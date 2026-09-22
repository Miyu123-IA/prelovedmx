import Link from 'next/link';
import { listarProductos, marcasDisponibles } from '@/lib/db';
import ProductCard from '@/components/ProductCard';
import HeroShowcase from '@/components/HeroShowcase';
import { TIENDA, tieneFotoReal } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const disponibles = await listarProductos({ estatus: 'disponible', orden: 'recientes' });
  const recientes = disponibles.slice(0, 4);
  const marcas = await marcasDisponibles();
  const fotosDestacadas = disponibles
    .filter((p) => tieneFotoReal(p.fotos))
    .flatMap((p) => p.fotos)
    .slice(0, 8);

  return (
    <div>
      <section className="relative overflow-hidden bg-tierra text-crema-light">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
          <div>
            <span className="inline-block rounded-full bg-terracota/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
              Curado a mano en {TIENDA.ciudad}
            </span>
            <h1 className="mt-4 font-display text-4xl leading-tight md:text-5xl">
              Dale segunda vida a la moda.
            </h1>
            <p className="mt-4 max-w-md text-crema/80">
              Piezas vintage y pre-owned multimarca, seleccionadas una por una. Nada de bazar de saldos:
              cada prenda que encuentras aquí tiene su propia historia y su segunda oportunidad.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/tienda" className="rounded-full bg-terracota px-6 py-3 text-sm font-semibold text-crema-light hover:bg-terracota-dark">
                Explorar la tienda
              </Link>
              <Link href="/vende" className="rounded-full border border-crema-light/40 px-6 py-3 text-sm font-semibold hover:bg-crema-light/10">
                Vende tu ropa
              </Link>
            </div>
          </div>
          <div className="hidden md:block">
            <HeroShowcase fotos={fotosDestacadas} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-3xl text-tinta">Recién llegados</h2>
          <Link href="/tienda" className="text-sm font-semibold text-terracota hover:underline">
            Ver todo →
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {recientes.map((p) => (
            <ProductCard key={p.id} producto={p} />
          ))}
        </div>
      </section>

      <section className="border-y border-tierra/10 bg-crema-dark/60 py-10">
        <div className="mx-auto max-w-6xl px-4">
          <p className="text-center text-sm font-semibold uppercase tracking-widest text-tierra">
            Marcas que manejamos
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-x-8 gap-y-3">
            {marcas.map((m) => (
              <span key={m} className="font-display text-lg text-tierra-light">
                {m}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 text-center">
        <h2 className="font-display text-3xl text-tinta">¿Tienes ropa en buen estado que ya no usas?</h2>
        <p className="mx-auto mt-3 max-w-xl text-tierra">
          Te la compramos en consignación o la recibimos en donación. Precio justo para ti,
          segunda vida para tu ropa.
        </p>
        <Link href="/vende" className="mt-6 inline-block rounded-full bg-olivo px-6 py-3 text-sm font-semibold text-crema-light hover:bg-olivo-dark">
          Vende con nosotros
        </Link>
      </section>
    </div>
  );
}
