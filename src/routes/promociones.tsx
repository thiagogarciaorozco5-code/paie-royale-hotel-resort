import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { usePromotions } from "@/data/repository";
import { img } from "@/data/images";
import { todayInBogota } from "@/lib/booking";
import { formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/catalog/StatusBadge";

export const Route = createFileRoute("/promociones")({
  head: () => ({ meta: [{ title: "Promociones — PAIE ROYALE" }, { name: "description", content: "Descuentos y códigos promocionales vigentes en PAIE ROYALE Hotel & Resort." }, { property: "og:title", content: "Promociones — PAIE ROYALE" }, { property: "og:description", content: "Ofertas vigentes en habitaciones y paquetes." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: () => {
    const today = todayInBogota();
    const promos = usePromotions().filter((p) => p.active);
    return (
      <div className="mx-auto max-w-6xl px-6 py-10">
        <PageHeader eyebrow="Ofertas" title="Promociones" description="Aplica el código en el resumen de tu reserva." />
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {promos.map((p) => {
            const expired = p.validUntil < today;
            return (
              <article key={p.id} className={`overflow-hidden rounded-2xl border bg-card shadow-soft ${expired ? "opacity-70" : ""}`}>
                <img src={img(p.image)} alt="" loading="lazy" width={1280} height={896} className="aspect-[16/8] w-full object-cover" />
                <div className="p-5">
                  <div className="flex items-center justify-between gap-3"><h2 className="font-display text-2xl">{p.title}</h2>{expired ? <StatusBadge tone="muted">Vencida</StatusBadge> : <StatusBadge tone="success">Vigente</StatusBadge>}</div>
                  <p className="mt-2 text-sm text-muted-foreground">{p.description}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-sm"><span className="rounded-md border border-dashed border-gold px-3 py-1 font-mono tracking-wider">{p.code}</span><span className="text-muted-foreground">Válida hasta el {formatDate(p.validUntil, true)}</span></div>
                  <details className="mt-4 text-sm"><summary className="cursor-pointer text-primary">Términos y condiciones</summary><ul className="mt-2 list-disc pl-5 text-muted-foreground">{p.terms.map((t) => <li key={t}>{t}</li>)}</ul></details>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    );
  },
});
