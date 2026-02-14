import { ArrowLeft, Send, Users } from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";

const ContactPage = () => {
  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col">
      <div className="flex-1 max-w-2xl mx-auto px-6 py-16">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </Link>
        <h1 className="text-3xl font-bold font-display text-gradient-gold mb-6">Kontak</h1>
        <div className="card-glass rounded-2xl p-6 space-y-6">
          <p className="text-secondary-foreground">
            Hubungi saya melalui platform berikut:
          </p>

          <div className="space-y-4">
            <a
              href="https://t.me/Dms_96"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50 border border-border/50 hover:border-primary/30 transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Send className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground group-hover:text-primary transition-colors">Telegram Personal</p>
                <p className="text-sm text-muted-foreground">@Dms_96</p>
              </div>
            </a>

            <a
              href="https://t.me/deimos_public"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50 border border-border/50 hover:border-primary/30 transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground group-hover:text-primary transition-colors">Grup Telegram</p>
                <p className="text-sm text-muted-foreground">DEIMOS Public</p>
              </div>
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ContactPage;
