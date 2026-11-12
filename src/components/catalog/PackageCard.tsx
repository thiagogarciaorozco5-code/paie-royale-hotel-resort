import { Link } from "@tanstack/react-router";
import { Check, Moon, Users } from "lucide-react";
import type { Package } from "@/lib/types";
import { img } from "@/data/images";
import { formatCOP } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { FavoriteButton } from "./FavoriteButton";

export function PackageCard({ pkg }: { pkg: Package }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-soft transition-shadow hover:shadow-lift">
      <div className="relative aspect-[16/10] overflow-hidden">
        <img src={img(pkg.image)} alt={pkg.name} loading="lazy" width={1280} height={896} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-hero-fade opacity-70" />
        <FavoriteButton kind="paquete" id={pkg.id} name={pkg.name} className="absolute top-3 right-3" />
        <div className="absolute bottom-4 left-5 right-5 text-primary-foreground">
          <div className="eyebrow text-gold">{pkg.tagline}</div>
          <h3 className="mt-1 font-display text-3xl leading-tight">{pkg.name}</h3>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><Moon className="h-3.5 w-3.5 text-gold" />{pkg.nights} noches</span>
          <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-gold" />Hasta {pkg.maxGuests} personas</span>
        </div>
        <ul className="mt-4 space-y-1.5 text-sm">
          {pkg.includes.slice(0, 4).map((inc) => (
            <li key={inc} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />{inc}</li>
          ))}
          {pkg.includes.length > 4 && <li className="pl-6 text-xs text-muted-foreground">+ {pkg.includes.length - 4} experiencias más</li>}
        </ul>
        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div>
            <div className="font-display text-2xl font-semibold text-primary">{formatCOP(pkg.price)}</div>
            <div className="text-xs text-muted-foreground">COP por paquete · valor demo</div>
          </div>
          <Button asChild size="sm">
            <Link to="/paquetes/$packageId" params={{ packageId: pkg.id }}>Ver detalles</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
