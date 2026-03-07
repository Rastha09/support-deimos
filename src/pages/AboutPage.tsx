import { User } from "lucide-react";
import PageShell from "@/components/PageShell";

const AboutPage = () => {
  return (
    <PageShell title="Tentang Saya" badge="Profil" badgeIcon={<User className="w-3 h-3 text-primary" />}>
      <div className="card-glass rounded-3xl p-7 md:p-9 space-y-5 text-secondary-foreground leading-relaxed text-[15px]">
        <p>
          Halo! Saya <strong className="text-foreground font-semibold">DEIMOS</strong>, seorang kreator konten dan karya digital.
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
        <div className="pt-2 border-t border-border/20">
          <p className="text-primary/80 font-medium">
            Terima kasih telah menjadi bagian dari perjalanan kreatif saya! ✨
          </p>
        </div>
      </div>
    </PageShell>
  );
};

export default AboutPage;
