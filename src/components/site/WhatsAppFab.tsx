import { MessageCircle } from "lucide-react";
import { whatsappLink } from "@/lib/catalog";

export function WhatsAppFab() {
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
