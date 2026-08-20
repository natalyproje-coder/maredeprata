import { createFileRoute } from "@tanstack/react-router";
import { Clock, Mail, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { whatsappLink } from "@/lib/catalog";

export const Route = createFileRoute("/institucional/contato")({
  head: () => ({
    meta: [
      { title: "Contato — Maré de Prata" },
      {
        name: "description",
        content:
          "Fale com a Maré de Prata por WhatsApp ou e-mail. Atendimento discreto de segunda a sábado.",
      },
      { property: "og:title", content: "Contato — Maré de Prata" },
      {
        property: "og:description",
        content: "Atendimento humano, discreto e rápido pelo canal que você preferir.",
      },
    ],
  }),
  component: ContatoPage,
});

function ContatoPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <p className="eyebrow">Institucional</p>
      <h1 className="font-display mt-3 text-4xl text-silver-gradient">Contato</h1>

      <div className="mt-10 grid gap-12 md:grid-cols-2">
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            toast.success("Mensagem enviada. Respondemos em até 1 dia útil.");
            (e.target as HTMLFormElement).reset();
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="nome">Nome</Label>
            <Input id="nome" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="msg">Mensagem</Label>
            <Textarea id="msg" rows={5} required />
          </div>
          <Button type="submit">Enviar mensagem</Button>
        </form>

        <div className="space-y-6 text-sm text-muted-foreground">
          <p className="flex items-center gap-3">
            <MessageCircle className="h-4 w-4 text-silver" />
            <a href={whatsappLink} target="_blank" rel="noreferrer" className="hover:text-pearl">
              Atendimento por WhatsApp
            </a>
          </p>
          <p className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-silver" /> ola@maredeprata.com
          </p>
          <p className="flex items-center gap-3">
            <Clock className="h-4 w-4 text-silver" /> Seg a sex, 9h às 18h · Sáb, 9h às 13h
          </p>
          <p className="leading-relaxed">
            Todo contato é tratado com sigilo. Nunca mencionamos o conteúdo do pedido em
            mensagens, embalagens ou faturas.
          </p>
        </div>
      </div>
    </div>
  );
}
