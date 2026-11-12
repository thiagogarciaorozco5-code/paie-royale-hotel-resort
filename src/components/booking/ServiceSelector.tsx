import { Check, Minus, Plus } from "lucide-react";
import type { Service } from "@/lib/types";
import { canAddService } from "@/lib/booking";
import { formatCOP, unitLabel } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { serviceIcons } from "./serviceIcons";

export function ServiceSelector({
  services,
  selected,
  onToggle,
}: {
  services: Service[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {services.map((s) => {
        const available = canAddService(s);
        const isSelected = selected.includes(s.id);
        const Icon = serviceIcons[s.icon];
        return (
          <div
            key={s.id}
            className={cn(
              "flex flex-col rounded-xl border p-4 transition-colors",
              available
                ? isSelected
                  ? "border-success bg-success-soft ring-1 ring-success"
                  : "border-success/40 bg-success-soft/60"
                : "border-unavailable bg-unavailable text-unavailable-foreground",
            )}
          >
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                  available ? "bg-success text-success-foreground" : "bg-unavailable-foreground/15",
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="font-medium">{s.name}</h4>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[0.7rem] font-semibold tracking-wide uppercase",
                      available ? "bg-success text-success-foreground" : "bg-unavailable-foreground/20",
                    )}
                  >
                    {available ? "Disponible" : "No disponible"}
                  </span>
                </div>
                <p className={cn("mt-1 text-sm", available ? "text-muted-foreground" : "text-unavailable-foreground/80")}>
                  {available ? s.description : s.unavailableReason ?? s.description}
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between gap-3">
              <div className="text-sm">
                <span className="font-semibold">{formatCOP(s.price)}</span>{" "}
                <span className={available ? "text-muted-foreground" : "text-unavailable-foreground/70"}>{unitLabel[s.unit]}</span>
              </div>
              {available ? (
                <Button
                  type="button"
                  size="sm"
                  variant={isSelected ? "outline" : "success"}
                  onClick={() => onToggle(s.id)}
                  aria-pressed={isSelected}
                  aria-label={isSelected ? `Quitar ${s.name}` : `Agregar ${s.name}`}
                >
                  {isSelected ? (<><Minus /> Quitar</>) : (<><Plus /> Agregar</>)}
                </Button>
              ) : (
                <Button type="button" size="sm" variant="ghost" disabled aria-label={`${s.name} no disponible`} className="text-unavailable-foreground">
                  No disponible
                </Button>
              )}
            </div>
            {isSelected && available && (
              <div className="mt-2 flex items-center gap-1 text-xs font-medium text-success"><Check className="h-3.5 w-3.5" /> Agregado a tu estadía</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
