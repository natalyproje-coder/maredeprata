# Plano de Correção de Segurança e Infraestrutura

Este plano visa corrigir as vulnerabilidades de segurança identificadas na auditoria automatizada, removendo acessos baseados em dados fixos (hardcoded) e garantindo que o fluxo de pedidos seja resiliente e seguro.

## Alterações Propostas

### 1. Segurança e Autenticação
- **Remover e-mail fixo da lógica de Admin**: A função `is_admin()` no banco de dados e o middleware `requireAdmin` no servidor dependem atualmente do e-mail `vivonirubens@gmail.com`. Vamos remover essa verificação para que o acesso administrativo dependa exclusivamente da tabela `user_roles`.
- **Correção da função `is_admin` no Supabase**: Atualizar a função SQL para remover a verificação de e-mail no JWT.

### 2. Fluxo de Pedidos (Checkout)
- **Política de Inserção de Pedidos**: Adicionar política RLS na tabela `orders` para permitir que usuários autenticados criem seus próprios pedidos (`auth.uid() = user_id`) e permitir pedidos anônimos (conforme o design atual que permite `user_id` nulo).
- **Validação de Propriedade**: Garantir que, ao criar um pedido logado, o `user_id` enviado coincida obrigatoriamente com o `auth.uid()`.

### 3. Melhoria no Middleware de Servidor
- **Refatoração do `requireAdmin`**: Ajustar o middleware em `src/lib/auth.server.ts` para consultar apenas a tabela `user_roles`.

## Detalhes Técnicos

### SQL (Migração)
```sql
-- Remover bypass de e-mail fixo na função is_admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT coalesce(public.has_role(auth.uid(), 'admin'), false)
$$;

-- Adicionar política de inserção na tabela orders
CREATE POLICY "Users can create their own orders"
ON public.orders FOR INSERT
TO authenticated, anon
WITH CHECK (
  (auth.uid() IS NULL AND user_id IS NULL) OR 
  (auth.uid() = user_id)
);
```

### Código (TypeScript)
- Arquivo: `src/lib/auth.server.ts`
  - Remover a verificação `session.user.email === "vivonirubens@gmail.com"`.
- Arquivo: `src/lib/admin.functions.ts`
  - No `createOrder`, se houver sessão, garantir que o `user_id` seja injetado do servidor para evitar spoofing.
