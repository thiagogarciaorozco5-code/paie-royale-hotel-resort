import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { whatsappLink } from "@/config/site";

const faqs = [
  ["¿Cuáles son los horarios de check-in y check-out?", "Check-in de 3:00 p. m. a 10:00 p. m. y check-out de 6:00 a. m. a 12:00 m., hora de Colombia."],
  ["¿Qué medios de pago aceptan?", "Efectivo en el hotel, transferencia bancaria y tarjeta. En esta versión de demostración ningún pago real es procesado."],
  ["¿Necesito una cuenta para reservar?", "Puedes explorar sin cuenta. Solo pedimos iniciar sesión al confirmar la reserva; tu selección se conserva."],
  ["¿Puedo cancelar?", "Sí, desde Mis reservas. La cancelación es gratuita hasta 72 horas antes de la llegada."],
];

export const Route = createFileRoute("/ayuda")({
  head: () => ({ meta: [{ title: "Ayuda — PAIE ROYALE" }, { name: "description", content: "Preguntas frecuentes sobre reservas, pagos y horarios en PAIE ROYALE." }, { property: "og:title", content: "Ayuda — PAIE ROYALE" }, { property: "og:description", content: "Resolvemos tus dudas sobre tu estadía." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: () => (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <PageHeader eyebrow="Soporte" title="Centro de ayuda" />
      <Accordion type="single" collapsible className="mt-8">
        {faqs.map(([q, a]) => <AccordionItem key={q} value={q}><AccordionTrigger>{q}</AccordionTrigger><AccordionContent>{a}</AccordionContent></AccordionItem>)}
      </Accordion>
      <Button asChild className="mt-8"><a href={whatsappLink()} target="_blank" rel="noreferrer">Escribir por WhatsApp</a></Button>
    </div>
  ),
});
