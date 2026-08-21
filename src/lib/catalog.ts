import lingerie from "@/assets/cat-lingerie.jpg";
import lingerie2 from "@/assets/prod-lingerie2.jpg";
import sexyshop from "@/assets/cat-sexyshop.jpg";
import cama from "@/assets/cat-cama.jpg";
import robe from "@/assets/prod-robe.jpg";
import semijoias from "@/assets/cat-semijoias.jpg";
import joia from "@/assets/prod-joia.jpg";

export type CategorySlug =
  | "lingerie"
  | "sexy-shop"
  | "moda-intima"
  | "cama-banho"
  | "semijoias"
  | "novidades"
  | "ofertas";

export type Category = {
  slug: CategorySlug;
  name: string;
  tagline: string;
  description: string;
  image: string;
};

export const categories: Category[] = [
  {
    slug: "lingerie",
    name: "Lingerie",
    tagline: "Renda, seda e segundos olhares",
    description:
      "Sutiãs, calcinhas, conjuntos, bodys, camisolas e peças sensuais para quem escolhe como quer se sentir.",
    image: lingerie,
  },
  {
    slug: "sexy-shop",
    name: "Sexy Shop",
    tagline: "Intimidade com discrição",
    description:
      "Uma curadoria elegante de produtos para prazer e intimidade, com embalagem discreta em todos os pedidos.",
    image: sexyshop,
  },
  {
    slug: "moda-intima",
    name: "Moda Íntima",
    tagline: "Conforto que não abre mão do brilho",
    description:
      "Básicos refinados, modeladores e peças do dia a dia com toque suave e caimento impecável.",
    image: lingerie2,
  },
  {
    slug: "cama-banho",
    name: "Cama & Banho",
    tagline: "O quarto como cenário",
    description:
      "Roupas de cama, tecidos acetinados, pijamas, robes e itens para transformar a sua noite.",
    image: cama,
  },
  {
    slug: "semijoias",
    name: "Semijoias",
    tagline: "Prata, ouro e maresia",
    description:
      "Brincos, colares, anéis, pulseiras e conjuntos em banho de prata e ouro 18k.",
    image: semijoias,
  },
];

export type Product = {
  slug: string;
  name: string;
  category: CategorySlug;
  categoryName: string;
  price: number;
  compareAt?: number | undefined;
  images: string[];
  badge?: "novidade" | "oferta" | "mais-vendido" | undefined;
  rating: number;
  reviews: number;
  colors: string[];
  sizes: string[];
  material: string;
  inStock: boolean;
  bestseller?: boolean | undefined;
  createdAt: string;
  description: string;
  details: { label: string; value: string }[];
  care: string;
  stock_quantity: number;
};

export function applyCatalog(newProducts: Product[], newCategories: Category[]) {
  products.length = 0;
  products.push(...newProducts);
  categories.length = 0;
  categories.push(...newCategories);
}

const lingerieSizes = ["P", "M", "G", "GG"];
const joiaSizes = ["14", "16", "18", "Único"];

export const products: Product[] = [
  {
    slug: "conjunto-mare-noturna",
    name: "Conjunto Maré Noturna",
    category: "lingerie",
    categoryName: "Lingerie",
    price: 289.9,
    compareAt: 349.9,
    images: [lingerie, lingerie2],
    badge: "oferta",
    rating: 4.9,
    reviews: 128,
    colors: ["Preto", "Pérola"],
    sizes: lingerieSizes,
    material: "Renda francesa",
    inStock: true,
    bestseller: true,
    createdAt: "2026-07-02",
    description:
      "Renda francesa aplicada sobre tule leve, com detalhes metálicos em prata envelhecida. Um conjunto para as noites em que você quer se sentir maré alta.",
    details: [
      { label: "Tecido", value: "Renda francesa com tule de seda" },
      { label: "Composição", value: "82% poliamida, 18% elastano" },
      { label: "Tamanhos", value: "P ao GG" },
      { label: "Detalhes", value: "Aro leve, alças reguláveis, fecho metálico prata" },
    ],
    care: "Lavar à mão em água fria com sabão neutro. Não torcer, secar à sombra.",
    stock_quantity: 10,
  },
  {
    slug: "body-luar-de-renda",
    name: "Body Luar de Renda",
    category: "lingerie",
    categoryName: "Lingerie",
    price: 349.9,
    images: [lingerie2, lingerie],
    badge: "novidade",
    rating: 4.8,
    reviews: 64,
    colors: ["Pérola", "Preto"],
    sizes: lingerieSizes,
    material: "Renda bordada",
    inStock: true,
    createdAt: "2026-08-08",
    description:
      "Body de renda bordada com pequenas pérolas costuradas à mão. Transparência calculada, presença absoluta.",
    details: [
      { label: "Tecido", value: "Renda bordada com pérolas" },
      { label: "Composição", value: "90% poliamida, 10% elastano" },
      { label: "Tamanhos", value: "P ao GG" },
      { label: "Detalhes", value: "Bordado manual, forro discreto" },
    ],
    care: "Lavagem delicada à mão. Não usar alvejante nem secadora.",
    stock_quantity: 10,
  },
  {
    slug: "camisola-seda-da-lua",
    name: "Camisola Seda da Lua",
    category: "moda-intima",
    categoryName: "Moda Íntima",
    price: 259.9,
    compareAt: 299.9,
    images: [robe, cama],
    badge: "mais-vendido",
    rating: 4.9,
    reviews: 212,
    colors: ["Pérola", "Marinho"],
    sizes: lingerieSizes,
    material: "Cetim de seda",
    inStock: true,
    bestseller: true,
    createdAt: "2026-06-14",
    description:
      "Cetim fluido que desliza como água. Camisola de alças finas com acabamento em viés acetinado.",
    details: [
      { label: "Tecido", value: "Cetim de seda toque frio" },
      { label: "Composição", value: "95% poliéster, 5% elastano" },
      { label: "Tamanhos", value: "P ao GG" },
      { label: "Detalhes", value: "Alças reguláveis, fenda lateral discreta" },
    ],
    care: "Lavar à mão ou ciclo delicado a 30°C. Passar em temperatura baixa.",
    stock_quantity: 10,
  },
  {
    slug: "robe-mare-alta",
    name: "Robe Maré Alta",
    category: "cama-banho",
    categoryName: "Cama & Banho",
    price: 379.9,
    images: [robe, cama],
    rating: 4.7,
    reviews: 88,
    colors: ["Pérola", "Marinho"],
    sizes: lingerieSizes,
    material: "Cetim",
    inStock: true,
    createdAt: "2026-05-20",
    description:
      "Robe longo de cetim com faixa para amarrar na cintura. O gesto final de qualquer ritual noturno.",
    details: [
      { label: "Tecido", value: "Cetim premium" },
      { label: "Composição", value: "100% poliéster" },
      { label: "Tamanhos", value: "P ao GG" },
      { label: "Detalhes", value: "Manga ampla, faixa removível" },
    ],
    care: "Ciclo delicado a 30°C. Não usar secadora.",
    stock_quantity: 10,
  },
  {
    slug: "jogo-de-cama-pearl-tide",
    name: "Jogo de Cama Pearl Tide",
    category: "cama-banho",
    categoryName: "Cama & Banho",
    price: 649.9,
    compareAt: 799.9,
    images: [cama, robe],
    badge: "oferta",
    rating: 4.8,
    reviews: 51,
    colors: ["Pérola", "Marinho"],
    sizes: ["Casal", "Queen", "King"],
    material: "Cetim 400 fios",
    inStock: true,
    createdAt: "2026-04-11",
    description:
      "Jogo de cama acetinado de 400 fios com brilho suave e toque fresco. Quatro peças que mudam a temperatura do quarto.",
    details: [
      { label: "Tecido", value: "Cetim 400 fios" },
      { label: "Composição", value: "100% microfibra acetinada" },
      { label: "Peças", value: "1 lençol com elástico, 1 lençol de cima, 2 fronhas" },
      { label: "Tamanhos", value: "Casal, Queen e King" },
    ],
    care: "Lavar a 30°C com peças de cor semelhante. Passar do lado avesso.",
    stock_quantity: 10,
  },
  {
    slug: "colar-pearl-tide-prata",
    name: "Colar Pearl Tide Prata 925",
    category: "semijoias",
    categoryName: "Semijoias",
    price: 219.9,
    images: [joia, semijoias],
    badge: "novidade",
    rating: 5,
    reviews: 76,
    colors: ["Prata"],
    sizes: joiaSizes,
    material: "Prata 925",
    inStock: true,
    bestseller: true,
    createdAt: "2026-08-12",
    description:
      "Corrente delicada em prata 925 com pêndulo de pérola natural abraçada por uma lua minimalista.",
    details: [
      { label: "Material", value: "Prata 925" },
      { label: "Banho", value: "Ródio branco" },
      { label: "Acabamento", value: "Polimento espelhado" },
      { label: "Tamanho", value: "Corrente 45cm com extensor de 3cm" },
    ],
    care: "Evite contato com perfume, cloro e produtos de limpeza. Guarde em saquinho antioxidante.",
    stock_quantity: 10,
  },
  {
    slug: "brincos-maresia-ouro",
    name: "Brincos Maresia Ouro 18k",
    category: "semijoias",
    categoryName: "Semijoias",
    price: 189.9,
    compareAt: 239.9,
    images: [semijoias, joia],
    badge: "oferta",
    rating: 4.9,
    reviews: 143,
    colors: ["Dourado"],
    sizes: ["Único"],
    material: "Banho de ouro 18k",
    inStock: true,
    createdAt: "2026-07-25",
    description:
      "Brincos com pérola de água doce em base folheada a ouro 18k. Movimento de onda em escala de joia.",
    details: [
      { label: "Material", value: "Latão nobre com pérola de água doce" },
      { label: "Banho", value: "Ouro 18k, 5 camadas" },
      { label: "Acabamento", value: "Brilho acetinado" },
      { label: "Tamanho", value: "2,2cm de comprimento" },
    ],
    care: "Retire antes de dormir e de tomar banho. Limpe com flanela seca.",
    stock_quantity: 10,
  },
  {
    slug: "kit-toque-de-seda",
    name: "Kit Toque de Seda",
    category: "sexy-shop",
    categoryName: "Sexy Shop",
    price: 199.9,
    images: [sexyshop, lingerie],
    badge: "mais-vendido",
    rating: 4.8,
    reviews: 97,
    colors: ["Preto"],
    sizes: ["Único"],
    material: "Cetim e veludo",
    inStock: true,
    bestseller: true,
    createdAt: "2026-06-30",
    description:
      "Kit sensorial com faixa de cetim, pluma e óleo de massagem de aroma amadeirado. Enviado sempre em embalagem discreta.",
    details: [
      { label: "Conteúdo", value: "Faixa de cetim, pluma e óleo de massagem 100ml" },
      { label: "Material", value: "Cetim, veludo e óleos vegetais" },
      { label: "Privacidade", value: "Embalagem neutra, sem identificação do conteúdo" },
      { label: "Validade", value: "24 meses (óleo)" },
    ],
    care: "Mantenha em local seco e ao abrigo da luz. Uso externo.",
    stock_quantity: 10,
  },
  {
    slug: "oleo-de-banho-noite-de-mare",
    name: "Óleo de Banho Noite de Maré",
    category: "sexy-shop",
    categoryName: "Sexy Shop",
    price: 129.9,
    images: [sexyshop, cama],
    rating: 4.6,
    reviews: 42,
    colors: ["Neutro"],
    sizes: ["120ml"],
    material: "Óleos vegetais",
    inStock: false,
    createdAt: "2026-03-18",
    description:
      "Óleo corporal de absorção rápida com brilho perolado discreto e aroma de sal, âmbar e flor branca.",
    details: [
      { label: "Conteúdo", value: "120ml" },
      { label: "Composição", value: "Óleo de amêndoas, jojoba e vitamina E" },
      { label: "Privacidade", value: "Embalagem neutra" },
      { label: "Validade", value: "24 meses" },
    ],
    care: "Uso externo. Realize teste de sensibilidade antes do primeiro uso.",
    stock_quantity: 10,
  },
  {
    slug: "conjunto-pulseira-e-anel-onda",
    name: "Conjunto Pulseira e Anel Onda",
    category: "semijoias",
    categoryName: "Semijoias",
    price: 279.9,
    images: [joia, semijoias],
    rating: 4.9,
    reviews: 33,
    colors: ["Prata", "Dourado"],
    sizes: joiaSizes,
    material: "Prata 925",
    inStock: true,
    createdAt: "2026-08-01",
    description:
      "Dupla em prata 925 com desenho de onda contínua e pérola central. Para usar junto ou separado.",
    details: [
      { label: "Material", value: "Prata 925" },
      { label: "Banho", value: "Ródio branco ou ouro 18k" },
      { label: "Acabamento", value: "Polido com detalhe fosco" },
      { label: "Tamanho", value: "Anel 14 ao 20, pulseira ajustável" },
    ],
    care: "Guarde separadamente para evitar riscos. Limpe com flanela.",
    stock_quantity: 10,
  },
  {
    slug: "calcinha-brisa-de-renda",
    name: "Calcinha Brisa de Renda",
    category: "moda-intima",
    categoryName: "Moda Íntima",
    price: 79.9,
    images: [lingerie2, lingerie],
    rating: 4.7,
    reviews: 189,
    colors: ["Pérola", "Preto", "Marinho"],
    sizes: lingerieSizes,
    material: "Microfibra",
    inStock: true,
    createdAt: "2026-02-09",
    description:
      "Cintura média em microfibra com laterais de renda e acabamento sem costura aparente.",
    details: [
      { label: "Tecido", value: "Microfibra com renda" },
      { label: "Composição", value: "88% poliamida, 12% elastano" },
      { label: "Tamanhos", value: "P ao GG" },
      { label: "Detalhes", value: "Forro em algodão" },
    ],
    care: "Lavar à mão em água fria. Não usar alvejante.",
    stock_quantity: 10,
  },
  {
    slug: "pijama-cetim-maresia",
    name: "Pijama Cetim Maresia",
    category: "cama-banho",
    categoryName: "Cama & Banho",
    price: 299.9,
    compareAt: 359.9,
    images: [robe, lingerie2],
    badge: "oferta",
    rating: 4.8,
    reviews: 74,
    colors: ["Pérola", "Marinho"],
    sizes: lingerieSizes,
    material: "Cetim",
    inStock: true,
    createdAt: "2026-05-02",
    description:
      "Camisa de botões e calça de cetim com vivo contrastante em tom prata. Elegância para ficar em casa.",
    details: [
      { label: "Tecido", value: "Cetim toque frio" },
      { label: "Composição", value: "97% poliéster, 3% elastano" },
      { label: "Tamanhos", value: "P ao GG" },
      { label: "Detalhes", value: "Vivo prata, bolso frontal" },
    ],
    care: "Ciclo delicado a 30°C. Passar em temperatura baixa.",
    stock_quantity: 10,
  },
];

export const allSizes = Array.from(new Set(products.flatMap((p) => p.sizes)));
export const allColors = Array.from(new Set(products.flatMap((p) => p.colors)));
export const allMaterials = Array.from(new Set(products.map((p) => p.material)));

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function getCategory(slug: string) {
  return categories.find((c) => c.slug === slug);
}

export function productsByCategory(slug: string) {
  if (slug === "novidades") {
    return [...products].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  if (slug === "ofertas") {
    return products.filter((p) => p.compareAt);
  }
  return products.filter((p) => p.category === slug);
}

export function relatedProducts(product: Product) {
  return products
    .filter((p) => p.slug !== product.slug && p.category === product.category)
    .concat(products.filter((p) => p.category !== product.category))
    .slice(0, 4);
}

export function formatPrice(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function installments(value: number, times = 6) {
  return `${times}x de ${formatPrice(value / times)} sem juros`;
}

export const WHATSAPP_NUMBER = "5512991139998";
export const WHATSAPP_MESSAGE =
  "Olá! Gostaria de saber mais sobre um produto da Maré de Prata.";
export const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
