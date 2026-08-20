import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/institucional/sobre")({
  head: () => ({
    meta: [
      { title: "Sobre a Maré de Prata — Nossa história" },
      {
        name: "description",
        content:
          "Conheça a Maré de Prata: curadoria feminina premium em lingerie, sexy shop, cama & banho e semijoias em prata e ouro.",
      },
      { property: "og:title", content: "Sobre a Maré de Prata" },
      {
        property: "og:description",
        content: "Uma marca sobre desejo, brilho e liberdade feminina.",
      },
    ],
  }),
  component: SobrePage,
});

function SobrePage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16">
      <p className="eyebrow">Institucional</p>
      <h1 className="font-display mt-3 text-4xl text-silver-gradient">Sobre nós</h1>
      <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
        <p>
          A Maré de Prata nasceu de uma ideia simples: intimidade merece a mesma
          sofisticação que qualquer outro ritual de beleza. Reunimos lingerie, sexy shop,
          moda íntima, cama & banho e semijoias em prata e ouro numa curadoria pensada
          para mulheres que escolhem como querem se sentir.
        </p>
        <p>
          Cada peça é selecionada por caimento, toque e acabamento. Trabalhamos com
          rendas francesas, cetins de toque frio, algodões egípcios e semijoias com
          banho reforçado e garantia contra oxidação.
        </p>
        <p>
          Discrição é parte do produto. Todos os pedidos chegam em embalagem neutra, sem
          identificação externa da loja, e a descrição na fatura também é discreta.
        </p>
        <p className="text-pearl italic">“Entre o desejo e o brilho.”</p>
      </div>
    </article>
  );
}
