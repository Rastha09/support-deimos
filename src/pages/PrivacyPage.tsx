import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";

const PrivacyPage = () => {
  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col">
      <div className="flex-1 max-w-2xl mx-auto px-6 py-16">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </Link>
        <h1 className="text-3xl font-bold font-display text-gradient-gold mb-6">Kebijakan Privasi</h1>
        <div className="card-glass rounded-2xl p-6 space-y-4 text-secondary-foreground leading-relaxed">
          <h2 className="text-lg font-semibold text-foreground">1. Data yang Dikumpulkan</h2>
          <p>Kami mengumpulkan data berikut saat Anda melakukan donasi: nama, alamat email (opsional), dan pesan dukungan.</p>

          <h2 className="text-lg font-semibold text-foreground">2. Penggunaan Data</h2>
          <p>Data yang dikumpulkan hanya digunakan untuk keperluan administrasi donasi dan komunikasi terkait donasi.</p>

          <h2 className="text-lg font-semibold text-foreground">3. Perlindungan Data</h2>
          <p>Kami tidak menjual, memperdagangkan, atau menyewakan data pribadi Anda kepada pihak ketiga. Data disimpan dengan standar keamanan yang memadai.</p>

          <h2 className="text-lg font-semibold text-foreground">4. Keamanan Data</h2>
          <p>Data donasi disimpan secara aman menggunakan enkripsi dan mengikuti standar keamanan data terkini.</p>

          <h2 className="text-lg font-semibold text-foreground">5. Hak Anda</h2>
          <p>Anda berhak meminta akses, koreksi, atau penghapusan data pribadi Anda kapan saja. Hubungi kami melalui halaman kontak.</p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PrivacyPage;
