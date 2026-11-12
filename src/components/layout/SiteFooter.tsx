import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Music2 } from "lucide-react";
import { siteConfig } from "@/config/site";
import { Wordmark } from "@/components/brand/LogoMark";

export function SiteFooter() {
  const socials = [
    { href: siteConfig.socials.instagram, label: "Instagram", icon: Instagram },
    { href: siteConfig.socials.facebook, label: "Facebook", icon: Facebook },
    { href: siteConfig.socials.tiktok, label: "TikTok", icon: Music2 },
  ];
  return (
    <footer className="no-print mt-20 bg-forest text-forest-foreground">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-3">
        <div>
          <Wordmark />
          <p className="mt-4 max-w-xs text-sm text-forest-foreground/70">{siteConfig.slogan}.</p>
        </div>
        <div className="text-sm">
          <div className="eyebrow text-gold">Contacto</div>
          <ul className="mt-3 space-y-1.5 text-forest-foreground/80">
            <li>{siteConfig.location}</li>
            <li>{siteConfig.phone}</li>
            <li>{siteConfig.email}</li>
          </ul>
          <Link to="/ayuda" className="mt-3 inline-block text-gold underline-offset-4 hover:underline">
            Centro de ayuda
          </Link>
        </div>
        <div>
          <div className="eyebrow text-gold">Síguenos</div>
          <div className="mt-3 flex gap-2">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                aria-label={s.label}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-forest-foreground/20 transition-colors hover:border-gold hover:text-gold"
              >
                <s.icon className="h-4 w-4" />
              </a>
            ))}
          </div>
          <p className="mt-6 text-xs text-forest-foreground/50">
            Precios en COP de demostración. © {new Date().getFullYear()} PAIE ROYALE Hotel &amp; Resort.
          </p>
        </div>
      </div>
    </footer>
  );
}
