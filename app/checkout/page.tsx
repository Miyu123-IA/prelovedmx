'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useCart } from '@/lib/cart-context';
import { formatoMXN } from '@/lib/utils';

export default function CheckoutPage() {
  const { items, total, vaciar } = useCart();
  const router = useRouter();

  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [entrega, setEntrega] = useState<'recoger' | 'envio'>('recoger');
  const [direccion, setDireccion] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="font-display text-3xl text-tinta">No hay nada que apartar todavía</h1>
        <Link href="/tienda" className="mt-6 inline-block rounded-full bg-terracota px-6 py-3 text-sm font-semibold text-crema-light hover:bg-terracota-dark">
          Ir a la tienda
        </Link>
      </div>
    );
  }

  async function confirmar(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setError(null);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre,
          telefono,
          entrega,
          direccion: entrega === 'envio' ? direccion : undefined,
          items: items.map((i) => i.id),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'No pudimos procesar tu apartado. Intenta de nuevo.');
        setEnviando(false);
        return;
      }

      vaciar();
      window.location.href = data.whatsappUrl;
    } catch {
      setError('Hubo un problema de conexión. Intenta de nuevo.');
      setEnviando(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-display text-3xl text-tinta">Confirmar apartado</h1>
      <p className="mt-2 text-sm text-tierra">
        No procesamos pagos en línea todavía: al confirmar, apartamos tus prendas por ti y te
        pasamos a WhatsApp para acordar pago y entrega directo con la tienda.
      </p>

      <form onSubmit={confirmar} className="mt-6 space-y-4 rounded-card bg-crema-light p-5 shadow-card">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-tierra">Nombre completo</label>
          <input
            required
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="mt-1 w-full rounded-lg border border-tierra/20 bg-crema px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-tierra">Teléfono / WhatsApp</label>
          <input
            required
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            placeholder="669 000 0000"
            className="mt-1 w-full rounded-lg border border-tierra/20 bg-crema px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-tierra">Entrega</label>
          <div className="mt-1 flex gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input type="radio" checked={entrega === 'recoger'} onChange={() => setEntrega('recoger')} />
              Recoger en punto de entrega
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" checked={entrega === 'envio'} onChange={() => setEntrega('envio')} />
              Envío a domicilio
            </label>
          </div>
        </div>

        {entrega === 'envio' && (
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-tierra">Dirección</label>
            <textarea
              required
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              className="mt-1 w-full rounded-lg border border-tierra/20 bg-crema px-3 py-2 text-sm"
              rows={2}
            />
          </div>
        )}

        <div className="rounded-lg bg-crema-dark/50 p-3 text-sm">
          <p className="font-semibold text-tinta">{items.length} pieza(s) · Total {formatoMXN(total)}</p>
        </div>

        {error && <p className="text-sm text-terracota-dark">{error}</p>}

        <button
          type="submit"
          disabled={enviando}
          className="w-full rounded-full bg-terracota px-6 py-3 text-sm font-semibold text-crema-light hover:bg-terracota-dark disabled:opacity-60"
        >
          {enviando ? 'Procesando...' : 'Confirmar y continuar por WhatsApp'}
        </button>
      </form>
    </div>
  );
}
