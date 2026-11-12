import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { AdminTitle, ConfirmDelete } from "@/components/admin/AdminUi";
import { servicesRepo, useServices } from "@/data/repository";
import { formatCOP, unitLabel } from "@/lib/format";

export const Route = createFileRoute("/admin/servicios")({ component: () => {
  const services = useServices();
  return (
    <div>
      <AdminTitle title="Servicios" description="Los servicios no disponibles se muestran oscuros y no se pueden agregar." />
      <div className="divide-y rounded-2xl border bg-card">
        {services.map((s) => (
          <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
            <div><div className="font-medium">{s.name}</div><div className="text-xs text-muted-foreground">{formatCOP(s.price)} {unitLabel[s.unit]}</div></div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs"><Switch checked={s.available} onCheckedChange={(v) => { servicesRepo.patch(s.id, { available: v }); toast.success(`${s.name}: ${v ? "disponible" : "no disponible"}`); }} />{s.available ? "Disponible" : "No disponible"}</label>
              <ConfirmDelete name={s.name} onConfirm={() => servicesRepo.remove(s.id)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} });
