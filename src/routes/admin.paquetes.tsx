import { createFileRoute } from "@tanstack/react-router";
import { Switch } from "@/components/ui/switch";
import { AdminTitle, ConfirmDelete } from "@/components/admin/AdminUi";
import { packagesRepo, usePackages } from "@/data/repository";
import { formatCOP } from "@/lib/format";

export const Route = createFileRoute("/admin/paquetes")({ component: () => {
  const pkgs = usePackages();
  return (
    <div>
      <AdminTitle title="Paquetes" description="Activa o desactiva paquetes del catálogo público." />
      <div className="divide-y rounded-2xl border bg-card">
        {pkgs.map((p) => (
          <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
            <div><div className="font-medium">{p.name}</div><div className="text-xs text-muted-foreground">{formatCOP(p.price)} · {p.nights} noches</div></div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs"><Switch checked={p.active} onCheckedChange={(v) => packagesRepo.patch(p.id, { active: v })} />{p.active ? "Activo" : "Inactivo"}</label>
              <ConfirmDelete name={p.name} onConfirm={() => packagesRepo.remove(p.id)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} });
