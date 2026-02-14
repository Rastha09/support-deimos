import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Loader2, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Footer from "@/components/Footer";

const NOMINAL_OPTIONS = [10000, 25000, 50000, 100000, 250000, 500000];

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

  const formatRupiah = (n: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 mb-4">
              <Heart className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs tracking-widest uppercase text-primary font-medium">Donasi</span>
            </div>
            <h1 className="text-3xl font-bold font-display">
              Dukung <span className="text-gradient-gold">DEIMOS</span>
            </h1>
            <p className="text-muted-foreground mt-2">
              Setiap dukungan sangat berarti untuk karya saya.
            </p>
          </div>

          <div className="card-glass rounded-2xl p-6 space-y-5">
            {/* Nama */}
            <div>
              <Label htmlFor="donorName">Nama Donatur *</Label>
              <Input
                id="donorName"
                placeholder="Nama kamu"
                maxLength={100}
                value={form.donorName}
                onChange={(e) => setForm({ ...form, donorName: e.target.value })}
                className="mt-1.5 bg-secondary/50 border-border/50"
              />
              {errors.donorName && <p className="text-xs text-destructive mt-1">{errors.donorName}</p>}
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email">Email (opsional)</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@contoh.com"
                maxLength={255}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="mt-1.5 bg-secondary/50 border-border/50"
              />
              {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
            </div>

            {/* Pesan */}
            <div>
              <Label htmlFor="message">Pesan Dukungan</Label>
              <Textarea
                id="message"
                placeholder="Tulis pesan dukunganmu..."
                maxLength={500}
                rows={3}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="mt-1.5 bg-secondary/50 border-border/50 resize-none"
              />
              {errors.message && <p className="text-xs text-destructive mt-1">{errors.message}</p>}
              <p className="text-xs text-muted-foreground mt-1 text-right">{form.message.length}/500</p>
            </div>

            {/* Nominal */}
            <div>
              <Label>Nominal Donasi *</Label>
              <div className="grid grid-cols-3 gap-2 mt-1.5">
                {NOMINAL_OPTIONS.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => {
                      setForm({ ...form, amount: n });
                      setCustomAmount("");
                    }}
                    className={`py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
                      form.amount === n
                        ? "bg-primary text-primary-foreground glow-gold-sm"
                        : "bg-secondary/50 text-secondary-foreground hover:bg-secondary border border-border/50"
                    }`}
                  >
                    {formatRupiah(n)}
                  </button>
                ))}
              </div>
              <div className="mt-2">
                <Input
                  type="number"
                  placeholder="Nominal lainnya (min. 10.000)"
                  min={10000}
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setForm({ ...form, amount: 0 });
                  }}
                  className="bg-secondary/50 border-border/50"
                />
              </div>
              {errors.amount && <p className="text-xs text-destructive mt-1">{errors.amount}</p>}
              {selectedAmount >= 10000 && (
                <p className="text-sm text-primary mt-1.5 font-medium">
                  Total: {formatRupiah(selectedAmount)}
                </p>
              )}
            </div>

            {/* Submit */}
            <motion.button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-base glow-gold hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
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
      <Footer />
    </div>
  );
};

export default DonatePage;
