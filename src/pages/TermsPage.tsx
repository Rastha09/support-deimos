import { FileText } from "lucide-react";
import PageShell from "@/components/PageShell";

const sections = [
  { title: "1. Sifat Donasi", content: "Donasi yang diberikan melalui website ini bersifat sukarela dan merupakan bentuk apresiasi terhadap karya dan konten DEIMOS." },
  { title: "2. Pengembalian Dana", content: "Tidak ada kewajiban pengembalian dana (refund) untuk donasi yang telah berhasil diproses. Dengan melakukan donasi, Anda menyetujui bahwa dana tidak dapat dikembalikan." },
  { title: "3. Bukan Crowdfunding", content: "Website ini bukan lembaga crowdfunding atau marketplace. Ini adalah halaman pribadi untuk menerima dukungan sukarela." },
  { title: "4. Pemrosesan Pembayaran", content: "Pembayaran diproses melalui QRISMU sebagai payment gateway resmi. Semua transaksi mengikuti ketentuan dan kebijakan QRISMU." },
  { title: "5. Penggunaan Dana", content: "Seluruh dana yang diterima akan digunakan untuk mendukung kegiatan kreatif dan produksi konten DEIMOS." },
  { title: "6. Perubahan Ketentuan", content: "Syarat dan ketentuan ini dapat berubah sewaktu-waktu tanpa pemberitahuan sebelumnya." },
];

const TermsPage = () => {
  return (
    <PageShell title="Syarat & Ketentuan" badge="Legal" badgeIcon={<FileText className="w-3 h-3 text-primary" />}>
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

export default TermsPage;
