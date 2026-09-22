import Link from 'next/link';
import type { Producto } from '@/lib/types';
import { ESTATUS_LABEL, formatoMXN } from '@/lib/utils';
import ProductPhoto from './ProductPhoto';
import Badge from './Badge';

export default function ProductCard({ producto }: { producto: Producto }) {
  const noDisponible = producto.estatus !== 'disponible';

  return (
    <Link
      href={`/tienda/${producto.id}`}
      className="group block overflow-hidden rounded-card bg-crema-light shadow-card transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative aspect-[4/5]">
        <ProductPhoto categoria={producto.categoria} genero={producto.genero} className="h-full w-full" />
        {noDisponible && (
          <div className="absolute inset-0 flex items-center justify-center bg-tinta/40">
            <Badge tipo={producto.estatus}>{ESTATUS_LABEL[producto.estatus]}</Badge>
          </div>
        )}
        <div className="absolute right-2 top-2">
          <Badge tipo="unica">Pieza única</Badge>
        </div>
      </div>
      <div className="p-4">
        <p className="text-xs uppercase tracking-wide text-tierra-light">{producto.marca}</p>
        <h3 className="font-display text-lg leading-tight text-tinta group-hover:text-terracota">
          {producto.nombre}
        </h3>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm text-tierra">Talla {producto.talla}</span>
          <span className="font-semibold text-terracota">{formatoMXN(producto.precio_venta)}</span>
        </div>
      </div>
    </Link>
  );
}
