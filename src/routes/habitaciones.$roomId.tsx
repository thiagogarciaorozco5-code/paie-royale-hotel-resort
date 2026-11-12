import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Bath, BedDouble, Check, Eye, Maximize2, Users } from "lucide-react";
import { useRooms } from "@/data/repository";
import { seedRooms } from "@/data/seed";
import { Gallery } from "@/components/booking/Gallery";
import { ServiceSelector } from "@/components/booking/ServiceSelector";
import { BookingSidebar } from "@/components/booking/DetailBooking";
import { useBookingConfig } from "@/components/booking/useBookingConfig";
import { FavoriteButton } from "@/components/catalog/FavoriteButton";
import { StatusBadge, roomStatusTone } from "@/components/catalog/StatusBadge";
import { EmptyState } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { formatCOP, roomStatusLabel } from "@/lib/format";
import type { Room } from "@/lib/types";

export const Route = createFileRoute("/habitaciones/$roomId")({
  loader: ({ params }) => ({ seed: seedRooms.find((r) => r.id === params.roomId) ?? null }),
  head: ({ loaderData }) => {
    const title = loaderData?.seed ? `${loaderData.seed.name} · Hab. ${loaderData.seed.number} — PAIE ROYALE` : "Habitación — PAIE ROYALE";
    const desc = loaderData?.seed?.shortDescription ?? "Detalle de habitación en PAIE ROYALE Hotel & Resort.";
    return { meta: [{ title }, { name: "description", content: desc }, { property: "og:title", content: title }, { property: "og:description", content: desc }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] };
  },
  component: RoomDetailPage,
});

function RoomDetailPage() {
  const { roomId } = Route.useParams();
  const room = useRooms().find((r) => r.id === roomId && r.status !== "inactiva");
  if (!room)
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <EmptyState icon={<BedDouble />} title="Habitación no encontrada" description="Esta habitación no existe o ya no está publicada." action={<Button asChild><Link to="/habitaciones">Ver habitaciones</Link></Button>} />
      </div>
    );
  return <RoomDetail room={room} />;
}

function RoomDetail({ room }: { room: Room }) {
  const cfg = useBookingConfig({ kind: "habitacion", itemId: room.id, itemName: `${room.name} · Hab. ${room.number}`, roomId: room.id, capacity: room.capacity, nightlyPrice: room.pricePerNight });
  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <Link to="/habitaciones" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Habitaciones</Link>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="eyebrow text-gold">Habitación {room.number}</div>
          <h1 className="mt-1 font-display text-4xl sm:text-5xl">{room.name}</h1>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge tone={roomStatusTone(room.status)}>{roomStatusLabel[room.status]}</StatusBadge>
          <FavoriteButton kind="habitacion" id={room.id} name={room.name} />
        </div>
      </div>
      <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_24rem]">
        <div className="min-w-0 space-y-10">
          <Gallery images={room.images} alt={room.name} />
          <section>
            <p className="text-lg leading-relaxed">{room.description}</p>
            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                { icon: BedDouble, label: "Configuración de camas", value: room.bedConfiguration },
                { icon: Users, label: "Capacidad", value: `Hasta ${room.capacity} huéspedes` },
                { icon: Maximize2, label: "Tamaño", value: `${room.sizeM2} m²` },
                { icon: Eye, label: "Vista", value: room.view },
              ].map((d) => (
                <div key={d.label} className="flex gap-3 rounded-xl border bg-card p-4">
                  <d.icon className="mt-0.5 h-5 w-5 text-gold" />
                  <div><dt className="text-xs text-muted-foreground">{d.label}</dt><dd className="text-sm font-medium">{d.value}</dd></div>
                </div>
              ))}
            </dl>
          </section>
          <section>
            <h2 className="font-display text-3xl">Amenidades</h2>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {room.amenities.map((a) => <li key={a} className="flex gap-2 text-sm"><Check className="h-4 w-4 text-success" />{a}</li>)}
            </ul>
            <div className="mt-6 flex gap-3 rounded-xl bg-secondary p-4 text-sm"><Bath className="h-5 w-5 shrink-0 text-gold" />{room.bathroom}</div>
          </section>
          <section>
            <h2 className="font-display text-3xl">Servicios disponibles para tu estadía</h2>
            <p className="mt-1 text-sm text-muted-foreground">Los servicios en verde se pueden agregar. Los oscuros no están disponibles por ahora.</p>
            <div className="mt-5"><ServiceSelector services={cfg.services} selected={cfg.serviceIds} onToggle={cfg.toggleService} /></div>
          </section>
          <section>
            <h2 className="font-display text-3xl">Políticas</h2>
            <ul className="mt-4 list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">{room.policies.map((p) => <li key={p}>{p}</li>)}</ul>
          </section>
        </div>
        <BookingSidebar cfg={cfg} capacity={room.capacity} priceLabel={`${formatCOP(room.pricePerNight)} / noche`} />
      </div>
    </div>
  );
}
