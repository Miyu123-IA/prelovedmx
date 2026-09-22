'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/lib/cart-context';
import { TIENDA } from '@/lib/utils';

const LINKS = [
  { href: '/tienda', label: 'Tienda' },
  { href: '/vende', label: 'Vende con nosotros' },
  { href: '/nosotros', label: 'Nosotros' },
  { href: '/contacto', label: 'Contacto' },
];

export default function Header() {
  const { items } = useCart();
  const [abierto, setAbierto] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-tierra/10 bg-crema-light/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="font-display text-2xl tracking-tight text-tinta">
          {TIENDA.nombre}
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm font-medium text-tierra hover:text-terracota">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/carrito" className="relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-tierra/10" aria-label="Carrito">
            <svg viewBox="0 0 24 24" className="h-6 w-6 text-tinta" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 6h15l-1.5 9h-12L6 3H3" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="9" cy="20" r="1.3" fill="currentColor" />
              <circle cx="18" cy="20" r="1.3" fill="currentColor" />
            </svg>
            {items.length > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-terracota text-[11px] font-bold text-crema-light">
                {items.length}
              </span>
            )}
          </Link>

          <button
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-tierra/10 md:hidden"
            onClick={() => setAbierto((v) => !v)}
            aria-label="Abrir menú"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6 text-tinta" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {abierto && (
        <nav className="flex flex-col gap-1 border-t border-tierra/10 px-4 py-3 md:hidden">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-lg px-2 py-2 text-sm font-medium text-tierra hover:bg-tierra/10"
              onClick={() => setAbierto(false)}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
