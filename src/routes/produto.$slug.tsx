import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Heart, RefreshCw, ShieldCheck, Star, Truck, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { ProductCard } from "@/components/site/ProductCard";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  formatPrice,
  getProduct,
  installments,
} from "@/lib/catalog";
import { useCatalog } from "@/lib/catalog-data";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/produto/$slug")({
  loader: ({ params }) => {
    const product = getProduct(params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Produto indisponível — Maré de Prata" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { product } = loaderData;
    const title = `${product.name} — Maré de Prata`;
    return {
      meta: [
        { title },
        { name: "description", content: product.description.slice(0, 155) },
        { property: "og:title", content: title },
        { property: "og:description", content: product.description.slice(0, 155) },
      ],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const loaderData = Route.useLoaderData();
  const { products } = useCatalog();
  const navigate = useNavigate();
  
  const product = useMemo(() => {
    return products.find(p => p.slug === loaderData.product.slug) || loaderData.product;
  }, [products, loaderData.product]);

  const related = useMemo(() => {
    return products
      .filter((p) => p.slug !== product.slug && p.category === product.category)
      .slice(0, 4);
  }, [products, product]);

  const { addItem, setCartOpen, toggleFavorite, isFavorite } = useStore();
  const [image, setImage] = useState(0);
  
  // Variations
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showErrors, setShowErrors] = useState(false);

  const favorite = isFavorite(product.slug);
  const isJewelry = product.category === "semijoias";
  const isBedding = product.category === "cama-banho";
  const isLingerie = product.category === "lingerie" || product.category === "moda-intima";
  const isSexyShop = product.category === "sexy-shop";

  const isOutOfStock = product.stock_quantity <= 0;

  const sizeChartType = product.meta?.size_chart_type || 
    (isJewelry ? "jewelry" : isBedding ? "bedding" : isLingerie ? "lingerie" : "none");

  const discount = product.compareAt
    ? Math.round((1 - product.price / product.compareAt) * 100)
    : 0;

  const validate = () => {
    let valid = true;
    if (product.sizes.length > 0 && !selectedSize) {
      toast.error("Por favor, selecione um tamanho");
      valid = false;
    }
    if (product.colors.length > 0 && !selectedColor) {
      toast.error("Por favor, selecione uma cor");
      valid = false;
    }
    if (quantity > product.stock_quantity) {
      toast.error(`Desculpe, temos apenas ${product.stock_quantity} unidades disponíveis.`);
      valid = false;
    }
    setShowErrors(!valid);
    return valid;
  };

  const handleAddToCart = () => {
    if (!validate()) return;
    addItem({ 
      slug: product.slug, 
      size: selectedSize || "Único", 
      color: selectedColor || "Padrão", 
      quantity 
    });
    setCartOpen(true);
    toast.success("Adicionado à sacola");
  };

  const handleBuyNow = () => {
    if (!validate()) return;
    addItem({ 
      slug: product.slug, 
      size: selectedSize || "Único", 
      color: selectedColor || "Padrão", 
      quantity 
    });
    navigate({ to: "/checkout" });
  };

  // Specific Product overrides (Task 6 & 7)
  const isKitSeda = product.slug === "kit-toque-de-seda";
  const isOleoMare = product.slug === "oleo-de-banho-noite-de-mare";

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:py-10">
      <nav className="text-[0.6rem] tracking-[0.24em] text-muted-foreground uppercase flex flex-wrap gap-1">
        <Link to="/" className="hover:text-pearl whitespace-nowrap">Início</Link>
        <span>/</span>
        <Link
          to="/categoria/$slug"
          params={{ slug: product.category }}
          className="hover:text-pearl whitespace-nowrap"
        >
          {product.categoryName}
        </Link>
        <span>/</span>
        <span className="text-pearl truncate">{product.name}</span>
      </nav>

      <div className="mt-6 sm:mt-8 grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* GALERIA */}
        <div className="space-y-4">
          <div className="overflow-hidden bg-card border border-border/50">
            <img
              src={product.images[image]}
              alt={product.name}
              className="aspect-[4/5] w-full object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>
          <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {product.images.map((src, index) => (
              <button
                key={`${src}-${index}`}
                type="button"
                onClick={() => setImage(index)}
                className={cn(
                  "w-16 sm:w-20 shrink-0 border transition-all duration-300",
                  index === image ? "border-silver scale-95" : "border-border opacity-70 hover:opacity-100",
                )}
              >
                <img src={src} alt="" className="aspect-[4/5] w-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* INFO */}
        <div className="flex flex-col">
          <div>
            <p className="eyebrow text-xs">{product.categoryName}</p>
            <h1 className="font-display mt-3 text-3xl leading-tight sm:text-5xl lg:text-6xl">
              {product.name}
            </h1>

            {/* AVALIAÇÕES (Task 9: Real reviews logic) */}
            <div className="mt-4 flex items-center gap-3">
              {product.reviews > 0 ? (
                <>
                  <span className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        key={index}
                        className={cn(
                          "h-3.5 w-3.5",
                          index < Math.round(product.rating)
                            ? "fill-gold text-gold"
                            : "text-muted-foreground/30",
                        )}
                      />
                    ))}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {product.rating} · {product.reviews} {product.reviews === 1 ? 'avaliação' : 'avaliações'}
                  </span>
                </>
              ) : (
                <span className="text-xs italic text-muted-foreground flex items-center gap-2">
                  <Star className="h-3.5 w-3.5 text-muted-foreground/30" />
                  Ainda não há avaliações. Seja a primeira pessoa a avaliar!
                </span>
              )}
            </div>

            <div className="mt-6 sm:mt-8 flex flex-wrap items-baseline gap-3">
              {product.compareAt ? (
                <span className="text-sm sm:text-base text-muted-foreground line-through opacity-60">
                  {formatPrice(product.compareAt)}
                </span>
              ) : null}
              <span className="font-display text-3xl sm:text-4xl">{formatPrice(product.price)}</span>
              {discount > 0 ? (
                <span className="bg-gold px-2 py-1 text-[0.6rem] tracking-[0.14em] text-primary-foreground uppercase font-semibold">
                  -{discount}%
                </span>
              ) : null}
            </div>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
              {installments(product.price)} · ou <span className="text-pearl font-medium">{formatPrice(product.price * 0.95)}</span> no Pix <span className="text-gold">(5% OFF)</span>
            </p>

            <div className="mt-6 text-sm sm:text-base leading-relaxed text-muted-foreground max-w-xl">
              {product.description}
            </div>
          </div>

          {/* VARIAÇÕES (Task 11) */}
          <div className="mt-8 space-y-6">
            {product.colors.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-3">
                  <p className="eyebrow text-[0.65rem]">Cores</p>
                  {showErrors && !selectedColor && (
                    <span className="text-[0.65rem] text-destructive flex items-center gap-1 uppercase tracking-wider">
                      <AlertCircle className="h-3 w-3" /> Selecione
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setSelectedColor(option)}
                      className={cn(
                        "h-11 sm:h-9 px-5 text-xs transition-all duration-300 border uppercase tracking-widest",
                        selectedColor === option
                          ? "border-silver bg-secondary text-pearl shadow-lg"
                          : "border-border text-muted-foreground hover:border-silver/50 hover:text-pearl",
                      )}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.sizes.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-3">
                  <p className="eyebrow text-[0.65rem]">{isJewelry ? "Aros" : "Tamanhos"}</p>
                  {showErrors && !selectedSize && (
                    <span className="text-[0.65rem] text-destructive flex items-center gap-1 uppercase tracking-wider">
                      <AlertCircle className="h-3 w-3" /> Selecione
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setSelectedSize(option)}
                      className={cn(
                        "h-11 sm:h-9 min-w-12 px-5 text-xs transition-all duration-300 border uppercase tracking-widest",
                        selectedSize === option
                          ? "border-silver bg-secondary text-pearl shadow-lg"
                          : "border-border text-muted-foreground hover:border-silver/50 hover:text-pearl",
                      )}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* AÇÕES (Task 3, 4, 10) */}
          <div className="mt-10 space-y-4">
            {isOutOfStock ? (
              <div className="space-y-4">
                <Button size="lg" className="h-14 w-full uppercase tracking-[0.2em] opacity-60" disabled>
                  Produto Esgotado
                </Button>
                <p className="text-center text-xs text-muted-foreground italic">
                  Avise-me quando estiver disponível
                </p>
              </div>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex items-center border border-border h-12 w-full sm:w-32 shrink-0">
                    <button
                      type="button"
                      className="h-full w-10 hover:bg-secondary transition-colors text-lg"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    >
                      −
                    </button>
                    <span className="flex-1 text-center text-sm font-medium">{quantity}</span>
                    <button
                      type="button"
                      className="h-full w-10 hover:bg-secondary transition-colors text-lg"
                      onClick={() => setQuantity((q) => Math.min(q + 1, product.stock_quantity))}
                    >
                      +
                    </button>
                  </div>
                  <Button
                    size="lg"
                    className="h-12 flex-1 tracking-[0.2em] uppercase font-semibold"
                    onClick={handleBuyNow}
                  >
                    Comprar agora
                  </Button>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-12 flex-1 tracking-[0.2em] uppercase"
                    onClick={handleAddToCart}
                  >
                    Adicionar à sacola
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-12 w-12 shrink-0"
                    onClick={() => {
                      toggleFavorite(product.slug);
                      toast(favorite ? "Removido dos favoritos" : "Adicionado aos favoritos");
                    }}
                  >
                    <Heart className={cn("h-4 w-4", favorite && "fill-gold text-gold transition-transform duration-300 scale-125")} />
                  </Button>
                </div>
                {product.stock_quantity < 5 && (
                  <p className="text-[0.65rem] text-gold uppercase tracking-[0.1em] text-center sm:text-left">
                    Restam apenas {product.stock_quantity} unidades em estoque!
                  </p>
                )}
              </>
            )}
          </div>

          <div className="hairline my-8" />

          <ul className="space-y-4 text-xs sm:text-sm text-muted-foreground">
            <li className="flex items-start gap-3">
              <Truck className="h-4 w-4 shrink-0 text-silver mt-0.5" />
              <span>Envio em até 2 dias úteis · <span className="text-pearl">Frete grátis</span> acima de R$ 399</span>
            </li>
            <li className="flex items-start gap-3">
              <ShieldCheck className="h-4 w-4 shrink-0 text-silver mt-0.5" />
              <span>Embalagem 100% discreta, sem identificação externa do conteúdo</span>
            </li>
            <li className="flex items-start gap-3">
              <RefreshCw className="h-4 w-4 shrink-0 text-silver mt-0.5" />
              <span>Troca garantida em até 7 dias após o recebimento</span>
            </li>
          </ul>

          {/* ESPECIFICAÇÕES TÉCNICAS (Task 5, 8) */}
          <Accordion type="single" collapsible className="mt-8 border-t border-border">
            {product.details.length > 0 && (
              <AccordionItem value="detalhes">
                <AccordionTrigger className="text-[0.65rem] tracking-[0.2em] uppercase py-5">
                  {isJewelry ? "Material e acabamento" : isSexyShop ? "Conteúdo e Composição" : "Composição e tecido"}
                </AccordionTrigger>
                <AccordionContent>
                  <dl className="space-y-3 text-sm pb-4">
                    {product.details.map((detail) => (
                      <div key={detail.label} className="grid grid-cols-[120px_minmax(0,1fr)] gap-2">
                        <dt className="text-muted-foreground text-[0.7rem] uppercase tracking-wider">{detail.label}</dt>
                        <dd className="text-pearl">{detail.value}</dd>
                      </div>
                    ))}
                  </dl>
                </AccordionContent>
              </AccordionItem>
            )}
            
            {(product.meta?.safety_info || product.meta?.usage_instructions) && (
              <AccordionItem value="seguranca">
                <AccordionTrigger className="text-[0.65rem] tracking-[0.2em] uppercase py-5">
                  {isSexyShop ? "Modo de Uso e Cuidados" : "Segurança e Garantia"}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="text-sm leading-relaxed text-muted-foreground space-y-4 pb-4">
                    {product.meta.usage_instructions && (
                       <div>
                        <p className="text-pearl font-medium mb-1">Modo de uso:</p>
                        <p>{product.meta.usage_instructions}</p>
                       </div>
                    )}
                    {product.meta.safety_info && (
                       <div>
                        <p className="text-pearl font-medium mb-1">Informações de segurança:</p>
                        <p>{product.meta.safety_info}</p>
                       </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Task 5, 6, 7: Conditional Size Chart */}
            {sizeChartType !== "none" && !isKitSeda && !isOleoMare && (
              <AccordionItem value="medidas">
                <AccordionTrigger className="text-[0.65rem] tracking-[0.2em] uppercase py-5">
                  Tabela de medidas
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pb-4">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="text-[0.65rem] uppercase tracking-tighter">Tamanho</TableHead>
                          <TableHead className="text-[0.65rem] uppercase tracking-tighter">{sizeChartType === "jewelry" ? "Circunferência" : "Busto / Tórax"}</TableHead>
                          <TableHead className="text-[0.65rem] uppercase tracking-tighter">{sizeChartType === "jewelry" ? "Comprimento" : "Cintura / Quadril"}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(sizeChartType === "jewelry"
                          ? [
                              ["14", "4,7 cm", "45 cm"],
                              ["16", "5,1 cm", "45 cm"],
                              ["18", "5,5 cm", "50 cm"],
                              ["Único", "Ajustável", "45–50 cm"],
                            ]
                          : sizeChartType === "bedding"
                          ? [
                              ["Solteiro", "188 x 88 cm", "1 peça"],
                              ["Casal", "188 x 138 cm", "4 peças"],
                              ["Queen", "198 x 158 cm", "4 peças"],
                              ["King", "203 x 193 cm", "4 peças"],
                            ]
                          : [
                              ["P", "82–86 cm", "62–66 cm"],
                              ["M", "87–91 cm", "67–71 cm"],
                              ["G", "92–97 cm", "72–77 cm"],
                              ["GG", "98–104 cm", "78–84 cm"],
                            ]
                        ).map((row) => (
                          <TableRow key={row[0]} className="hover:bg-secondary/20">
                            <TableCell className="text-xs">{row[0]}</TableCell>
                            <TableCell className="text-xs">{row[1]}</TableCell>
                            <TableCell className="text-xs">{row[2]}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {product.care && !isKitSeda && !isOleoMare && (
              <AccordionItem value="cuidados">
                <AccordionTrigger className="text-[0.65rem] tracking-[0.2em] uppercase py-5">
                  {isJewelry ? "Cuidados com a peça" : "Instruções de lavagem"}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground pb-4 leading-relaxed">
                  {product.care}
                </AccordionContent>
              </AccordionItem>
            )}

            <AccordionItem value="trocas">
              <AccordionTrigger className="text-[0.65rem] tracking-[0.2em] uppercase py-5">
                Entrega e política de troca
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground pb-4 leading-relaxed">
                Enviamos para todo o Brasil com código de rastreio. Trocas podem ser solicitadas em até 7 dias corridos
                após o recebimento, desde que a peça esteja sem uso e em sua embalagem original. Por
                questões de higiene e segurança, itens de sexy shop e calcinhas só são passíveis de troca se o
                lacre de segurança estiver intacto.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      {/* PRODUTOS RELACIONADOS (Task 13) */}
      {related.length > 0 && (
        <section className="mt-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-2xl tracking-[0.06em] uppercase">
              Quem viu, também amou
            </h2>
            <Link 
              to="/categoria/$slug" 
              params={{ slug: product.category }}
              className="text-[0.6rem] tracking-[0.2em] uppercase text-muted-foreground hover:text-pearl transition-colors"
            >
              Ver tudo
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-8">
            {related.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
