import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const QRISMU_BASE_URL = "https://api.qrismu.app/api/v1";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const QRISMU_API_KEY = Deno.env.get("QRISMU_API_KEY");
    const QRISMU_SECRET_KEY = Deno.env.get("QRISMU_SECRET_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!QRISMU_API_KEY) throw new Error("QRISMU_API_KEY not configured");
    if (!QRISMU_SECRET_KEY) throw new Error("QRISMU_SECRET_KEY not configured");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Supabase env not configured");

    const { donorName, email, message, amount } = await req.json();

    // Validation
    if (!donorName || typeof donorName !== "string" || donorName.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Nama wajib diisi" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (donorName.length > 100) {
      return new Response(JSON.stringify({ error: "Nama terlalu panjang" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (email && (typeof email !== "string" || email.length > 255)) {
      return new Response(JSON.stringify({ error: "Email tidak valid" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (typeof amount !== "number" || amount < 10000 || amount > 10000000) {
      return new Response(JSON.stringify({ error: "Nominal tidak valid (min Rp10.000, max Rp10.000.000)" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const orderId = `DEIMOS-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    // Add 1% service fee so the creator receives the full donation amount
    const FEE_PERCENTAGE = 0.01;
    const fee = Math.ceil(amount * FEE_PERCENTAGE);
    const chargedAmount = amount + fee;

    // Build QRISMU signature: HMAC-SHA256(secret_key, timestamp + METHOD + path + body)
    const timestamp = new Date().toISOString();
    const method = "POST";
    const path = "/api/v1/transactions";
    const bodyObj = {
      order_id: orderId,
      amount: chargedAmount,
      customer_name: donorName.trim().substring(0, 50),
      customer_email: email?.trim() || undefined,
      expiry_minutes: 30,
    };
    const bodyStr = JSON.stringify(bodyObj);

    const payload = timestamp + method + path + bodyStr;
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(QRISMU_SECRET_KEY),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const sigBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
    const signature = Array.from(new Uint8Array(sigBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");

    console.log("Creating QRISMU transaction for order:", orderId);

    const qrismuRes = await fetch(`${QRISMU_BASE_URL}/transactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": QRISMU_API_KEY,
        "X-Timestamp": timestamp,
        "X-Signature": signature,
      },
      body: bodyStr,
    });

    const qrismuData = await qrismuRes.json();

    if (!qrismuRes.ok || qrismuData.status !== "success") {
      console.error("QRISMU API error:", JSON.stringify(qrismuData));
      throw new Error(`QRISMU API error [${qrismuRes.status}]: ${qrismuData.message || JSON.stringify(qrismuData)}`);
    }

    const txData = qrismuData.data;

    // Store pending donation in database
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { error: insertError } = await supabase.from("donations").insert({
      donor_name: donorName.trim().substring(0, 100),
      email: email?.trim().substring(0, 255) || null,
      message: message?.trim().substring(0, 500) || null,
      amount,
      reference: txData.transaction_id || "",
      merchant_order_id: orderId,
      transaction_id: txData.transaction_id,
      qris_url: txData.qris_url || null,
      status: "PENDING",
    });

    if (insertError) {
      console.error("Insert error:", insertError);
      throw new Error("Failed to store donation");
    }

    console.log("QRISMU transaction created:", orderId, txData.transaction_id);

    return new Response(
      JSON.stringify({
        transactionId: txData.transaction_id,
        orderId,
        qrisBase64: txData.qris_base64,
        qrisUrl: txData.qris_url,
        expiresAt: txData.expires_at,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error creating payment:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
