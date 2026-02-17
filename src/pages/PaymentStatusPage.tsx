import { useEffect, useState, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Clock, ArrowLeft, RefreshCw, Heart } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import Footer from "@/components/Footer";
import ParticleBackground from "@/components/ParticleBackground";

const DonationStatusSchema = z.object({
  status: z.string(),
});

type PaymentStatus = "loading" | "PAID" | "PENDING" | "FAILED" | "unknown";

const StatusCard = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-hero opacity-50" />
    <ParticleBackground count={80} color="200, 170, 90" maxOpacity={0.8} connectionDistance={150} />
    <div className="relative z-10 flex-1 flex items-center justify-center px-4">
      {children}
    </div>
    <div className="relative z-10">
      <Footer />
    </div>
  </div>
);

const PaymentStatusPage = () => {
  const [searchParams] = useSearchParams();
  const merchantOrderId = searchParams.get("merchantOrderId");
  const [status, setStatus] = useState<PaymentStatus>("loading");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!merchantOrderId) {
      setStatus("unknown");
      return;
    }

    const checkStatus = async () => {
      const { data, error } = await supabase
        .from("donations")
        .select("status")
        .eq("merchant_order_id", merchantOrderId)
        .maybeSingle();

      if (error || !data) {
        setStatus("unknown");
        return;
      }

      const parsed = DonationStatusSchema.safeParse(data);
      if (!parsed.success) {
        setStatus("unknown");
        return;
      }

      const s = parsed.data.status;
      if (s === "PAID" || s === "SUCCESS") {
        setStatus("PAID");
        // Stop polling on final status
        if (intervalRef.current) clearInterval(intervalRef.current);
      } else if (s === "FAILED" || s === "EXPIRED") {
        setStatus("FAILED");
        if (intervalRef.current) clearInterval(intervalRef.current);
      } else {
        setStatus("PENDING");
      }
    };

    checkStatus();
    intervalRef.current = setInterval(checkStatus, 2000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [merchantOrderId]);

  if (status === "loading") {
    return (
      <StatusCard>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Clock className="w-10 h-10 text-primary animate-spin" />
          <p className="text-muted-foreground text-sm">Memuat status pembayaran...</p>
        </motion.div>
      </StatusCard>
    );
  }

  if (status === "PAID") {
    return (
      <StatusCard>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md bg-card/40 backdrop-blur-md border border-border/30 rounded-2xl p-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-24 h-24 mx-auto mb-8 rounded-2xl bg-primary/10 flex items-center justify-center shadow-[0_0_40px_-10px_hsl(38_90%_55%_/_0.3)]"
          >
            <CheckCircle className="w-12 h-12 text-primary" />
          </motion.div>
          <h1 className="text-3xl font-bold font-display mb-3">
            Terima Kasih! <Heart className="inline w-5 h-5 text-primary" />
          </h1>
          <p className="text-muted-foreground mb-8 leading-relaxed text-sm">
            Dukunganmu sangat berarti bagi perjalanan kreatif saya. Semoga karya saya terus menginspirasi.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
          </Link>
        </motion.div>
      </StatusCard>
    );
  }

  if (status === "FAILED") {
    return (
      <StatusCard>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md bg-card/40 backdrop-blur-md border border-border/30 rounded-2xl p-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-24 h-24 mx-auto mb-8 rounded-2xl bg-destructive/10 flex items-center justify-center"
          >
            <XCircle className="w-12 h-12 text-destructive" />
          </motion.div>
          <h1 className="text-3xl font-bold font-display mb-3">Pembayaran Gagal</h1>
          <p className="text-muted-foreground mb-8 leading-relaxed text-sm">
            Maaf, pembayaran tidak berhasil diproses. Silakan coba kembali.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/donate" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:shadow-[0_0_25px_-5px_hsl(38_90%_55%_/_0.3)] hover:scale-105 transition-all">
              <RefreshCw className="w-4 h-4" /> Coba Lagi
            </Link>
            <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Kembali
            </Link>
          </div>
        </motion.div>
      </StatusCard>
    );
  }

  // PENDING or unknown
  return (
    <StatusCard>
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md bg-card/40 backdrop-blur-md border border-border/30 rounded-2xl p-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-24 h-24 mx-auto mb-8 rounded-2xl bg-amber-500/10 flex items-center justify-center"
        >
          <Clock className="w-12 h-12 text-amber-500 animate-spin" style={{ animationDuration: '3s' }} />
        </motion.div>
        <h1 className="text-3xl font-bold font-display mb-3">Pembayaran Pending</h1>
        <p className="text-xs text-muted-foreground/60 mb-2 animate-pulse">Status diperbarui otomatis setiap 2 detik...</p>
        <p className="text-muted-foreground mb-8 leading-relaxed text-sm">
          Pembayaran belum selesai. Jika kamu sudah membayar, status akan diperbarui secara otomatis.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/donate" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:shadow-[0_0_25px_-5px_hsl(38_90%_55%_/_0.3)] hover:scale-105 transition-all">
            <RefreshCw className="w-4 h-4" /> Donasi Lagi
          </Link>
          <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Kembali
          </Link>
        </div>
      </motion.div>
    </StatusCard>
  );
};

export default PaymentStatusPage;
