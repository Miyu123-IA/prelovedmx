import { TIENDA } from '@/lib/utils';

export const metadata = { title: `Nosotros — ${TIENDA.nombre}` };

export default function NosotrosPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="font-display text-4xl text-tinta">Nuestra historia</h1>
      <p className="mt-5 leading-relaxed text-tierra">
        {TIENDA.nombre} nació en {TIENDA.ciudad} con una idea simple: la ropa buena no debería
        acabar en la basura, y comprar bien no debería costar una fortuna. Buscamos, curamos y le
        damos una segunda oportunidad a piezas de marca y piezas vintage con carácter —
        multimarca, no un bazar de saldos.
      </p>
      <p className="mt-4 leading-relaxed text-tierra">
        Cada prenda que ves aquí pasó por nuestras manos: la revisamos, medimos, le pusimos un
        precio justo y, si tiene algún detalle, te lo decimos con honestidad. Trabajamos con
        consignación y donación, así que también le pagamos justo a quien nos confía su ropa.
      </p>
      <p className="mt-4 leading-relaxed text-tierra">
        Creemos en la moda circular: menos desperdicio textil, más historias que se siguen
        contando puestas. Si compras con nosotros, le estás dando a una prenda su segunda vida —
        y a alguien más, un ingreso justo por dejarla ir.
      </p>
    </div>
  );
}
