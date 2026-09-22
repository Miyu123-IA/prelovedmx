export const TIENDA = {
  nombre: 'PRELOVEDMX',
  ciudad: 'Mazatlán, México',
  whatsapp: '5216690000000',
  instagram: 'prelovedmx',
};

export function formatoMXN(valor: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(valor);
}

export function linkWhatsApp(mensaje: string, numero: string = TIENDA.whatsapp): string {
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
}

/** "placeholder" es el valor que usan los 8 productos de ejemplo iniciales. */
export function tieneFotoReal(fotos: string[]): boolean {
  return fotos.length > 0 && fotos[0] !== 'placeholder';
}

export const CATEGORIAS: Record<string, string> = {
  playeras: 'Playeras',
  camisas: 'Camisas',
  blusas: 'Blusas',
  pantalones: 'Pantalones',
  chamarras: 'Chamarras',
  vestidos: 'Vestidos',
  sudaderas: 'Sudaderas',
  shorts: 'Shorts',
  faldas: 'Faldas',
  accesorios: 'Accesorios',
};

export const GENEROS: Record<string, string> = {
  hombre: 'Hombre',
  mujer: 'Mujer',
  unisex: 'Unisex',
};

export const ESTATUS_LABEL: Record<string, string> = {
  disponible: 'Disponible',
  apartado: 'Apartado',
  vendido: 'Vendido',
};
