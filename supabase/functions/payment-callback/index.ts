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
    const QRISMU_SECRET_KEY = Deno.env.get("QRISMU_SECRET_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!QRISMU_SECRET_KEY) throw new Error("QRISMU_SECRET_KEY not configured");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Supabase env not configured");

    // Get raw body for signature verification
    const rawBody = await req.text();
    const body = JSON.parse(rawBody);

    // Verify webhook signature
    const receivedSignature = req.headers.get("x-webhook-signature");
    if (receivedSignature) {
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(QRISMU_SECRET_KEY),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      );
      const expectedBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(JSON.stringify(body)));
      const expectedSignature = Array.from(new Uint8Array(expectedBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");

      if (receivedSignature !== expectedSignature) {
        console.error("Webhook signature mismatch for order:", body.order_id);
        return new Response(JSON.stringify({ error: "Invalid signature" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const { event, transaction_id, order_id, amount, fee, amount_received, status, paid_at } = body;

    console.log("QRISMU webhook received:", { event, transaction_id, order_id, status });

    if (event !== "payment.success") {
      console.log("Ignoring non-success event:", event);
      return new Response(JSON.stringify({ ok: true }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Check for duplicate processing
    const { data: existing } = await supabase
      .from("donations")
      .select("id, status")
      .eq("merchant_order_id", order_id)
      .maybeSingle();

    if (existing && existing.status === "SUCCESS") {
      console.log("Already processed:", order_id);
      return new Response(JSON.stringify({ ok: true, message: "Already processed" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const updateData = {
      status: "SUCCESS",
      transaction_id,
      fee: fee || 0,
      amount_received: amount_received || amount,
      paid_at: paid_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (existing) {
      const { error } = await supabase
        .from("donations")
        .update(updateData)
        .eq("merchant_order_id", order_id);

      if (error) {
        console.error("Update error:", error);
        throw new Error("Failed to update donation");
      }
    } else {
      const { error } = await supabase.from("donations").insert({
        donor_name: "Unknown",
        amount: amount || 0,
        reference: transaction_id || "",
        merchant_order_id: order_id,
        ...updateData,
      });

      if (error) {
        console.error("Insert error:", error);
        throw new Error("Failed to insert donation");
      }
    }

    console.log(`Donation ${order_id} marked as SUCCESS`);

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
