import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCOP } from "@/lib/format";
import { PriceSummary } from "./PriceSummary";
import { StayForm } from "./StayForm";
import type { useBookingConfig } from "./useBookingConfig";

export function BookingSidebar({ cfg, capacity, priceLabel, fixedNights }: { cfg: ReturnType<typeof useBookingConfig>; capacity: number; priceLabel: string; fixedNights?: number }) {
  return (
    <aside className="rounded-2xl border bg-card p-5 shadow-lift lg:sticky lg:top-20">
      <div className="eyebrow text-gold">Tu estadía</div>
      <div className="mt-1 font-display text-2xl">{priceLabel}</div>
      <div className="mt-5">
        <StayForm value={cfg.stay} onChange={cfg.patchStay} errors={cfg.errors} capacity={capacity} occupied={cfg.occupied} today={cfg.today} fixedNights={fixedNights} />
      </div>
      <div className="mt-5 border-t pt-4">
        {cfg.hasDates ? <PriceSummary pricing={cfg.pricing} compact /> : <p className="text-sm text-muted-foreground">Elige tus fechas para ver el total con impuestos.</p>}
      </div>
      <Button size="lg" className="mt-5 w-full" onClick={cfg.proceed}>
        Continuar a reserva <ArrowRight />
      </Button>
      {cfg.hasDates && <p className="mt-2 text-center text-xs text-muted-foreground">Total estimado {formatCOP(cfg.pricing.total)} COP</p>}
    </aside>
  );
}
