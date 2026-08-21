import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getProduct, type Product } from "@/lib/catalog";

export type CartItem = {
  slug: string;
  size: string;
  color: string;
  quantity: number;
};

type StoreContextValue = {
  items: CartItem[];
  favorites: string[];
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  addItem: (item: CartItem) => void;
  updateQuantity: (slug: string, size: string, quantity: number) => void;
  removeItem: (slug: string, size: string) => void;
  clearCart: () => void;
  toggleFavorite: (slug: string) => void;
  isFavorite: (slug: string) => boolean;
  count: number;
  subtotal: number;
  detailed: (CartItem & { product: Product })[];
};

const StoreContext = createContext<StoreContextValue | null>(null);
const CART_KEY = "mdp.cart";
const FAV_KEY = "mdp.favorites";

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(read<CartItem[]>(CART_KEY, []));
    setFavorites(read<string[]>(FAV_KEY, []));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  useEffect(() => {
    if (hydrated) localStorage.setItem(FAV_KEY, JSON.stringify(favorites));
  }, [favorites, hydrated]);

  const addItem = useCallback((item: CartItem) => {
    const product = getProduct(item.slug);
    if (!product) return;

    setItems((prev) => {
      const found = prev.find((i) => i.slug === item.slug && i.size === item.size);
      const currentQty = found ? found.quantity : 0;
      const newQty = currentQty + item.quantity;

      if (newQty > product.stock_quantity) {
        return prev; // Or we could cap it, but let's keep it simple for now
      }

      if (found) {
        return prev.map((i) =>
          i === found ? { ...i, quantity: newQty } : i,
        );
      }
      return [...prev, item];
    });
  }, []);

  const updateQuantity = useCallback((slug: string, size: string, quantity: number) => {
    const product = getProduct(slug);
    if (!product) return;

    setItems((prev) => {
      const targetQty = Math.min(quantity, product.stock_quantity);
      return targetQty <= 0
        ? prev.filter((i) => !(i.slug === slug && i.size === size))
        : prev.map((i) => (i.slug === slug && i.size === size ? { ...i, quantity: targetQty } : i));
    });
  }, []);

  const removeItem = useCallback((slug: string, size: string) => {
    setItems((prev) => prev.filter((i) => !(i.slug === slug && i.size === size)));
  }, []);

  const toggleFavorite = useCallback((slug: string) => {
    setFavorites((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  }, []);

  const value = useMemo<StoreContextValue>(() => {
    const detailed = items
      .map((i) => {
        const product = getProduct(i.slug);
        return product ? { ...i, product } : null;
      })
      .filter((i): i is CartItem & { product: Product } => i !== null);

    return {
      items,
      favorites,
      cartOpen,
      setCartOpen,
      addItem,
      updateQuantity,
      removeItem,
      clearCart: () => setItems([]),
      toggleFavorite,
      isFavorite: (slug: string) => favorites.includes(slug),
      count: items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal: detailed.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
      detailed,
    };
  }, [items, favorites, cartOpen, addItem, updateQuantity, removeItem, toggleFavorite]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
