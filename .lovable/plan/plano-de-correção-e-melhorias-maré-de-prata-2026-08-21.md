# Plano de Correção e Melhorias - Maré de Prata

O usuário relatou problemas na finalização de pedidos, salvamento de produtos no admin e solicitou a gestão de categorias.

## Ações Corretivas

### 1. Sistema de Pedidos (Checkout)
*   **Problema:** Possível falha na inserção na tabela `orders` devido a falta de privilégios ou erros silenciosos.
*   **Solução:** 
    *   Implementar `requireSupabaseAuth` no middleware da `createOrder` no servidor para garantir integridade.
    *   Adicionar logs de erro detalhados no `checkout.tsx` para identificar falhas de rede ou banco.
    *   Validar se o campo `items` no JSONB está sendo enviado corretamente conforme o esquema da tabela.

### 2. Gestão de Produtos (Admin)
*   **Problema:** Dificuldade em salvar/alterar produtos. Provavelmente devido ao `upsert` enviando campos "virtuais" que não existem na tabela `products` (ex: `categoryName`, `inStock`).
*   **Solução:**
    *   Refatorar o `handleUpsert` no `admin.tsx` para limpar rigorosamente o objeto antes do envio.
    *   Garantir que o `requireAdmin` esteja funcionando corretamente no backend.

### 3. Gestão de Categorias (Nova Funcionalidade)
*   **Objetivo:** Permitir adicionar/alterar categorias diretamente pelo painel admin.
*   **Solução:**
    *   Criar nova aba "Categorias" no `admin.tsx`.
    *   Implementar CRUD de categorias (`supabase.from('categories')`).
    *   Adicionar funções de servidor `upsertCategory` e `deleteCategory` no `lib/admin.functions.ts`.
    *   Atualizar o seletor de categorias no formulário de produto para usar as categorias do banco de dados em vez de uma lista estática.

## Detalhes Técnicos

### Backend (Supabase/Migrations)
*   Verificar se a política de RLS para `orders` permite `INSERT` para usuários autenticados (conforme migração 20260821203113, parece correto, mas re-validaremos).
*   Garantir que a função `is_admin()` trate corretamente o email `vivonirubens@gmail.com`.

### Frontend
*   `src/routes/admin.tsx`: Adicionar estado para gerenciar a visão de categorias e formulário correspondente.
*   `src/lib/admin.functions.ts`: Adicionar exportações para manipulação de categorias.
*   `src/lib/catalog-data.tsx`: Garantir que `fetchCatalog` invalide o cache corretamente após mudanças no admin.
