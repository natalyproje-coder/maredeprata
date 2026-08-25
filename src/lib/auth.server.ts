import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
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

/**
 * Reads the caller's user id from the incoming Authorization header when
 * present. Returns null for guests instead of throwing, so public flows such
 * as guest checkout keep working while logged-in users can never be spoofed.
 */
export async function getOptionalUserId(): Promise<string | null> {
  const SUPABASE_URL = process.env["SUPABASE_URL"];
  const SUPABASE_PUBLISHABLE_KEY = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) return null;

  const request = getRequest();
  const authHeader = request?.headers?.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.slice("Bearer ".length).trim();
  if (!token || token.split(".").length !== 3) return null;

  try {
    const { createClient } = await import("@supabase/supabase-js");
    const client = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await client.auth.getClaims(token);
    if (error || !data?.claims?.sub) return null;
    return data.claims.sub as string;
  } catch (error) {
    console.error("[getOptionalUserId] token verification failed:", error);
    return null;
  }
}
