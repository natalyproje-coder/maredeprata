import { Link, useLocation } from "@tanstack/react-router";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Logo } from "@/components/site/Logo";
import { Input } from "@/components/ui/input";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const nav = [
  { label: "Início", to: "/" as const, params: undefined },
  { label: "Lingerie", slug: "lingerie" },
  { label: "Sexy Shop", slug: "sexy-shop" },
  { label: "Moda Íntima", slug: "moda-intima" },
  { label: "Cama & Banho", slug: "cama-banho" },
  { label: "Semijoias", slug: "semijoias" },
  { label: "Novidades", slug: "novidades" },
  { label: "Ofertas", slug: "ofertas" },
];

export function Header() {
  const { count, setCartOpen, favorites } = useStore();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isAdminPath = location.pathname.startsWith("/admin");
  if (isAdminPath) return null;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-colors duration-500",
        scrolled
          ? "border-border bg-background/85 backdrop-blur-xl"
          : "border-transparent bg-transparent",
      )}
    >
      <p className="bg-secondary/60 py-2 text-center text-[0.6rem] tracking-[0.28em] text-silver uppercase">
        Embalagem discreta · Frete grátis acima de R$ 399
      </p>

      <div className="mx-auto grid max-w-7xl grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 px-4 py-4 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
        <button
          type="button"
          aria-label="Abrir menu"
          className="grid h-10 w-10 place-items-center lg:hidden"
          onClick={() => setMenuOpen(true)}
        >
          <Menu className="h-5 w-5 text-silver" />
        </button>

        <div className="hidden min-w-0 lg:block">
          <Logo />
        </div>

        <div className="min-w-0 justify-self-center lg:hidden">
          <Logo size="sm" />
        </div>

        <nav className="hidden justify-self-center lg:block" aria-label="Categorias">
          <ul className="flex items-center gap-6 text-[0.7rem] tracking-[0.2em] uppercase">
            {nav.map((item) =>
              item.slug ? (
                <li key={item.label}>
                  <Link
                    to="/categoria/$slug"
                    params={{ slug: item.slug }}
                    className="text-muted-foreground transition-colors hover:text-pearl"
                    activeProps={{ className: "text-pearl" }}
                  >
                    {item.label}
                  </Link>
                </li>
              ) : (
                <li key={item.label}>
                  <Link
                    to="/"
                    className="text-muted-foreground transition-colors hover:text-pearl"
                    activeOptions={{ exact: true }}
                    activeProps={{ className: "text-pearl" }}
                  >
                    {item.label}
                  </Link>
                </li>
              ),
            )}
          </ul>
        </nav>

        <div className="flex items-center justify-end gap-1 sm:gap-2">
          <button
            type="button"
            aria-label="Pesquisar"
            className="grid h-10 w-10 place-items-center text-silver hover:text-pearl"
            onClick={() => setSearchOpen((open) => !open)}
          >
            <Search className="h-[1.1rem] w-[1.1rem]" />
          </button>
          <Link
            to="/conta"
            aria-label="Minha conta"
            className="hidden h-10 w-10 place-items-center text-silver hover:text-pearl sm:grid"
          >
            <User className="h-[1.1rem] w-[1.1rem]" />
          </Link>
          <Link
            to="/favoritos"
            aria-label="Favoritos"
            className="relative hidden h-10 w-10 place-items-center text-silver hover:text-pearl sm:grid"
          >
            <Heart className="h-[1.1rem] w-[1.1rem]" />
            {favorites.length > 0 ? (
              <span className="absolute top-1 right-1 grid h-4 min-w-4 place-items-center bg-gold px-1 text-[0.55rem] text-primary-foreground">
                {favorites.length}
              </span>
            ) : null}
          </Link>
          <button
            type="button"
            aria-label="Abrir sacola"
            className="relative grid h-10 w-10 place-items-center text-silver hover:text-pearl"
            onClick={() => setCartOpen(true)}
          >
            <ShoppingBag className="h-[1.1rem] w-[1.1rem]" />
            {count > 0 ? (
              <span className="absolute top-1 right-1 grid h-4 min-w-4 place-items-center bg-gold px-1 text-[0.55rem] text-primary-foreground">
                {count}
              </span>
            ) : null}
          </button>
        </div>
      </div>

      {searchOpen ? (
        <div className="border-t border-border bg-background/95 px-4 py-4 backdrop-blur">
          <div className="mx-auto max-w-3xl">
            <Input
              autoFocus
              placeholder="Buscar por peça, categoria ou material"
              aria-label="Buscar produtos"
            />
          </div>
        </div>
      ) : null}

      {menuOpen ? (
        <div className="fixed inset-0 z-50 bg-background lg:hidden">
          <div className="flex items-center justify-between border-b border-border px-4 py-4">
            <Logo size="sm" />
            <button
              type="button"
              aria-label="Fechar menu"
              onClick={() => setMenuOpen(false)}
              className="grid h-10 w-10 place-items-center text-silver"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="px-6 py-8" aria-label="Menu principal">
            <ul className="space-y-5">
              {nav.map((item) => (
                <li key={item.label} className="border-b border-border/60 pb-4">
                  {item.slug ? (
                    <Link
                      to="/categoria/$slug"
                      params={{ slug: item.slug }}
                      onClick={() => setMenuOpen(false)}
                      className="font-display text-2xl"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <Link
                      to="/"
                      onClick={() => setMenuOpen(false)}
                      className="font-display text-2xl"
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
              <li className="pt-2">
                <Link
                  to="/conta"
                  onClick={() => setMenuOpen(false)}
                  className="text-xs tracking-[0.24em] text-muted-foreground uppercase"
                >
                  Minha conta
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
