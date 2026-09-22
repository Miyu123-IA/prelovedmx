import { CATEGORIAS } from '@/lib/utils';
import type { Categoria } from '@/lib/types';

/**
 * Marcador visual mientras no hay fotos reales cargadas por el bot.
 * Dibuja una silueta simple de la prenda sobre un fondo con el tono de la
 * pieza, para que el catálogo se vea vivo sin usar fotografías de stock.
 */

const ICONOS: Record<Categoria, string> = {
  playeras: 'M 35 25 L 45 15 L 55 20 L 65 15 L 75 25 L 70 35 L 65 32 L 65 85 L 35 85 L 35 32 L 30 35 Z',
  camisas:
    'M 34 24 L 45 14 L 50 20 L 55 14 L 66 24 L 71 34 L 63 38 L 63 86 L 37 86 L 37 38 L 29 34 Z M 50 20 L 47 30 L 50 40 L 53 30 Z',
  pantalones: 'M 36 15 L 64 15 L 66 85 L 54 85 L 50 45 L 46 85 L 34 85 Z',
  chamarras:
    'M 33 22 L 45 14 L 55 14 L 67 22 L 73 35 L 64 40 L 64 86 L 36 86 L 36 40 L 27 35 Z M 50 14 L 50 45',
  vestidos: 'M 42 15 L 58 15 L 62 32 L 74 85 L 26 85 L 38 32 Z',
  sudaderas:
    'M 50 12 C 40 12 34 20 34 27 L 22 33 L 30 44 L 36 39 L 36 86 L 64 86 L 64 39 L 70 44 L 78 33 L 66 27 C 66 20 60 12 50 12 Z',
  shorts: 'M 36 15 L 64 15 L 66 55 L 54 55 L 52 40 L 48 55 L 34 55 Z',
  faldas: 'M 38 18 L 62 18 L 76 82 L 24 82 Z',
  accesorios: 'M 38 30 L 62 30 L 66 82 L 34 82 Z M 42 30 C 42 20 58 20 58 30',
};

const TINTES: Record<string, string> = {
  hombre: 'from-tierra/15 to-olivo/20',
  mujer: 'from-terracota/15 to-mostaza/20',
  unisex: 'from-olivo/15 to-tierra/15',
};

export default function ProductPhoto({
  categoria,
  genero = 'unisex',
  className = '',
}: {
  categoria: Categoria;
  genero?: 'hombre' | 'mujer' | 'unisex';
  className?: string;
}) {
  const path = ICONOS[categoria] ?? ICONOS.playeras;
  const tinte = TINTES[genero] ?? TINTES.unisex;

  return (
    <div className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br ${tinte} bg-crema-dark ${className}`}>
      <svg viewBox="0 0 100 100" className="h-2/3 w-2/3 text-tierra/70">
        <path d={path} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      </svg>
      <span className="absolute bottom-2 left-2 rounded-full bg-crema/80 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-tierra">
        {CATEGORIAS[categoria]}
      </span>
    </div>
  );
}
