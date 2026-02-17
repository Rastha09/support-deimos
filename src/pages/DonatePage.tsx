import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Loader2, Send, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";
import ParticleBackground from "@/components/ParticleBackground";

const NOMINAL_OPTIONS = [10000, 25000, 50000, 100000, 250000, 500000];

const formatRupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

const DonatePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    donorName: "",
    email: "",
    message: "",
    amount: 0,
  });
  const [customAmount, setCustomAmount] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedAmount = form.amount || (customAmount ? parseInt(customAmount) : 0);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.donorName.trim()) e.donorName = "Nama wajib diisi";
    if (form.donorName.length > 100) e.donorName = "Nama maksimal 100 karakter";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Email tidak valid";
    if (form.message.length > 500) e.message = "Pesan maksimal 500 karakter";
    if (!selectedAmount || selectedAmount < 10000)
      e.amount = "Minimal donasi Rp10.000";
    if (selectedAmount > 100000000) e.amount = "Nominal terlalu besar";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-payment", {
        body: {
          donorName: form.donorName.trim().substring(0, 100),
          email: form.email.trim().substring(0, 255),
          message: form.message.trim().substring(0, 500),
          amount: selectedAmount,
        },
      });

      if (error) throw error;
      if (data?.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        throw new Error("Tidak dapat membuat pembayaran");
      }
    } catch (err: any) {
      toast({
        title: "Gagal",
        description: err.message || "Terjadi kesalahan. Coba lagi.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-hero" />
      <ParticleBackground count={35} color="200, 170, 90" connectionDistance={100} />

      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-lg"
        >
          {/* Back button */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali
          </Link>

          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-sm mb-4">
              <Heart className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs tracking-[0.15em] uppercase text-primary font-medium">Donasi</span>
            </div>
            <h1 className="text-3xl font-bold font-display">
              Dukung <span className="text-gradient-gold">DEIMOS</span>
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Setiap dukungan sangat berarti untuk karya saya.
            </p>
          </div>

          <div className="card-glass rounded-2xl p-6 md:p-8 space-y-5">
            {/* Nama */}
            <div>
              <Label htmlFor="donorName" className="text-sm font-medium">Nama Donatur *</Label>
              <Input
                id="donorName"
                placeholder="Nama kamu"
                maxLength={100}
                value={form.donorName}
                onChange={(e) => setForm({ ...form, donorName: e.target.value })}
                className="mt-1.5 bg-secondary/50 border-border/50 focus:border-primary/50 transition-colors"
              />
              {errors.donorName && <p className="text-xs text-destructive mt-1">{errors.donorName}</p>}
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email" className="text-sm font-medium">Email (opsional)</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@contoh.com"
                maxLength={255}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="mt-1.5 bg-secondary/50 border-border/50 focus:border-primary/50 transition-colors"
              />
              {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
            </div>

            {/* Pesan */}
            <div>
              <Label htmlFor="message" className="text-sm font-medium">Pesan Dukungan</Label>
              <Textarea
                id="message"
                placeholder="Tulis pesan dukunganmu..."
                maxLength={500}
                rows={3}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="mt-1.5 bg-secondary/50 border-border/50 resize-none focus:border-primary/50 transition-colors"
              />
              {errors.message && <p className="text-xs text-destructive mt-1">{errors.message}</p>}
              <p className="text-xs text-muted-foreground mt-1 text-right">{form.message.length}/500</p>
            </div>

            {/* Nominal */}
            <div>
              <Label className="text-sm font-medium">Nominal Donasi *</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {NOMINAL_OPTIONS.map((n) => (
                  <motion.button
                    key={n}
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setForm({ ...form, amount: n });
                      setCustomAmount("");
                    }}
                    className={`py-2.5 px-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      form.amount === n
                        ? "bg-primary text-primary-foreground shadow-[0_0_20px_-5px_hsl(38_90%_55%_/_0.3)]"
                        : "bg-secondary/50 text-secondary-foreground hover:bg-secondary/80 border border-border/50"
                    }`}
                  >
                    {formatRupiah(n)}
                  </motion.button>
                ))}
              </div>
              <div className="mt-2.5">
                <Input
                  type="number"
                  placeholder="Nominal lainnya (min. 10.000)"
                  min={10000}
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setForm({ ...form, amount: 0 });
                  }}
                  className="bg-secondary/50 border-border/50 focus:border-primary/50 transition-colors"
                />
              </div>
              {errors.amount && <p className="text-xs text-destructive mt-1">{errors.amount}</p>}
              {selectedAmount >= 10000 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-primary mt-2 font-semibold"
                >
                  Total: {formatRupiah(selectedAmount)}
                </motion.p>
              )}
            </div>

            {/* Divider */}
            <div className="h-px bg-border/30" />

            {/* Submit */}
            <motion.button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-base hover:shadow-[0_0_30px_-5px_hsl(38_90%_55%_/_0.35)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Lanjutkan Pembayaran
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
};

export default DonatePage;
