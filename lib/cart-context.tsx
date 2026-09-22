'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export interface CartItem {
  id: string;
  nombre: string;
  marca: string;
  talla: string;
  precio_venta: number;
  categoria: string;
  color: string;
}

interface CartContextValue {
  items: CartItem[];
  agregar: (item: CartItem) => void;
  quitar: (id: string) => void;
  vaciar: () => void;
  total: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);
const STORAGE_KEY = 'prelovedmx_carrito';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hidratado, setHidratado] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // localStorage no disponible; el carrito queda vacío para esta sesión.
    }
    setHidratado(true);
  }, []);

  useEffect(() => {
    if (!hidratado) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignorar si el almacenamiento está lleno o bloqueado.
    }
  }, [items, hidratado]);

  const agregar = (item: CartItem) => {
    setItems((prev) => (prev.some((i) => i.id === item.id) ? prev : [...prev, item]));
  };

  const quitar = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const vaciar = () => setItems([]);

  const total = useMemo(() => items.reduce((sum, i) => sum + i.precio_venta, 0), [items]);

  return (
    <CartContext.Provider value={{ items, agregar, quitar, vaciar, total }}>{children}</CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart debe usarse dentro de <CartProvider>');
  return ctx;
}
