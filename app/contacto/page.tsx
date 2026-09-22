import { linkWhatsApp, TIENDA } from '@/lib/utils';

export const metadata = { title: `Contacto — ${TIENDA.nombre}` };

export default function ContactoPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-14 text-center">
      <h1 className="font-display text-4xl text-tinta">Contacto</h1>
      <p className="mt-3 text-tierra">Estamos en {TIENDA.ciudad}. Escríbenos, respondemos rápido.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <a
          href={linkWhatsApp(`Hola ${TIENDA.nombre}, tengo una pregunta.`)}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-card bg-crema-light p-6 shadow-card transition hover:-translate-y-0.5"
        >
          <p className="font-display text-xl text-tinta">WhatsApp</p>
          <p className="mt-1 text-sm text-tierra">Respuesta directa y rápida</p>
        </a>

        <a
          href={`https://instagram.com/${TIENDA.instagram}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-card bg-crema-light p-6 shadow-card transition hover:-translate-y-0.5"
        >
          <p className="font-display text-xl text-tinta">Instagram</p>
          <p className="mt-1 text-sm text-tierra">@{TIENDA.instagram}</p>
        </a>
      </div>
    </div>
  );
}
