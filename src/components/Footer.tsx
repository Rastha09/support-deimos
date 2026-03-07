import { Link, useLocation } from "react-router-dom";
import { Heart } from "lucide-react";

const Footer = () => {
  const location = useLocation();

  const links = [
    { to: "/about", label: "Tentang" },
    { to: "/terms", label: "Syarat & Ketentuan" },
    { to: "/privacy", label: "Privasi" },
    { to: "/contact", label: "Kontak" },
  ];

  return (
    <footer className="border-t border-border/20 bg-background/50 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto px-6 py-10 md:py-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <Heart className="w-4 h-4 text-primary" />
            </div>
            <span className="font-display font-bold text-lg text-gradient-gold">
              DEIMOS
            </span>
          </div>

          {/* Nav */}
          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm transition-colors duration-200 hover:text-primary ${
                  location.pathname === link.to
                    ? "text-primary font-medium"
                    : "text-muted-foreground/70 hover:text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-8 pt-6 border-t border-border/15 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <p className="text-[11px] text-muted-foreground/40">
            © {new Date().getFullYear()} DEIMOS. All rights reserved.
          </p>
          <p className="text-[11px] text-muted-foreground/30">
            Powered by QRISMU
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
