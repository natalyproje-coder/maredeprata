# Plano de Implementação: Sistema Admin e Pedidos via WhatsApp

Implementação do sistema administrativo para gerenciamento de catálogo e conteúdo, integração de autenticação via Supabase e finalização de pedidos via WhatsApp para a marca Maré de Prata.

## 1. Autenticação e Autorização
- Implementar login com Supabase na rota `/conta` (E-mail/Senha e Google).
- Criar hook `useAuth` para gerenciar o estado da sessão e verificar permissões de admin (checar contra o banco e o e-mail `vivonirubens@gmail.com`).
- Proteger a rota `/admin` para acesso exclusivo da administradora.

## 2. Painel Administrativo (`/admin`)
- Criar dashboard administrativo moderno seguindo a estética da marca.
- **Produtos**: Lista com busca/filtros e formulário para Adicionar, Editar e Excluir itens (sincronizado com a tabela `products`).
- **Conteúdo**: Edição dos textos do Banner Hero (título, subtítulo, CTA) e do número de WhatsApp (sincronizado com a tabela `site_content`).
- **Categorias**: Gerenciamento básico de categorias.

## 3. Dinamização do Catálogo (Frontend)
- Atualizar a `Home` para carregar o conteúdo do banner e produtos em destaque do banco de dados via `useCatalog`.
- Atualizar a listagem por `Categoria` e a página de `Produto` para usarem dados dinâmicos do Supabase.
- Garantir que as imagens usem URLs estáveis (migradas para `/img/` no banco).

## 4. Checkout via WhatsApp
- Integrar o número de WhatsApp dinâmico da tabela `site_content`.
- Ao clicar em "Finalizar" no checkout:
  1. Validar os dados do formulário.
  2. Gerar o resumo do pedido (itens, tamanhos, cores, total).
  3. Gerar o link `wa.me` com a mensagem formatada.
  4. Redirecionar o cliente para o WhatsApp da loja e registrar o sucesso no UI.

## Detalhes Técnicos
- **TanStack Start**: Uso de `createServerFn` para operações de escrita seguras no admin.
- **Supabase**: Consultas públicas via client anon; operações de escrita restritas via RLS à role `admin`.
- **Estado**: Manter `useCatalog` (TanStack Query) para caching eficiente do catálogo.
