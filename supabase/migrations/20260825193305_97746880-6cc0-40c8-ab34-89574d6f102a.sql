INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role FROM auth.users WHERE email = 'vivonirubens@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

CREATE POLICY "users read own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);