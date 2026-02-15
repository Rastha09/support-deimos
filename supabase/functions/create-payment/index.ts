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
    const DUITKU_MERCHANT_CODE = Deno.env.get("DUITKU_MERCHANT_CODE");
    const DUITKU_API_KEY = Deno.env.get("DUITKU_API_KEY");
    const DUITKU_CALLBACK_URL = Deno.env.get("DUITKU_CALLBACK_URL");
    const DUITKU_RETURN_URL = Deno.env.get("DUITKU_RETURN_URL");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!DUITKU_MERCHANT_CODE) throw new Error("DUITKU_MERCHANT_CODE not configured");
    if (!DUITKU_API_KEY) throw new Error("DUITKU_API_KEY not configured");
    if (!DUITKU_CALLBACK_URL) throw new Error("DUITKU_CALLBACK_URL not configured");
    if (!DUITKU_RETURN_URL) throw new Error("DUITKU_RETURN_URL not configured");
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
    if (typeof amount !== "number" || amount < 10000 || amount > 100000000) {
      return new Response(JSON.stringify({ error: "Nominal tidak valid (min Rp10.000)" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const merchantOrderId = `DEIMOS-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    // Generate SHA256 signature for POP API: SHA256(merchantCode + timestamp + apiKey)
    const timestamp = Date.now().toString();
    const encoder = new TextEncoder();
    const signData = encoder.encode(DUITKU_MERCHANT_CODE + timestamp + DUITKU_API_KEY);
    const hashBuffer = await crypto.subtle.digest("SHA-256", signData);
    const signature = Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, "0")).join("");

    // Create invoice at Duitku POP
    const duitkuPayload = {
      paymentAmount: amount,
      merchantOrderId,
      productDetails: "Donasi untuk DEIMOS",
      customerVaName: donorName.trim().substring(0, 50),
      email: email?.trim() || "donor@deimos.id",
      callbackUrl: DUITKU_CALLBACK_URL,
      returnUrl: DUITKU_RETURN_URL,
      expiryPeriod: 1440,
    };

    console.log("Creating Duitku invoice for order:", merchantOrderId);

    const duitkuRes = await fetch("https://api-sandbox.duitku.com/api/merchant/createInvoice", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-duitku-merchantcode": DUITKU_MERCHANT_CODE,
        "x-duitku-timestamp": timestamp,
        "x-duitku-signature": signature,
      },
      body: JSON.stringify(duitkuPayload),
    });

    const duitkuData = await duitkuRes.json();

    if (!duitkuRes.ok || !duitkuData.paymentUrl) {
      console.error("Duitku API error:", JSON.stringify(duitkuData));
      throw new Error(`Duitku API error [${duitkuRes.status}]: ${JSON.stringify(duitkuData)}`);
    }

    // Store pending donation in database using service role
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { error: insertError } = await supabase.from("donations").insert({
      donor_name: donorName.trim().substring(0, 100),
      email: email?.trim().substring(0, 255) || null,
      message: message?.trim().substring(0, 500) || null,
      amount,
      reference: duitkuData.reference || merchantOrderId,
      merchant_order_id: merchantOrderId,
      status: "PENDING",
      payment_url: duitkuData.paymentUrl,
    });

    if (insertError) {
      console.error("Insert error:", insertError);
      throw new Error("Failed to store donation");
    }

    console.log("Payment created successfully:", merchantOrderId);

    return new Response(
      JSON.stringify({ paymentUrl: duitkuData.paymentUrl, merchantOrderId }),
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
