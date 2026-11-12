import { Banknote, CreditCard, Landmark, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { cardBrand, formatCardNumber, formatExpiry } from "@/lib/booking";
import { siteConfig } from "@/config/site";
import type { PaymentMethod } from "@/lib/types";

export interface CardState {
  name: string;
  number: string;
  expiry: string;
  cvv: string;
}
export type CardErrors = Partial<Record<keyof CardState, string>>;

const methods: { id: PaymentMethod; label: string; hint: string; icon: typeof Banknote }[] = [
  { id: "efectivo", label: "Efectivo", hint: "Paga al llegar al hotel", icon: Banknote },
  { id: "transferencia", label: "Transferencia", hint: "Bancaria, verificación manual", icon: Landmark },
  { id: "tarjeta", label: "Tarjeta", hint: "Crédito o débito (demo)", icon: CreditCard },
];

export function PaymentSection({
  method,
  onMethod,
  card,
  onCard,
  cardErrors,
  transferFile,
  onTransferFile,
  error,
}: {
  method?: PaymentMethod;
  onMethod: (m: PaymentMethod) => void;
  card: CardState;
  onCard: (c: Partial<CardState>) => void;
  cardErrors: CardErrors;
  transferFile: string;
  onTransferFile: (name: string) => void;
  error?: string;
}) {
  return (
    <div>
      <div role="radiogroup" aria-label="Método de pago" className="grid gap-3 sm:grid-cols-3">
        {methods.map((m) => (
          <button
            key={m.id}
            type="button"
            role="radio"
            aria-checked={method === m.id}
            onClick={() => onMethod(m.id)}
            className={cn(
              "flex flex-col items-start gap-1 rounded-xl border p-4 text-left transition-all",
              method === m.id ? "border-primary bg-secondary ring-1 ring-primary" : "hover:border-gold",
            )}
          >
            <m.icon className="h-5 w-5 text-gold" />
            <span className="font-medium">{m.label}</span>
            <span className="text-xs text-muted-foreground">{m.hint}</span>
          </button>
        ))}
      </div>
      {error && <p role="alert" className="mt-2 text-xs font-medium text-destructive">{error}</p>}

      {method === "efectivo" && (
        <div className="mt-4 rounded-xl bg-secondary p-4 text-sm">
          Tu reserva quedará con estado <strong>“Pago en el hotel”</strong>. Pagas en efectivo en recepción al hacer check-in.
        </div>
      )}

      {method === "transferencia" && (
        <div className="mt-4 space-y-4 rounded-xl bg-secondary p-4 text-sm">
          <div>
            <div className="eyebrow text-gold">Datos para transferir (demo)</div>
            <dl className="mt-2 grid gap-x-6 gap-y-1 sm:grid-cols-2">
              <div><dt className="text-xs text-muted-foreground">Banco</dt><dd>{siteConfig.bank.name}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Tipo</dt><dd>{siteConfig.bank.accountType}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Número</dt><dd className="font-mono">{siteConfig.bank.accountNumber}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Titular · NIT</dt><dd>{siteConfig.bank.holder} · {siteConfig.bank.nit}</dd></div>
            </dl>
            <p className="mt-2 text-xs text-muted-foreground">Usa tu código de reserva como referencia. La reserva quedará pendiente de verificación.</p>
          </div>
          <div>
            <Label htmlFor="transfer-proof" className="text-xs">Comprobante (opcional, puedes subirlo después)</Label>
            <label htmlFor="transfer-proof" className="mt-1 flex cursor-pointer items-center gap-2 rounded-lg border border-dashed bg-card px-3 py-3 text-muted-foreground hover:border-gold">
              <Upload className="h-4 w-4" /> {transferFile || "Seleccionar archivo (PDF o imagen)"}
            </label>
            <input id="transfer-proof" type="file" accept="image/*,.pdf" className="sr-only" onChange={(e) => onTransferFile(e.target.files?.[0]?.name ?? "")} />
            <p className="mt-1 text-[0.7rem] text-muted-foreground">Demo: solo se guarda el nombre del archivo.</p>
          </div>
        </div>
      )}

      {method === "tarjeta" && (
        <div className="mt-4 space-y-3 rounded-xl bg-secondary p-4">
          <p className="text-xs text-muted-foreground">
            Modo demostración: no se realiza ningún cobro y nunca guardamos el número ni el CVV. Prueba con 4242 4242 4242 4242; un número terminado en 0002 simula un rechazo.
          </p>
          <div className="space-y-1.5">
            <Label htmlFor="card-name" className="text-xs">Nombre en la tarjeta</Label>
            <Input id="card-name" autoComplete="cc-name" value={card.name} onChange={(e) => onCard({ name: e.target.value })} aria-invalid={!!cardErrors.name} />
            {cardErrors.name && <p className="text-xs text-destructive">{cardErrors.name}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="card-number" className="text-xs">Número de tarjeta {card.number && <span className="text-muted-foreground">· {cardBrand(card.number)}</span>}</Label>
            <Input id="card-number" inputMode="numeric" autoComplete="cc-number" placeholder="0000 0000 0000 0000" value={card.number} onChange={(e) => onCard({ number: formatCardNumber(e.target.value) })} aria-invalid={!!cardErrors.number} className="font-mono" />
            {cardErrors.number && <p className="text-xs text-destructive">{cardErrors.number}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="card-exp" className="text-xs">Vencimiento</Label>
              <Input id="card-exp" inputMode="numeric" autoComplete="cc-exp" placeholder="MM/AA" value={card.expiry} onChange={(e) => onCard({ expiry: formatExpiry(e.target.value) })} aria-invalid={!!cardErrors.expiry} className="font-mono" />
              {cardErrors.expiry && <p className="text-xs text-destructive">{cardErrors.expiry}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="card-cvv" className="text-xs">CVV</Label>
              <Input id="card-cvv" inputMode="numeric" autoComplete="cc-csc" type="password" placeholder="•••" value={card.cvv} onChange={(e) => onCard({ cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })} aria-invalid={!!cardErrors.cvv} className="font-mono" />
              {cardErrors.cvv && <p className="text-xs text-destructive">{cardErrors.cvv}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
