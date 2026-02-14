import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col">
      <div className="flex-1 max-w-2xl mx-auto px-6 py-16">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </Link>
        <h1 className="text-3xl font-bold font-display text-gradient-gold mb-6">Tentang Saya</h1>
        <div className="card-glass rounded-2xl p-6 space-y-4 text-secondary-foreground leading-relaxed">
          <p>
            Halo! Saya <strong className="text-foreground">DEIMOS</strong>, seorang kreator konten dan karya digital.
          </p>
          <p>
            Website ini adalah halaman pribadi saya untuk menerima dukungan sukarela dari audiens atas karya
            dan konten yang saya buat. Setiap dukungan membantu saya untuk terus berkarya dan menghasilkan
            konten berkualitas.
          </p>
          <p>
            Ini bukan platform crowdfunding, marketplace, atau lembaga penggalangan dana. Semua donasi yang
            diterima bersifat sukarela dan langsung masuk ke rekening pribadi saya sebagai bentuk apresiasi.
          </p>
          <p>
            Terima kasih telah menjadi bagian dari perjalanan kreatif saya!
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AboutPage;
