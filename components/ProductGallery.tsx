'use client';

import { useState } from 'react';
import clsx from 'clsx';
import ProductPhoto from './ProductPhoto';
import Badge from './Badge';
import { tieneFotoReal } from '@/lib/utils';
import type { Categoria, Genero } from '@/lib/types';

export default function ProductGallery({
  fotos,
  categoria,
  genero,
  nombre,
}: {
  fotos: string[];
  categoria: Categoria;
  genero: Genero;
  nombre: string;
}) {
  const [activa, setActiva] = useState(0);
  const hayFotos = tieneFotoReal(fotos);

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-card">
        {hayFotos ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={fotos[activa]} alt={nombre} className="h-full w-full object-cover" />
        ) : (
          <ProductPhoto categoria={categoria} genero={genero} className="h-full w-full" />
        )}
        <div className="absolute right-3 top-3">
          <Badge tipo="unica">Pieza única</Badge>
        </div>
      </div>

      {hayFotos && fotos.length > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-2">
          {fotos.map((foto, i) => (
            <button
              key={foto}
              onClick={() => setActiva(i)}
              className={clsx(
                'aspect-square overflow-hidden rounded-lg border-2',
                i === activa ? 'border-terracota' : 'border-transparent'
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={foto} alt={`${nombre} foto ${i + 1}`} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
