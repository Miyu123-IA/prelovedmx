import Link from 'next/link';
import { linkWhatsApp, TIENDA } from '@/lib/utils';

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-tierra/10 bg-tierra text-crema-light">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-3">
        <div>
          <p className="font-display text-xl">{TIENDA.nombre}</p>
          <p className="mt-2 text-sm text-crema/70">
            Ropa vintage y pre-owned multimarca, curada a mano en {TIENDA.ciudad}. Segunda vida para piezas con historia.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-mostaza">Explora</p>
          <ul className="mt-2 space-y-1 text-sm text-crema/80">
            <li><Link href="/tienda" className="hover:text-crema-light">Tienda</Link></li>
            <li><Link href="/vende" className="hover:text-crema-light">Vende con nosotros</Link></li>
            <li><Link href="/nosotros" className="hover:text-crema-light">Nosotros</Link></li>
            <li><Link href="/contacto" className="hover:text-crema-light">Contacto</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-mostaza">Síguenos</p>
          <ul className="mt-2 space-y-1 text-sm text-crema/80">
            <li>
              <a href={linkWhatsApp(`Hola ${TIENDA.nombre}, quiero más información.`)} target="_blank" rel="noopener noreferrer" className="hover:text-crema-light">
                WhatsApp
              </a>
            </li>
            <li>
              <a href={`https://instagram.com/${TIENDA.instagram}`} target="_blank" rel="noopener noreferrer" className="hover:text-crema-light">
                @{TIENDA.instagram}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-crema-light/10 px-4 py-4 text-center text-xs text-crema/60">
        © {new Date().getFullYear()} {TIENDA.nombre} · {TIENDA.ciudad}
      </div>
    </footer>
  );
}
