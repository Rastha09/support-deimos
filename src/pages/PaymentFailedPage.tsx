import { motion } from "framer-motion";
import { XCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";

const PaymentFailedPage = () => {
  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-20 h-20 mx-auto mb-6 rounded-full bg-destructive/10 flex items-center justify-center"
          >
            <XCircle className="w-10 h-10 text-destructive" />
          </motion.div>

          <h1 className="text-3xl font-bold font-display mb-3">
            Pembayaran Gagal
          </h1>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Maaf, pembayaran tidak berhasil diproses. Silakan coba kembali atau
            hubungi kami jika masalah berlanjut.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/donate"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium glow-gold-sm hover:scale-105 transition-transform"
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
      <Footer />
    </div>
  );
};

export default PaymentFailedPage;
