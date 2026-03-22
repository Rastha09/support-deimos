import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const IPAYMU_API_KEY = Deno.env.get("IPAYMU_API_KEY");
    const IPAYMU_VA = Deno.env.get("IPAYMU_VA");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!IPAYMU_API_KEY) throw new Error("IPAYMU_API_KEY not configured");
    if (!IPAYMU_VA) throw new Error("IPAYMU_VA not configured");
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
    if (!email || typeof email !== "string" || email.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Email wajib diisi" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (email.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
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

    // iPaymu sandbox URL
    const IPAYMU_BASE_URL = "https://sandbox.ipaymu.com/api/v2/payment/direct";

    // Callback URL for iPaymu webhook
    const notifyUrl = `${SUPABASE_URL}/functions/v1/payment-callback`;

    const bodyObj = {
      name: donorName.trim().substring(0, 50),
      phone: "08000000000",
      email: email.trim(),
      amount: amount,
      notifyUrl: notifyUrl,
      referenceId: orderId,
      paymentMethod: "qris",
      paymentChannel: "qris",
      comments: message?.trim().substring(0, 500) || "Donasi untuk DEIMOS",
    };

    const bodyStr = JSON.stringify(bodyObj);

    // iPaymu signature: HMAC-SHA256(apikey, "POST:" + va + ":" + SHA256(body) + ":" + apikey)
    const encoder = new TextEncoder();
    const bodyHash = Array.from(
      new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(bodyStr)))
    ).map(b => b.toString(16).padStart(2, "0")).join("");

    const stringToSign = `POST:${IPAYMU_VA}:${bodyHash}:${IPAYMU_API_KEY}`;

    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(IPAYMU_API_KEY),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const sigBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(stringToSign));
    const signature = Array.from(new Uint8Array(sigBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");

    const timestamp = new Date().toISOString().replace(/[-:T]/g, "").substring(0, 14);

    console.log("Creating iPaymu QRIS transaction for order:", orderId);

    const ipaymuRes = await fetch(IPAYMU_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "va": IPAYMU_VA,
        "signature": signature,
        "timestamp": timestamp,
      },
      body: bodyStr,
    });

    const ipaymuData = await ipaymuRes.json();

    if (!ipaymuRes.ok || ipaymuData.Status !== 200) {
      console.error("iPaymu API error:", JSON.stringify(ipaymuData));
      throw new Error(`iPaymu API error [${ipaymuRes.status}]: ${ipaymuData.Message || JSON.stringify(ipaymuData)}`);
    }

    const txData = ipaymuData.Data;

    // Store pending donation in database
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { error: insertError } = await supabase.from("donations").insert({
      donor_name: donorName.trim().substring(0, 100),
      email: email?.trim().substring(0, 255) || null,
      message: message?.trim().substring(0, 500) || null,
      amount,
      fee: 0,
      amount_received: amount,
      reference: String(txData.TransactionId || ""),
      merchant_order_id: orderId,
      transaction_id: String(txData.TransactionId || ""),
      qris_url: txData.QrImage || txData.QrUrl || null,
      status: "PENDING",
    });

    if (insertError) {
      console.error("Insert error:", insertError);
      throw new Error("Failed to store donation");
    }

    console.log("iPaymu transaction created:", orderId, txData.TransactionId);

    return new Response(
      JSON.stringify({
        transactionId: String(txData.TransactionId),
        orderId,
        qrisUrl: txData.QrImage || txData.QrUrl || null,
        qrisString: txData.QrString || null,
        sessionId: txData.SessionId || null,
        expiresAt: null,
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
