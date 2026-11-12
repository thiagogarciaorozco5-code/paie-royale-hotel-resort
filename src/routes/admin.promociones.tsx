import { createFileRoute } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { AdminTitle, ConfirmDelete } from "@/components/admin/AdminUi";
import { campaignsRepo, newId, promotionsRepo, useCampaigns, usePromotions, useUsers } from "@/data/repository";
import { campaignRecipients } from "@/lib/campaigns";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/admin/promociones")({ component: () => {
  const promos = usePromotions();
  const recipients = campaignRecipients(useUsers());
  const campaigns = useCampaigns();
  return (
    <div className="space-y-8">
      <AdminTitle title="Promociones" description={`${recipients.length} usuarios aceptaron recibir correos promocionales.`} />
      <div className="divide-y rounded-2xl border bg-card">
        {promos.map((p) => (
          <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
            <div><div className="font-medium">{p.title} · <span className="font-mono">{p.code}</span></div><div className="text-xs text-muted-foreground">−{p.discountPercent}% · hasta {formatDate(p.validUntil)}</div></div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs"><Switch checked={p.active} onCheckedChange={(v) => promotionsRepo.patch(p.id, { active: v })} />{p.active ? "Activa" : "Inactiva"}</label>
              <Button size="sm" variant="outline" onClick={() => { campaignsRepo.upsert({ id: newId("cmp"), promotionId: p.id, subject: p.title, recipientCount: recipients.length, status: "pendiente_proveedor", createdAt: new Date().toISOString() }); toast("Campaña guardada como pendiente", { description: "No se envió ningún correo: falta configurar el proveedor de email." }); }}><Mail /> Preparar campaña</Button>
              <ConfirmDelete name={p.title} onConfirm={() => promotionsRepo.remove(p.id)} />
            </div>
          </div>
        ))}
      </div>
      <section>
        <h3 className="font-display text-2xl">Campañas</h3>
        {campaigns.length === 0 ? <p className="mt-2 text-sm text-muted-foreground">Aún no hay campañas.</p> : (
          <ul className="mt-3 divide-y rounded-2xl border bg-card text-sm">{campaigns.map((c) => <li key={c.id} className="flex justify-between p-3"><span>{c.subject} · {c.recipientCount} destinatarios</span><span className="text-warning">Integración de correo pendiente</span></li>)}</ul>
        )}
      </section>
    </div>
  );
} });
