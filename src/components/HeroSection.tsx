import { Heart, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import heroBg from "@/assets/hero-bg.jpg";
import ParticleBackground from "@/components/ParticleBackground";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroBg}
          alt="DEIMOS cosmic background"
          className="w-full h-full object-cover opacity-30"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
      </div>

      {/* Particle overlay */}
      <ParticleBackground count={60} color="200, 170, 90" connectionDistance={130} />

      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-primary/25 bg-primary/5 backdrop-blur-sm mb-10"
          >
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs tracking-[0.2em] uppercase text-primary/90 font-medium">
              Support My Work
            </span>
          </motion.div>

          {/* Name */}
          <h1 className="text-7xl md:text-9xl font-bold tracking-tighter mb-6">
            <span className="text-gradient-gold">DEIMOS</span>
          </h1>

          {/* Tagline */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <p className="text-base md:text-lg text-muted-foreground max-w-md mx-auto mb-12 leading-relaxed font-light">
              Kreator konten & karya digital. Dukung perjalanan kreatif saya
              dengan memberikan donasi sukarela.
            </p>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            <Link to="/donate">
              <motion.button
                className="group relative inline-flex items-center gap-3 px-10 py-4.5 rounded-2xl bg-primary text-primary-foreground font-semibold text-lg overflow-hidden transition-all duration-300 hover:shadow-[0_0_40px_-5px_hsl(38_90%_55%_/_0.4)]"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                <Heart className="w-5 h-5" />
                Berikan Dukungan
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;
