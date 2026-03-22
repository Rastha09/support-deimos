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

    const { transactionId } = await req.json();

    if (!transactionId) {
      return new Response(JSON.stringify({ error: "transactionId is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // iPaymu check transaction endpoint
    const url = "https://sandbox.ipaymu.com/api/v2/transaction";

    const bodyObj = { transactionId: Number(transactionId) };
    const bodyStr = JSON.stringify(bodyObj);

    // Generate signature
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

    const ipaymuRes = await fetch(url, {
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

    if (!ipaymuRes.ok) {
      console.error("iPaymu check status error:", JSON.stringify(ipaymuData));
      throw new Error(`iPaymu API error [${ipaymuRes.status}]`);
    }

    const txData = ipaymuData.Data;
    // iPaymu status values: 1 = pending, 0 = expired/failed, 6 = refund, 1 with PaidStatus = success
    // Status field in response: "berhasil" / "pending" / "expired" / "canceled"
    const rawStatus = String(txData?.Status || txData?.StatusDesc || "unknown").toLowerCase();
    
    let status = "pending";
    if (rawStatus === "berhasil" || rawStatus === "1" || rawStatus === "success") {
      status = "paid";
    } else if (rawStatus === "expired" || rawStatus === "canceled" || rawStatus === "0") {
      status = rawStatus === "0" ? "expired" : rawStatus;
    }

    // Update database if status changed
    if (status === "paid" || status === "expired" || status === "canceled") {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const dbStatus = status === "paid" ? "SUCCESS" : status === "expired" ? "EXPIRED" : "FAILED";

      const { data: currentDonation } = await supabase
        .from("donations")
        .select("status, email, donor_name, amount, merchant_order_id")
        .eq("transaction_id", String(transactionId))
        .maybeSingle();

      const statusChanged = currentDonation && currentDonation.status !== dbStatus;

      await supabase
        .from("donations")
        .update({
          status: dbStatus,
          fee: txData?.Fee || 0,
          amount_received: txData?.ReceivedAmount || txData?.Amount || 0,
          paid_at: txData?.PaidDate || null,
          updated_at: new Date().toISOString(),
        })
        .eq("transaction_id", String(transactionId));

      // Send email notification if status changed and email exists
      if (statusChanged && currentDonation?.email) {
        try {
          await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            },
            body: JSON.stringify({
              email: currentDonation.email,
              donorName: currentDonation.donor_name,
              amount: currentDonation.amount,
              status: dbStatus,
              orderId: currentDonation.merchant_order_id,
              paidAt: txData?.PaidDate || null,
            }),
          });
        } catch (emailErr) {
          console.error("Failed to send email notification:", emailErr);
        }
      }
    }

    return new Response(
      JSON.stringify({ status, data: txData }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Check status error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
