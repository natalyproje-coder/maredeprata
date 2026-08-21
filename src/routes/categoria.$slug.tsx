import { createFileRoute, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { ProductCard } from "@/components/site/ProductCard";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  allColors,
  allMaterials,
  allSizes,
  getCategory,
  productsByCategory,
} from "@/lib/catalog";
import { useCatalog } from "@/lib/catalog-data";

const virtual: Record<string, { name: string; description: string }> = {
  novidades: {
    name: "Novidades",
    description: "As peças mais recentes da nossa curadoria, em ordem de chegada.",
  },
  ofertas: {
    name: "Ofertas",
    description: "Seleção com preço especial enquanto durarem os estoques.",
  },
};

export const Route = createFileRoute("/categoria/$slug")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: (search.q as string) || undefined,
  }) as { q?: string },
  loader: ({ params }) => {
    const category = getCategory(params.slug);
    const meta = category
      ? { name: category.name, description: category.description }
      : virtual[params.slug];
    if (!meta) throw notFound();
    return { slug: params.slug, ...meta };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Categoria indisponível — Maré de Prata" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const title = `${loaderData.name} — Maré de Prata`;
    return {
      meta: [
        { title },
        { name: "description", content: loaderData.description },
        { property: "og:title", content: title },
        { property: "og:description", content: loaderData.description },
      ],
    };
  },
  component: CategoryPage,
});

type SortKey = "relevantes" | "menor" | "maior" | "vendidos" | "recentes";

function CategoryPage() {
  const { slug, name, description } = Route.useLoaderData();
  const { products: allProducts, categories, content } = useCatalog();
  const searchParams = Route.useSearch();
  const query = searchParams.q?.toLowerCase() || "";

  const base = useMemo(() => {
    let filtered = [...allProducts];
    
    if (slug === "novidades") {
      filtered = filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    } else if (slug === "ofertas") {
      filtered = filtered.filter((p) => p.compareAt);
    } else {
      filtered = filtered.filter((p) => p.category === slug);
    }

    if (query) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.description.toLowerCase().includes(query) ||
        p.material.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [allProducts, slug, query]);

  const isJewelry = slug === "semijoias";
  const isBedding = slug === "cama-banho";
  const isLingerie = slug === "lingerie" || slug === "moda-intima";
  const isSexyShop = slug === "sexy-shop";

  const isSpecial = slug === "novidades" || slug === "ofertas";
  
  const relevantSizes = useMemo(() => {
    if (isSpecial) return allSizes;
    return Array.from(new Set(base.flatMap(p => p.sizes)));
  }, [base, isSpecial]);

  const relevantColors = useMemo(() => {
    if (isSpecial) return allColors;
    return Array.from(new Set(base.flatMap(p => p.colors)));
  }, [base, isSpecial]);

  const relevantMaterials = useMemo(() => {
    if (isSpecial) return allMaterials;
    return Array.from(new Set(base.map(p => p.material)));
  }, [base, isSpecial]);

  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [materials, setMaterials] = useState<string[]>([]);
  const [cats, setCats] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(700);
  const [onlyStock, setOnlyStock] = useState<boolean>(false);
  const [onlyBest, setOnlyBest] = useState<boolean>(false);
  const [sort, setSort] = useState<SortKey>("relevantes");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const toggle = (
    value: string,
    list: string[],
    set: (next: string[]) => void,
  ) => set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  const filtered = useMemo(() => {
    let list = base.filter((p) => {
      if (sizes.length && !p.sizes.some((s) => sizes.includes(s))) return false;
      if (colors.length && !p.colors.some((c) => colors.includes(c))) return false;
      if (materials.length && !materials.includes(p.material)) return false;
      if (cats.length && !cats.includes(p.category)) return false;
      if (p.price > maxPrice) return false;
      if (onlyStock && !p.inStock) return false;
      if (onlyBest && !p.bestseller) return false;
      return true;
    });

    list = [...list];
    if (sort === "menor") list.sort((a, b) => a.price - b.price);
    if (sort === "maior") list.sort((a, b) => b.price - a.price);
    if (sort === "vendidos") list.sort((a, b) => b.reviews - a.reviews);
    if (sort === "recentes") list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return list;
  }, [base, sizes, colors, materials, cats, maxPrice, onlyStock, onlyBest, sort]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <nav aria-label="Você está em" className="text-[0.6rem] tracking-[0.24em] text-muted-foreground uppercase">
        Início / {name}
      </nav>
      <header className="mt-4 max-w-2xl">
        <h1 className="font-display text-4xl tracking-[0.06em] uppercase sm:text-5xl">
          {name}
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{description}</p>
      </header>

      <div className="hairline my-10" />

      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 lg:hidden">
        <Button variant="outline" onClick={() => setFiltersOpen((o) => !o)}>
          <SlidersHorizontal className="h-4 w-4" /> Filtros
        </Button>
        <SortSelect value={sort} onChange={setSort} />
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className={`${filtersOpen ? "block" : "hidden"} lg:block`}>
          <FilterGroup title="Categoria">
            {categories.map((c) => (
              <FilterCheck
                key={c.slug}
                id={`cat-${c.slug}`}
                label={c.name}
                checked={cats.includes(c.slug)}
                onChange={() => toggle(c.slug, cats, setCats)}
              />
            ))}
          </FilterGroup>
          <FilterGroup title="Tamanho">
            <div className="flex flex-wrap gap-2">
              {relevantSizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  aria-pressed={sizes.includes(s)}
                  onClick={() => toggle(s, sizes, setSizes)}
                  className={`border px-3 py-1.5 text-xs transition-colors ${
                    sizes.includes(s)
                      ? "border-silver bg-secondary text-pearl"
                      : "border-border text-muted-foreground hover:text-pearl"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </FilterGroup>
          {allColors.length > 0 && (
            <FilterGroup title="Cor">
            {relevantColors.map((c) => (
              <FilterCheck
                key={c}
                id={`color-${c}`}
                label={c}
                checked={colors.includes(c)}
                onChange={() => toggle(c, colors, setColors)}
              />
            ))}
            </FilterGroup>
          )}
          {allMaterials.length > 0 && (
            <FilterGroup title="Material">
            {relevantMaterials.map((m) => (
              <FilterCheck
                key={m}
                id={`mat-${m}`}
                label={m}
                checked={materials.includes(m)}
                onChange={() => toggle(m, materials, setMaterials)}
              />
            ))}
            </FilterGroup>
          )}
          <FilterGroup title="Preço até">
            <Slider
              value={[maxPrice]}
              min={50}
              max={800}
              step={10}
              onValueChange={(value) => setMaxPrice(value[0] ?? 800)}
              aria-label="Preço máximo"
            />
            <p className="mt-3 text-xs text-muted-foreground">
              Até R$ {maxPrice.toLocaleString("pt-BR")}
            </p>
          </FilterGroup>
          <FilterGroup title="Outros">
            <FilterCheck
              id="stock"
              label="Disponível em estoque"
              checked={onlyStock}
              onChange={() => setOnlyStock((v) => !v)}
            />
            <FilterCheck
              id="best"
              label="Mais vendidos"
              checked={onlyBest}
              onChange={() => setOnlyBest((v) => !v)}
            />
          </FilterGroup>
        </aside>

        <section>
          <div className="hidden grid-cols-[minmax(0,1fr)_auto] items-center gap-4 lg:grid">
            <p className="text-xs text-muted-foreground">
              {filtered.length} peça{filtered.length === 1 ? "" : "s"}
            </p>
            <SortSelect value={sort} onChange={setSort} />
          </div>

          {filtered.length === 0 ? (
            <p className="py-24 text-center text-sm text-muted-foreground">
              Nenhuma peça encontrada com esses filtros.
            </p>
          ) : (
            <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-3">
              {filtered.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function SortSelect({
  value,
  onChange,
}: {
  value: SortKey;
  onChange: (value: SortKey) => void;
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as SortKey)}>
      <SelectTrigger className="w-[190px]" aria-label="Ordenar por">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="relevantes">Mais relevantes</SelectItem>
        <SelectItem value="menor">Menor preço</SelectItem>
        <SelectItem value="maior">Maior preço</SelectItem>
        <SelectItem value="vendidos">Mais vendidos</SelectItem>
        <SelectItem value="recentes">Mais recentes</SelectItem>
      </SelectContent>
    </Select>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-border py-6 first:pt-0">
      <h2 className="eyebrow">{title}</h2>
      <div className="mt-4 space-y-3">{children}</div>
    </div>
  );
}

function FilterCheck({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <Checkbox id={id} checked={checked} onCheckedChange={onChange} />
      <Label htmlFor={id} className="text-sm font-normal text-muted-foreground">
        {label}
      </Label>
    </div>
  );
}
