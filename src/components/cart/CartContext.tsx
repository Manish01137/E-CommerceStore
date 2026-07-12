"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  scent: string;
  price: number;
  image: string;
  quantity: number;
  stock: number;
}

interface CartState {
  items: CartItem[];
  hydrated: boolean;
  drawerOpen: boolean;
  bumpKey: number;
  count: number;
  subtotal: number;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  updateQuantity: (productId: string, scent: string, quantity: number) => void;
  removeItem: (productId: string, scent: string) => void;
  clearCart: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
}

const CartContext = createContext<CartState | null>(null);

const STORAGE_KEY = "tb-cart-v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [bumpKey, setBumpKey] = useState(0);
  const skipPersist = useRef(true);

  useEffect(() => {
    // localStorage is only readable post-mount; a one-time synchronous
    // hydration here is intentional (SSR renders an empty cart).
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setItems(JSON.parse(raw));
    } catch {
      /* corrupted cart — start fresh */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (skipPersist.current) {
      skipPersist.current = false;
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((item: Omit<CartItem, "quantity">, quantity = 1) => {
    setItems((prev) => {
      const idx = prev.findIndex(
        (i) => i.productId === item.productId && i.scent === item.scent
      );
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = {
          ...next[idx],
          quantity: Math.min(next[idx].quantity + quantity, item.stock),
        };
        return next;
      }
      return [...prev, { ...item, quantity: Math.min(quantity, item.stock) }];
    });
    setBumpKey((k) => k + 1);
  }, []);

  const updateQuantity = useCallback((productId: string, scent: string, quantity: number) => {
    setItems((prev) =>
      prev
        .map((i) =>
          i.productId === productId && i.scent === scent
            ? { ...i, quantity: Math.max(1, Math.min(quantity, i.stock)) }
            : i
        )
        .filter((i) => i.quantity > 0)
    );
  }, []);

  const removeItem = useCallback((productId: string, scent: string) => {
    setItems((prev) => prev.filter((i) => !(i.productId === productId && i.scent === scent)));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);
  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const value = useMemo<CartState>(() => {
    const count = items.reduce((sum, i) => sum + i.quantity, 0);
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    return {
      items,
      hydrated,
      drawerOpen,
      bumpKey,
      count,
      subtotal,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      openDrawer,
      closeDrawer,
    };
  }, [items, hydrated, drawerOpen, bumpKey, addItem, updateQuantity, removeItem, clearCart, openDrawer, closeDrawer]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartState {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
