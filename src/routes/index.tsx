import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Leaf, Sparkles, Waves } from "lucide-react";
import { Button } from "@/components/ui/button";
import { heroImage } from "@/data/images";
import { RoomsCatalog } from "@/components/catalog/RoomsCatalog";
import { PackageCard } from "@/components/catalog/PackageCard";
import { publicPackages, usePackages, usePromotions } from "@/data/repository";
import { siteConfig } from "@/config/site";
import { todayInBogota } from "@/lib/booking";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PAIE ROYALE — Hotel & Resort de lujo en Colombia" },
      { name: "description", content: "Habitaciones, suites y paquetes de experiencias entre la Sierra Nevada y el Caribe colombiano. Reserva en línea." },
      { property: "og:title", content: "PAIE ROYALE — Hotel & Resort" },
      { property: "og:description", content: "Lujo, naturaleza y experiencias inolvidables en Colombia." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const packages = publicPackages(usePackages()).slice(0, 3);
  const today = todayInBogota();
  const promo = usePromotions().find((p) => p.active && p.validUntil >= today);

  return (
    <div>
      <section className="relative isolate overflow-hidden">
        <img src={heroImage} alt="Piscina infinita de PAIE ROYALE frente a la Sierra Nevada y el mar Caribe" width={1920} height={1088} className="absolute inset-0 -z-10 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-hero-fade" />
        <div className="mx-auto flex min-h-[78vh] max-w-6xl flex-col justify-end px-6 pt-32 pb-16 text-primary-foreground sm:pb-20">
          <div className="rise-in eyebrow text-gold">{siteConfig.location}</div>
          <h1 className="rise-in mt-4 max-w-3xl font-display text-5xl leading-[1.02] font-medium sm:text-7xl" style={{ animationDelay: "0.1s" }}>
            Donde la selva <em className="text-gold-gradient not-italic">abraza</em> el mar.
          </h1>
          <p className="rise-in mt-5 max-w-xl text-lg text-primary-foreground/85" style={{ animationDelay: "0.2s" }}>
            {siteConfig.slogan}. Suites con piscina privada, gastronomía de autor y rituales de bienestar en el Caribe colombiano.
          </p>
          <div className="rise-in mt-8 flex flex-wrap gap-3" style={{ animationDelay: "0.3s" }}>
            <Button asChild variant="gold" size="lg">
              <a href="#habitaciones">Explorar habitaciones <ArrowRight /></a>
            </Button>
            <Button asChild variant="hero" size="lg">
              <Link to="/paquetes">Ver paquetes</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="border-b bg-card">
        <div className="mx-auto grid max-w-6xl gap-6 px-6 py-8 sm:grid-cols-3">
          {[
            { icon: Waves, title: "Frente al Caribe", text: "Atardeceres dorados desde cada terraza." },
            { icon: Leaf, title: "Reserva natural", text: "Jardines tropicales y selva nativa." },
            { icon: Sparkles, title: "Servicio Royale", text: "Mayordomo, spa y gastronomía de autor." },
          ].map((f) => (
            <div key={f.title} className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold-soft text-primary"><f.icon className="h-5 w-5" /></div>
              <div>
                <div className="font-display text-xl">{f.title}</div>
                <p className="text-sm text-muted-foreground">{f.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="habitaciones" className="mx-auto max-w-6xl scroll-mt-20 px-6 pt-16">
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="eyebrow text-gold">Habitaciones &amp; suites</div>
            <h2 className="mt-2 font-display text-4xl sm:text-5xl">Tu refugio en el paraíso</h2>
          </div>
          <p className="max-w-sm text-sm text-muted-foreground">Elige tu habitación y, dentro del detalle, selecciona fechas, huéspedes y servicios.</p>
        </div>
        <RoomsCatalog />
      </section>

      {promo && (
        <section className="mx-auto mt-16 max-w-6xl px-6">
          <div className="flex flex-col items-start justify-between gap-4 rounded-2xl bg-forest p-8 text-forest-foreground sm:flex-row sm:items-center">
            <div>
              <div className="eyebrow text-gold">Promoción vigente</div>
              <div className="mt-1 font-display text-3xl">{promo.title}</div>
              <p className="mt-1 text-sm text-forest-foreground/75">{promo.description} Código <strong className="text-gold">{promo.code}</strong>.</p>
            </div>
            <Button asChild variant="gold"><Link to="/promociones">Ver promociones</Link></Button>
          </div>
        </section>
      )}

      <section className="mx-auto mt-16 max-w-6xl px-6">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <div className="eyebrow text-gold">Paquetes</div>
            <h2 className="mt-2 font-display text-4xl sm:text-5xl">Experiencias completas</h2>
          </div>
          <Button asChild variant="link" className="hidden sm:inline-flex"><Link to="/paquetes">Ver todos <ArrowRight /></Link></Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {packages.map((p) => <PackageCard key={p.id} pkg={p} />)}
        </div>
      </section>
    </div>
  );
}
