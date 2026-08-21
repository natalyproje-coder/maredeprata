# Plano de Implementação: Novas Funcionalidades e Melhorias do Admin

Implementação de geração de ID de pedidos, controle de estoque, upload de imagens e integração de dados de cadastro no checkout.

## 1. Geração e Acompanhamento de Pedidos
- Criar tabela `orders` no Supabase para registrar pedidos.
- Implementar gerador de ID único (ex: MP-2026-XXXX).
- Adicionar seção "Meus Pedidos" na área do cliente (`/conta`) para consulta via ID ou login.

## 2. Controle de Estoque
- Adicionar coluna `stock_quantity` na tabela `products`.
- Exibir alertas de "Baixo Estoque" ou "Esgotado" na vitrine e no painel admin.
- Decrementar estoque automaticamente ao finalizar um pedido.

## 3. Upload de Imagens no Admin
- Configurar bucket `product-images` no Supabase Storage.
- Implementar componente de upload no formulário de produtos em `/admin`.
- Substituir campos de URL de imagem por upload direto com preview.

## 4. Relevância do Sistema de Login
- Integrar dados do perfil (nome, telefone, endereço) no formulário de checkout.
- Salvar dados de entrega no perfil do usuário após a primeira compra.

## Detalhes Técnicos
- **Database**: Novas migrações para `orders` e colunas de estoque.
- **Storage**: RLS para permitir upload apenas por administradores.
- **TanStack Start**: Server functions para processamento de pedidos e gestão de estoque.
