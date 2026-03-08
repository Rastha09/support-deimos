import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Loader2, ArrowLeft, QrCode, Clock, Download, Shield, Wallet, Timer } from "lucide-react";
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

/* ─── Animated circular progress for countdown ─── */
const CountdownRing = ({ seconds, total }: { seconds: number; total: number }) => {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const progress = (seconds / total) * circumference;
  const isUrgent = seconds <= 60;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="72" height="72" className="-rotate-90">
        <circle cx="36" cy="36" r={radius} fill="none" strokeWidth="3" className="stroke-border/30" />
        <motion.circle
          cx="36" cy="36" r={radius} fill="none" strokeWidth="3"
          strokeLinecap="round"
          className={isUrgent ? "stroke-destructive" : "stroke-primary"}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-sm font-bold font-display tabular-nums ${isUrgent ? "text-destructive" : "text-primary"}`}>
          {Math.floor(seconds / 60)}:{(seconds % 60).toString().padStart(2, "0")}
        </span>
      </div>
    </div>
  );
};

/* ─── Step indicator dots ─── */
const StepIndicator = ({ step }: { step: 1 | 2 }) => (
  <div className="flex items-center gap-2 justify-center mb-6">
    <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${step >= 1 ? "bg-primary" : "bg-border/50"}`} />
    <div className={`w-8 h-px transition-colors duration-300 ${step >= 2 ? "bg-primary" : "bg-border/30"}`} />
    <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${step >= 2 ? "bg-primary" : "bg-border/50"}`} />
  </div>
);

const DonatePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ donorName: "", email: "", message: "", amount: 0 });
  const [customAmount, setCustomAmount] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [qrisData, setQrisData] = useState<{
    qrisBase64: string; orderId: string; transactionId: string; expiresAt: string;
  } | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string>("pending");
  const [polling, setPolling] = useState(false);
  const [countdown, setCountdown] = useState(300);
  const qrisRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!qrisData || paymentStatus !== "pending") return;
    setCountdown(300);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) { clearInterval(timer); setPaymentStatus("failed"); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [qrisData, paymentStatus]);

  const handleSaveQris = useCallback(async () => {
    if (!qrisData?.qrisBase64) return;
    try {
      const res = await fetch(qrisData.qrisBase64);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `QRIS-${qrisData.orderId}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({ title: "Berhasil", description: "QR code berhasil disimpan" });
    } catch {
      toast({ title: "Gagal", description: "Tidak dapat menyimpan gambar", variant: "destructive" });
    }
  }, [qrisData, toast]);

  const selectedAmount = form.amount || (customAmount ? parseInt(customAmount) : 0);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.donorName.trim()) e.donorName = "Nama wajib diisi";
    if (form.donorName.length > 100) e.donorName = "Nama maksimal 100 karakter";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Email tidak valid";
    if (form.message.length > 500) e.message = "Pesan maksimal 500 karakter";
    if (!selectedAmount || selectedAmount < 10000) e.amount = "Minimal donasi Rp10.000";
    if (selectedAmount > 10000000) e.amount = "Maksimal donasi Rp10.000.000";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const startPolling = (transactionId: string) => {
    setPolling(true);
    const interval = setInterval(async () => {
      try {
        const { data } = await supabase.from("donations").select("status").eq("merchant_order_id", transactionId).maybeSingle();
        if (data?.status === "SUCCESS") { clearInterval(interval); setPaymentStatus("paid"); setPolling(false); navigate("/payment-status?merchantOrderId=" + transactionId); }
        else if (data?.status === "FAILED" || data?.status === "EXPIRED") { clearInterval(interval); setPaymentStatus("failed"); setPolling(false); }
      } catch (err) { console.error("Polling error:", err); }
    }, 3000);
    setTimeout(() => { clearInterval(interval); setPolling(false); }, 30 * 60 * 1000);
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-payment", {
        body: { donorName: form.donorName.trim().substring(0, 100), email: form.email.trim().substring(0, 255), message: form.message.trim().substring(0, 500), amount: selectedAmount },
      });
      if (error) throw error;
      if (data?.qrisBase64) {
        setQrisData({ qrisBase64: data.qrisBase64, orderId: data.orderId, transactionId: data.transactionId, expiresAt: data.expiresAt });
        setPaymentStatus("pending");
        startPolling(data.orderId);
      } else throw new Error("Tidak dapat membuat pembayaran QRIS");
    } catch (err: any) {
      toast({ title: "Gagal", description: err.message || "Terjadi kesalahan. Coba lagi.", variant: "destructive" });
    } finally { setLoading(false); }
  };

  const handleBack = () => { setQrisData(null); setPaymentStatus("pending"); setPolling(false); };

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-hero" />
      <ParticleBackground count={35} color="200, 170, 90" connectionDistance={100} />

      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-12 md:py-16">
        <AnimatePresence mode="wait">
          {qrisData ? (
            /* ═══════════════ QRIS PAYMENT SCREEN ═══════════════ */
            <motion.div
              key="qris"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-sm"
            >
              <button
                onClick={handleBack}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-4 group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Kembali
              </button>

              <StepIndicator step={2} />

              <div className="card-glass rounded-3xl p-6 md:p-8 text-center space-y-6 shadow-[0_8px_40px_-12px_hsl(var(--primary)/0.15)]">
                {/* Header badge */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-sm"
                >
                  <QrCode className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs tracking-[0.15em] uppercase text-primary font-medium">Scan QRIS</span>
                </motion.div>

                {/* Amount */}
                <motion.h2
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl font-bold font-display text-foreground"
                >
                  {formatRupiah(selectedAmount)}
                </motion.h2>

                {/* QR Code with glow frame */}
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.35, type: "spring", stiffness: 200 }}
                  className="relative mx-auto w-fit"
                >
                  <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-primary/20 via-transparent to-primary/10 blur-sm" />
                  <div className="relative bg-white rounded-2xl p-5">
                    <img
                      ref={qrisRef}
                      src={qrisData.qrisBase64}
                      alt="QRIS Payment QR Code"
                      className="w-52 h-52 md:w-56 md:h-56"
                    />
                  </div>
                </motion.div>

                {/* Countdown ring */}
                {paymentStatus === "pending" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <CountdownRing seconds={countdown} total={300} />
                    <p className="text-xs text-muted-foreground mt-1.5">Sisa waktu pembayaran</p>
                  </motion.div>
                )}

                {/* Instruction */}
                <p className="text-muted-foreground text-sm leading-relaxed max-w-[280px] mx-auto">
                  Scan QR code menggunakan <span className="text-foreground font-medium">e-wallet</span> atau <span className="text-foreground font-medium">mobile banking</span>
                </p>

                {/* Status */}
                <div className="flex items-center justify-center gap-2 text-sm">
                  {paymentStatus === "pending" && (
                    <motion.div
                      className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10"
                      animate={{ opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/60" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
                      </span>
                      <span className="text-muted-foreground text-xs">Menunggu pembayaran...</span>
                    </motion.div>
                  )}
                  {paymentStatus === "paid" && (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                      <span className="text-primary font-medium text-sm">✓ Pembayaran berhasil!</span>
                    </div>
                  )}
                  {paymentStatus === "failed" && (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 border border-destructive/20">
                      <span className="text-destructive font-medium text-sm">Pembayaran gagal/expired</span>
                    </div>
                  )}
                </div>

                {/* Save button */}
                {paymentStatus === "pending" && (
                  <motion.button
                    onClick={handleSaveQris}
                    className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-xl bg-secondary/80 text-secondary-foreground font-medium text-sm hover:bg-secondary transition-all duration-200 border border-border/30 hover:border-border/60"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Download className="w-4 h-4" />
                    Simpan QR Code
                  </motion.button>
                )}

                {/* Order ID */}
                <div className="text-[11px] text-muted-foreground/40 pt-3 border-t border-border/15 font-mono">
                  {qrisData.orderId}
                </div>
              </div>
            </motion.div>
          ) : (
            /* ═══════════════ DONATION FORM ═══════════════ */
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-lg"
            >
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-4 group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Kembali
              </Link>

              <StepIndicator step={1} />

              {/* Header */}
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-sm mb-4"
                >
                  <Heart className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs tracking-[0.15em] uppercase text-primary font-medium">Donasi</span>
                </motion.div>
                <motion.h1
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl md:text-4xl font-bold font-display"
                >
                  Dukung <span className="text-gradient-gold">DEIMOS</span>
                </motion.h1>
                <motion.p
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-muted-foreground mt-2 text-sm"
                >
                  Setiap dukungan sangat berarti untuk karya saya.
                </motion.p>
              </div>

              {/* Form Card */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="card-glass rounded-3xl p-6 md:p-8 space-y-5 shadow-[0_8px_40px_-12px_hsl(var(--primary)/0.1)]"
              >
                {/* Nominal - moved to top for better UX */}
                <div>
                  <Label className="text-sm font-medium flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5 text-primary" />
                    Nominal Donasi <span className="text-destructive">*</span>
                  </Label>
                  <div className="grid grid-cols-3 gap-2 mt-2.5">
                    {NOMINAL_OPTIONS.map((n, i) => (
                      <motion.button
                        key={n}
                        type="button"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + i * 0.04 }}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => { setForm({ ...form, amount: n }); setCustomAmount(""); }}
                        className={`py-3 px-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                          form.amount === n
                            ? "bg-primary text-primary-foreground shadow-[0_4px_20px_-4px_hsl(var(--primary)/0.4)] ring-1 ring-primary/30"
                            : "bg-secondary/50 text-secondary-foreground hover:bg-secondary/80 border border-border/40 hover:border-border/70"
                        }`}
                      >
                        {formatRupiah(n)}
                      </motion.button>
                    ))}
                  </div>
                  <div className="mt-2.5 relative">
                    <Input
                      type="number"
                      placeholder="Nominal lainnya (min. 10.000)"
                      min={10000}
                      max={10000000}
                      value={customAmount}
                      onChange={(e) => { setCustomAmount(e.target.value); setForm({ ...form, amount: 0 }); }}
                      className="bg-secondary/30 border-border/40 focus:border-primary/50 focus:bg-secondary/50 transition-all pl-10"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">Rp</span>
                  </div>
                  {errors.amount && <p className="text-xs text-destructive mt-1">{errors.amount}</p>}
                  <AnimatePresence>
                    {selectedAmount >= 10000 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-2 space-y-1">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Donasi</span>
                            <span>{formatRupiah(selectedAmount)}</span>
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Biaya layanan (1%)</span>
                            <span>{formatRupiah(Math.ceil(selectedAmount * 0.01))}</span>
                          </div>
                          <div className="h-px bg-border/30 my-1" />
                          <div className="flex justify-between text-sm font-semibold text-primary">
                            <span>Total bayar</span>
                            <span>{formatRupiah(selectedAmount + Math.ceil(selectedAmount * 0.01))}</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="h-px bg-border/20" />

                {/* Nama */}
                <div className="space-y-1.5">
                  <Label htmlFor="donorName" className="text-sm font-medium">
                    Nama Donatur <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="donorName"
                    placeholder="Nama kamu"
                    maxLength={100}
                    value={form.donorName}
                    onChange={(e) => setForm({ ...form, donorName: e.target.value })}
                    className="bg-secondary/30 border-border/40 focus:border-primary/50 focus:bg-secondary/50 transition-all"
                  />
                  {errors.donorName && <p className="text-xs text-destructive mt-0.5">{errors.donorName}</p>}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email <span className="text-muted-foreground text-xs">(opsional)</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@contoh.com"
                    maxLength={255}
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="bg-secondary/30 border-border/40 focus:border-primary/50 focus:bg-secondary/50 transition-all"
                  />
                  {errors.email && <p className="text-xs text-destructive mt-0.5">{errors.email}</p>}
                </div>

                {/* Pesan */}
                <div className="space-y-1.5">
                  <Label htmlFor="message" className="text-sm font-medium">Pesan Dukungan</Label>
                  <Textarea
                    id="message"
                    placeholder="Tulis pesan dukunganmu..."
                    maxLength={500}
                    rows={3}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="bg-secondary/30 border-border/40 resize-none focus:border-primary/50 focus:bg-secondary/50 transition-all"
                  />
                  {errors.message && <p className="text-xs text-destructive mt-0.5">{errors.message}</p>}
                  <p className="text-[11px] text-muted-foreground/50 text-right tabular-nums">{form.message.length}/500</p>
                </div>

                <div className="h-px bg-border/20" />

                {/* Submit */}
                <motion.button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-base shadow-[0_4px_24px_-4px_hsl(var(--primary)/0.3)] hover:shadow-[0_4px_32px_-4px_hsl(var(--primary)/0.45)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                  whileHover={{ scale: loading ? 1 : 1.01 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <QrCode className="w-4.5 h-4.5" />
                      Buat QRIS Pembayaran
                    </>
                  )}
                </motion.button>

                {/* Trust badges */}
                <div className="flex items-center justify-center gap-4 pt-1">
                  <div className="flex items-center gap-1.5 text-muted-foreground/40">
                    <Shield className="w-3 h-3" />
                    <span className="text-[10px] uppercase tracking-wider">Aman</span>
                  </div>
                  <div className="w-px h-3 bg-border/20" />
                  <div className="flex items-center gap-1.5 text-muted-foreground/40">
                    <Wallet className="w-3 h-3" />
                    <span className="text-[10px] uppercase tracking-wider">QRISMU</span>
                  </div>
                  <div className="w-px h-3 bg-border/20" />
                  <div className="flex items-center gap-1.5 text-muted-foreground/40">
                    <Timer className="w-3 h-3" />
                    <span className="text-[10px] uppercase tracking-wider">Instan</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
};

export default DonatePage;
