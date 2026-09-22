import { NextRequest, NextResponse } from 'next/server';
import { crearProducto, listarProductos } from '@/lib/db';
import { nuevoProductoSchema } from '@/lib/validation';
import type { FiltrosProducto } from '@/lib/types';

/**
 * GET /api/products?genero=hombre&categoria=playeras&marca=Zara&talla=M
 *   &precioMin=100&precioMax=500&estatus=disponible&q=vintage&orden=recientes
 *
 * POST /api/products  — usado por el bot de inventario para crear una prenda.
 * Body JSON con la forma de NuevoProducto (ver lib/types.ts).
 */

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const filtros: FiltrosProducto = {
    genero: (sp.get('genero') as FiltrosProducto['genero']) || undefined,
    marca: sp.get('marca') || undefined,
    talla: sp.get('talla') || undefined,
    categoria: (sp.get('categoria') as FiltrosProducto['categoria']) || undefined,
    precioMin: sp.get('precioMin') ? Number(sp.get('precioMin')) : undefined,
    precioMax: sp.get('precioMax') ? Number(sp.get('precioMax')) : undefined,
    estadoMin: sp.get('estadoMin') ? Number(sp.get('estadoMin')) : undefined,
    estatus: (sp.get('estatus') as FiltrosProducto['estatus']) || undefined,
    q: sp.get('q') || undefined,
    orden: (sp.get('orden') as FiltrosProducto['orden']) || undefined,
  };

  const productos = await listarProductos(filtros);
  return NextResponse.json({ productos, total: productos.length });
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 });
  }

  const parsed = nuevoProductoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos', detalles: parsed.error.flatten() }, { status: 400 });
  }

  const producto = await crearProducto(parsed.data);
  return NextResponse.json({ producto }, { status: 201 });
}
