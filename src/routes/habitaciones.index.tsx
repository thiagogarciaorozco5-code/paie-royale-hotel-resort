import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { RoomsCatalog } from "@/components/catalog/RoomsCatalog";

export const Route = createFileRoute("/habitaciones/")({
  head: () => ({
    meta: [
      { title: "Habitaciones y suites — PAIE ROYALE" },
      { name: "description", content: "Explora habitaciones dobles, twin, king y suites con piscina privada en PAIE ROYALE Hotel & Resort." },
      { property: "og:title", content: "Habitaciones y suites — PAIE ROYALE" },
      { property: "og:description", content: "Habitaciones de lujo frente al Caribe colombiano." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RoomsPage,
});

function RoomsPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <PageHeader eyebrow="Habitaciones & suites" title="Habitaciones" description="Filtra por capacidad, tipo de cama, precio o disponibilidad. Las fechas y huéspedes se eligen dentro de cada habitación." />
      <div className="mt-8"><RoomsCatalog /></div>
    </div>
  );
}
