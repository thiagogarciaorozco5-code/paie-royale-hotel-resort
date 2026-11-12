import { createFileRoute, Link } from "@tanstack/react-router";
import { BedDouble, CalendarCheck, RotateCcw, Users, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { StatusBadge, reservationTone } from "@/components/catalog/StatusBadge";
import { resetDemoData, useReservations, useRooms, useUsers } from "@/data/repository";
import { todayInBogota } from "@/lib/booking";
import { formatCOP, formatDate, reservationStatusLabel } from "@/lib/format";

export const Route = createFileRoute("/admin/")({ component: Dashboard });

function Dashboard() {
  const reservations = useReservations();
  const rooms = useRooms();
  const users = useUsers();
  const today = todayInBogota();
  const active = reservations.filter((r) => r.status !== "cancelada");
  const inHouse = active.filter((r) => r.checkInDate <= today && r.checkOutDate > today);
  const upcoming = active.filter((r) => r.checkInDate > today);
  const revenue = active.reduce((a, r) => a + r.pricing.total, 0);
  const bookable = rooms.filter((r) => r.status === "disponible").length;
  const cards = [
    { icon: CalendarCheck, label: "Reservas próximas", value: String(upcoming.length) },
    { icon: BedDouble, label: "Ocupación hoy", value: `${inHouse.length}/${bookable}` },
    { icon: Wallet, label: "Ingresos registrados (demo)", value: formatCOP(revenue) },
    { icon: Users, label: "Clientes", value: String(users.filter((u) => u.role === "cliente").length) },
  ];
  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border bg-card p-5 shadow-soft">
            <c.icon className="h-5 w-5 text-gold" />
            <div className="mt-3 font-display text-3xl font-semibold">{c.value}</div>
            <div className="text-xs text-muted-foreground">{c.label}</div>
          </div>
        ))}
      </div>
      <section className="rounded-2xl border bg-card p-5 shadow-soft">
        <div className="flex items-center justify-between"><h2 className="font-display text-2xl">Reservas recientes</h2><Button asChild size="sm" variant="link"><Link to="/admin/reservas">Ver todas</Link></Button></div>
        <ul className="mt-3 divide-y">
          {[...reservations].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6).map((r) => (
            <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
              <div><span className="font-mono text-xs text-muted-foreground">{r.code}</span> · {r.guestName} · Hab. {r.roomNumber}</div>
              <div className="flex items-center gap-3"><span className="text-muted-foreground">{formatDate(r.checkInDate)}</span><StatusBadge tone={reservationTone(r.status)}>{reservationStatusLabel[r.status]}</StatusBadge></div>
            </li>
          ))}
        </ul>
      </section>
      <div className="flex items-center justify-between rounded-2xl border border-dashed p-4 text-sm">
        <span className="text-muted-foreground">Los datos son de demostración y se guardan en este navegador.</span>
        <Button variant="outline" size="sm" onClick={() => { resetDemoData(); toast.success("Datos de demostración restablecidos"); }}><RotateCcw /> Restablecer demo</Button>
      </div>
    </div>
  );
}
