import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  applyCatalog,
  categories as staticCategories,
  products as staticProducts,
  type Category,
  type CategorySlug,
  type Product,
} from "@/lib/catalog";

export type ContentMap = Record<string, string>;

export const defaultContent: ContentMap = {
  hero_eyebrow: "Coleção Maré Alta",
  hero_title: "MARÉ DE PRATA",
  hero_subtitle: "Seu desejo, seu brilho, sua essência.",
  hero_cta: "Comprar agora",
  whatsapp_number: "5512991139998",
  business_cnpj: "00.000.000/0001-00",
  business_name: "Maré de Prata E-commerce LTDA",
  business_address: "São José dos Campos, SP",
  business_email: "ola@maredeprata.com",
  instagram_url: "https://instagram.com",
  facebook_url: "https://facebook.com",
  tiktok_url: "https://tiktok.com",
};

type ProductRow = {
  slug: string;
  name: string;
  category: string;
  category_name: string;
  price: number | string;
  compare_at: number | string | null;
  images: string[];
  badge: string | null;
  rating: number | string;
  reviews: number;
  colors: string[];
  sizes: string[];
  material: string;
  in_stock: boolean;
  bestseller: boolean;
  created_on: string;
  description: string;
  details: unknown;
  care: string;
  stock_quantity: number;
  meta: any;
};

export function rowToProduct(row: ProductRow): Product {
  const product: Product = {
    slug: row.slug,
    name: row.name,
    category: row.category as CategorySlug,
    categoryName: row.category_name,
    price: Number(row.price),
    images: row.images?.length ? row.images : ["/img/cat-lingerie.jpg"],
    rating: Number(row.rating),
    reviews: row.reviews,
    colors: row.colors ?? [],
    sizes: row.sizes ?? [],
    material: row.material,
    inStock: row.in_stock,
    createdAt: row.created_on,
    description: row.description,
    details: Array.isArray(row.details)
      ? (row.details as { label: string; value: string }[])
      : [],
    care: row.care,
    stock_quantity: row.stock_quantity || 0,
    meta: row.meta || {},
  };

  if (row.compare_at != null) {
    product.compareAt = Number(row.compare_at);
  }
  if (row.badge) {
    product.badge = row.badge as Product["badge"];
  }
  if (row.bestseller) {
    product.bestseller = row.bestseller;
  }

  return product;
}

export type Catalog = {
  products: Product[];
  categories: Category[];
  content: ContentMap;
};

export async function fetchCatalog(): Promise<Catalog> {
  const [prod, cats, cont] = await Promise.all([
    supabase.from("products").select("*").order("sort_order", { ascending: true }),
    supabase.from("categories").select("*").order("sort_order", { ascending: true }),
    supabase.from("site_content").select("key, value"),
  ]);

  const products = prod.data?.length
    ? (prod.data as unknown as ProductRow[]).map(rowToProduct)
    : staticProducts;
  const categories = cats.data?.length
    ? (cats.data as unknown as Category[]).map((c) => ({
        slug: c.slug,
        name: c.name,
        tagline: c.tagline,
        description: c.description,
        image: c.image,
      }))
    : staticCategories;
  const content: ContentMap = { ...defaultContent };
  for (const row of (cont.data ?? []) as { key: string; value: string }[]) {
    content[row.key] = row.value;
  }

  applyCatalog(products, categories);
  
  // Sincronizar número de WhatsApp global se houver no conteúdo
  if (content["whatsapp_number"]) {
    // Apenas garantimos que o valor do banco prevalece
  }

  return { products, categories, content };
}

export function useCatalog(): Catalog {
  const { data } = useQuery({
    queryKey: ["catalog"],
    queryFn: fetchCatalog,
    staleTime: 30_000,
  });

  return (
    data ?? {
      products: staticProducts,
      categories: staticCategories,
      content: defaultContent,
    }
  );
}

export function useSiteText(key: string) {
  const { content } = useCatalog();
  return content[key] ?? defaultContent[key] ?? "";
}
