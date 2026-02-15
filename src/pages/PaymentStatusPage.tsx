import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Clock, ArrowLeft, RefreshCw, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Footer from "@/components/Footer";

type PaymentStatus = "loading" | "PAID" | "PENDING" | "FAILED" | "unknown";

const PaymentStatusPage = () => {
  const [searchParams] = useSearchParams();
  const merchantOrderId = searchParams.get("merchantOrderId");
  const [status, setStatus] = useState<PaymentStatus>("loading");

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

      if (data.status === "PAID" || data.status === "SUCCESS") {
        setStatus("PAID");
      } else if (data.status === "FAILED" || data.status === "EXPIRED") {
        setStatus("FAILED");
      } else {
        setStatus("PENDING");
      }
    };

    checkStatus();
  }, [merchantOrderId]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <Clock className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (status === "PAID") {
    return (
      <div className="min-h-screen bg-gradient-hero flex flex-col">
        <div className="flex-1 flex items-center justify-center px-4">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }} className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center glow-gold">
              <CheckCircle className="w-10 h-10 text-primary" />
            </motion.div>
            <h1 className="text-3xl font-bold font-display mb-3">Terima Kasih! <Heart className="inline w-6 h-6 text-primary" /></h1>
            <p className="text-muted-foreground mb-8 leading-relaxed">Dukunganmu sangat berarti bagi perjalanan kreatif saya. Semoga karya saya terus menginspirasi.</p>
            <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
            </Link>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  if (status === "FAILED") {
    return (
      <div className="min-h-screen bg-gradient-hero flex flex-col">
        <div className="flex-1 flex items-center justify-center px-4">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }} className="w-20 h-20 mx-auto mb-6 rounded-full bg-destructive/10 flex items-center justify-center">
              <XCircle className="w-10 h-10 text-destructive" />
            </motion.div>
            <h1 className="text-3xl font-bold font-display mb-3">Pembayaran Gagal</h1>
            <p className="text-muted-foreground mb-8 leading-relaxed">Maaf, pembayaran tidak berhasil diproses. Silakan coba kembali.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/donate" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium glow-gold-sm hover:scale-105 transition-transform">
                <RefreshCw className="w-4 h-4" /> Coba Lagi
              </Link>
              <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Kembali
              </Link>
            </div>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  // PENDING or unknown
  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }} className="w-20 h-20 mx-auto mb-6 rounded-full bg-yellow-500/10 flex items-center justify-center">
            <Clock className="w-10 h-10 text-yellow-500" />
          </motion.div>
          <h1 className="text-3xl font-bold font-display mb-3">Pembayaran Pending</h1>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Pembayaran belum selesai. Jika kamu sudah membayar, status akan diperbarui secara otomatis. Silakan cek kembali nanti.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/donate" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium glow-gold-sm hover:scale-105 transition-transform">
              <RefreshCw className="w-4 h-4" /> Donasi Lagi
            </Link>
            <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Kembali
            </Link>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default PaymentStatusPage;
