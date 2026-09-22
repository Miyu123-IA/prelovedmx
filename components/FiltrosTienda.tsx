'use client';

import { useState } from 'react';
import clsx from 'clsx';
import { CATEGORIAS, GENEROS } from '@/lib/utils';

export default function FiltrosTienda({
  marcas,
  tallas,
  valores,
}: {
  marcas: string[];
  tallas: string[];
  valores: Record<string, string | undefined>;
}) {
  const [abierto, setAbierto] = useState(false);

  return (
    <div className="md:self-start">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        className="flex w-full items-center justify-between rounded-card bg-crema-light px-4 py-3 text-sm font-semibold text-tierra shadow-card md:hidden"
      >
        Filtros
        <svg
          viewBox="0 0 24 24"
          className={clsx('h-4 w-4 transition-transform', abierto && 'rotate-180')}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <form
        method="get"
        className={clsx(
          'mt-3 space-y-5 rounded-card bg-crema-light p-4 shadow-card md:mt-0 md:block md:sticky md:top-24',
          abierto ? 'block' : 'hidden'
        )}
      >
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-tierra">Buscar</label>
          <input
            type="text"
            name="q"
            defaultValue={valores.q}
            placeholder="marca, prenda, tag..."
            className="mt-1 w-full rounded-lg border border-tierra/20 bg-crema px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-tierra">Género</label>
          <select name="genero" defaultValue={valores.genero ?? ''} className="mt-1 w-full rounded-lg border border-tierra/20 bg-crema px-3 py-2 text-sm">
            <option value="">Todos</option>
            {Object.entries(GENEROS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-tierra">Categoría</label>
          <select name="categoria" defaultValue={valores.categoria ?? ''} className="mt-1 w-full rounded-lg border border-tierra/20 bg-crema px-3 py-2 text-sm">
            <option value="">Todas</option>
            {Object.entries(CATEGORIAS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-tierra">Marca</label>
          <select name="marca" defaultValue={valores.marca ?? ''} className="mt-1 w-full rounded-lg border border-tierra/20 bg-crema px-3 py-2 text-sm">
            <option value="">Todas</option>
            {marcas.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-tierra">Talla</label>
          <select name="talla" defaultValue={valores.talla ?? ''} className="mt-1 w-full rounded-lg border border-tierra/20 bg-crema px-3 py-2 text-sm">
            <option value="">Todas</option>
            {tallas.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-tierra">Precio min</label>
            <input type="number" name="precioMin" defaultValue={valores.precioMin} className="mt-1 w-full rounded-lg border border-tierra/20 bg-crema px-2 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-tierra">Precio max</label>
            <input type="number" name="precioMax" defaultValue={valores.precioMax} className="mt-1 w-full rounded-lg border border-tierra/20 bg-crema px-2 py-2 text-sm" />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-tierra">Estado mínimo</label>
          <select name="estadoMin" defaultValue={valores.estadoMin ?? ''} className="mt-1 w-full rounded-lg border border-tierra/20 bg-crema px-3 py-2 text-sm">
            <option value="">Cualquiera</option>
            {[10, 9, 8, 7, 6, 5].map((n) => (
              <option key={n} value={n}>{n}+ / 10</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-tierra">Ordenar por</label>
          <select name="orden" defaultValue={valores.orden ?? 'recientes'} className="mt-1 w-full rounded-lg border border-tierra/20 bg-crema px-3 py-2 text-sm">
            <option value="recientes">Recién llegados</option>
            <option value="precio_asc">Precio: menor a mayor</option>
            <option value="precio_desc">Precio: mayor a menor</option>
          </select>
        </div>

        <div className="flex gap-2">
          <button type="submit" className="flex-1 rounded-full bg-terracota px-4 py-2 text-sm font-semibold text-crema-light hover:bg-terracota-dark">
            Filtrar
          </button>
          <a href="/tienda" className="flex-1 rounded-full border border-tierra/20 px-4 py-2 text-center text-sm font-semibold text-tierra hover:bg-tierra/5">
            Limpiar
          </a>
        </div>
      </form>
    </div>
  );
}
