import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Download, FileX, Mail, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmptyState } from "@/components/layout/PageHeader";
import { PriceSummary } from "@/components/booking/PriceSummary";
import { StatusBadge, reservationTone } from "@/components/catalog/StatusBadge";
import { Wordmark } from "@/components/brand/LogoMark";
import { isAdmin, useCurrentUser } from "@/data/auth";
import { useReservations } from "@/data/repository";
import { formatCOP, formatDate, formatTime, paymentMethodLabel, paymentStatusLabel, reservationStatusLabel } from "@/lib/format";
import { siteConfig } from "@/config/site";
import type { Reservation } from "@/lib/types";

export const Route = createFileRoute("/reservas/$code")({
  head: ({ params }) => ({ meta: [{ title: `Reserva ${params.code} — PAIE ROYALE` }, { name: "description", content: "Recibo y detalle de tu reserva en PAIE ROYALE." }, { name: "robots", content: "noindex" }, { property: "og:title", content: "Recibo de reserva — PAIE ROYALE" }, { property: "og:description", content: "Detalle de tu reserva." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: ReceiptPage,
});

function receiptText(r: Reservation) {
  const lines = [
    `PAIE ROYALE — HOTEL & RESORT`,
    `Recibo de reserva ${r.code}`,
    ``,
    `Huésped: ${r.guestName} (${r.guestEmail})`,
    `${r.itemName} · Habitación ${r.roomNumber}`,
    `Llegada: ${formatDate(r.checkInDate, true)} ${formatTime(r.checkInTime)}`,
    `Salida: ${formatDate(r.checkOutDate, true)} ${formatTime(r.checkOutTime)}`,
    `Huéspedes: ${r.adults} adultos, ${r.children} niños`,
    ``,
    `${r.pricing.lodging.label} (${r.pricing.lodging.detail}): ${formatCOP(r.pricing.lodging.amount)}`,
    ...r.pricing.services.map((s) => `${s.label} (${s.detail}): ${formatCOP(s.amount)}`),
    `Subtotal: ${formatCOP(r.pricing.subtotal)}`,
    ...(r.pricing.discount ? [`Descuento ${r.pricing.discountLabel}: -${formatCOP(r.pricing.discount)}`] : []),
    `IVA 19%: ${formatCOP(r.pricing.iva)}`,
    `Seguro hotelero: ${formatCOP(r.pricing.insurance)}`,
    `TOTAL: ${formatCOP(r.pricing.total)} COP`,
    ``,
    `Pago: ${paymentMethodLabel[r.paymentMethod]} — ${paymentStatusLabel[r.paymentStatus]}`,
    `Estado: ${reservationStatusLabel[r.status]}`,
    ``,
    `Documento de demostración. Valores en COP de prueba.`,
  ];
  return lines.join("\n");
}

function ReceiptPage() {
  const { code } = Route.useParams();
  const user = useCurrentUser();
  const r = useReservations().find((x) => x.code === code);
  const [emailOpen, setEmailOpen] = useState(false);

  if (!r || !user || (r.userId !== user.id && !isAdmin(user)))
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <EmptyState icon={<FileX className="h-6 w-6" />} title="Reserva no disponible" description={user ? "No encontramos esta reserva en tu cuenta." : "Inicia sesión con la cuenta que hizo la reserva para verla."} action={user ? <Button asChild><Link to="/reservas" search={{ tab: "mis-reservas" }}>Mis reservas</Link></Button> : <Button asChild><Link to="/login" search={{ redirect: `/reservas/${code}` }}>Iniciar sesión</Link></Button>} />
      </div>
    );

  const download = () => {
    const blob = new Blob([receiptText(r)], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `recibo-${r.code}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="no-print rise-in mb-6 flex items-start gap-3 rounded-2xl bg-success-soft p-5 text-success">
        <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0" />
        <div>
          <div className="font-medium">Reserva registrada</div>
          <p className="text-sm">Código <strong className="font-mono">{r.code}</strong> · {paymentStatusLabel[r.paymentStatus]}</p>
        </div>
      </div>
      <article className="rounded-2xl border bg-card p-6 shadow-soft sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b pb-6">
          <Wordmark />
          <div className="text-right">
            <div className="eyebrow text-gold">Recibo</div>
            <div className="font-mono text-lg">{r.code}</div>
            <StatusBadge tone={reservationTone(r.status)}>{reservationStatusLabel[r.status]}</StatusBadge>
          </div>
        </div>
        <dl className="grid gap-4 py-6 text-sm sm:grid-cols-2">
          <div><dt className="text-xs text-muted-foreground">Huésped</dt><dd>{r.guestName}<br />{r.guestEmail}</dd></div>
          <div><dt className="text-xs text-muted-foreground">Reserva</dt><dd>{r.itemName}<br />Habitación {r.roomNumber}</dd></div>
          <div><dt className="text-xs text-muted-foreground">Llegada</dt><dd>{formatDate(r.checkInDate, true)} · {formatTime(r.checkInTime)}</dd></div>
          <div><dt className="text-xs text-muted-foreground">Salida</dt><dd>{formatDate(r.checkOutDate, true)} · {formatTime(r.checkOutTime)}</dd></div>
          <div><dt className="text-xs text-muted-foreground">Huéspedes</dt><dd>{r.adults} adultos · {r.children} niños</dd></div>
          <div><dt className="text-xs text-muted-foreground">Pago</dt><dd>{paymentMethodLabel[r.paymentMethod]} — {paymentStatusLabel[r.paymentStatus]}{r.paymentReference ? <><br /><span className="text-muted-foreground">{r.paymentReference}</span></> : null}</dd></div>
        </dl>
        {r.paymentMethod === "transferencia" && r.paymentStatus === "pendiente_verificacion" && (
          <div className="mb-6 rounded-xl bg-secondary p-4 text-sm">Transfiere a {siteConfig.bank.name}, {siteConfig.bank.accountType} {siteConfig.bank.accountNumber}, usando <strong>{r.code}</strong> como referencia.</div>
        )}
        <div className="border-t pt-6"><PriceSummary pricing={r.pricing} /></div>
      </article>
      <div className="no-print mt-6 flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => window.print()}><Printer /> Imprimir</Button>
        <Button variant="outline" onClick={download}><Download /> Descargar</Button>
        <Button variant="outline" onClick={() => setEmailOpen(true)}><Mail /> Enviar por correo</Button>
        <Button asChild variant="link"><Link to="/reservas" search={{ tab: "mis-reservas" }}>Ver mis reservas</Link></Button>
      </div>
      <Dialog open={emailOpen} onOpenChange={setEmailOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Envío por correo pendiente</DialogTitle>
            <DialogDescription>
              El servicio de correo aún no está configurado, así que no se envió ningún mensaje a {r.guestEmail}. Mientras tanto puedes descargar o imprimir el recibo.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter><Button onClick={() => { download(); setEmailOpen(false); }}><Download /> Descargar recibo</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
