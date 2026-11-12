import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdminTitle, ConfirmDelete } from "@/components/admin/AdminUi";
import { roomsRepo, useRooms } from "@/data/repository";
import { formatCOP, roomStatusLabel } from "@/lib/format";
import type { RoomStatus } from "@/lib/types";

export const Route = createFileRoute("/admin/habitaciones")({ component: () => {
  const rooms = useRooms();
  return (
    <div>
      <AdminTitle title="Habitaciones" description="Cambia la disponibilidad, desactiva o elimina habitaciones." />
      <div className="divide-y rounded-2xl border bg-card">
        {rooms.map((r) => (
          <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
            <div><Link to="/habitaciones/$roomId" params={{ roomId: r.id }} className="font-medium hover:underline">Hab. {r.number} · {r.name}</Link><div className="text-xs text-muted-foreground">{formatCOP(r.pricePerNight)} / noche · hasta {r.capacity}</div></div>
            <div className="flex items-center gap-2">
              <Select value={r.status} onValueChange={(v) => { roomsRepo.patch(r.id, { status: v as RoomStatus }); toast.success(`Hab. ${r.number}: ${roomStatusLabel[v]}`); }}>
                <SelectTrigger className="h-8 w-44" aria-label={`Estado habitación ${r.number}`}><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(roomStatusLabel).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
              </Select>
              <ConfirmDelete name={`la habitación ${r.number}`} onConfirm={() => { roomsRepo.remove(r.id); toast("Habitación eliminada"); }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} });
