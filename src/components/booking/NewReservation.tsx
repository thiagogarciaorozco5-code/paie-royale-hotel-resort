import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { CalendarDays, CalendarPlus, Loader2, Lock, Pencil, Tag, Trash2, Users, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/layout/PageHeader";
import { PriceSummary } from "./PriceSummary";
import { PaymentSection, type CardErrors, type CardState } from "./PaymentSection";
import { ServiceSelector } from "./ServiceSelector";
import { clearDraft, patchDraft, useDraft } from "@/data/draft";
import { useCurrentUser } from "@/data/auth";
import { usePackages, usePromotions, useReservations, useRooms, useServices } from "@/data/repository";
import { BookingError, createReservation, priceDraft, type PaymentResult } from "@/data/reservations";
import { img } from "@/data/images";
import { cardBrand, expiryValid, isPromoValid, luhnValid, todayInBogota } from "@/lib/booking";
import { formatDate, formatTime } from "@/lib/format";
import type { BookingDraft } from "@/lib/types";

const emptyCard: CardState = { name: "", number: "", expiry: "", cvv: "" };

export function NewReservation() {
  const draft = useDraft();
  if (!draft)
    return (
      <EmptyState
        icon={<CalendarPlus className="h-6 w-6" />}
        title="No tienes una reserva en curso"
        description="Abre una habitación o un paquete, elige fechas, huéspedes y servicios, y pulsa “Continuar a reserva”."
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Button asChild><Link to="/habitaciones">Ver habitaciones</Link></Button>
            <Button asChild variant="outline"><Link to="/paquetes">Ver paquetes</Link></Button>
          </div>
        }
      />
    );
  return <DraftEditor draft={draft} />;
}

function DraftEditor({ draft }: { draft: BookingDraft }) {
  const navigate = useNavigate();
  const user = useCurrentUser();
  const rooms = useRooms();
  const packages = usePackages();
  const services = useServices();
  const promotions = usePromotions();
  useReservations(); // re-render when availability changes
  const [promoInput, setPromoInput] = useState(draft.promoCode ?? "");
  const [promoError, setPromoError] = useState("");
  const [card, setCard] = useState<CardState>(emptyCard);
  const [cardErrors, setCardErrors] = useState<CardErrors>({});
  const [transferFile, setTransferFile] = useState("");
  const [methodError, setMethodError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const pkg = draft.kind === "paquete" ? packages.find((p) => p.id === draft.itemId) : undefined;
  const room = rooms.find((r) => r.id === (pkg ? pkg.roomId : draft.itemId));
  if (!room || (draft.kind === "paquete" && !pkg)) {
    return (
      <EmptyState icon={<X className="h-6 w-6" />} title="Este elemento ya no está disponible" description="La habitación o paquete de tu reserva fue retirado del catálogo." action={<Button onClick={clearDraft}>Descartar reserva</Button>} />
    );
  }

  const pricing = priceDraft(draft);
  const offered = pkg ? services.filter((s) => pkg.extraServiceIds.includes(s.id)) : services;
  const today = todayInBogota();
  const editLink = pkg
    ? ({ to: "/paquetes/$packageId", params: { packageId: pkg.id } } as const)
    : ({ to: "/habitaciones/$roomId", params: { roomId: room.id } } as const);

  const toggleService = (id: string) => {
    const s = services.find((x) => x.id === id);
    if (!s?.available) return;
    patchDraft({ serviceIds: draft.serviceIds.includes(id) ? draft.serviceIds.filter((x) => x !== id) : [...draft.serviceIds, id] });
  };

  const applyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    const promo = promotions.find((p) => p.code.toUpperCase() === code);
    if (!code) return setPromoError("Escribe un código.");
    if (!promo) return setPromoError("El código no existe.");
    if (!isPromoValid(promo, draft.kind, today))
      return setPromoError(promo.validUntil < today ? "Este código ya venció." : "Este código no aplica para esta reserva.");
    setPromoError("");
    patchDraft({ promoCode: promo.code });
    toast.success("Código aplicado", { description: `${promo.discountPercent}% de descuento` });
  };

  const validatePayment = (): PaymentResult | null => {
    if (!draft.paymentMethod) {
      setMethodError("Elige un método de pago.");
      return null;
    }
    setMethodError("");
    if (draft.paymentMethod === "efectivo") return { method: "efectivo", status: "pendiente_hotel" };
    if (draft.paymentMethod === "transferencia")
      return { method: "transferencia", status: "pendiente_verificacion", reference: transferFile || undefined };
    const e: CardErrors = {};
    if (card.name.trim().length < 3) e.name = "Escribe el nombre como aparece en la tarjeta.";
    if (!luhnValid(card.number)) e.number = "Número de tarjeta no válido.";
    if (!expiryValid(card.expiry, today)) e.expiry = "Fecha de vencimiento no válida o vencida.";
    if (!/^\d{3,4}$/.test(card.cvv)) e.cvv = "CVV de 3 o 4 dígitos.";
    setCardErrors(e);
    if (Object.keys(e).length) return null;
    const digits = card.number.replace(/\D/g, "");
    return { method: "tarjeta", status: "aprobado_demo", reference: `${cardBrand(digits)} •••• ${digits.slice(-4)}` };
  };

  const confirm = async () => {
    setSubmitError("");
    if (!user) {
      toast("Inicia sesión para confirmar", { description: "Tu reserva se conserva mientras ingresas." });
      navigate({ to: "/login", search: { redirect: "/reservas" } });
      return;
    }
    const payment = validatePayment();
    if (!payment) return;
    setSubmitting(true);
    try {
      if (payment.method === "tarjeta") {
        await new Promise((r) => setTimeout(r, 900));
        if (card.number.replace(/\D/g, "").endsWith("0002")) throw new BookingError("Pago rechazado (simulación). Prueba con otra tarjeta u otro método.");
      }
      const reservation = await createReservation(draft, user, payment);
      setCard(emptyCard); // card data is discarded immediately
      clearDraft();
      toast.success("¡Reserva registrada!", { description: reservation.code });
      navigate({ to: "/reservas/$code", params: { code: reservation.code } });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "No pudimos registrar la reserva. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_24rem]">
      <div className="min-w-0 space-y-8">
        <section className="overflow-hidden rounded-2xl border bg-card shadow-soft sm:grid sm:grid-cols-[14rem_1fr]">
          <img src={img(pkg ? pkg.image : room.images[0])} alt="" width={640} height={448} className="aspect-[4/3] h-full w-full object-cover" />
          <div className="p-5">
            <div className="eyebrow text-gold">{pkg ? "Paquete" : `Habitación ${room.number}`}</div>
            <h2 className="mt-1 font-display text-3xl">{pkg ? pkg.name : room.name}</h2>
            {pkg && <p className="text-sm text-muted-foreground">{room.name} · Hab. {room.number}</p>}
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div className="flex gap-2"><CalendarDays className="h-4 w-4 text-gold" /><div><dt className="text-xs text-muted-foreground">Llegada</dt><dd>{formatDate(draft.checkInDate, true)} · {formatTime(draft.checkInTime)}</dd></div></div>
              <div className="flex gap-2"><CalendarDays className="h-4 w-4 text-gold" /><div><dt className="text-xs text-muted-foreground">Salida</dt><dd>{formatDate(draft.checkOutDate, true)} · {formatTime(draft.checkOutTime)}</dd></div></div>
              <div className="flex gap-2"><Users className="h-4 w-4 text-gold" /><div><dt className="text-xs text-muted-foreground">Huéspedes</dt><dd>{draft.adults} {draft.adults === 1 ? "adulto" : "adultos"}{draft.children ? `, ${draft.children} ${draft.children === 1 ? "niño" : "niños"}` : ""}</dd></div></div>
            </dl>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button asChild size="sm" variant="outline"><Link {...editLink}><Pencil /> Editar fechas y huéspedes</Link></Button>
              <Button size="sm" variant="ghost" className="text-destructive" onClick={() => { clearDraft(); toast("Reserva en curso eliminada"); }}><Trash2 /> Eliminar</Button>
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-display text-3xl">{pkg ? "Extras opcionales" : "Servicios de tu estadía"}</h2>
          <p className="mt-1 text-sm text-muted-foreground">Agrega o quita servicios; el total se actualiza al instante.</p>
          <div className="mt-4"><ServiceSelector services={offered} selected={draft.serviceIds} onToggle={toggleService} /></div>
        </section>

        <section>
          <h2 className="font-display text-3xl">Método de pago</h2>
          <div className="mt-4">
            <PaymentSection
              method={draft.paymentMethod}
              onMethod={(m) => { patchDraft({ paymentMethod: m }); setMethodError(""); }}
              card={card}
              onCard={(c) => setCard((p) => ({ ...p, ...c }))}
              cardErrors={cardErrors}
              transferFile={transferFile}
              onTransferFile={setTransferFile}
              error={methodError}
            />
          </div>
        </section>
      </div>

      <aside className="h-fit rounded-2xl border bg-card p-5 shadow-lift lg:sticky lg:top-20">
        <div className="eyebrow text-gold">Resumen</div>
        <div className="mt-4"><PriceSummary pricing={pricing} /></div>
        <div className="mt-5 border-t pt-4">
          <label htmlFor="promo" className="flex items-center gap-1.5 text-xs text-muted-foreground"><Tag className="h-3.5 w-3.5" /> Código promocional</label>
          {draft.promoCode && pricing.discount > 0 ? (
            <div className="mt-2 flex items-center justify-between rounded-lg bg-success-soft px-3 py-2 text-sm text-success">
              <span className="font-mono">{draft.promoCode}</span>
              <button type="button" className="text-xs underline" onClick={() => { patchDraft({ promoCode: undefined }); setPromoInput(""); }}>Quitar</button>
            </div>
          ) : (
            <div className="mt-2 flex gap-2">
              <Input id="promo" value={promoInput} onChange={(e) => setPromoInput(e.target.value)} placeholder="ROYALE15" className="uppercase" />
              <Button type="button" variant="outline" onClick={applyPromo}>Aplicar</Button>
            </div>
          )}
          {promoError && <p role="alert" className="mt-1 text-xs text-destructive">{promoError}</p>}
        </div>
        {submitError && <div role="alert" className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{submitError}</div>}
        <Button size="lg" className="mt-5 w-full" onClick={confirm} disabled={submitting}>
          {submitting ? <><Loader2 className="animate-spin" /> Procesando…</> : user ? "Confirmar reserva" : <><Lock /> Iniciar sesión y confirmar</>}
        </Button>
        {!user && <p className="mt-2 text-center text-xs text-muted-foreground">Solo pedimos tu cuenta al confirmar. Tu selección se conserva.</p>}
        <Button asChild variant="link" className="mt-1 w-full"><Link to="/habitaciones">Seguir explorando</Link></Button>
      </aside>
    </div>
  );
}
