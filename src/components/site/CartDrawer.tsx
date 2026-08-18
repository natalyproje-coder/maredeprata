import { Link } from "@tanstack/react-router";
import { Minus, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { formatPrice } from "@/lib/catalog";
import { useStore } from "@/lib/store";

export function CartDrawer() {
  const { cartOpen, setCartOpen, detailed, subtotal, updateQuantity, removeItem } =
    useStore();
  const [coupon, setCoupon] = useState("");
  const [zip, setZip] = useState("");
  const [shipping, setShipping] = useState<number | null>(null);

  const discount = coupon.trim().toUpperCase() === "MARE10" ? subtotal * 0.1 : 0;
  const total = Math.max(0, subtotal - discount) + (shipping ?? 0);

  return (
    <Sheet open={cartOpen} onOpenChange={setCartOpen}>
      <SheetContent className="flex w-full flex-col gap-0 border-border bg-background p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border px-6 py-5">
          <SheetTitle className="font-display text-2xl tracking-[0.08em]">
            Sua sacola
          </SheetTitle>
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-silver" /> Enviamos sempre em
            embalagem discreta
          </p>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {detailed.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted-foreground">
              Sua sacola está vazia. Comece pela nossa curadoria.
            </p>
          ) : (
            <ul className="space-y-5">
              {detailed.map((item) => (
                <li key={`${item.slug}-${item.size}`} className="flex gap-4">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    width={1024}
                    height={1280}
                    loading="lazy"
                    className="h-28 w-20 shrink-0 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">{item.product.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.size} · {item.color}
                    </p>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex items-center border border-border">
                        <button
                          type="button"
                          aria-label="Diminuir quantidade"
                          className="grid h-8 w-8 place-items-center hover:bg-secondary"
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
                          className="grid h-8 w-8 place-items-center hover:bg-secondary"
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
                        className="text-muted-foreground transition-colors hover:text-destructive"
                        onClick={() => removeItem(item.slug, item.size)}
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
          )}
        </div>

        {detailed.length > 0 ? (
          <SheetFooter className="gap-4 border-t border-border px-6 py-5">
            <div className="grid w-full grid-cols-[minmax(0,1fr)_auto] gap-2">
              <Input
                value={coupon}
                onChange={(event) => setCoupon(event.target.value)}
                placeholder="Cupom de desconto"
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
            <div className="grid w-full grid-cols-[minmax(0,1fr)_auto] gap-2">
              <Input
                value={zip}
                onChange={(event) => setZip(event.target.value)}
                placeholder="CEP para frete"
                inputMode="numeric"
                aria-label="CEP para cálculo de frete"
              />
              <Button
                variant="outline"
                onClick={() => {
                  setShipping(subtotal >= 399 ? 0 : 29.9);
                  toast(
                    subtotal >= 399
                      ? "Frete grátis para este pedido."
                      : "Frete estimado: R$ 29,90",
                  );
                }}
              >
                Calcular
              </Button>
            </div>

            <dl className="w-full space-y-1 text-sm">
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
              <div className="flex justify-between border-t border-border pt-2 text-base">
                <dt>Total</dt>
                <dd>{formatPrice(total)}</dd>
              </div>
            </dl>

            <Button asChild size="lg" className="w-full tracking-[0.24em] uppercase">
              <Link to="/checkout" onClick={() => setCartOpen(false)}>
                Finalizar compra
              </Link>
            </Button>
            <Link
              to="/carrinho"
              onClick={() => setCartOpen(false)}
              className="w-full text-center text-xs tracking-[0.2em] text-muted-foreground uppercase hover:text-pearl"
            >
              Ver sacola completa
            </Link>
          </SheetFooter>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
