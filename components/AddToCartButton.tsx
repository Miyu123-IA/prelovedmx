'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useCart, type CartItem } from '@/lib/cart-context';
import { formatoMXN } from '@/lib/utils';

function BotonCarrito({ item, yaEnCarrito, onAgregar }: { item: CartItem; yaEnCarrito: boolean; onAgregar: () => void }) {
  const router = useRouter();

  return (
    <div className="flex flex-1 gap-2">
      <button
        onClick={onAgregar}
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

export default function AddToCartButton({ item }: { item: CartItem }) {
  const { items, agregar } = useCart();
  const [agregado, setAgregado] = useState(false);

  const yaEnCarrito = items.some((i) => i.id === item.id) || agregado;
  const onAgregar = () => {
    agregar(item);
    setAgregado(true);
  };

  return (
    <>
      {/* Inline: visible en la ficha en desktop; en móvil queda debajo de la barra fija */}
      <div className="hidden sm:flex">
        <BotonCarrito item={item} yaEnCarrito={yaEnCarrito} onAgregar={onAgregar} />
      </div>

      {/* Barra fija solo en móvil, siempre alcanzable sin hacer scroll */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-tierra/10 bg-crema-light/95 px-4 py-3 shadow-[0_-2px_10px_rgba(43,37,32,0.1)] backdrop-blur sm:hidden">
        <span className="font-display text-lg text-terracota">{formatoMXN(item.precio_venta)}</span>
        <BotonCarrito item={item} yaEnCarrito={yaEnCarrito} onAgregar={onAgregar} />
      </div>

      {/* Espaciador para que la barra fija no tape el contenido en móvil */}
      <div className="h-20 sm:hidden" />
    </>
  );
}
