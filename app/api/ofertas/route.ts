import { NextRequest, NextResponse } from 'next/server';
import { crearOferta } from '@/lib/db';
import { ofertaSchema } from '@/lib/validation';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = ofertaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos', detalles: parsed.error.flatten() }, { status: 400 });
  }
  try {
    const oferta = await crearOferta(parsed.data);
    return NextResponse.json({ oferta }, { status: 201 });
  } catch (err) {
    console.error('POST /api/ofertas falló:', err);
    return NextResponse.json({ error: 'No pudimos guardar tu oferta.' }, { status: 500 });
  }
}
