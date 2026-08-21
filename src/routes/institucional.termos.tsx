import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/institucional/termos")({
  head: () => ({
    meta: [
      { title: "Termos de uso — Maré de Prata" },
      {
        name: "description",
        content:
          "Condições de compra, entrega, trocas e devoluções da loja Maré de Prata.",
      },
      { property: "og:title", content: "Termos de uso — Maré de Prata" },
      {
        property: "og:description",
        content: "Regras claras de compra, entrega e devolução.",
      },
    ],
  }),
  component: TermosPage,
});

const blocks = [
  {
    title: "Uso da loja",
    text: "A compra é permitida apenas para maiores de 18 anos. Ao finalizar um pedido, você declara que as informações fornecidas são verdadeiras.",
  },
  {
    title: "Preços e pagamento",
    text: "Preços em reais, sujeitos a alteração sem aviso. Aceitamos Pix, cartão de crédito, débito e boleto. O pedido é confirmado após a aprovação do pagamento.",
  },
  {
    title: "Entrega",
    text: "Enviamos para todo o Brasil em embalagem discreta. O prazo é informado no checkout e começa a contar após a confirmação do pagamento.",
  },
  {
    title: "Trocas e devoluções",
    text: "Você tem 7 dias corridos após o recebimento para desistir da compra (Direito de Arrependimento). A peça deve estar obrigatoriamente sem uso, com etiquetas originais e na embalagem original. Veja as exceções para itens íntimos abaixo.",
  },
  {
    title: "Itens íntimos",
    text: "Por razões sanitárias e de higiene, produtos de sexy shop e peças íntimas (lingerie) só são aceitos para troca ou devolução se a embalagem original e o lacre do fabricante estiverem totalmente intactos e sem sinais de violação. Peças que foram provadas ou que tiveram o lacre rompido não podem ser trocadas ou devolvidas.",
  },
  {
    title: "Semijoias",
    text: "Garantia de 6 meses contra defeitos de banho, desde que respeitados os cuidados indicados na página do produto.",
  },
];

function TermosPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16">
      <p className="eyebrow">Institucional</p>
      <h1 className="font-display mt-3 text-4xl text-silver-gradient">Termos de uso</h1>
      <div className="mt-8 space-y-8">
        {blocks.map((b) => (
          <section key={b.title}>
            <h2 className="font-display text-xl">{b.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b.text}</p>
          </section>
        ))}
      </div>
    </article>
  );
}
