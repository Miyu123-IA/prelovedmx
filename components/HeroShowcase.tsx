'use client';

import { useEffect, useState } from 'react';

const COLORES_RESPALDO = ['bg-olivo/30', 'bg-mostaza/30', 'bg-terracota/30', 'bg-crema-light/20'];
const ROTAR_CADA_MS = 4000;

export default function HeroShowcase({ fotos }: { fotos: string[] }) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (fotos.length <= 4) return; // nada que rotar si no sobran fotos
    const id = setInterval(() => setTick((t) => t + 1), ROTAR_CADA_MS);
    return () => clearInterval(id);
  }, [fotos.length]);

  return (
    <div className="grid grid-cols-2 gap-3">
      {[0, 1, 2, 3].map((i) => {
        const foto = fotos.length > 0 ? fotos[(tick + i) % fotos.length] : undefined;
        const desplazamiento = i === 1 ? 'mt-6' : i === 2 ? '-mt-6' : '';
        return (
          <div key={i} className={`relative aspect-square overflow-hidden rounded-card ${desplazamiento} ${foto ? '' : COLORES_RESPALDO[i]}`}>
            {foto && (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={foto} src={foto} alt="" className="h-full w-full animate-[fadein_0.6s_ease] object-cover" />
            )}
          </div>
        );
      })}
    </div>
  );
}
