import { Link, useLocation } from "react-router-dom";

import bcaLogo from "@/assets/logos/bca.png";
import bniLogo from "@/assets/logos/bni.png";
import briLogo from "@/assets/logos/bri.png";
import mandiriLogo from "@/assets/logos/mandiri.png";
import bsiLogo from "@/assets/logos/bsi.png";
import gopayLogo from "@/assets/logos/gopay.png";
import ovoLogo from "@/assets/logos/ovo.png";
import danaLogo from "@/assets/logos/dana.png";
import shopeepayLogo from "@/assets/logos/shopeepay.png";
import linkajaLogo from "@/assets/logos/linkaja.png";

const paymentLogos = [
  { src: bcaLogo, alt: "BCA" },
  { src: bniLogo, alt: "BNI" },
  { src: briLogo, alt: "BRI" },
  { src: mandiriLogo, alt: "Mandiri" },
  { src: bsiLogo, alt: "BSI" },
  { src: gopayLogo, alt: "GoPay" },
  { src: ovoLogo, alt: "OVO" },
  { src: danaLogo, alt: "DANA" },
  { src: shopeepayLogo, alt: "ShopeePay" },
  { src: linkajaLogo, alt: "LinkAja" },
];

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
        {/* Marquee */}
        <div className="relative overflow-hidden mb-8">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-12 z-10 bg-gradient-to-r from-background/50 to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-12 z-10 bg-gradient-to-l from-background/50 to-transparent pointer-events-none" />

          <div className="flex animate-marquee whitespace-nowrap">
            {[...paymentLogos, ...paymentLogos].map((logo, i) => (
              <div
                key={`${logo.alt}-${i}`}
                className="flex-shrink-0 mx-6 flex items-center justify-center h-10 w-20 rounded-lg bg-white/90 p-1.5"
              >
                <img
                  src={logo.src}
                  alt={logo.alt}
                  className="h-full w-full object-contain"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mb-8">
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

        <div className="pt-6 border-t border-border/15 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <p className="text-[11px] text-muted-foreground/40">
            © {new Date().getFullYear()} DEIMOS. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
