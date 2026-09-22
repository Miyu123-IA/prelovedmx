import { NextRequest, NextResponse } from 'next/server';
import { actualizarEstatusProducto, obtenerProducto } from '@/lib/db';
import { z } from 'zod';

const patchSchema = z.object({
  estatus: z.enum(['disponible', 'apartado', 'vendido']),
});

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const producto = await obtenerProducto(params.id);
  if (!producto) {
    return NextResponse.json({ error: 'Producto no encontrado.' }, { status: 404 });
  }
  return NextResponse.json({ producto });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos', detalles: parsed.error.flatten() }, { status: 400 });
  }
  try {
    const producto = await actualizarEstatusProducto(params.id, parsed.data.estatus);
    if (!producto) {
      return NextResponse.json({ error: 'Producto no encontrado.' }, { status: 404 });
    }
    return NextResponse.json({ producto });
  } catch (err) {
    console.error('PATCH /api/products/[id] falló:', err);
    return NextResponse.json({ error: 'No pudimos actualizar el producto.' }, { status: 500 });
  }
}
