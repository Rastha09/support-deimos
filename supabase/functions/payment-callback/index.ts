import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Supabase env not configured");

    // iPaymu sends callback as form-urlencoded or JSON
    const contentType = req.headers.get("content-type") || "";
    let body: Record<string, string>;
    
    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await req.formData();
      body = {};
      formData.forEach((value, key) => {
        body[key] = String(value);
      });
    } else {
      body = await req.json();
    }

    console.log("=== IPAYMU PAYMENT CALLBACK RECEIVED ===");
    console.log("Body:", JSON.stringify(body));

    // iPaymu callback fields:
    // trx_id, sid, reference_id, via, channel, status, status_code, amount
    const {
      trx_id,
      reference_id,
      status: callbackStatus,
      status_code,
      amount,
      via,
      channel,
      sid,
    } = body;

    const orderId = reference_id;
    const transactionId = trx_id;

    console.log("Parsed callback:", { trx_id, reference_id, callbackStatus, status_code, amount });

    // iPaymu status_code: 1 = success, other = failed
    const isSuccess = String(status_code) === "1" || String(callbackStatus).toLowerCase() === "berhasil";

    if (!isSuccess) {
      console.log("Non-success callback, status:", callbackStatus, "code:", status_code);
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Check for existing donation
    const { data: existing } = await supabase
      .from("donations")
      .select("id, status, email, donor_name, amount")
      .eq("merchant_order_id", orderId)
      .maybeSingle();

    const dbStatus = isSuccess ? "SUCCESS" : "FAILED";

    if (existing && existing.status === "SUCCESS") {
      console.log("Already processed:", orderId);
      return new Response(JSON.stringify({ ok: true, message: "Already processed" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const updateData = {
      status: dbStatus,
      transaction_id: transactionId || undefined,
      fee: 0,
      amount_received: Number(amount) || 0,
      paid_at: isSuccess ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    };

    if (existing) {
      const { error } = await supabase
        .from("donations")
        .update(updateData)
        .eq("merchant_order_id", orderId);

      if (error) {
        console.error("Update error:", error);
        throw new Error("Failed to update donation");
      }
      console.log("Donation updated to", dbStatus, ":", orderId);
    } else if (orderId) {
      const { error } = await supabase.from("donations").insert({
        donor_name: "Unknown",
        amount: Number(amount) || 0,
        reference: transactionId || "",
        merchant_order_id: orderId,
        ...updateData,
      });

      if (error) {
        console.error("Insert error:", error);
        throw new Error("Failed to insert donation");
      }
      console.log("New donation inserted as", dbStatus, ":", orderId);
    }

    // Send email notification if success
    if (isSuccess && existing?.email) {
      try {
        await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          },
          body: JSON.stringify({
            email: existing.email,
            donorName: existing.donor_name,
            amount: existing.amount,
            status: "SUCCESS",
            orderId: orderId,
            paidAt: new Date().toISOString(),
          }),
        });
      } catch (emailErr) {
        console.error("Failed to send email:", emailErr);
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Webhook error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
