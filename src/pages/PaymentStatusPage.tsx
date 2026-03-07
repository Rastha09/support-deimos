import { useEffect, useState, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Clock, ArrowLeft, RefreshCw, Heart, Sparkles } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import Footer from "@/components/Footer";
import ParticleBackground from "@/components/ParticleBackground";

const DonationStatusSchema = z.object({ status: z.string() });
type PaymentStatus = "loading" | "PAID" | "PENDING" | "FAILED" | "unknown";

const StatusShell = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-hero" />
    <ParticleBackground count={30} color="200, 170, 90" connectionDistance={100} />
    <div className="relative z-10 flex-1 flex items-center justify-center px-4">
      {children}
    </div>
    <div className="relative z-10"><Footer /></div>
  </div>
);

const StatusIcon = ({ children, variant }: { children: React.ReactNode; variant: "success" | "error" | "warning" }) => {
  const colors = {
    success: { bg: "bg-primary/10", border: "border-primary/20", glow: "bg-primary/15" },
    error: { bg: "bg-destructive/8", border: "border-destructive/15", glow: "bg-destructive/10" },
    warning: { bg: "bg-accent/8", border: "border-accent/15", glow: "bg-accent/10" },
  };
  const c = colors[variant];
  return (
    <motion.div
      initial={{ scale: 0, rotate: -15 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ delay: 0.2, type: "spring", stiffness: 180, damping: 15 }}
      className="relative w-28 h-28 mx-auto mb-8"
    >
      <div className={`absolute inset-0 rounded-3xl ${c.glow} blur-xl`} />
      <div className={`relative w-full h-full rounded-3xl ${c.bg} border ${c.border} flex items-center justify-center`}>
        {children}
      </div>
    </motion.div>
  );
};

const PaymentStatusPage = () => {
  const [searchParams] = useSearchParams();
  const merchantOrderId = searchParams.get("merchantOrderId");
  const [status, setStatus] = useState<PaymentStatus>("loading");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!merchantOrderId) { setStatus("unknown"); return; }
    const checkStatus = async () => {
      const { data, error } = await supabase.from("donations").select("status").eq("merchant_order_id", merchantOrderId).maybeSingle();
      if (error || !data) { setStatus("unknown"); return; }
      const parsed = DonationStatusSchema.safeParse(data);
      if (!parsed.success) { setStatus("unknown"); return; }
      const s = parsed.data.status;
      if (s === "PAID" || s === "SUCCESS") { setStatus("PAID"); if (intervalRef.current) clearInterval(intervalRef.current); }
      else if (s === "FAILED" || s === "EXPIRED") { setStatus("FAILED"); if (intervalRef.current) clearInterval(intervalRef.current); }
      else setStatus("PENDING");
    };
    checkStatus();
    intervalRef.current = setInterval(checkStatus, 2000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [merchantOrderId]);

  if (status === "loading") {
    return (
      <StatusShell>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Clock className="w-6 h-6 text-primary animate-spin" style={{ animationDuration: '2s' }} />
          </div>
          <p className="text-muted-foreground text-sm">Memuat status pembayaran...</p>
        </motion.div>
      </StatusShell>
    );
  }

  if (status === "PAID") {
    return (
      <StatusShell>
        <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="text-center max-w-md">
          <StatusIcon variant="success">
            <CheckCircle className="w-14 h-14 text-primary" />
          </StatusIcon>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/15 bg-primary/5 mb-4">
              <Sparkles className="w-3 h-3 text-primary" />
              <span className="text-[11px] tracking-[0.15em] uppercase text-primary/80 font-medium">Berhasil</span>
            </div>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="text-3xl md:text-4xl font-bold font-display mb-3">
            Terima Kasih! <Heart className="inline w-5 h-5 text-primary" />
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="text-muted-foreground mb-10 leading-relaxed text-sm max-w-sm mx-auto">
            Dukunganmu sangat berarti bagi perjalanan kreatif saya.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
            <Link to="/">
              <motion.button className="inline-flex items-center gap-2.5 px-7 py-3 rounded-xl bg-secondary/80 text-secondary-foreground font-medium border border-border/30 hover:bg-secondary hover:border-border/50 transition-all" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>
      </StatusShell>
    );
  }

  if (status === "FAILED") {
    return (
      <StatusShell>
        <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }} className="text-center max-w-md">
          <StatusIcon variant="error">
            <XCircle className="w-14 h-14 text-destructive" />
          </StatusIcon>
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-3xl md:text-4xl font-bold font-display mb-3">
            Pembayaran Gagal
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-muted-foreground mb-10 leading-relaxed text-sm max-w-sm mx-auto">
            Maaf, pembayaran tidak berhasil diproses. Silakan coba kembali.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/donate">
              <motion.button className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-primary text-primary-foreground font-semibold shadow-[0_4px_20px_-4px_hsl(var(--primary)/0.3)] hover:shadow-[0_4px_28px_-4px_hsl(var(--primary)/0.45)] transition-all" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <RefreshCw className="w-4 h-4" /> Coba Lagi
              </motion.button>
            </Link>
            <Link to="/">
              <motion.button className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-secondary/80 text-secondary-foreground font-medium border border-border/30 hover:bg-secondary transition-all" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                <ArrowLeft className="w-4 h-4" /> Kembali
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>
      </StatusShell>
    );
  }

  // PENDING
  return (
    <StatusShell>
      <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }} className="text-center max-w-md">
        <StatusIcon variant="warning">
          <Clock className="w-14 h-14 text-accent animate-spin" style={{ animationDuration: '3s' }} />
        </StatusIcon>
        <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-3xl md:text-4xl font-bold font-display mb-3">
          Menunggu Pembayaran
        </motion.h1>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mb-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/5 border border-accent/10">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent/60" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent" />
            </span>
            <span className="text-xs text-muted-foreground">Status diperbarui otomatis</span>
          </div>
          <p className="text-muted-foreground leading-relaxed text-sm max-w-sm mx-auto">
            Jika kamu sudah membayar, status akan diperbarui secara otomatis.
          </p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/donate">
            <motion.button className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-primary text-primary-foreground font-semibold shadow-[0_4px_20px_-4px_hsl(var(--primary)/0.3)] transition-all" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <RefreshCw className="w-4 h-4" /> Donasi Lagi
            </motion.button>
          </Link>
          <Link to="/">
            <motion.button className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-secondary/80 text-secondary-foreground font-medium border border-border/30 hover:bg-secondary transition-all" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              <ArrowLeft className="w-4 h-4" /> Kembali
            </motion.button>
          </Link>
        </motion.div>
      </motion.div>
    </StatusShell>
  );
};

export default PaymentStatusPage;
