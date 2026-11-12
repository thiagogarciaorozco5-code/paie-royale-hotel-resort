import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { PageHeader, EmptyState } from "@/components/layout/PageHeader";
import { RoomCard } from "@/components/catalog/RoomCard";
import { PackageCard } from "@/components/catalog/PackageCard";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/data/favorites";
import { publicPackages, publicRooms, usePackages, useRooms } from "@/data/repository";

export const Route = createFileRoute("/favoritos")({
  head: () => ({ meta: [{ title: "Mis favoritos — PAIE ROYALE" }, { name: "description", content: "Habitaciones y paquetes guardados en PAIE ROYALE." }, { property: "og:title", content: "Favoritos — PAIE ROYALE" }, { property: "og:description", content: "Tus habitaciones y paquetes guardados." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: () => {
    const favs = useFavorites();
    const rooms = publicRooms(useRooms()).filter((r) => favs.habitacion.includes(r.id));
    const pkgs = publicPackages(usePackages()).filter((p) => favs.paquete.includes(p.id));
    return (
      <div className="mx-auto max-w-6xl px-6 py-10">
        <PageHeader eyebrow="Guardados" title="Favoritos" description="Toca el corazón en cualquier habitación o paquete para guardarlo aquí." />
        {rooms.length + pkgs.length === 0 ? (
          <div className="mt-8"><EmptyState icon={<Heart className="h-6 w-6" />} title="Aún no tienes favoritos" description="Guarda las habitaciones y paquetes que más te gusten para compararlos después." action={<Button asChild><Link to="/habitaciones">Explorar habitaciones</Link></Button>} /></div>
        ) : (
          <div className="mt-8 space-y-10">
            {rooms.length > 0 && <section><h2 className="font-display text-3xl">Habitaciones</h2><div className="mt-4 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">{rooms.map((r) => <RoomCard key={r.id} room={r} />)}</div></section>}
            {pkgs.length > 0 && <section><h2 className="font-display text-3xl">Paquetes</h2><div className="mt-4 grid gap-6 md:grid-cols-2">{pkgs.map((p) => <PackageCard key={p.id} pkg={p} />)}</div></section>}
          </div>
        )}
      </div>
    );
  },
});
