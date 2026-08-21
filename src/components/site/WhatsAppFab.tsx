import { MessageCircle } from "lucide-react";
import { useSiteText } from "@/lib/catalog-data";

export function WhatsAppFab() {
  const whatsappNumber = useSiteText("whatsapp_number");
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=Olá! Gostaria de saber mais sobre um produto da Maré de Prata.`;
  
  return (
    <a
      href={whatsappLink}
      target="_blank"
      rel="noreferrer"
      aria-label="Falar com a Maré de Prata no WhatsApp"
      className="fixed right-4 bottom-20 z-40 flex h-12 items-center gap-2 border border-border bg-card/90 px-4 shadow-lux backdrop-blur transition-colors hover:bg-secondary md:bottom-6"
    >
      <MessageCircle className="h-5 w-5 text-silver" />
      <span className="hidden text-xs tracking-[0.2em] uppercase sm:inline">
        WhatsApp
      </span>
    </a>
  );
}
