import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Heart, RefreshCw, ShieldCheck, Star, Truck } from "lucide-react";
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
  relatedProducts,
} from "@/lib/catalog";
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
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            description: product.description,
            brand: { "@type": "Brand", name: "Maré de Prata" },
            material: product.material,
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: product.rating,
              reviewCount: product.reviews,
            },
            offers: {
              "@type": "Offer",
              price: product.price.toFixed(2),
              priceCurrency: "BRL",
              availability: product.inStock
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
            },
          }),
        },
      ],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { product } = Route.useLoaderData();
  const { addItem, setCartOpen, toggleFavorite, isFavorite } = useStore();
  const [image, setImage] = useState(0);
  const [size, setSize] = useState(product.sizes[0] ?? "Único");
  const [color, setColor] = useState(product.colors[0] ?? "Padrão");
  const [quantity, setQuantity] = useState(1);

  const favorite = isFavorite(product.slug);
  const isJewelry = product.category === "semijoias";
  const discount = product.compareAt
    ? Math.round((1 - product.price / product.compareAt) * 100)
    : 0;

  const add = () => {
    addItem({ slug: product.slug, size, color, quantity });
    setCartOpen(true);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <nav className="text-[0.6rem] tracking-[0.24em] text-muted-foreground uppercase">
        <Link to="/" className="hover:text-pearl">
          Início
        </Link>{" "}
        /{" "}
        <Link
          to="/categoria/$slug"
          params={{ slug: product.category }}
          className="hover:text-pearl"
        >
          {product.categoryName}
        </Link>{" "}
        / {product.name}
      </nav>

      <div className="mt-8 grid gap-12 lg:grid-cols-2">
        {/* GALERIA */}
        <div>
          <div className="overflow-hidden bg-card">
            <img
              src={product.images[image]}
              alt={product.name}
              width={1024}
              height={1280}
              className="aspect-[4/5] w-full object-cover"
            />
          </div>
          <div className="mt-3 flex gap-3">
            {product.images.map((src, index) => (
              <button
                key={src}
                type="button"
                onClick={() => setImage(index)}
                aria-label={`Ver imagem ${index + 1}`}
                className={cn(
                  "w-20 border transition-colors",
                  index === image ? "border-silver" : "border-border",
                )}
              >
                <img
                  src={src}
                  alt=""
                  width={1024}
                  height={1280}
                  loading="lazy"
                  className="aspect-[4/5] w-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* INFO */}
        <div>
          <p className="eyebrow">{product.categoryName}</p>
          <h1 className="font-display mt-3 text-4xl leading-tight sm:text-5xl">
            {product.name}
          </h1>

          <div className="mt-4 flex items-center gap-2">
            <span className="flex" aria-label={`Avaliação ${product.rating} de 5`}>
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={index}
                  className={cn(
                    "h-3.5 w-3.5",
                    index < Math.round(product.rating)
                      ? "fill-gold text-gold"
                      : "text-muted-foreground",
                  )}
                />
              ))}
            </span>
            <span className="text-xs text-muted-foreground">
              {product.rating} · {product.reviews} avaliações
            </span>
          </div>

          <div className="mt-8 flex flex-wrap items-baseline gap-3">
            {product.compareAt ? (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.compareAt)}
              </span>
            ) : null}
            <span className="font-display text-3xl">{formatPrice(product.price)}</span>
            {discount > 0 ? (
              <span className="bg-gold px-2 py-1 text-[0.6rem] tracking-[0.14em] text-primary-foreground uppercase">
                -{discount}%
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {installments(product.price)} · ou {formatPrice(product.price * 0.95)} no Pix
          </p>

          <p className="mt-8 text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </p>

          {/* COR */}
          <div className="mt-8">
            <p className="eyebrow">Cor</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {product.colors.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setColor(option)}
                  aria-pressed={color === option}
                  className={cn(
                    "border px-4 py-2 text-xs transition-colors",
                    color === option
                      ? "border-silver bg-secondary text-pearl"
                      : "border-border text-muted-foreground hover:text-pearl",
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* TAMANHO */}
          <div className="mt-6">
            <p className="eyebrow">Tamanho</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {product.sizes.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setSize(option)}
                  aria-pressed={size === option}
                  className={cn(
                    "min-w-12 border px-4 py-2 text-xs transition-colors",
                    size === option
                      ? "border-silver bg-secondary text-pearl"
                      : "border-border text-muted-foreground hover:text-pearl",
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* QUANTIDADE + AÇÕES */}
          <div className="mt-8 grid grid-cols-[auto_minmax(0,1fr)] gap-3">
            <div className="flex items-center border border-border">
              <button
                type="button"
                aria-label="Diminuir quantidade"
                className="h-12 w-10 hover:bg-secondary"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                −
              </button>
              <span className="w-8 text-center text-sm">{quantity}</span>
              <button
                type="button"
                aria-label="Aumentar quantidade"
                className="h-12 w-10 hover:bg-secondary"
                onClick={() => setQuantity((q) => q + 1)}
              >
                +
              </button>
            </div>
            <Button
              size="lg"
              className="h-12 tracking-[0.28em] uppercase"
              disabled={!product.inStock}
              asChild={product.inStock}
              onClick={product.inStock ? add : undefined}
            >
              {product.inStock ? (
                <Link to="/checkout" onClick={add}>
                  Comprar
                </Link>
              ) : (
                <span>Esgotado</span>
              )}
            </Button>
          </div>

          <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] gap-3">
            <Button
              variant="outline"
              size="lg"
              className="h-12 tracking-[0.24em] uppercase"
              disabled={!product.inStock}
              onClick={add}
            >
              Adicionar ao carrinho
            </Button>
            <Button
              variant="outline"
              size="lg"
              aria-label="Favoritar"
              className="h-12 w-12"
              onClick={() => {
                toggleFavorite(product.slug);
                toast(favorite ? "Removido dos favoritos" : "Adicionado aos favoritos");
              }}
            >
              <Heart className={cn("h-4 w-4", favorite && "fill-gold text-gold")} />
            </Button>
          </div>

          <ul className="mt-8 space-y-3 border-t border-border pt-6 text-sm text-muted-foreground">
            <li className="flex items-center gap-3">
              <Truck className="h-4 w-4 shrink-0 text-silver" /> Envio em até 2 dias úteis ·
              frete grátis acima de R$ 399
            </li>
            <li className="flex items-center gap-3">
              <ShieldCheck className="h-4 w-4 shrink-0 text-silver" /> Embalagem discreta,
              sem identificação do conteúdo
            </li>
            <li className="flex items-center gap-3">
              <RefreshCw className="h-4 w-4 shrink-0 text-silver" /> Troca em até 7 dias
              após o recebimento
            </li>
          </ul>

          <Accordion type="single" collapsible className="mt-8">
            <AccordionItem value="detalhes">
              <AccordionTrigger className="text-xs tracking-[0.2em] uppercase">
                {isJewelry ? "Material e acabamento" : "Composição e tecido"}
              </AccordionTrigger>
              <AccordionContent>
                <dl className="space-y-2 text-sm">
                  {product.details.map((detail) => (
                    <div key={detail.label} className="grid grid-cols-[130px_minmax(0,1fr)] gap-2">
                      <dt className="text-muted-foreground">{detail.label}</dt>
                      <dd>{detail.value}</dd>
                    </div>
                  ))}
                </dl>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="medidas">
              <AccordionTrigger className="text-xs tracking-[0.2em] uppercase">
                Tabela de medidas
              </AccordionTrigger>
              <AccordionContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tamanho</TableHead>
                      <TableHead>{isJewelry ? "Circunferência" : "Busto"}</TableHead>
                      <TableHead>{isJewelry ? "Comprimento" : "Cintura"}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(isJewelry
                      ? [
                          ["14", "4,7 cm", "45 cm"],
                          ["16", "5,1 cm", "45 cm"],
                          ["18", "5,5 cm", "50 cm"],
                          ["Único", "Ajustável", "45–50 cm"],
                        ]
                      : [
                          ["P", "82–86 cm", "62–66 cm"],
                          ["M", "87–91 cm", "67–71 cm"],
                          ["G", "92–97 cm", "72–77 cm"],
                          ["GG", "98–104 cm", "78–84 cm"],
                        ]
                    ).map((row) => (
                      <TableRow key={row[0]}>
                        <TableCell>{row[0]}</TableCell>
                        <TableCell>{row[1]}</TableCell>
                        <TableCell>{row[2]}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="cuidados">
              <AccordionTrigger className="text-xs tracking-[0.2em] uppercase">
                {isJewelry ? "Cuidados com a peça" : "Instruções de lavagem"}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                {product.care}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="trocas">
              <AccordionTrigger className="text-xs tracking-[0.2em] uppercase">
                Entrega e política de troca
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                Enviamos para todo o Brasil com rastreio. Trocas em até 7 dias corridos
                após o recebimento, com a peça sem uso e na embalagem original. Por
                questões de higiene, itens de sexy shop e calcinhas só são trocados se o
                lacre estiver intacto.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      <section className="mt-24">
        <h2 className="font-display text-3xl">Você também vai gostar</h2>
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
          {relatedProducts(product).map((item) => (
            <ProductCard key={item.slug} product={item} />
          ))}
        </div>
      </section>
    </div>
  );
}
