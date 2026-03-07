import { motion } from "framer-motion";
import { XCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";
import ParticleBackground from "@/components/ParticleBackground";

const PaymentFailedPage = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-hero" />
      <ParticleBackground count={25} color="200, 170, 90" connectionDistance={100} />

      <div className="relative z-10 flex-1 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-md"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 180, damping: 15 }}
            className="relative w-28 h-28 mx-auto mb-8"
          >
            <div className="absolute inset-0 rounded-3xl bg-destructive/10 blur-xl" />
            <div className="relative w-full h-full rounded-3xl bg-destructive/8 border border-destructive/15 flex items-center justify-center">
              <XCircle className="w-14 h-14 text-destructive" />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-3xl md:text-4xl font-bold font-display mb-3"
          >
            Pembayaran Gagal
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-muted-foreground mb-10 leading-relaxed text-sm max-w-sm mx-auto"
          >
            Maaf, pembayaran tidak berhasil diproses. Silakan coba kembali atau hubungi kami jika masalah berlanjut.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link to="/donate">
              <motion.button
                className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-primary text-primary-foreground font-semibold shadow-[0_4px_20px_-4px_hsl(var(--primary)/0.3)] hover:shadow-[0_4px_28px_-4px_hsl(var(--primary)/0.45)] transition-all duration-300"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <RefreshCw className="w-4 h-4" />
                Coba Lagi
              </motion.button>
            </Link>
            <Link to="/">
              <motion.button
                className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-secondary/80 text-secondary-foreground font-medium border border-border/30 hover:bg-secondary hover:border-border/50 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                <ArrowLeft className="w-4 h-4" />
                Kembali
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
};

export default PaymentFailedPage;
