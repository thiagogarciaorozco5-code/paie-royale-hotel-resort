import { cn } from "@/lib/utils";

const tones = {
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  muted: "bg-muted text-muted-foreground",
  danger: "bg-destructive/10 text-destructive",
  gold: "bg-gold-soft text-foreground",
} as const;

export function StatusBadge({ tone, children, className }: { tone: keyof typeof tones; children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium", tones[tone], className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {children}
    </span>
  );
}

export function roomStatusTone(status: string) {
  return status === "disponible" ? "success" : status === "mantenimiento" ? "warning" : "muted";
}

export function reservationTone(status: string) {
  return status === "confirmada" ? "success" : status === "pendiente" ? "warning" : status === "cancelada" ? "danger" : "muted";
}
