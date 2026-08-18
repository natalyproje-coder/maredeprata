import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice, installments } from "@/lib/catalog";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/carrinho")({
  head: () => ({
    meta: [
      { title: "Sua sacola — Maré de Prata" },
      {
        name: "description",
        content:
          "Revise as peças da sua sacola, aplique cupom e calcule o frete antes de finalizar sua compra na Maré de Prata.",
      },
      { property: "og:title", content: "Sua sacola — Maré de Prata" },
      {
        property: "og:description",
        content: "Revise sua sacola e finalize sua compra com embalagem discreta.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { detailed, subtotal, updateQuantity, removeItem } = useStore();
  const [coupon, setCoupon] = useState("");
  const [zip, setZip] = useState("");
  const [shipping, setShipping] = useState<number | null>(null);

  const discount = coupon.trim().toUpperCase() === "MARE10" ? subtotal * 0.1 : 0;
  const total = Math.max(0, subtotal - discount) + (shipping ?? 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-4xl">Sua sacola</h1>
      <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="h-3.5 w-3.5 text-silver" /> Todos os pedidos são enviados
        em embalagem discreta
      </p>

      {detailed.length === 0 ? (
        <div className="py-24 text-center">
          <p className="text-sm text-muted-foreground">Sua sacola está vazia.</p>
          <Button asChild className="mt-6 tracking-[0.24em] uppercase">
            <Link to="/categoria/$slug" params={{ slug: "novidades" }}>
              Ver novidades
            </Link>
          </Button>
        </div>
      ) : (
        <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_340px]">
          <ul className="divide-y divide-border border-y border-border">
            {detailed.map((item) => (
              <li key={`${item.slug}-${item.size}`} className="flex gap-4 py-6">
                <img
                  src={item.product.images[0]}
                  alt={item.product.name}
                  width={1024}
                  height={1280}
                  loading="lazy"
                  className="h-36 w-24 shrink-0 object-cover"
                />
                <div className="min-w-0 flex-1">
                  <Link
                    to="/produto/$slug"
                    params={{ slug: item.slug }}
                    className="font-display text-lg hover:text-silver"
                  >
                    {item.product.name}
                  </Link>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.size} · {item.color}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {installments(item.product.price)}
                  </p>
                  <div className="mt-4 flex items-center gap-4">
                    <div className="flex items-center border border-border">
                      <button
                        type="button"
                        aria-label="Diminuir quantidade"
                        className="grid h-9 w-9 place-items-center hover:bg-secondary"
                        onClick={() =>
                          updateQuantity(item.slug, item.size, item.quantity - 1)
                        }
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center text-xs">{item.quantity}</span>
                      <button
                        type="button"
                        aria-label="Aumentar quantidade"
                        className="grid h-9 w-9 place-items-center hover:bg-secondary"
                        onClick={() =>
                          updateQuantity(item.slug, item.size, item.quantity + 1)
                        }
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <button
                      type="button"
                      aria-label="Remover item"
                      onClick={() => removeItem(item.slug, item.size)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <span className="text-sm whitespace-nowrap">
                  {formatPrice(item.product.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <aside className="h-fit border border-border bg-card/40 p-6">
            <h2 className="eyebrow">Resumo</h2>

            <div className="mt-6 space-y-3">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                <Input
                  value={coupon}
                  onChange={(event) => setCoupon(event.target.value)}
                  placeholder="Cupom"
                  aria-label="Cupom de desconto"
                />
                <Button
                  variant="outline"
                  onClick={() =>
                    toast(
                      coupon.trim().toUpperCase() === "MARE10"
                        ? "Cupom MARE10 aplicado."
                        : "Cupom inválido.",
                    )
                  }
                >
                  Aplicar
                </Button>
              </div>
              <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                <Input
                  value={zip}
                  onChange={(event) => setZip(event.target.value)}
                  placeholder="CEP"
                  inputMode="numeric"
                  aria-label="CEP"
                />
                <Button
                  variant="outline"
                  onClick={() => setShipping(subtotal >= 399 ? 0 : 29.9)}
                >
                  Frete
                </Button>
              </div>
            </div>

            <dl className="mt-6 space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <dt>Subtotal</dt>
                <dd>{formatPrice(subtotal)}</dd>
              </div>
              {discount > 0 ? (
                <div className="flex justify-between text-gold">
                  <dt>Desconto</dt>
                  <dd>-{formatPrice(discount)}</dd>
                </div>
              ) : null}
              {shipping !== null ? (
                <div className="flex justify-between text-muted-foreground">
                  <dt>Frete</dt>
                  <dd>{shipping === 0 ? "Grátis" : formatPrice(shipping)}</dd>
                </div>
              ) : null}
              <div className="flex justify-between border-t border-border pt-3 text-base">
                <dt>Total</dt>
                <dd>{formatPrice(total)}</dd>
              </div>
            </dl>

            <Button asChild size="lg" className="mt-6 w-full tracking-[0.24em] uppercase">
              <Link to="/checkout">Finalizar compra</Link>
            </Button>
          </aside>
        </div>
      )}
    </div>
  );
}
