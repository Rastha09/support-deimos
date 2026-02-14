import { Link, useLocation } from "react-router-dom";
import { Heart } from "lucide-react";

const Footer = () => {
  const location = useLocation();
  
  const links = [
    { to: "/about", label: "Tentang Saya" },
    { to: "/terms", label: "Syarat & Ketentuan" },
    { to: "/privacy", label: "Kebijakan Privasi" },
    { to: "/contact", label: "Kontak" },
  ];

  return (
    <footer className="border-t border-border/50 bg-card/30">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-primary" />
            <span className="font-display font-semibold text-gradient-gold">DEIMOS</span>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-6">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm transition-colors hover:text-primary ${
                  location.pathname === link.to
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} DEIMOS
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
