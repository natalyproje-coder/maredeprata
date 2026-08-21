import { createServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { requireAdmin } from "./auth.server";
import { z } from "zod";

export const updateSiteContent = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((data) => z.object({
    key: z.string(),
    value: z.string(),
  }).parse(data))
  .handler(async ({ data }) => {
    const { error } = await supabase
      .from("site_content")
      .update({ value: data.value })
      .eq("key", data.key);
    
    if (error) throw error;
    return { success: true };
  });

export const deleteProduct = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((data) => z.object({
    slug: z.string(),
  }).parse(data))
  .handler(async ({ data }) => {
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("slug", data.slug);
    
    if (error) throw error;
    return { success: true };
  });

export const upsertProduct = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((data) => z.any().parse(data))
  .handler(async ({ data }) => {
    const { error } = await supabase
      .from("products")
      .upsert(data);
    
    if (error) throw error;
    return { success: true };
  });

export const createOrder = createServerFn({ method: "POST" })
  .inputValidator((data) => z.any().parse(data))
  .handler(async ({ data }) => {
    // We allow anonymous orders but try to associate user if present
    const { error } = await supabase
      .from("orders")
      .insert(data);
    
    if (error) {
      console.error("Error creating order:", error);
      throw new Error(`Failed to create order: ${error.message}`);
    }
    return { success: true };
  });

export const updateProfile = createServerFn({ method: "POST" })
  .inputValidator((data) => z.any().parse(data))
  .handler(async ({ data }) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Unauthorized");

    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: session.user.id,
        ...data,
        updated_at: new Date().toISOString()
      });
    
    if (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
    return { success: true };
  });

export const upsertCategory = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((data) => z.any().parse(data))
  .handler(async ({ data }) => {
    const { error } = await supabase
      .from("categories")
      .upsert(data);
    
    if (error) {
      console.error("Error upserting category:", error);
      throw error;
    }
    return { success: true };
  });

export const deleteCategory = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((data) => z.object({
    slug: z.string(),
  }).parse(data))
  .handler(async ({ data }) => {
    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("slug", data.slug);
    
    if (error) {
      console.error("Error deleting category:", error);
      throw error;
    }
    return { success: true };
  });
