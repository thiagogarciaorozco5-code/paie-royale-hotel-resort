import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NewReservation } from "@/components/booking/NewReservation";
import { MyReservations } from "@/components/booking/MyReservations";

type Tab = "nueva" | "mis-reservas";

export const Route = createFileRoute("/reservas/")({
  validateSearch: (search: Record<string, unknown>): { tab?: Tab } =>
    search.tab === "mis-reservas" || search.tab === "nueva" ? { tab: search.tab } : {},
  head: () => ({ meta: [{ title: "Reservas — PAIE ROYALE" }, { name: "description", content: "Revisa tu reserva en curso, elige el método de pago y consulta tus reservas en PAIE ROYALE." }, { property: "og:title", content: "Reservas — PAIE ROYALE" }, { property: "og:description", content: "Nueva reserva y mis reservas." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: ReservationsPage,
});

function ReservationsPage() {
  const { tab = "nueva" } = Route.useSearch();
  const navigate = useNavigate({ from: "/reservas/" });
  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <PageHeader eyebrow="Tu viaje" title="Reservas" />
      <Tabs value={tab} onValueChange={(v) => navigate({ search: { tab: v as Tab }, replace: true })} className="mt-6">
        <TabsList>
          <TabsTrigger value="nueva">Nueva reserva</TabsTrigger>
          <TabsTrigger value="mis-reservas">Mis reservas</TabsTrigger>
        </TabsList>
        <TabsContent value="nueva" className="mt-6"><NewReservation /></TabsContent>
        <TabsContent value="mis-reservas" className="mt-6"><MyReservations /></TabsContent>
      </Tabs>
    </div>
  );
}
