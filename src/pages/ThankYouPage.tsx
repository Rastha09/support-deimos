import { motion } from "framer-motion";
import { CheckCircle, Heart, ArrowLeft, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";
import ParticleBackground from "@/components/ParticleBackground";

const ThankYouPage = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-hero" />
      <ParticleBackground count={40} color="200, 170, 90" connectionDistance={120} />

      <div className="relative z-10 flex-1 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-md"
        >
          {/* Success icon with glow */}
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 180, damping: 15 }}
            className="relative w-28 h-28 mx-auto mb-8"
          >
            <div className="absolute inset-0 rounded-3xl bg-primary/15 blur-xl" />
            <div className="relative w-full h-full rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-[0_0_40px_-10px_hsl(var(--primary)/0.3)]">
              <CheckCircle className="w-14 h-14 text-primary" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/15 bg-primary/5 mb-4">
              <Sparkles className="w-3 h-3 text-primary" />
              <span className="text-[11px] tracking-[0.15em] uppercase text-primary/80 font-medium">Berhasil</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-3xl md:text-4xl font-bold font-display mb-3"
          >
            Terima Kasih! <Heart className="inline w-5 h-5 text-primary" />
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-muted-foreground mb-10 leading-relaxed text-sm max-w-sm mx-auto"
          >
            Dukunganmu sangat berarti bagi perjalanan kreatif saya. Semoga karya
            saya terus menginspirasi.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Link to="/">
              <motion.button
                className="inline-flex items-center gap-2.5 px-7 py-3 rounded-xl bg-secondary/80 text-secondary-foreground font-medium border border-border/30 hover:bg-secondary hover:border-border/50 transition-all duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                <ArrowLeft className="w-4 h-4" />
                Kembali ke Beranda
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

export default ThankYouPage;
