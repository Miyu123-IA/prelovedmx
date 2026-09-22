'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useCart, type CartItem } from '@/lib/cart-context';

export default function AddToCartButton({ item }: { item: CartItem }) {
  const { items, agregar } = useCart();
  const router = useRouter();
  const [agregado, setAgregado] = useState(false);

  const yaEnCarrito = items.some((i) => i.id === item.id) || agregado;

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <button
        onClick={() => {
          agregar(item);
          setAgregado(true);
        }}
        disabled={yaEnCarrito}
        className="flex-1 rounded-full bg-terracota px-6 py-3 text-sm font-semibold text-crema-light transition hover:bg-terracota-dark disabled:cursor-not-allowed disabled:bg-tierra/30"
      >
        {yaEnCarrito ? 'Ya está en tu carrito' : 'Agregar al carrito'}
      </button>
      {yaEnCarrito && (
        <button
          onClick={() => router.push('/carrito')}
          className="flex-1 rounded-full border border-terracota px-6 py-3 text-sm font-semibold text-terracota hover:bg-terracota/10"
        >
          Ir al carrito
        </button>
      )}
    </div>
  );
}
