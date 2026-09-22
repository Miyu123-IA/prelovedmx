'use client';

import { useState } from 'react';
import { linkWhatsApp, TIENDA } from '@/lib/utils';

export default function VendePage() {
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [modalidad, setModalidad] = useState<'donacion' | 'consignacion' | 'no_seguro'>('consignacion');
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setError(null);
    try {
      const res = await fetch('/api/ofertas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, telefono, email, descripcion, modalidad, fotos: [] }),
      });
      if (!res.ok) throw new Error();
      setEnviado(true);
    } catch {
      setError('No pudimos enviar tu oferta. Intenta de nuevo o escríbenos por WhatsApp.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-display text-3xl text-tinta">Vende con nosotros</h1>
      <p className="mt-3 max-w-2xl text-tierra">
        Le damos segunda vida a tu ropa en buen estado. Así funciona:
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          { paso: '1. Nos cuentas qué tienes', texto: 'Llena el formulario o mándanos fotos por WhatsApp de las prendas que ya no usas.' },
          { paso: '2. Curamos y ponemos precio', texto: 'Revisamos estado, marca y le damos un precio justo para ti y para quien la compre.' },
          { paso: '3. Te pagamos tu %', texto: 'En consignación, cuando se vende te pagamos tu porcentaje acordado. En donación, tú decides que le demos vida nueva.' },
        ].map((p) => (
          <div key={p.paso} className="rounded-card bg-crema-light p-4 shadow-card">
            <p className="font-display text-lg text-terracota">{p.paso}</p>
            <p className="mt-1 text-sm text-tierra">{p.texto}</p>
          </div>
        ))}
      </div>

      <div className="mt-10">
        {enviado ? (
          <div className="rounded-card bg-olivo/10 p-6 text-center">
            <p className="font-display text-xl text-tinta">¡Gracias, {nombre}!</p>
            <p className="mt-2 text-tierra">
              Recibimos tu oferta. Te contactamos por WhatsApp al {telefono} en cuanto la revisemos.
            </p>
          </div>
        ) : (
          <form onSubmit={enviar} className="space-y-4 rounded-card bg-crema-light p-5 shadow-card">
            <h2 className="font-display text-xl text-tinta">Ofrécenos tu ropa</h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-tierra">Nombre</label>
                <input required value={nombre} onChange={(e) => setNombre(e.target.value)} className="mt-1 w-full rounded-lg border border-tierra/20 bg-crema px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-tierra">Teléfono / WhatsApp</label>
                <input required value={telefono} onChange={(e) => setTelefono(e.target.value)} className="mt-1 w-full rounded-lg border border-tierra/20 bg-crema px-3 py-2 text-sm" />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-tierra">Email (opcional)</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-lg border border-tierra/20 bg-crema px-3 py-2 text-sm" />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-tierra">¿Qué modalidad prefieres?</label>
              <select
                value={modalidad}
                onChange={(e) => setModalidad(e.target.value as typeof modalidad)}
                className="mt-1 w-full rounded-lg border border-tierra/20 bg-crema px-3 py-2 text-sm"
              >
                <option value="consignacion">Consignación (me pagan % al vender)</option>
                <option value="donacion">Donación</option>
                <option value="no_seguro">Todavía no sé, quiero que me asesoren</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-tierra">Cuéntanos qué prendas tienes</label>
              <textarea
                required
                rows={4}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Ej. 5 playeras de marca, 2 chamarras vintage, todo en buen estado..."
                className="mt-1 w-full rounded-lg border border-tierra/20 bg-crema px-3 py-2 text-sm"
              />
              <p className="mt-1 text-xs text-tierra-light">
                Por ahora manda las fotos directo por WhatsApp una vez que te contactemos.
              </p>
            </div>

            {error && <p className="text-sm text-terracota-dark">{error}</p>}

            <button
              type="submit"
              disabled={enviando}
              className="w-full rounded-full bg-olivo px-6 py-3 text-sm font-semibold text-crema-light hover:bg-olivo-dark disabled:opacity-60"
            >
              {enviando ? 'Enviando...' : 'Enviar oferta'}
            </button>

            <a
              href={linkWhatsApp(`Hola ${TIENDA.nombre}, quiero ofrecerles ropa para vender.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center text-xs text-tierra-light hover:text-terracota"
            >
              O escríbenos directo a WhatsApp si prefieres mandar fotos de una vez.
            </a>
          </form>
        )}
      </div>
    </div>
  );
}
