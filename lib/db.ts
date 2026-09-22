import fs from 'node:fs';
import path from 'node:path';
import type { Estatus, FiltrosProducto, NuevoProducto, OfertaConsignacion, Producto } from './types';
import * as sheets from './sheets';

/**
 * Fuente de datos del inventario: Google Sheets si está configurado
 * (GOOGLE_SHEET_ID + credenciales de la cuenta de servicio — así es como
 * escribe el bot de Telegram), si no, un archivo JSON local para desarrollo
 * sin esas credenciales a la mano. Todo lo demás en la app llama estas
 * funciones sin saber cuál de las dos está activa.
 */

const DATA_DIR = path.join(process.cwd(), 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const OFERTAS_FILE = path.join(DATA_DIR, 'ofertas.json');

function leerJSON<T>(archivo: string, fallback: T): T {
  try {
    const raw = fs.readFileSync(archivo, 'utf-8');
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function escribirJSON(archivo: string, data: unknown) {
  try {
    fs.mkdirSync(path.dirname(archivo), { recursive: true });
    fs.writeFileSync(archivo, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    // En hosting serverless (Vercel) el sistema de archivos del deploy es de
    // solo lectura: el cambio no persiste. No tronamos la petición por esto
    // -en producción debería estar configurado Google Sheets de cualquier
    // forma-, solo lo dejamos en log.
    console.warn(`No se pudo escribir ${archivo} (¿filesystem de solo lectura?):`, err);
  }
}

/**
 * Para lecturas: si Sheets está configurado pero falla (credenciales mal
 * pegadas, Sheet sin compartir, etc.) preferimos mostrarle algo a la
 * clienta -aunque sea el catálogo de ejemplo- a tronar la página entera.
 */
async function leerConFallback<T>(intento: () => Promise<T>, fallback: () => T): Promise<T> {
  try {
    return await intento();
  } catch (err) {
    console.error('Google Sheets falló, usando data/*.json de respaldo:', err);
    return fallback();
  }
}

function generarId(prefijo: string): string {
  return `${prefijo}${Date.now().toString(36)}${Math.floor(Math.random() * 1000)
    .toString(36)
    .padStart(2, '0')}`;
}

function filtrarProductos(productos: Producto[], filtros: FiltrosProducto): Producto[] {
  if (filtros.genero) {
    productos = productos.filter((p) => p.genero === filtros.genero || p.genero === 'unisex');
  }
  if (filtros.marca) {
    productos = productos.filter((p) => p.marca.toLowerCase() === filtros.marca!.toLowerCase());
  }
  if (filtros.talla) {
    productos = productos.filter((p) => p.talla.toLowerCase() === filtros.talla!.toLowerCase());
  }
  if (filtros.categoria) {
    productos = productos.filter((p) => p.categoria === filtros.categoria);
  }
  if (filtros.precioMin != null) {
    productos = productos.filter((p) => p.precio_venta >= filtros.precioMin!);
  }
  if (filtros.precioMax != null) {
    productos = productos.filter((p) => p.precio_venta <= filtros.precioMax!);
  }
  if (filtros.estadoMin != null) {
    productos = productos.filter((p) => p.estado.puntuacion >= filtros.estadoMin!);
  }
  if (filtros.estatus) {
    productos = productos.filter((p) => p.estatus === filtros.estatus);
  }
  if (filtros.q) {
    const q = filtros.q.toLowerCase();
    productos = productos.filter(
      (p) =>
        p.nombre.toLowerCase().includes(q) ||
        p.marca.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    );
  }
  switch (filtros.orden) {
    case 'precio_asc':
      productos.sort((a, b) => a.precio_venta - b.precio_venta);
      break;
    case 'precio_desc':
      productos.sort((a, b) => b.precio_venta - a.precio_venta);
      break;
    default:
      productos.sort((a, b) => new Date(b.fecha_ingreso).getTime() - new Date(a.fecha_ingreso).getTime());
  }
  return productos;
}

export async function listarProductos(filtros: FiltrosProducto = {}): Promise<Producto[]> {
  if (sheets.sheetsConfigurado()) {
    return leerConFallback(
      () => sheets.listarProductosSheet(filtros),
      () => filtrarProductos(leerJSON<Producto[]>(PRODUCTS_FILE, []), filtros)
    );
  }
  const productos = leerJSON<Producto[]>(PRODUCTS_FILE, []);
  return filtrarProductos(productos, filtros);
}

export async function obtenerProducto(id: string): Promise<Producto | undefined> {
  if (sheets.sheetsConfigurado()) {
    return leerConFallback(
      () => sheets.obtenerProductoSheet(id),
      () => leerJSON<Producto[]>(PRODUCTS_FILE, []).find((p) => p.id === id)
    );
  }
  return leerJSON<Producto[]>(PRODUCTS_FILE, []).find((p) => p.id === id);
}

export async function crearProducto(nuevo: NuevoProducto): Promise<Producto> {
  if (sheets.sheetsConfigurado()) return sheets.crearProductoSheet(nuevo);
  const productos = leerJSON<Producto[]>(PRODUCTS_FILE, []);
  const producto: Producto = {
    ...nuevo,
    id: generarId('p'),
    fecha_ingreso: nuevo.fecha_ingreso ?? new Date().toISOString().slice(0, 10),
    estatus: nuevo.estatus ?? 'disponible',
  };
  productos.push(producto);
  escribirJSON(PRODUCTS_FILE, productos);
  return producto;
}

export async function actualizarEstatusProducto(id: string, estatus: Estatus): Promise<Producto | undefined> {
  if (sheets.sheetsConfigurado()) return sheets.actualizarEstatusProductoSheet(id, estatus);
  const productos = leerJSON<Producto[]>(PRODUCTS_FILE, []);
  const idx = productos.findIndex((p) => p.id === id);
  if (idx === -1) return undefined;
  productos[idx].estatus = estatus;
  escribirJSON(PRODUCTS_FILE, productos);
  return productos[idx];
}

export async function marcasDisponibles(): Promise<string[]> {
  if (sheets.sheetsConfigurado()) {
    return leerConFallback(
      () => sheets.marcasDisponiblesSheet(),
      () => Array.from(new Set(leerJSON<Producto[]>(PRODUCTS_FILE, []).map((p) => p.marca))).sort()
    );
  }
  const productos = leerJSON<Producto[]>(PRODUCTS_FILE, []);
  return Array.from(new Set(productos.map((p) => p.marca))).sort();
}

export async function tallasDisponibles(): Promise<string[]> {
  if (sheets.sheetsConfigurado()) {
    return leerConFallback(
      () => sheets.tallasDisponiblesSheet(),
      () => Array.from(new Set(leerJSON<Producto[]>(PRODUCTS_FILE, []).map((p) => p.talla))).sort()
    );
  }
  const productos = leerJSON<Producto[]>(PRODUCTS_FILE, []);
  return Array.from(new Set(productos.map((p) => p.talla))).sort();
}

export async function crearOferta(oferta: Omit<OfertaConsignacion, 'id' | 'fecha' | 'estatus'>): Promise<OfertaConsignacion> {
  if (sheets.sheetsConfigurado()) return sheets.crearOfertaSheet(oferta);
  const ofertas = leerJSON<OfertaConsignacion[]>(OFERTAS_FILE, []);
  const nueva: OfertaConsignacion = {
    ...oferta,
    id: generarId('o'),
    fecha: new Date().toISOString(),
    estatus: 'nueva',
  };
  ofertas.push(nueva);
  escribirJSON(OFERTAS_FILE, ofertas);
  return nueva;
}
