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
    <footer className="border-t border-border/30">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex flex-col items-center gap-8">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Heart className="w-4 h-4 text-primary" />
            </div>
            <span className="font-display font-bold text-lg text-gradient-gold">
              DEIMOS
            </span>
          </div>

          {/* Nav */}
          <nav className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm transition-colors duration-200 hover:text-primary ${
                  location.pathname === link.to
                    ? "text-primary font-medium"
                    : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Divider */}
          <div className="w-16 h-px bg-border/50" />

          <p className="text-xs text-muted-foreground/60">
            © {new Date().getFullYear()} DEIMOS. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
