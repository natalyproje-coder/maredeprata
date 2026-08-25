import { createMiddleware } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Requires an authenticated user that owns the "admin" role in public.user_roles.
 * Role lookup runs through the caller's own (RLS-scoped) client, never the
 * service role, so an unprivileged user cannot elevate themselves.
 */
export const requireAdmin = createMiddleware({ type: "function" })
  .middleware([requireSupabaseAuth])
  .server(async ({ next, context }) => {
    const { supabase, userId } = context;

    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (error) {
      console.error("[requireAdmin] role lookup failed:", error);
      throw new Error("Forbidden: Admin access required");
    }

    if (!data) {
      throw new Error("Forbidden: Admin access required");
    }

    return next({ context: { supabase, userId } });
  });
