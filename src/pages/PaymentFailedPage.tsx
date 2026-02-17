import { motion } from "framer-motion";
import { XCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";
import ParticleBackground from "@/components/ParticleBackground";

const PaymentFailedPage = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-hero" />
      <ParticleBackground count={30} color="200, 170, 90" connectionDistance={100} />

      <div className="relative z-10 flex-1 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-24 h-24 mx-auto mb-8 rounded-2xl bg-destructive/10 flex items-center justify-center"
          >
            <XCircle className="w-12 h-12 text-destructive" />
          </motion.div>

          <h1 className="text-3xl font-bold font-display mb-3">
            Pembayaran Gagal
          </h1>
          <p className="text-muted-foreground mb-8 leading-relaxed text-sm">
            Maaf, pembayaran tidak berhasil diproses. Silakan coba kembali atau
            hubungi kami jika masalah berlanjut.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/donate"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:shadow-[0_0_25px_-5px_hsl(38_90%_55%_/_0.3)] hover:scale-105 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Coba Lagi
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali
            </Link>
          </div>
        </motion.div>
      </div>
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
};

export default PaymentFailedPage;
