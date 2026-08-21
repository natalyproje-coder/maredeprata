import { createMiddleware } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";

export const requireAdmin = createMiddleware().server(async ({ next }) => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Check database for admin role
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", session.user.id)
    .eq("role", "admin")
    .single();

  if (error || !data) {
    throw new Error("Forbidden: Admin access required");
  }

  return next();
});
