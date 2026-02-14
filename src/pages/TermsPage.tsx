import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col">
      <div className="flex-1 max-w-2xl mx-auto px-6 py-16">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </Link>
        <h1 className="text-3xl font-bold font-display text-gradient-gold mb-6">Syarat & Ketentuan</h1>
        <div className="card-glass rounded-2xl p-6 space-y-4 text-secondary-foreground leading-relaxed">
          <h2 className="text-lg font-semibold text-foreground">1. Sifat Donasi</h2>
          <p>Donasi yang diberikan melalui website ini bersifat sukarela dan merupakan bentuk apresiasi terhadap karya dan konten DEIMOS.</p>
          
          <h2 className="text-lg font-semibold text-foreground">2. Pengembalian Dana</h2>
          <p>Tidak ada kewajiban pengembalian dana (refund) untuk donasi yang telah berhasil diproses. Dengan melakukan donasi, Anda menyetujui bahwa dana tidak dapat dikembalikan.</p>
          
          <h2 className="text-lg font-semibold text-foreground">3. Bukan Crowdfunding</h2>
          <p>Website ini bukan lembaga crowdfunding atau marketplace. Ini adalah halaman pribadi untuk menerima dukungan sukarela.</p>
          
          <h2 className="text-lg font-semibold text-foreground">4. Pemrosesan Pembayaran</h2>
          <p>Pembayaran diproses oleh Duitku sebagai payment gateway resmi. Semua transaksi mengikuti ketentuan dan kebijakan Duitku.</p>
          
          <h2 className="text-lg font-semibold text-foreground">5. Penggunaan Dana</h2>
          <p>Seluruh dana yang diterima akan digunakan untuk mendukung kegiatan kreatif dan produksi konten DEIMOS.</p>
          
          <h2 className="text-lg font-semibold text-foreground">6. Perubahan Ketentuan</h2>
          <p>Syarat dan ketentuan ini dapat berubah sewaktu-waktu tanpa pemberitahuan sebelumnya.</p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TermsPage;
