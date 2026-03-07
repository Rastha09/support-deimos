import { ShieldCheck } from "lucide-react";
import PageShell from "@/components/PageShell";

const sections = [
  { title: "1. Data yang Dikumpulkan", content: "Kami mengumpulkan data berikut saat Anda melakukan donasi: nama, alamat email (opsional), dan pesan dukungan." },
  { title: "2. Penggunaan Data", content: "Data yang dikumpulkan hanya digunakan untuk keperluan administrasi donasi dan komunikasi terkait donasi." },
  { title: "3. Perlindungan Data", content: "Kami tidak menjual, memperdagangkan, atau menyewakan data pribadi Anda kepada pihak ketiga. Data disimpan dengan standar keamanan yang memadai." },
  { title: "4. Keamanan Data", content: "Data donasi disimpan secara aman menggunakan enkripsi dan mengikuti standar keamanan data terkini." },
  { title: "5. Hak Anda", content: "Anda berhak meminta akses, koreksi, atau penghapusan data pribadi Anda kapan saja. Hubungi kami melalui halaman kontak." },
];

const PrivacyPage = () => {
  return (
    <PageShell title="Kebijakan Privasi" badge="Privasi" badgeIcon={<ShieldCheck className="w-3 h-3 text-primary" />}>
      <div className="card-glass rounded-3xl p-7 md:p-9 space-y-6 text-[15px]">
        {sections.map((s, i) => (
          <div key={i} className={i > 0 ? "pt-5 border-t border-border/15" : ""}>
            <h2 className="text-base font-semibold text-foreground mb-2 font-display">{s.title}</h2>
            <p className="text-secondary-foreground leading-relaxed">{s.content}</p>
          </div>
        ))}
      </div>
    </PageShell>
  );
};

export default PrivacyPage;
