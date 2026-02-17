import { motion } from "framer-motion";
import { CheckCircle, Heart, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";
import ParticleBackground from "@/components/ParticleBackground";

const ThankYouPage = () => {
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
            className="w-24 h-24 mx-auto mb-8 rounded-2xl bg-primary/10 flex items-center justify-center shadow-[0_0_40px_-10px_hsl(38_90%_55%_/_0.3)]"
          >
            <CheckCircle className="w-12 h-12 text-primary" />
          </motion.div>

          <h1 className="text-3xl font-bold font-display mb-3">
            Terima Kasih! <Heart className="inline w-5 h-5 text-primary" />
          </h1>
          <p className="text-muted-foreground mb-8 leading-relaxed text-sm">
            Dukunganmu sangat berarti bagi perjalanan kreatif saya. Semoga karya
            saya terus menginspirasi.
          </p>

          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Beranda
          </Link>
        </motion.div>
      </div>
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
};

export default ThankYouPage;
