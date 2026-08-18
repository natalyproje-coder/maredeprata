import { Link } from "@tanstack/react-router";
import { Heart, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatPrice, installments, type Product } from "@/lib/catalog";
import { useStore } from "@/lib/store";

const badgeLabel: Record<string, string> = {
  novidade: "Novidade",
  oferta: "Oferta",
  "mais-vendido": "Mais vendido",
};

export function ProductCard({ product }: { product: Product }) {
  const { addItem, setCartOpen, toggleFavorite, isFavorite } = useStore();
  const favorite = isFavorite(product.slug);
  const discount = product.compareAt
    ? Math.round((1 - product.price / product.compareAt) * 100)
    : 0;

  return (
    <article className="group relative flex flex-col">
      <div className="relative overflow-hidden bg-card">
        <Link
          to="/produto/$slug"
          params={{ slug: product.slug }}
          aria-label={product.name}
        >
          <img
            src={product.images[0]}
            alt={product.name}
            width={1024}
            height={1280}
            loading="lazy"
            className="aspect-[4/5] w-full object-cover transition-all duration-700 ease-out group-hover:scale-[1.04] group-hover:opacity-0"
          />
          {product.images[1] ? (
            <img
              src={product.images[1]}
              alt=""
              width={1024}
              height={1280}
              loading="lazy"
              className="absolute inset-0 aspect-[4/5] w-full object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
            />
          ) : null}
        </Link>

        <div className="pointer-events-none absolute left-3 top-3 flex flex-col gap-2">
          {product.badge ? (
            <span className="bg-background/80 px-3 py-1 text-[0.6rem] tracking-[0.24em] text-silver uppercase backdrop-blur-sm">
              {badgeLabel[product.badge]}
            </span>
          ) : null}
          {discount > 0 ? (
            <span className="bg-gold px-3 py-1 text-[0.6rem] tracking-[0.18em] text-primary-foreground uppercase">
              -{discount}%
            </span>
          ) : null}
          {!product.inStock ? (
            <span className="bg-background/80 px-3 py-1 text-[0.6rem] tracking-[0.2em] text-muted-foreground uppercase backdrop-blur-sm">
              Esgotado
            </span>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => {
            toggleFavorite(product.slug);
            toast(favorite ? "Removido dos favoritos" : "Adicionado aos favoritos");
          }}
          aria-label={favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          aria-pressed={favorite}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center border border-border bg-background/70 backdrop-blur-sm transition-colors hover:bg-secondary"
        >
          <Heart
            className={cn("h-4 w-4", favorite ? "fill-gold text-gold" : "text-silver")}
          />
        </button>

        <div className="absolute inset-x-0 bottom-0 translate-y-full p-3 transition-transform duration-500 group-hover:translate-y-0">
          <Button
            variant="secondary"
            size="sm"
            className="w-full tracking-[0.2em] uppercase"
            disabled={!product.inStock}
            onClick={() => {
              addItem({
                slug: product.slug,
                size: product.sizes[0],
                color: product.colors[0],
                quantity: 1,
              });
              setCartOpen(true);
            }}
          >
            <ShoppingBag className="h-4 w-4" />
            {product.inStock ? "Adicionar" : "Esgotado"}
          </Button>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1 pt-4">
        <span className="text-[0.6rem] tracking-[0.24em] text-muted-foreground uppercase">
          {product.categoryName}
        </span>
        <h3 className="font-display text-lg leading-snug">
          <Link to="/produto/$slug" params={{ slug: product.slug }}>
            {product.name}
          </Link>
        </h3>
        <div className="mt-1 flex items-baseline gap-2">
          {product.compareAt ? (
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(product.compareAt)}
            </span>
          ) : null}
          <span className="text-base text-pearl">{formatPrice(product.price)}</span>
        </div>
        <span className="text-xs text-muted-foreground">
          {installments(product.price)}
        </span>
      </div>
    </article>
  );
}
