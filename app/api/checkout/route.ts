import { NextRequest, NextResponse } from 'next/server';
import { actualizarEstatusProducto, obtenerProducto } from '@/lib/db';
import { checkoutSchema } from '@/lib/validation';
import { formatoMXN, linkWhatsApp, TIENDA } from '@/lib/utils';

/**
 * No hay pasarela de pago conectada (requeriría credenciales propias del
 * negocio en Stripe/Conekta/Mercado Pago). Este endpoint reserva las prendas
 * (estatus -> "apartado", ya que el stock de cada pieza es único) y genera un
 * link de WhatsApp para confirmar pago y entrega directamente con la tienda.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos', detalles: parsed.error.flatten() }, { status: 400 });
  }

  const { nombre, telefono, entrega, direccion, items } = parsed.data;

  try {
    const productos = (await Promise.all(items.map((id) => obtenerProducto(id)))).filter((p) => p !== undefined);
    const noDisponibles = productos.filter((p) => p!.estatus !== 'disponible');

    if (productos.length !== items.length) {
      return NextResponse.json({ error: 'Uno o más productos ya no existen.' }, { status: 409 });
    }
    if (noDisponibles.length > 0) {
      return NextResponse.json(
        { error: 'Alguna prenda ya fue apartada o vendida.', productos: noDisponibles },
        { status: 409 }
      );
    }

    await Promise.all(productos.map((p) => actualizarEstatusProducto(p!.id, 'apartado')));

    const total = productos.reduce((sum, p) => sum + p!.precio_venta, 0);
    const listado = productos.map((p) => `• ${p!.nombre} (${p!.marca}, talla ${p!.talla}) — ${formatoMXN(p!.precio_venta)}`).join('\n');
    const mensaje = [
      `Hola ${TIENDA.nombre}, quiero confirmar mi apartado:`,
      listado,
      `Total: ${formatoMXN(total)}`,
      `Entrega: ${entrega === 'envio' ? `Envío a ${direccion ?? ''}` : 'Recojo en punto de entrega'}`,
      `Nombre: ${nombre}`,
      `Teléfono: ${telefono}`,
    ].join('\n');

    return NextResponse.json({
      ok: true,
      total,
      whatsappUrl: linkWhatsApp(mensaje),
    });
  } catch (err) {
    console.error('POST /api/checkout falló:', err);
    return NextResponse.json({ error: 'No pudimos procesar tu apartado.' }, { status: 500 });
  }
}
