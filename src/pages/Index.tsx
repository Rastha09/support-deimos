import HeroSection from "@/components/HeroSection";
import Footer from "@/components/Footer";
import ParticleBackground from "@/components/ParticleBackground";
import { motion } from "framer-motion";
import { Heart, Zap, Shield, ArrowRight, Star } from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  {
    icon: Heart,
    title: "Donasi Sukarela",
    desc: "Dukung karya dan konten kreatif tanpa komitmen apapun.",
  },
  {
    icon: Zap,
    title: "Pembayaran Instan",
    desc: "Proses pembayaran cepat melalui QRIS — semua bank & e-wallet.",
  },
  {
    icon: Shield,
    title: "Aman & Terpercaya",
    desc: "Transaksi diproses secara aman melalui payment gateway resmi.",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />

      {/* Features section */}
      <section className="relative py-24 md:py-32 px-6">
        {/* Subtle background accent */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/5 to-background" />
        
        <div className="relative max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/15 bg-primary/5 backdrop-blur-sm mb-5">
              <Star className="w-3 h-3 text-primary" />
              <span className="text-[11px] tracking-[0.15em] uppercase text-primary/80 font-medium">Fitur</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">
              Kenapa Dukung <span className="text-gradient-gold">DEIMOS</span>?
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto text-sm md:text-base">
              Setiap kontribusi membantu saya terus berkarya dan menghasilkan konten berkualitas.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-5 md:gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.5 }}
                className="group card-glass rounded-3xl p-7 text-center hover:border-primary/25 hover:bg-card/60 transition-all duration-500"
              >
                <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-primary/8 flex items-center justify-center group-hover:bg-primary/15 group-hover:shadow-[0_0_20px_-6px_hsl(var(--primary)/0.3)] transition-all duration-500">
                  <f.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="card-glass rounded-3xl p-10 md:p-14 relative overflow-hidden"
          >
            {/* Decorative glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-primary/8 rounded-full blur-3xl" />
            
            <div className="relative">
              <h3 className="text-2xl md:text-3xl font-bold font-display mb-3">
                Siap Mendukung?
              </h3>
              <p className="text-muted-foreground text-sm md:text-base mb-8 max-w-md mx-auto">
                Setiap dukungan, sekecil apapun, sangat berarti untuk perjalanan kreatif saya.
              </p>
              <Link to="/donate">
                <motion.button
                  className="group inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-base shadow-[0_4px_24px_-4px_hsl(var(--primary)/0.3)] hover:shadow-[0_4px_32px_-4px_hsl(var(--primary)/0.45)] transition-all duration-300"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Heart className="w-4.5 h-4.5" />
                  Donasi Sekarang
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
