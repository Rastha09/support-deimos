import { Send, Users, Mail, ExternalLink } from "lucide-react";
import PageShell from "@/components/PageShell";

const contacts = [
  {
    icon: Send,
    label: "Telegram Personal",
    value: "@Dms_96",
    href: "https://t.me/Dms_96",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Users,
    label: "Grup Telegram",
    value: "DEIMOS Public",
    href: "https://t.me/deimos_public",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
];

const ContactPage = () => {
  return (
    <PageShell title="Kontak" badge="Hubungi" badgeIcon={<Mail className="w-3 h-3 text-primary" />}>
      <div className="space-y-3">
        <p className="text-muted-foreground text-sm mb-5">
          Hubungi saya melalui platform berikut:
        </p>

        {contacts.map((c) => (
          <a
            key={c.href}
            href={c.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-4 p-5 rounded-2xl card-glass hover:border-primary/25 hover:bg-card/60 transition-all duration-300"
          >
            <div className={`w-12 h-12 rounded-xl ${c.bgColor} flex items-center justify-center group-hover:shadow-[0_0_16px_-4px_hsl(var(--primary)/0.25)] transition-all duration-300`}>
              <c.icon className={`w-5 h-5 ${c.color}`} />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground group-hover:text-primary transition-colors text-[15px]">{c.label}</p>
              <p className="text-sm text-muted-foreground">{c.value}</p>
            </div>
            <ExternalLink className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary/50 transition-colors" />
          </a>
        ))}
      </div>
    </PageShell>
  );
};

export default ContactPage;
