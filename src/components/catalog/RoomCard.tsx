import { Link } from "@tanstack/react-router";
import { BedDouble, Maximize2, Users } from "lucide-react";
import type { Room } from "@/lib/types";
import { img } from "@/data/images";
import { bedTypeLabel, formatCOP, roomStatusLabel } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { FavoriteButton } from "./FavoriteButton";
import { StatusBadge, roomStatusTone } from "./StatusBadge";

export function RoomCard({ room, layout = "grid" }: { room: Room; layout?: "grid" | "list" }) {
  const list = layout === "list";
  return (
    <article
      className={`group overflow-hidden rounded-2xl border border-border/70 bg-card shadow-soft transition-shadow hover:shadow-lift ${list ? "sm:grid sm:grid-cols-[18rem_1fr]" : "flex flex-col"}`}
    >
      <div className={`relative overflow-hidden ${list ? "aspect-[4/3] sm:aspect-auto sm:h-full" : "aspect-[4/3]"}`}>
        <img
          src={img(room.images[0])}
          alt={room.name}
          loading="lazy"
          width={1280}
          height={896}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3 rounded-full bg-overlay/70 px-3 py-1 text-xs font-medium tracking-wider text-primary-foreground backdrop-blur">
          Hab. {room.number}
        </div>
        <FavoriteButton kind="habitacion" id={room.id} name={room.name} className="absolute top-3 right-3" />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-2xl leading-tight">{room.name}</h3>
          <StatusBadge tone={roomStatusTone(room.status)} className="shrink-0">{roomStatusLabel[room.status]}</StatusBadge>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{room.shortDescription}</p>
        <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
          <li className="flex items-center gap-1.5"><BedDouble className="h-3.5 w-3.5 text-gold" />{bedTypeLabel[room.bedType]}</li>
          <li className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-gold" />Hasta {room.capacity}</li>
          <li className="flex items-center gap-1.5"><Maximize2 className="h-3.5 w-3.5 text-gold" />{room.sizeM2} m²</li>
        </ul>
        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div>
            <div className="font-display text-2xl font-semibold text-primary">{formatCOP(room.pricePerNight)}</div>
            <div className="text-xs text-muted-foreground">COP / noche · valor demo</div>
          </div>
          <Button asChild size="sm">
            <Link to="/habitaciones/$roomId" params={{ roomId: room.id }}>Ver detalles</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
