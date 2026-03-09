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

    const rawBody = await req.text();
    console.log("=== PAYMENT CALLBACK RECEIVED ===");
    console.log("Raw body:", rawBody);

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
      console.log("Webhook signature verified OK");
    } else {
      console.log("No webhook signature header — skipping verification");
    }

    const { event, transaction_id, order_id, amount, fee, amount_received, status, paid_at } = body;

    console.log("Parsed webhook data:", { event, transaction_id, order_id, status, amount });

    if (event !== "payment.success") {
      console.log("Ignoring non-success event:", event);
      return new Response(JSON.stringify({ ok: true }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Check for duplicate processing
    const { data: existing, error: selectError } = await supabase
      .from("donations")
      .select("id, status, email, donor_name, amount")
      .eq("merchant_order_id", order_id)
      .maybeSingle();

    console.log("Existing donation lookup:", { existing, selectError });

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
      console.log("Donation updated to SUCCESS:", order_id);
    } else {
      const { error } = await supabase.from("donations").insert({
        donor_name: body.customer_name || "Unknown",
        email: body.customer_email || null,
        amount: amount || 0,
        reference: transaction_id || "",
        merchant_order_id: order_id,
        ...updateData,
      });

      if (error) {
        console.error("Insert error:", error);
        throw new Error("Failed to insert donation");
      }
      console.log("New donation inserted as SUCCESS:", order_id);
    }

    // === SEND EMAIL NOTIFICATION ===
    // Get fresh donation data from DB to ensure we have email
    const { data: donation } = await supabase
      .from("donations")
      .select("email, donor_name, amount, merchant_order_id")
      .eq("merchant_order_id", order_id)
      .maybeSingle();

    console.log("Fresh donation data for email:", donation);

    const donationEmail = donation?.email || body.customer_email;
    const donationName = donation?.donor_name || body.customer_name || "Donatur";
    const donationAmount = donation?.amount || amount || 0;

    if (donationEmail) {
      console.log("Sending email to:", donationEmail);
      try {
        const emailPayload = {
          email: donationEmail,
          donorName: donationName,
          amount: donationAmount,
          status: "SUCCESS",
          orderId: order_id,
          paidAt: paid_at || new Date().toISOString(),
        };
        console.log("Email payload:", JSON.stringify(emailPayload));

        const emailRes = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          },
          body: JSON.stringify(emailPayload),
        });

        const emailText = await emailRes.text();
        console.log("Send-email response status:", emailRes.status);
        console.log("Send-email response body:", emailText);

        if (!emailRes.ok) {
          console.error("Send-email returned error:", emailRes.status, emailText);
        }
      } catch (emailErr) {
        console.error("Failed to call send-email function:", emailErr);
      }
    } else {
      console.warn("No email found for donation — skipping email notification. order_id:", order_id);
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
