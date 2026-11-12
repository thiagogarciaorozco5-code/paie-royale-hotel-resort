import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { AdminTitle } from "@/components/admin/AdminUi";
import { useCurrentUser } from "@/data/auth";
import { usersRepo, useUsers } from "@/data/repository";
import type { Role } from "@/lib/types";

export const Route = createFileRoute("/admin/usuarios")({ component: () => {
  const users = useUsers();
  const me = useCurrentUser();
  return (
    <div>
      <AdminTitle title="Usuarios" description="Roles disponibles: Cliente y Administrador." />
      <div className="divide-y rounded-2xl border bg-card">
        {users.map((u) => {
          const self = u.id === me?.id;
          return (
            <div key={u.id} className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
              <div><div className="font-medium">{u.name}{self && " (tú)"}</div><div className="text-xs text-muted-foreground">{u.email} · {u.promoOptIn ? "Acepta promociones" : "Sin promociones"}</div></div>
              <div className="flex items-center gap-3">
                <Select value={u.role} disabled={self} onValueChange={(v) => { usersRepo.patch(u.id, { role: v as Role }); toast.success("Rol actualizado"); }}>
                  <SelectTrigger className="h-8 w-40" aria-label={`Rol de ${u.name}`}><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="cliente">Cliente</SelectItem><SelectItem value="administrador">Administrador</SelectItem></SelectContent>
                </Select>
                <label className="flex items-center gap-2 text-xs"><Switch checked={u.active} disabled={self} onCheckedChange={(v) => usersRepo.patch(u.id, { active: v })} />{u.active ? "Activo" : "Inactivo"}</label>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} });
