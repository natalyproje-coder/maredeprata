import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Gem, Sparkles, Truck } from "lucide-react";
import hero from "@/assets/hero.jpg";
import { ProductCard } from "@/components/site/ProductCard";
import { InstagramSection } from "@/components/site/InstagramSection";
import { Button } from "@/components/ui/button";
import { useCatalog, useSiteText } from "@/lib/catalog-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Maré de Prata — Lingerie, Sexy Shop e Semijoias" },
      {
        name: "description",
        content:
          "Seu desejo, seu brilho, sua essência. Lingerie de renda, cama & banho acetinado e semijoias em prata e ouro, com entrega discreta.",
      },
      { property: "og:title", content: "Maré de Prata — Seu desejo, seu brilho" },
      {
        property: "og:description",
        content:
          "Boutique feminina premium: lingerie, sexy shop, cama & banho e semijoias em prata e ouro.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { products, categories } = useCatalog();
  const heroEyebrow = useSiteText("hero_eyebrow");
  const heroTitle = useSiteText("hero_title");
  const heroSubtitle = useSiteText("hero_subtitle");
  const heroCta = useSiteText("hero_cta");

  const novidades = [...products]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 4);
  const maisVendidos = products.filter((p) => p.bestseller).slice(0, 4);
  const banners = categories.filter((c) =>
    ["lingerie", "sexy-shop", "cama-banho", "semijoias"].includes(c.slug),
  );

  return (
    <>
      {/* HERO */}
      <section className="relative min-h-[86vh] overflow-hidden">
        <img
          src={hero}
          alt="Peça de cetim e renda em cenário de luz prateada"
          width={1920}
          height={1152}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-background/55" />
        <div className="veil absolute inset-0" />
        <div className="animate-tide pointer-events-none absolute inset-x-0 bottom-0 h-40 opacity-30">
          <svg viewBox="0 0 1440 160" preserveAspectRatio="none" className="h-full w-full">
            <path
              d="M0 90 C 240 140 480 30 720 70 C 960 110 1200 20 1440 60 L1440 160 L0 160 Z"
              fill="oklch(0.318 0.031 233 / 55%)"
            />
          </svg>
        </div>

        <div className="relative mx-auto flex min-h-[86vh] max-w-7xl flex-col items-start justify-end px-4 pb-24 sm:justify-center sm:pb-0">
          <div className="animate-rise max-w-2xl">
            <p className="eyebrow">{heroEyebrow}</p>
            <h1 className="font-display mt-6 text-5xl leading-[0.95] tracking-[0.06em] text-silver-gradient sm:text-7xl lg:text-8xl">
              {heroTitle}
            </h1>
            <p className="font-display mt-6 text-xl text-pearl/90 italic sm:text-2xl">
              “{heroSubtitle}”
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Button asChild size="lg" className="tracking-[0.28em] uppercase">
                <Link to="/categoria/$slug" params={{ slug: "novidades" }}>
                  {heroCta}
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="tracking-[0.28em] uppercase"
              >
                <Link to="/categoria/$slug" params={{ slug: "semijoias" }}>
                  Ver semijoias
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* SELOS */}
      <section className="border-y border-border">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:grid-cols-3">
          {[
            { icon: Truck, title: "Embalagem discreta", text: "Sem identificação externa" },
            { icon: Gem, title: "Prata 925 e ouro 18k", text: "Garantia de 12 meses" },
            { icon: Sparkles, title: "Curadoria autoral", text: "Peças em edição limitada" },
          ].map((item) => (
            <div key={item.title} className="flex min-w-0 items-center gap-4">
              <item.icon className="h-5 w-5 shrink-0 text-silver" />
              <div className="min-w-0">
                <p className="text-sm">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* BANNERS MENORES */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {banners.map((cat) => (
            <Link
              key={cat.slug}
              to="/categoria/$slug"
              params={{ slug: cat.slug }}
              className="group relative overflow-hidden"
            >
              <img
                src={cat.image}
                alt={cat.name}
                width={1024}
                height={1280}
                loading="lazy"
                className="aspect-[3/4] w-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="veil absolute inset-0" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <h2 className="font-display text-2xl tracking-[0.1em] uppercase">
                  {cat.name}
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">{cat.tagline}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-[0.6rem] tracking-[0.24em] text-silver uppercase">
                  Explorar <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CATEGORIAS EDITORIAIS */}
      <section className="surface-tide border-y border-border py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="max-w-xl">
            <p className="eyebrow">Categorias</p>
            <h2 className="font-display mt-3 text-4xl sm:text-5xl">
              Escolha como quer se sentir
            </h2>
          </div>
          <div className="mt-12 space-y-4">
            {categories.map((cat, index) => (
              <Link
                key={cat.slug}
                to="/categoria/$slug"
                params={{ slug: cat.slug }}
                className="group grid items-center gap-6 border border-border bg-card/40 p-4 transition-colors hover:bg-card/80 md:grid-cols-[220px_minmax(0,1fr)_auto]"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  width={1024}
                  height={1280}
                  loading="lazy"
                  className="h-48 w-full object-cover md:h-40"
                />
                <div className="min-w-0">
                  <span className="text-[0.6rem] tracking-[0.28em] text-muted-foreground">
                    0{index + 1}
                  </span>
                  <h3 className="font-display mt-2 text-3xl tracking-[0.06em] uppercase">
                    {cat.name}
                  </h3>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                    {cat.description}
                  </p>
                </div>
                <ArrowRight className="hidden h-5 w-5 text-silver transition-transform duration-500 group-hover:translate-x-2 md:block" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* NOVIDADES */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
          <div className="min-w-0">
            <p className="eyebrow">Recém-chegadas</p>
            <h2 className="font-display mt-3 text-4xl">Novidades</h2>
          </div>
          <Link
            to="/categoria/$slug"
            params={{ slug: "novidades" }}
            className="shrink-0 text-[0.65rem] tracking-[0.24em] text-silver uppercase hover:text-pearl"
          >
            Ver tudo
          </Link>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
          {novidades.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </section>

      {/* MANIFESTO */}
      <section className="border-y border-border bg-card/30 py-24">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <p className="eyebrow">Nosso jeito</p>
          <p className="font-display mt-6 text-3xl leading-snug italic sm:text-4xl">
            “Você não está apenas comprando uma peça. Está escolhendo como quer se
            sentir.”
          </p>
          <div className="hairline mx-auto mt-10 w-40" />
        </div>
      </section>

      {/* MAIS VENDIDOS */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
          <div className="min-w-0">
            <p className="eyebrow">Favoritas da casa</p>
            <h2 className="font-display mt-3 text-4xl">Mais vendidos</h2>
          </div>
          <Link
            to="/categoria/$slug"
            params={{ slug: "ofertas" }}
            className="shrink-0 text-[0.65rem] tracking-[0.24em] text-silver uppercase hover:text-pearl"
          >
            Ver ofertas
          </Link>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
          {maisVendidos.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </section>

      <InstagramSection />
    </>
  );
}
