import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";
import ParticleBackground from "@/components/ParticleBackground";

interface PageShellProps {
  children: React.ReactNode;
  title: string;
  badge?: string;
  badgeIcon?: React.ReactNode;
  maxWidth?: string;
}

const PageShell = ({ children, title, badge, badgeIcon, maxWidth = "max-w-2xl" }: PageShellProps) => {
  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-hero" />
      <ParticleBackground count={80} color="200, 170, 90" maxOpacity={0.85} connectionDistance={150} />

      <div className={`relative z-10 flex-1 ${maxWidth} mx-auto w-full px-5 md:px-6 py-12 md:py-16`}>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Kembali
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {badge && (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/15 bg-primary/5 backdrop-blur-sm mb-4">
              {badgeIcon}
              <span className="text-[11px] tracking-[0.15em] uppercase text-primary/80 font-medium">{badge}</span>
            </div>
          )}
          <h1 className="text-3xl md:text-4xl font-bold font-display text-gradient-gold mb-8">{title}</h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {children}
        </motion.div>
      </div>

      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
};

export default PageShell;
