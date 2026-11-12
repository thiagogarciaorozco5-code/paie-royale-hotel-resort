import type { PriceBreakdown } from "@/lib/types";
import { formatCOP } from "@/lib/format";
import { INSURANCE_PER_GUEST_NIGHT, IVA_RATE } from "@/lib/booking";

export function PriceSummary({ pricing, compact = false }: { pricing: PriceBreakdown; compact?: boolean }) {
  const Row = ({ label, detail, amount, muted, negative }: { label: string; detail?: string; amount: number; muted?: boolean; negative?: boolean }) => (
    <div className={`flex items-start justify-between gap-4 py-1.5 text-sm ${muted ? "text-muted-foreground" : ""}`}>
      <div>
        <div>{label}</div>
        {detail && <div className="text-xs text-muted-foreground">{detail}</div>}
      </div>
      <div className={`shrink-0 tabular-nums ${negative ? "text-success" : ""}`}>{negative ? "−" : ""}{formatCOP(amount)}</div>
    </div>
  );
  return (
    <div>
      <Row label={pricing.lodging.label} detail={pricing.lodging.detail} amount={pricing.lodging.amount} />
      {pricing.services.map((s) => (
        <Row key={s.label} label={s.label} detail={s.detail} amount={s.amount} />
      ))}
      <div className="my-2 border-t border-dashed" />
      <Row label="Subtotal" amount={pricing.subtotal} muted={compact} />
      {pricing.discount > 0 && <Row label="Descuento" detail={pricing.discountLabel} amount={pricing.discount} negative />}
      <Row label={`IVA (${Math.round(IVA_RATE * 100)}%)`} detail="Impuesto sobre alojamiento y servicios" amount={pricing.iva} muted />
      <Row label="Seguro hotelero" detail={`${formatCOP(INSURANCE_PER_GUEST_NIGHT)} por huésped por noche`} amount={pricing.insurance} muted />
      <div className="mt-2 flex items-baseline justify-between border-t pt-3">
        <span className="font-medium">Total</span>
        <span className="font-display text-3xl font-semibold text-primary tabular-nums">{formatCOP(pricing.total)}</span>
      </div>
      <p className="mt-1 text-right text-[0.7rem] text-muted-foreground">COP · valores de demostración</p>
    </div>
  );
}
