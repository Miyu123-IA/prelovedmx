import { listarProductos, marcasDisponibles, tallasDisponibles } from '@/lib/db';
import ProductCard from '@/components/ProductCard';
import FiltrosTienda from '@/components/FiltrosTienda';
import type { FiltrosProducto } from '@/lib/types';

export const metadata = { title: 'Tienda — PRELOVEDMX' };

interface Props {
  searchParams: Record<string, string | undefined>;
}

export default function TiendaPage({ searchParams }: Props) {
  const filtros: FiltrosProducto = {
    genero: (searchParams.genero as FiltrosProducto['genero']) || undefined,
    marca: searchParams.marca || undefined,
    talla: searchParams.talla || undefined,
    categoria: (searchParams.categoria as FiltrosProducto['categoria']) || undefined,
    precioMin: searchParams.precioMin ? Number(searchParams.precioMin) : undefined,
    precioMax: searchParams.precioMax ? Number(searchParams.precioMax) : undefined,
    estadoMin: searchParams.estadoMin ? Number(searchParams.estadoMin) : undefined,
    q: searchParams.q || undefined,
    orden: (searchParams.orden as FiltrosProducto['orden']) || 'recientes',
    estatus: undefined,
  };

  const productos = listarProductos(filtros).filter((p) => p.estatus !== 'vendido');
  const marcas = marcasDisponibles();
  const tallas = tallasDisponibles();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-display text-3xl text-tinta">Tienda</h1>
      <p className="mt-1 text-sm text-tierra">{productos.length} pieza(s) encontradas</p>

      <div className="mt-6 grid gap-6 md:grid-cols-[240px_1fr] md:gap-8">
        <FiltrosTienda marcas={marcas} tallas={tallas} valores={searchParams} />

        <div>
          {productos.length === 0 ? (
            <p className="rounded-card bg-crema-light p-8 text-center text-tierra shadow-card">
              No encontramos piezas con esos filtros. Intenta ampliar la búsqueda.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {productos.map((p) => (
                <ProductCard key={p.id} producto={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
