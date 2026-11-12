import { createFileRoute, Link } from "@tanstack/react-router";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdminTitle } from "@/components/admin/AdminUi";
import { reservationsRepo, useReservations } from "@/data/repository";
import { formatCOP, formatDate, paymentStatusLabel, reservationStatusLabel } from "@/lib/format";
import type { PaymentStatus, ReservationStatus } from "@/lib/types";

export const Route = createFileRoute("/admin/reservas")({ component: () => {
  const list = [...useReservations()].sort((a, b) => a.checkInDate.localeCompare(b.checkInDate));
  return (
    <div>
      <AdminTitle title="Reservas" description="Actualiza el estado de la reserva y del pago." />
      <div className="divide-y rounded-2xl border bg-card">
        {list.map((r) => (
          <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
            <div><Link to="/reservas/$code" params={{ code: r.code }} className="font-mono text-xs hover:underline">{r.code}</Link> · {r.guestName}<div className="text-xs text-muted-foreground">{r.itemName} · Hab. {r.roomNumber} · {formatDate(r.checkInDate)} → {formatDate(r.checkOutDate)} · {formatCOP(r.pricing.total)}</div></div>
            <div className="flex gap-2">
              <Select value={r.status} onValueChange={(v) => reservationsRepo.patch(r.id, { status: v as ReservationStatus })}>
                <SelectTrigger className="h-8 w-36" aria-label="Estado de reserva"><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(reservationStatusLabel).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={r.paymentStatus} onValueChange={(v) => reservationsRepo.patch(r.id, { paymentStatus: v as PaymentStatus })}>
                <SelectTrigger className="h-8 w-48" aria-label="Estado de pago"><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(paymentStatusLabel).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} });
