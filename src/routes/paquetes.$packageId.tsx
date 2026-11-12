import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Check, Gift } from "lucide-react";
import { usePackages, useRooms } from "@/data/repository";
import { seedPackages } from "@/data/seed";
import { img } from "@/data/images";
import { ServiceSelector } from "@/components/booking/ServiceSelector";
import { BookingSidebar } from "@/components/booking/DetailBooking";
import { useBookingConfig } from "@/components/booking/useBookingConfig";
import { FavoriteButton } from "@/components/catalog/FavoriteButton";
import { EmptyState } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { formatCOP } from "@/lib/format";
import type { Package } from "@/lib/types";

export const Route = createFileRoute("/paquetes/$packageId")({
  loader: ({ params }) => ({ seed: seedPackages.find((p) => p.id === params.packageId) ?? null }),
  head: ({ loaderData }) => {
    const title = loaderData?.seed ? `${loaderData.seed.name} — Paquetes PAIE ROYALE` : "Paquete — PAIE ROYALE";
    const desc = loaderData?.seed?.description ?? "Paquete de experiencias en PAIE ROYALE.";
    return { meta: [{ title }, { name: "description", content: desc }, { property: "og:title", content: title }, { property: "og:description", content: desc }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] };
  },
  component: () => {
    const { packageId } = Route.useParams();
    const pkg = usePackages().find((p) => p.id === packageId && p.active);
    if (!pkg) return <div className="mx-auto max-w-3xl px-6 py-16"><EmptyState icon={<Gift />} title="Paquete no encontrado" description="Este paquete no existe o ya no está disponible." action={<Button asChild><Link to="/paquetes">Ver paquetes</Link></Button>} /></div>;
    return <PackageDetail pkg={pkg} />;
  },
});

function PackageDetail({ pkg }: { pkg: Package }) {
  const room = useRooms().find((r) => r.id === pkg.roomId);
  const cfg = useBookingConfig({ kind: "paquete", itemId: pkg.id, itemName: pkg.name, roomId: pkg.roomId, capacity: pkg.maxGuests, packagePrice: pkg.price, fixedNights: pkg.nights, serviceIds: pkg.extraServiceIds });
  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <Link to="/paquetes" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Paquetes</Link>
      <div className="mt-4 flex items-start justify-between gap-4">
        <div><div className="eyebrow text-gold">{pkg.tagline}</div><h1 className="mt-1 font-display text-4xl sm:text-5xl">{pkg.name}</h1></div>
        <FavoriteButton kind="paquete" id={pkg.id} name={pkg.name} />
      </div>
      <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_24rem]">
        <div className="min-w-0 space-y-10">
          <img src={img(pkg.image)} alt={pkg.name} width={1280} height={896} className="aspect-[16/10] w-full rounded-2xl object-cover" />
          <section>
            <p className="text-lg leading-relaxed">{pkg.description}</p>
            <p className="mt-2 text-sm text-muted-foreground">{pkg.nights} noches · hasta {pkg.maxGuests} personas{room ? ` · ${room.name} (Hab. ${room.number})` : ""}</p>
          </section>
          <section>
            <h2 className="font-display text-3xl">Incluye</h2>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">{pkg.includes.map((i) => <li key={i} className="flex gap-2 text-sm"><Check className="h-4 w-4 text-success" />{i}</li>)}</ul>
          </section>
          <section>
            <h2 className="font-display text-3xl">Extras opcionales</h2>
            <div className="mt-5"><ServiceSelector services={cfg.services} selected={cfg.serviceIds} onToggle={cfg.toggleService} /></div>
          </section>
        </div>
        <BookingSidebar cfg={cfg} capacity={pkg.maxGuests} priceLabel={`${formatCOP(pkg.price)} / paquete`} fixedNights={pkg.nights} />
      </div>
    </div>
  );
}
