import { Link } from "@tanstack/react-router";
import { Heart, Home, LayoutGrid, ShoppingBag, User } from "lucide-react";
import { useStore } from "@/lib/store";

export function MobileTabBar() {
  const { count, setCartOpen } = useStore();

  return (
    <nav
      aria-label="Navegação rápida"
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-background/95 backdrop-blur md:hidden"
    >
      <Link
        to="/"
        className="grid place-items-center gap-1 py-3 text-[0.55rem] tracking-[0.14em] text-muted-foreground uppercase"
        activeOptions={{ exact: true }}
        activeProps={{ className: "text-pearl" }}
      >
        <Home className="h-[1.05rem] w-[1.05rem]" />
        Início
      </Link>
      <Link
        to="/categoria/$slug"
        params={{ slug: "lingerie" }}
        className="grid place-items-center gap-1 py-3 text-[0.55rem] tracking-[0.14em] text-muted-foreground uppercase"
        activeProps={{ className: "text-pearl" }}
      >
        <LayoutGrid className="h-[1.05rem] w-[1.05rem]" />
        Loja
      </Link>
      <button
        type="button"
        onClick={() => setCartOpen(true)}
        className="relative grid place-items-center gap-1 py-3 text-[0.55rem] tracking-[0.14em] text-muted-foreground uppercase"
      >
        <ShoppingBag className="h-[1.05rem] w-[1.05rem]" />
        Sacola
        {count > 0 ? (
          <span className="absolute top-2 right-1/4 grid h-4 min-w-4 place-items-center bg-gold px-1 text-[0.5rem] text-primary-foreground">
            {count}
          </span>
        ) : null}
      </button>
      <Link
        to="/favoritos"
        className="grid place-items-center gap-1 py-3 text-[0.55rem] tracking-[0.14em] text-muted-foreground uppercase"
        activeProps={{ className: "text-pearl" }}
      >
        <Heart className="h-[1.05rem] w-[1.05rem]" />
        Favoritos
      </Link>
      <Link
        to="/conta"
        className="grid place-items-center gap-1 py-3 text-[0.55rem] tracking-[0.14em] text-muted-foreground uppercase"
        activeProps={{ className: "text-pearl" }}
      >
        <User className="h-[1.05rem] w-[1.05rem]" />
        Conta
      </Link>
    </nav>
  );
}
