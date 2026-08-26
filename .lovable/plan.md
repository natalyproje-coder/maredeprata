# Plano de Melhorias — Maré de Prata (Próxima Evolução)

Lista priorizada do que ainda dá para melhorar na loja, do maior para o menor impacto.

## 1. Gestão de Pedidos no Admin (maior impacto)
- Nova aba "Pedidos" no painel `/admin`: lista todos os pedidos recebidos (tabela `orders` já existe).
- Ver detalhes de cada pedido (itens, cliente, endereço, total).
- Atualizar status: pendente → pago → enviado → entregue / cancelado.
- Hoje os pedidos só chegam via WhatsApp; com isso você tem um histórico organizado dentro do app.

## 2. Cupons de Desconto Reais
- Hoje o cupom "MARE10" está fixo no código da sacola e não passa para o checkout.
- Criar tabela `coupons` (código, percentual, ativo, validade) com gerenciamento no Admin.
- Aplicar o desconto de ponta a ponta: sacola → checkout → resumo do pedido no WhatsApp.

## 3. Notificações e Marketing
- Botão "Avise-me" em produtos esgotados (registra e-mail/WhatsApp da cliente).
- Seção de newsletter no rodapé com captura de e-mails.
- Página de confirmação de pedido mais rica (número do pedido, próximos passos, prazo).

## 4. Experiência de Compra
- Galeria do produto com zoom e swipe no mobile.
- Filtro por faixa de preço com slider nas categorias.
- "Vistos recentemente" na página do produto.
- Cálculo de frete por CEP com prazo estimado (hoje é valor fixo).

## 5. SEO e Performance
- JSON-LD de produto (preço, disponibilidade) para aparecer com rich snippets no Google.
- Sitemap.xml e URLs canônicas.
- Otimização de imagens (tamanhos responsivos/srcset).

## 6. Painel Admin — qualidade de vida
- Upload de múltiplas imagens de uma vez com arrastar-e-soltar.
- Estatísticas simples na home do admin: total de pedidos, faturamento, produtos sem estoque.

## Detalhes Técnicos
- Tabelas novas: `coupons`, `stock_alerts`, `newsletter_subscribers` (com RLS e GRANTs).
- Server functions com `requireAdmin` para gestão de pedidos e cupons.
- Sem mudanças visuais na identidade da marca.

**Sugestão:** começar pelos itens 1 e 2 (pedidos no admin + cupons reais), que são os que mais afetam a operação diária. Posso implementar tudo de uma vez ou por etapas — me diga se quer priorizar algo diferente.
