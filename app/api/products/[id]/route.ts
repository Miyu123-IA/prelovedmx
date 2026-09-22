import { NextRequest, NextResponse } from 'next/server';
import { actualizarEstatusProducto, obtenerProducto } from '@/lib/db';
import { z } from 'zod';

const patchSchema = z.object({
  estatus: z.enum(['disponible', 'apartado', 'vendido']),
});

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const producto = obtenerProducto(params.id);
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
  const producto = actualizarEstatusProducto(params.id, parsed.data.estatus);
  if (!producto) {
    return NextResponse.json({ error: 'Producto no encontrado.' }, { status: 404 });
  }
  return NextResponse.json({ producto });
}
