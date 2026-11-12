import { Link } from "@tanstack/react-router";
import { CalendarCheck, LogIn } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/layout/PageHeader";
import { StatusBadge, reservationTone } from "@/components/catalog/StatusBadge";
import { useCurrentUser } from "@/data/auth";
import { useReservations } from "@/data/repository";
import { cancelReservation } from "@/data/reservations";
import { todayInBogota } from "@/lib/booking";
import { formatCOP, formatDate, paymentMethodLabel, paymentStatusLabel, reservationStatusLabel } from "@/lib/format";
import type { Reservation } from "@/lib/types";

function ReservationRow({ r, canCancel }: { r: Reservation; canCancel: boolean }) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-soft sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs tracking-wider text-muted-foreground">{r.code}</span>
          <StatusBadge tone={reservationTone(r.status)}>{reservationStatusLabel[r.status]}</StatusBadge>
        </div>
        <div className="mt-1 font-display text-2xl">{r.itemName}</div>
        <div className="text-sm text-muted-foreground">
          Hab. {r.roomNumber} · {formatDate(r.checkInDate)} → {formatDate(r.checkOutDate)} · {r.adults + r.children} huéspedes
        </div>
        <div className="mt-1 text-xs text-muted-foreground">{paymentMethodLabel[r.paymentMethod]} · {paymentStatusLabel[r.paymentStatus]}</div>
      </div>
      <div className="flex flex-col items-start gap-2 sm:items-end">
        <div className="font-display text-2xl font-semibold text-primary">{formatCOP(r.pricing.total)}</div>
        <div className="flex gap-2">
          {canCancel && (
            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => { cancelReservation(r.id); toast("Reserva cancelada", { description: r.code }); }}>
              Cancelar
            </Button>
          )}
          <Button asChild size="sm" variant="outline"><Link to="/reservas/$code" params={{ code: r.code }}>Ver detalle</Link></Button>
        </div>
      </div>
    </div>
  );
}

export function MyReservations() {
  const user = useCurrentUser();
  const all = useReservations();
  if (!user)
    return <EmptyState icon={<LogIn className="h-6 w-6" />} title="Inicia sesión para ver tus reservas" description="Tus reservas confirmadas y pasadas aparecerán aquí." action={<Button asChild><Link to="/login" search={{ redirect: "/reservas?tab=mis-reservas" }}>Iniciar sesión</Link></Button>} />;
  const today = todayInBogota();
  const mine = all.filter((r) => r.userId === user.id).sort((a, b) => a.checkInDate.localeCompare(b.checkInDate));
  const upcoming = mine.filter((r) => r.checkOutDate >= today && r.status !== "cancelada" && r.status !== "completada");
  const past = mine.filter((r) => !upcoming.includes(r)).reverse();
  if (!mine.length)
    return <EmptyState icon={<CalendarCheck className="h-6 w-6" />} title="Aún no tienes reservas" description="Cuando confirmes una reserva la verás aquí con su estado y recibo." action={<Button asChild><Link to="/habitaciones">Reservar ahora</Link></Button>} />;
  return (
    <div className="space-y-10">
      <section>
        <h2 className="font-display text-3xl">Próximas</h2>
        <div className="mt-4 space-y-3">{upcoming.length ? upcoming.map((r) => <ReservationRow key={r.id} r={r} canCancel={r.checkInDate > today} />) : <p className="text-sm text-muted-foreground">No tienes reservas próximas.</p>}</div>
      </section>
      <section>
        <h2 className="font-display text-3xl">Historial</h2>
        <div className="mt-4 space-y-3">{past.length ? past.map((r) => <ReservationRow key={r.id} r={r} canCancel={false} />) : <p className="text-sm text-muted-foreground">Sin reservas anteriores.</p>}</div>
      </section>
    </div>
  );
}
