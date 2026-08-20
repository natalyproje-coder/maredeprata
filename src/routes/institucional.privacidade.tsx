import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/institucional/privacidade")({
  head: () => ({
    meta: [
      { title: "Política de privacidade — Maré de Prata" },
      {
        name: "description",
        content:
          "Como a Maré de Prata coleta, usa e protege seus dados pessoais, em conformidade com a LGPD.",
      },
      { property: "og:title", content: "Política de privacidade — Maré de Prata" },
      {
        property: "og:description",
        content: "Transparência total sobre o uso dos seus dados.",
      },
    ],
  }),
  component: PrivacidadePage,
});

const blocks = [
  {
    title: "Dados que coletamos",
    text: "Nome, e-mail, CPF, telefone e endereço de entrega, além de dados de navegação usados para melhorar a experiência da loja.",
  },
  {
    title: "Como usamos",
    text: "Para processar pedidos, emitir notas fiscais, realizar entregas, prevenir fraudes e — apenas com seu consentimento — enviar novidades.",
  },
  {
    title: "Compartilhamento",
    text: "Compartilhamos o mínimo necessário com transportadoras e meios de pagamento. Nunca vendemos seus dados.",
  },
  {
    title: "Discrição",
    text: "O nome da loja não aparece na embalagem. A descrição na fatura do cartão é neutra.",
  },
  {
    title: "Seus direitos",
    text: "Você pode solicitar acesso, correção, portabilidade ou exclusão dos seus dados pelo e-mail ola@maredeprata.com.",
  },
  {
    title: "Cookies",
    text: "Usamos cookies essenciais para carrinho e sessão, e cookies analíticos para entender o uso da loja.",
  },
];

function PrivacidadePage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16">
      <p className="eyebrow">Institucional</p>
      <h1 className="font-display mt-3 text-4xl text-silver-gradient">
        Política de privacidade
      </h1>
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
