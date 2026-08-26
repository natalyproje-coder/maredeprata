import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAdmin } from "./auth.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const productSchema = z
  .object({
    id: z.string().optional(),
    slug: z.string().min(1),
    name: z.string().min(1),
    category: z.string().min(1),
    category_name: z.string().default(""),
    price: z.coerce.number().nonnegative(),
    compare_at: z.coerce.number().nullable().optional(),
    images: z.array(z.string()).default([]),
    badge: z.string().nullable().optional(),
    material: z.string().default(""),
    in_stock: z.boolean().default(true),
    bestseller: z.boolean().default(false),
    colors: z.array(z.string()).default([]),
    sizes: z.array(z.string()).default([]),
    description: z.string().default(""),
    details: z
      .array(z.object({ label: z.string().default(""), value: z.string().default("") }))
      .default([]),
    care: z.string().default(""),
    stock_quantity: z.coerce.number().int().min(0).default(0),
    meta: z.record(z.string(), z.any()).default({}),
    sort_order: z.coerce.number().int().default(0),
    rating: z.coerce.number().default(5),
    reviews: z.coerce.number().int().default(0),
    created_on: z.string().default(() => new Date().toISOString().slice(0, 10)),
  })
  .strip();

const categorySchema = z
  .object({
    id: z.string().optional(),
    slug: z.string().min(1),
    name: z.string().min(1),
    description: z.string().nullable().optional(),
    image: z.string().nullable().optional(),
    sort_order: z.coerce.number().int().default(0),
  })
  .strip();

const orderItemSchema = z.object({
  slug: z.string(),
  name: z.string(),
  size: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  quantity: z.coerce.number().int().positive(),
  price: z.coerce.number().nonnegative(),
});

const orderSchema = z.object({
  order_number: z.string().min(1),
  customer_name: z.string().min(1),
  customer_email: z.string().email(),
  customer_phone: z.string().nullable().optional(),
  shipping_address: z.record(z.string(), z.any()),
  items: z.array(orderItemSchema).min(1),
  total_amount: z.coerce.number().nonnegative(),
});

const profileSchema = z.object({
  full_name: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  address: z.record(z.string(), z.any()).nullable().optional(),
});

export const updateSiteContent = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((data) => z.object({ key: z.string(), value: z.string() }).parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("site_content")
      .upsert({ key: data.key, value: data.value }, { onConflict: "key" });

    if (error) {
      console.error("[updateSiteContent]", error);
      throw new Error(error.message);
    }
    return { success: true };
  });

export const deleteProduct = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((data) => z.object({ slug: z.string() }).parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("products").delete().eq("slug", data.slug);

    if (error) {
      console.error("[deleteProduct]", error);
      throw new Error(error.message);
    }
    return { success: true };
  });

export const upsertProduct = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((data) => productSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const payload = { ...data, in_stock: data.stock_quantity > 0 };
    if (!payload.id) delete (payload as Record<string, unknown>)["id"];

    const { error } = await supabaseAdmin
      .from("products")
      .upsert(payload as never, { onConflict: "slug" });

    if (error) {
      console.error("[upsertProduct]", error);
      throw new Error(error.message);
    }
    return { success: true };
  });

export const upsertCategory = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((data) => categorySchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const payload = { ...data };
    if (!payload.id) delete (payload as Record<string, unknown>)["id"];

    const { error } = await supabaseAdmin
      .from("categories")
      .upsert(payload as never, { onConflict: "slug" });

    if (error) {
      console.error("[upsertCategory]", error);
      throw new Error(error.message);
    }
    return { success: true };
  });

export const deleteCategory = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((data) => z.object({ slug: z.string() }).parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("categories").delete().eq("slug", data.slug);

    if (error) {
      console.error("[deleteCategory]", error);
      throw new Error(error.message);
    }
    return { success: true };
  });

export const createOrder = createServerFn({ method: "POST" })
  .inputValidator((data) => orderSchema.parse(data))
  .handler(async ({ data }) => {
    // The owner is derived from the verified bearer token, never from input.
    const { getOptionalUserId } = await import("./optional-user.server");
    const userId = await getOptionalUserId();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { error } = await supabaseAdmin.from("orders").insert({
      ...data,
      customer_phone: data.customer_phone || null,
      user_id: userId,
      status: "pending",
    } as never);

    if (error) {
      console.error("[createOrder]", error);
      throw new Error(`Falha ao registrar o pedido: ${error.message}`);
    }
    return { success: true, order_number: data.order_number };
  });

export const updateProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => profileSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("profiles").upsert({
      id: context.userId,
      ...data,
      updated_at: new Date().toISOString(),
    } as never);

    if (error) {
      console.error("[updateProfile]", error);
      throw new Error(error.message);
    }
    return { success: true };
  });
