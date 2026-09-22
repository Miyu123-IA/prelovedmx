import { notFound } from 'next/navigation';
import { obtenerProducto } from '@/lib/db';
import ProductPhoto from '@/components/ProductPhoto';
import Badge from '@/components/Badge';
import AddToCartButton from '@/components/AddToCartButton';
import { CATEGORIAS, ESTATUS_LABEL, GENEROS, formatoMXN } from '@/lib/utils';

interface Props {
  params: { id: string };
}

export default async function ProductoPage({ params }: Props) {
  const producto = await obtenerProducto(params.id);
  if (!producto) notFound();

  const medidasLegibles = Object.entries(producto.medidas)
    .filter(([k]) => k !== 'nota')
    .map(([k, v]) => `${k.replace('_cm', '').replace('_', ' ')}: ${v} cm`);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-card">
          <ProductPhoto categoria={producto.categoria} genero={producto.genero} className="h-full w-full" />
          <div className="absolute right-3 top-3">
            <Badge tipo="unica">Pieza única</Badge>
          </div>
        </div>

        <div>
          <p className="text-sm uppercase tracking-wide text-tierra-light">{producto.marca}</p>
          <h1 className="mt-1 font-display text-3xl text-tinta">{producto.nombre}</h1>

          <div className="mt-3 flex flex-wrap gap-2">
            <Badge tipo={producto.estatus}>{ESTATUS_LABEL[producto.estatus]}</Badge>
            <Badge tipo="unica">{GENEROS[producto.genero]}</Badge>
            <Badge tipo="unica">{CATEGORIAS[producto.categoria]}</Badge>
          </div>

          <p className="mt-5 text-3xl font-semibold text-terracota">{formatoMXN(producto.precio_venta)}</p>

          <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-tierra-light">Talla</dt>
              <dd className="font-medium text-tinta">{producto.talla}</dd>
            </div>
            <div>
              <dt className="text-tierra-light">Color</dt>
              <dd className="font-medium text-tinta">{producto.color}</dd>
            </div>
            <div>
              <dt className="text-tierra-light">Material</dt>
              <dd className="font-medium text-tinta">{producto.material}</dd>
            </div>
            <div>
              <dt className="text-tierra-light">Estado</dt>
              <dd className="font-medium text-tinta">{producto.estado.puntuacion}/10</dd>
            </div>
          </dl>

          {medidasLegibles.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-semibold text-tinta">Medidas</p>
              <p className="text-sm text-tierra">{medidasLegibles.join(' · ')}</p>
            </div>
          )}

          {producto.estado.nota && (
            <div className="mt-4 rounded-lg bg-mostaza/10 p-3 text-sm text-tierra-dark">
              <span className="font-semibold">Nota honesta sobre el estado: </span>
              {producto.estado.nota}
            </div>
          )}

          <div className="mt-8">
            {producto.estatus === 'disponible' ? (
              <AddToCartButton
                item={{
                  id: producto.id,
                  nombre: producto.nombre,
                  marca: producto.marca,
                  talla: producto.talla,
                  precio_venta: producto.precio_venta,
                  categoria: producto.categoria,
                  color: producto.color,
                }}
              />
            ) : (
              <p className="rounded-full bg-tierra/10 px-6 py-3 text-center text-sm font-semibold text-tierra">
                Esta pieza ya no está disponible.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
