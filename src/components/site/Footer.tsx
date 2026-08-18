import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Mail, MessageCircle, Music2 } from "lucide-react";
import { Logo } from "@/components/site/Logo";
import { whatsappLink } from "@/lib/catalog";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/40 pb-24 md:pb-0">
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_repeat(3,minmax(0,1fr))]">
          <div>
            <Logo />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Você não está apenas comprando uma peça. Está escolhendo como quer se
              sentir.
            </p>
            <div className="mt-6 flex gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="grid h-10 w-10 place-items-center border border-border text-silver hover:bg-secondary"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="grid h-10 w-10 place-items-center border border-border text-silver hover:bg-secondary"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noreferrer"
                aria-label="TikTok"
                className="grid h-10 w-10 place-items-center border border-border text-silver hover:bg-secondary"
              >
                <Music2 className="h-4 w-4" />
              </a>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp"
                className="grid h-10 w-10 place-items-center border border-border text-silver hover:bg-secondary"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="eyebrow">Institucional</h3>
            <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
              <li>
                <Link to="/institucional/sobre" className="hover:text-pearl">
                  Sobre nós
                </Link>
              </li>
              <li>
                <Link to="/institucional/contato" className="hover:text-pearl">
                  Contato
                </Link>
              </li>
              <li>
                <Link to="/institucional/privacidade" className="hover:text-pearl">
                  Política de privacidade
                </Link>
              </li>
              <li>
                <Link to="/institucional/termos" className="hover:text-pearl">
                  Termos de uso
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="eyebrow">Atendimento</h3>
            <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
              <li>
                <a href={whatsappLink} target="_blank" rel="noreferrer" className="hover:text-pearl">
                  WhatsApp
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5" /> ola@maredeprata.com
              </li>
              <li>Seg a sex, 9h às 18h</li>
              <li>Sáb, 9h às 13h</li>
            </ul>
          </div>

          <div>
            <h3 className="eyebrow">Compra</h3>
            <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
              <li>Pix, cartão de crédito, débito e boleto</li>
              <li>Entrega em todo o Brasil</li>
              <li>Trocas e devoluções em 7 dias</li>
              <li>Compra segura e embalagem discreta</li>
            </ul>
          </div>
        </div>

        <div className="hairline my-12" />

        <div className="text-center">
          <p className="font-display text-2xl tracking-[0.22em] text-silver-gradient">
            MARÉ DE PRATA
          </p>
          <p className="mt-2 text-sm text-muted-foreground italic">
            “Entre o desejo e o brilho.”
          </p>
          <p className="mt-6 text-[0.65rem] tracking-[0.2em] text-muted-foreground uppercase">
            © {new Date().getFullYear()} Maré de Prata · CNPJ 00.000.000/0001-00
          </p>
        </div>
      </div>
    </footer>
  );
}
