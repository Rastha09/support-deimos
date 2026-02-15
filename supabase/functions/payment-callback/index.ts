import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";
import { encode as encodeHex } from "https://deno.land/std@0.168.0/encoding/hex.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Simple in-memory rate limiting
const requestLog: Map<string, number[]> = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 10;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = requestLog.get(ip) || [];
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW);
  requestLog.set(ip, [...recent, now]);
  return recent.length >= RATE_LIMIT_MAX;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  const clientIp = req.headers.get("x-forwarded-for") || "unknown";
  if (isRateLimited(clientIp)) {
    console.warn("Rate limited:", clientIp);
    return new Response(JSON.stringify({ error: "Too many requests" }), {
      status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const DUITKU_MERCHANT_CODE = Deno.env.get("DUITKU_MERCHANT_CODE");
    const DUITKU_API_KEY = Deno.env.get("DUITKU_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!DUITKU_MERCHANT_CODE) throw new Error("DUITKU_MERCHANT_CODE not configured");
    if (!DUITKU_API_KEY) throw new Error("DUITKU_API_KEY not configured");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Supabase env not configured");

    // Parse form data or JSON body
    let body: Record<string, string>;
    const contentType = req.headers.get("content-type") || "";
    
    if (contentType.includes("application/x-www-form-urlencoded")) {
      const text = await req.text();
      body = Object.fromEntries(new URLSearchParams(text));
    } else {
      body = await req.json();
    }

    const {
      merchantCode,
      merchantOrderId,
      amount,
      resultCode,
      reference,
      signature: receivedSignature,
    } = body;

    console.log("Callback received:", { merchantOrderId, resultCode, reference });

    // Validate required fields
    if (!merchantOrderId || !resultCode || !reference) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify signature: MD5(merchantCode + amount + merchantOrderId + apiKey)
    const encoder = new TextEncoder();
    const signData = encoder.encode(
      DUITKU_MERCHANT_CODE + (amount || "") + merchantOrderId + DUITKU_API_KEY
    );
    const hashBuffer = await crypto.subtle.digest("MD5", signData);
    const expectedSignature = new TextDecoder().decode(encodeHex(new Uint8Array(hashBuffer)));

    if (receivedSignature && receivedSignature !== expectedSignature) {
      console.error("Signature mismatch for order:", merchantOrderId);
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Check for duplicate - prevent double processing
    const { data: existing } = await supabase
      .from("donations")
      .select("id, status")
      .eq("merchant_order_id", merchantOrderId)
      .maybeSingle();

    if (existing && existing.status === "SUCCESS") {
      console.log("Already processed:", merchantOrderId);
      return new Response(JSON.stringify({ success: true, message: "Already processed" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const newStatus = resultCode === "00" ? "SUCCESS" : "FAILED";

    if (existing) {
      // Update existing record
      const { error } = await supabase
        .from("donations")
        .update({ status: newStatus, reference, updated_at: new Date().toISOString() })
        .eq("merchant_order_id", merchantOrderId);

      if (error) {
        console.error("Update error:", error);
        throw new Error("Failed to update donation");
      }
    } else {
      // Insert new record (in case create-payment didn't save it)
      const { error } = await supabase.from("donations").insert({
        donor_name: "Unknown",
        amount: parseInt(amount || "0"),
        reference,
        merchant_order_id: merchantOrderId,
        status: newStatus,
      });

      if (error) {
        console.error("Insert error:", error);
        throw new Error("Failed to insert donation");
      }
    }

    console.log(`Donation ${merchantOrderId} updated to ${newStatus}`);

    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Callback error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
