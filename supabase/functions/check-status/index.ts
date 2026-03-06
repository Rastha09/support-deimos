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

    const { transactionId } = await req.json();

    if (!transactionId) {
      return new Response(JSON.stringify({ error: "transactionId is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build signature for GET request
    const timestamp = new Date().toISOString();
    const method = "GET";
    const path = `/api/v1/transactions/${transactionId}`;
    const bodyStr = "";

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

    const qrismuRes = await fetch(`${QRISMU_BASE_URL}/transactions/${transactionId}`, {
      method: "GET",
      headers: {
        "X-API-Key": QRISMU_API_KEY,
        "X-Timestamp": timestamp,
        "X-Signature": signature,
      },
    });

    const qrismuData = await qrismuRes.json();

    if (!qrismuRes.ok) {
      console.error("QRISMU check status error:", JSON.stringify(qrismuData));
      throw new Error(`QRISMU API error [${qrismuRes.status}]`);
    }

    const txData = qrismuData.data;
    const status = txData?.status || "unknown";

    // Update database if status changed to paid/expired/failed
    if (status === "paid" || status === "expired" || status === "failed") {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const dbStatus = status === "paid" ? "SUCCESS" : status === "expired" ? "EXPIRED" : "FAILED";

      await supabase
        .from("donations")
        .update({
          status: dbStatus,
          fee: txData.fee || 0,
          amount_received: txData.amount_received || 0,
          paid_at: txData.paid_at || null,
          updated_at: new Date().toISOString(),
        })
        .eq("transaction_id", transactionId);
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
