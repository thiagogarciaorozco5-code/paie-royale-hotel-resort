import { MessageCircle } from "lucide-react";
import { whatsappLink } from "@/config/site";

export function WhatsAppButton() {
  return (
    <a
      href={whatsappLink()}
      target="_blank"
      rel="noreferrer"
      aria-label="Escríbenos por WhatsApp"
      className="no-print group fixed right-5 bottom-5 z-40 flex h-14 items-center gap-2 rounded-full bg-whatsapp px-4 text-whatsapp-foreground shadow-lift transition-transform hover:scale-105"
    >
      <MessageCircle className="h-6 w-6" />
      <span className="hidden text-sm font-medium sm:inline">Soporte</span>
    </a>
  );
}
