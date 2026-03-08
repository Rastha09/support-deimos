import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const formatRupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

const getEmailContent = (status: string, donorName: string, amount: number, orderId: string, paidAt?: string) => {
  const baseStyle = `
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    max-width: 520px; margin: 0 auto; padding: 40px 24px;
  `;

  if (status === "SUCCESS" || status === "PAID") {
    return {
      subject: `✅ Pembayaran Berhasil — ${formatRupiah(amount)}`,
      html: `
        <div style="${baseStyle}">
          <div style="text-align:center;margin-bottom:32px;">
            <div style="width:64px;height:64px;border-radius:16px;background:#10b981;display:inline-flex;align-items:center;justify-content:center;">
              <span style="font-size:32px;color:#fff;">✓</span>
            </div>
          </div>
          <h1 style="text-align:center;font-size:24px;color:#111;margin:0 0 8px;">Pembayaran Berhasil!</h1>
          <p style="text-align:center;color:#666;font-size:14px;margin:0 0 32px;">Terima kasih atas dukunganmu, ${donorName}!</p>
          <div style="background:#f9fafb;border-radius:12px;padding:20px;margin-bottom:24px;">
            <table style="width:100%;border-collapse:collapse;font-size:14px;">
              <tr><td style="padding:8px 0;color:#666;">Nominal</td><td style="padding:8px 0;text-align:right;font-weight:600;color:#111;">${formatRupiah(amount)}</td></tr>
              <tr><td style="padding:8px 0;color:#666;">Order ID</td><td style="padding:8px 0;text-align:right;color:#111;font-family:monospace;font-size:12px;">${orderId}</td></tr>
              ${paidAt ? `<tr><td style="padding:8px 0;color:#666;">Waktu Bayar</td><td style="padding:8px 0;text-align:right;color:#111;">${new Date(paidAt).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })}</td></tr>` : ""}
            </table>
          </div>
          <p style="text-align:center;color:#999;font-size:12px;">Dukunganmu sangat berarti bagi perjalanan kreatif DEIMOS.</p>
        </div>
      `,
    };
  }

  if (status === "FAILED" || status === "EXPIRED") {
    return {
      subject: `❌ Pembayaran Gagal — ${formatRupiah(amount)}`,
      html: `
        <div style="${baseStyle}">
          <div style="text-align:center;margin-bottom:32px;">
            <div style="width:64px;height:64px;border-radius:16px;background:#ef4444;display:inline-flex;align-items:center;justify-content:center;">
              <span style="font-size:32px;color:#fff;">✕</span>
            </div>
          </div>
          <h1 style="text-align:center;font-size:24px;color:#111;margin:0 0 8px;">Pembayaran Gagal</h1>
          <p style="text-align:center;color:#666;font-size:14px;margin:0 0 32px;">Maaf ${donorName}, pembayaranmu tidak berhasil diproses.</p>
          <div style="background:#f9fafb;border-radius:12px;padding:20px;margin-bottom:24px;">
            <table style="width:100%;border-collapse:collapse;font-size:14px;">
              <tr><td style="padding:8px 0;color:#666;">Nominal</td><td style="padding:8px 0;text-align:right;font-weight:600;color:#111;">${formatRupiah(amount)}</td></tr>
              <tr><td style="padding:8px 0;color:#666;">Order ID</td><td style="padding:8px 0;text-align:right;color:#111;font-family:monospace;font-size:12px;">${orderId}</td></tr>
              <tr><td style="padding:8px 0;color:#666;">Status</td><td style="padding:8px 0;text-align:right;color:#ef4444;font-weight:600;">${status === "EXPIRED" ? "Kedaluwarsa" : "Gagal"}</td></tr>
            </table>
          </div>
          <div style="text-align:center;">
            <a href="https://support-deimos.lovable.app/donate" style="display:inline-block;background:#c8a45a;color:#fff;padding:12px 32px;border-radius:12px;text-decoration:none;font-weight:600;font-size:14px;">Coba Lagi</a>
          </div>
        </div>
      `,
    };
  }

  // PENDING
  return {
    subject: `⏳ Menunggu Pembayaran — ${formatRupiah(amount)}`,
    html: `
      <div style="${baseStyle}">
        <div style="text-align:center;margin-bottom:32px;">
          <div style="width:64px;height:64px;border-radius:16px;background:#f59e0b;display:inline-flex;align-items:center;justify-content:center;">
            <span style="font-size:32px;color:#fff;">⏳</span>
          </div>
        </div>
        <h1 style="text-align:center;font-size:24px;color:#111;margin:0 0 8px;">Menunggu Pembayaran</h1>
        <p style="text-align:center;color:#666;font-size:14px;margin:0 0 32px;">Hai ${donorName}, kami menunggu pembayaranmu.</p>
        <div style="background:#f9fafb;border-radius:12px;padding:20px;margin-bottom:24px;">
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <tr><td style="padding:8px 0;color:#666;">Nominal</td><td style="padding:8px 0;text-align:right;font-weight:600;color:#111;">${formatRupiah(amount)}</td></tr>
            <tr><td style="padding:8px 0;color:#666;">Order ID</td><td style="padding:8px 0;text-align:right;color:#111;font-family:monospace;font-size:12px;">${orderId}</td></tr>
          </table>
        </div>
        <p style="text-align:center;color:#999;font-size:12px;">Segera selesaikan pembayaran sebelum QRIS kedaluwarsa.</p>
      </div>
    `,
  };
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY not configured");

    const { email, donorName, amount, status, orderId, paidAt } = await req.json();

    if (!email || !donorName || !amount || !status || !orderId) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { subject, html } = getEmailContent(status, donorName, amount, orderId, paidAt);

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "DEIMOS <onboarding@resend.dev>",
        to: [email],
        subject,
        html,
      }),
    });

    const resendData = await resendRes.json();

    if (!resendRes.ok) {
      console.error("Resend error:", JSON.stringify(resendData));
      throw new Error(`Resend API error: ${resendData.message || JSON.stringify(resendData)}`);
    }

    console.log(`Email sent to ${email} for order ${orderId} (status: ${status})`);

    return new Response(
      JSON.stringify({ success: true, id: resendData.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Send email error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
