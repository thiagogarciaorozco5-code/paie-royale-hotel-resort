import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { PackageCard } from "@/components/catalog/PackageCard";
import { publicPackages, usePackages } from "@/data/repository";

export const Route = createFileRoute("/paquetes/")({
  head: () => ({ meta: [{ title: "Paquetes y experiencias — PAIE ROYALE" }, { name: "description", content: "Luna de miel, bienestar, ruta del café y planes en familia en PAIE ROYALE." }, { property: "og:title", content: "Paquetes — PAIE ROYALE" }, { property: "og:description", content: "Experiencias completas en el Caribe colombiano." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: () => {
    const pkgs = publicPackages(usePackages());
    return (
      <div className="mx-auto max-w-6xl px-6 py-10">
        <PageHeader eyebrow="Experiencias" title="Paquetes" description="Estadías completas con experiencias incluidas. Elige fechas y huéspedes dentro de cada paquete." />
        <div className="mt-8 grid gap-6 md:grid-cols-2">{pkgs.map((p) => <PackageCard key={p.id} pkg={p} />)}</div>
      </div>
    );
  },
});
