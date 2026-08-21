import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import {
  getCategory,
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
  validateSearch: (search: Record<string, unknown>): { q?: string | undefined } => ({
    q: search["q"] as string | undefined,
  }),
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
  const { products: allProducts, categories } = useCatalog();
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
  const isSexyShop = slug === "sexy-shop";
  
  // Contextual Filters logic: Only show options that exist in the current products
  const relevantSizes = useMemo(() => Array.from(new Set(base.flatMap(p => p.sizes))).sort(), [base]);
  const relevantColors = useMemo(() => Array.from(new Set(base.flatMap(p => p.colors))).sort(), [base]);
  const relevantMaterials = useMemo(() => Array.from(new Set(base.map(p => p.material))).sort(), [base]);

  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [materials, setMaterials] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(1200);
  const [onlyStock, setOnlyStock] = useState<boolean>(false);
  const [onlyBest, setOnlyBest] = useState<boolean>(false);
  const [sort, setSort] = useState<SortKey>("relevantes");

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
      if (p.price > maxPrice) return false;
      if (onlyStock && p.stock_quantity <= 0) return false;
      if (onlyBest && !p.bestseller) return false;
      return true;
    });

    list = [...list];
    if (sort === "menor") list.sort((a, b) => a.price - b.price);
    if (sort === "maior") list.sort((a, b) => b.price - a.price);
    if (sort === "vendidos") list.sort((a, b) => b.reviews - a.reviews);
    if (sort === "recentes") list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return list;
  }, [base, sizes, colors, materials, maxPrice, onlyStock, onlyBest, sort]);

  const clearFilters = () => {
    setSizes([]);
    setColors([]);
    setMaterials([]);
    setMaxPrice(1200);
    setOnlyStock(false);
    setOnlyBest(false);
  };

  const FilterContent = () => (
    <div className="space-y-8">
      {relevantSizes.length > 0 && (
        <FilterGroup title={isJewelry ? "Aro / Tamanho" : "Tamanho"}>
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
      )}
      {relevantColors.length > 0 && (
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
      {relevantMaterials.length > 0 && (
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
          max={1200}
          step={10}
          onValueChange={(value) => setMaxPrice(value[0] ?? 1200)}
          aria-label="Preço máximo"
        />
        <p className="mt-3 text-xs text-muted-foreground">
          Até R$ {maxPrice.toLocaleString("pt-BR")}
        </p>
      </FilterGroup>
      <FilterGroup title="Disponibilidade">
        <FilterCheck
          id="stock"
          label="Em estoque"
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
      
      <Button 
        variant="ghost" 
        size="sm" 
        className="w-full text-xs text-muted-foreground"
        onClick={clearFilters}
      >
        Limpar todos os filtros
      </Button>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
      <nav aria-label="Você está em" className="text-[0.6rem] tracking-[0.24em] text-muted-foreground uppercase">
        <Link to="/" className="hover:text-pearl">Início</Link> / {name}
      </nav>
      <header className="mt-4 max-w-2xl">
        <h1 className="font-display text-3xl tracking-[0.06em] uppercase sm:text-5xl">
          {name}
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{description}</p>
      </header>

      <div className="hairline my-8 sm:my-10" />

      {/* Mobile Actions */}
      <div className="flex items-center gap-3 lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="flex-1 h-11">
              <SlidersHorizontal className="h-4 w-4 mr-2" /> Filtrar
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh] overflow-y-auto rounded-t-2xl">
            <SheetHeader className="border-b pb-4 mb-4">
              <SheetTitle className="text-left font-display uppercase tracking-widest">Filtros</SheetTitle>
            </SheetHeader>
            <FilterContent />
            <SheetFooter className="mt-8 pb-8">
              <SheetClose asChild>
                <Button className="w-full h-12 uppercase tracking-widest">Aplicar Filtros</Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
        <div className="flex-1">
          <SortSelect value={sort} onChange={setSort} />
        </div>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[240px_minmax(0,1fr)]">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block space-y-2">
          <FilterContent />
        </aside>

        <section>
          <div className="hidden grid-cols-[minmax(0,1fr)_auto] items-center gap-4 lg:grid mb-8">
            <p className="text-xs text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? "peça encontrada" : "peças encontradas"}
            </p>
            <SortSelect value={sort} onChange={setSort} />
          </div>

          {filtered.length === 0 ? (
            <div className="py-24 text-center">
              <p className="text-sm text-muted-foreground">
                {base.length === 0 
                  ? "Em breve teremos novidades nesta categoria."
                  : "Nenhuma peça encontrada com esses filtros."
                }
              </p>
              {filtered.length !== base.length && (
                <Button variant="link" onClick={clearFilters} className="mt-2 text-pearl">
                  Limpar filtros
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-3">
              {filtered.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </div>
          )}

          {/* Cross-navigation section */}
          <div className="mt-20 border-t border-border pt-12">
            <h2 className="eyebrow text-center mb-8">Explore outras categorias</h2>
            <div className="flex flex-wrap justify-center gap-4">
              {categories.filter(c => c.slug !== slug).map(c => (
                <Button key={c.slug} variant="outline" asChild className="rounded-full">
                  <Link to="/categoria/$slug" params={{ slug: c.slug }}>
                    {c.name}
                  </Link>
                </Button>
              ))}
            </div>
          </div>
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
      <SelectTrigger className="w-full lg:w-[190px] h-11 lg:h-9" aria-label="Ordenar por">
        <SelectValue placeholder="Ordenar por" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="relevantes">Mais relevantes</SelectItem>
        <SelectItem value="menor">Menor preço</SelectItem>
        <SelectItem value="maior">Maior preço</SelectItem>
        <SelectItem value="vendidos">Mais vendidos</SelectItem>
        <SelectItem value="recentes">Lançamentos</SelectItem>
      </SelectContent>
    </Select>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="py-2">
      <h2 className="text-[0.65rem] tracking-[0.2em] text-muted-foreground uppercase font-medium mb-3">{title}</h2>
      <div className="space-y-3">{children}</div>
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
      <Label htmlFor={id} className="text-sm font-normal text-muted-foreground cursor-pointer select-none">
        {label}
      </Label>
    </div>
  );
}
