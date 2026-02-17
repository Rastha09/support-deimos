import HeroSection from "@/components/HeroSection";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Heart, Zap, Shield } from "lucide-react";

const features = [
  {
    icon: Heart,
    title: "Donasi Sukarela",
    desc: "Dukung karya dan konten kreatif tanpa komitmen apapun.",
  },
  {
    icon: Zap,
    title: "Pembayaran Instan",
    desc: "Proses pembayaran cepat melalui berbagai metode pembayaran.",
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
      <section className="relative py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-2xl md:text-3xl font-bold font-display mb-3">
              Kenapa Dukung <span className="text-gradient-gold">DEIMOS</span>?
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Setiap kontribusi membantu saya terus berkarya.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="card-glass rounded-2xl p-6 text-center group hover:border-primary/30 transition-colors duration-300"
              >
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
