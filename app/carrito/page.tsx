'use client';

import Link from 'next/link';
import { useCart } from '@/lib/cart-context';
import { formatoMXN } from '@/lib/utils';

export default function CarritoPage() {
  const { items, quitar, total } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="font-display text-3xl text-tinta">Tu carrito está vacío</h1>
        <p className="mt-2 text-tierra">Cada prenda es única, así que cuando la ves disponible, es momento de apartarla.</p>
        <Link href="/tienda" className="mt-6 inline-block rounded-full bg-terracota px-6 py-3 text-sm font-semibold text-crema-light hover:bg-terracota-dark">
          Ir a la tienda
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-3xl text-tinta">Tu carrito</h1>

      <ul className="mt-6 divide-y divide-tierra/10 rounded-card bg-crema-light shadow-card">
        {items.map((item) => (
          <li key={item.id} className="flex items-center justify-between gap-4 p-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-tierra-light">{item.marca}</p>
              <p className="font-display text-lg text-tinta">{item.nombre}</p>
              <p className="text-sm text-tierra">Talla {item.talla}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-semibold text-terracota">{formatoMXN(item.precio_venta)}</span>
              <button onClick={() => quitar(item.id)} className="text-sm text-tierra-light hover:text-terracota" aria-label="Quitar">
                Quitar
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-center justify-between rounded-card bg-crema-dark/50 p-4">
        <span className="font-display text-xl text-tinta">Total</span>
        <span className="font-display text-xl text-terracota">{formatoMXN(total)}</span>
      </div>

      <Link
        href="/checkout"
        className="mt-6 block rounded-full bg-terracota px-6 py-3 text-center text-sm font-semibold text-crema-light hover:bg-terracota-dark"
      >
        Continuar con el apartado
      </Link>
    </div>
  );
}
