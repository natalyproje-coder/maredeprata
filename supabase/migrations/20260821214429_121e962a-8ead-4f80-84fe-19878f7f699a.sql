-- Remover bypass de e-mail fixo na função is_admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT coalesce(public.has_role(auth.uid(), 'admin'), false)
$$;

-- Adicionar política de inserção na tabela orders
-- Primeiro removemos políticas existentes de inserção se houver (o scan indicou falta, mas por garantia)
DROP POLICY IF EXISTS "Users can create their own orders" ON public.orders;

CREATE POLICY "Users can create their own orders"
ON public.orders FOR INSERT
TO authenticated, anon
WITH CHECK (
  (auth.uid() IS NULL AND user_id IS NULL) OR 
  (auth.uid() = user_id)
);

-- Garantir que service_role tenha acesso total (já estava no grant, mas reforçando RLS)
ALTER TABLE public.orders FORCE ROW LEVEL SECURITY;
