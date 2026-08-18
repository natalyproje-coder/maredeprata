import { createFileRoute, Link } from "@tanstack/react-router";
import { ProductCard } from "@/components/site/ProductCard";
import { Button } from "@/components/ui/button";
import { getProduct } from "@/lib/catalog";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/favoritos")({
  head: () => ({
    meta: [
      { title: "Meus favoritos — Maré de Prata" },
      {
        name: "description",
        content:
          "As peças que você guardou para depois: lingerie, semijoias e itens de cama & banho da Maré de Prata.",
      },
      { property: "og:title", content: "Meus favoritos — Maré de Prata" },
      {
        property: "og:description",
        content: "As peças que você guardou para depois na Maré de Prata.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: FavoritesPage,
});

function FavoritesPage() {
  const { favorites } = useStore();
  const items = favorites
    .map((slug) => getProduct(slug))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <p className="eyebrow">Sua lista</p>
      <h1 className="font-display mt-3 text-4xl">Favoritos</h1>

      {items.length === 0 ? (
        <div className="py-24 text-center">
          <p className="text-sm text-muted-foreground">
            Você ainda não guardou nenhuma peça.
          </p>
          <Button asChild className="mt-6 tracking-[0.24em] uppercase">
            <Link to="/categoria/$slug" params={{ slug: "lingerie" }}>
              Descobrir peças
            </Link>
          </Button>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
          {items.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
