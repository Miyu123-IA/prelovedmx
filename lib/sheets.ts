import { google } from 'googleapis';
import type {
  Categoria,
  Estatus,
  FiltrosProducto,
  Genero,
  NuevoProducto,
  OfertaConsignacion,
  Origen,
  Producto,
} from './types';

/**
 * Inventario respaldado en Google Sheets: el bot de Telegram escribe aquí y
 * la tienda lee de aquí. Mismas firmas que lib/db.ts (versión JSON) para que
 * rutas de API y páginas no tengan que saber cuál de las dos está activa —
 * ver el switch en lib/db.ts.
 */

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const HOJA_PRODUCTOS = 'Productos';
const HOJA_OFERTAS = 'Ofertas';
const HOJA_ESTADO_BOT = 'BotEstado';

const COLUMNAS_PRODUCTOS = [
  'id',
  'nombre',
  'marca',
  'genero',
  'categoria',
  'talla',
  'medidas_pecho_cm',
  'medidas_largo_cm',
  'medidas_cintura_cm',
  'medidas_cadera_cm',
  'medidas_manga_cm',
  'medidas_nota',
  'estado_puntuacion',
  'estado_nota',
  'material',
  'color',
  'precio_venta',
  'precio_costo',
  'origen',
  'consignatario_nombre',
  'consignatario_porcentaje',
  'fotos',
  'estatus',
  'fecha_ingreso',
  'tags',
] as const;

const COLUMNAS_OFERTAS = ['id', 'nombre', 'telefono', 'email', 'descripcion', 'modalidad', 'fotos', 'fecha', 'estatus'] as const;

export function sheetsConfigurado(): boolean {
  return Boolean(SHEET_ID && process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY);
}

function credenciales() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (!email || !privateKey) {
    throw new Error('Faltan GOOGLE_SERVICE_ACCOUNT_EMAIL / GOOGLE_PRIVATE_KEY en las variables de entorno.');
  }
  return { email, privateKey };
}

function auth() {
  const { email, privateKey } = credenciales();
  return new google.auth.JWT({
    email,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive'],
  });
}

function sheetsClient() {
  return google.sheets({ version: 'v4', auth: auth() });
}

export function driveClient() {
  return google.drive({ version: 'v3', auth: auth() });
}

function colLetter(index: number): string {
  let n = index + 1;
  let letra = '';
  while (n > 0) {
    const resto = (n - 1) % 26;
    letra = String.fromCharCode(65 + resto) + letra;
    n = Math.floor((n - 1) / 26);
  }
  return letra;
}

async function leerFilas(hoja: string, columnas: readonly string[]): Promise<Record<string, string>[]> {
  const rango = `${hoja}!A2:${colLetter(columnas.length - 1)}`;
  const res = await sheetsClient().spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: rango });
  const filas = res.data.values ?? [];
  return filas
    .filter((fila) => fila.some((celda) => celda !== undefined && celda !== ''))
    .map((fila) => {
      const obj: Record<string, string> = {};
      columnas.forEach((col, i) => {
        obj[col] = fila[i] ?? '';
      });
      return obj;
    });
}

async function encontrarFila(hoja: string, columnas: readonly string[], id: string): Promise<number | null> {
  const rango = `${hoja}!A2:A`;
  const res = await sheetsClient().spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: rango });
  const ids = res.data.values ?? [];
  const idx = ids.findIndex((fila) => fila[0] === id);
  return idx === -1 ? null : idx + 2; // +2: encabezado en fila 1, base 1
}

function generarId(prefijo: string): string {
  return `${prefijo}${Date.now().toString(36)}${Math.floor(Math.random() * 1000)
    .toString(36)
    .padStart(2, '0')}`;
}

function filaAProducto(fila: Record<string, string>): Producto {
  return {
    id: fila.id,
    nombre: fila.nombre,
    marca: fila.marca,
    genero: fila.genero as Genero,
    categoria: fila.categoria as Categoria,
    talla: fila.talla,
    medidas: {
      pecho_cm: fila.medidas_pecho_cm ? Number(fila.medidas_pecho_cm) : undefined,
      largo_cm: fila.medidas_largo_cm ? Number(fila.medidas_largo_cm) : undefined,
      cintura_cm: fila.medidas_cintura_cm ? Number(fila.medidas_cintura_cm) : undefined,
      cadera_cm: fila.medidas_cadera_cm ? Number(fila.medidas_cadera_cm) : undefined,
      manga_cm: fila.medidas_manga_cm ? Number(fila.medidas_manga_cm) : undefined,
      nota: fila.medidas_nota || undefined,
    },
    estado: {
      puntuacion: Number(fila.estado_puntuacion) || 0,
      nota: fila.estado_nota || undefined,
    },
    material: fila.material,
    color: fila.color,
    precio_venta: Number(fila.precio_venta) || 0,
    precio_costo: Number(fila.precio_costo) || 0,
    origen: fila.origen as Origen,
    consignatario: fila.consignatario_nombre
      ? { nombre: fila.consignatario_nombre, porcentaje: Number(fila.consignatario_porcentaje) || 0 }
      : undefined,
    fotos: fila.fotos ? fila.fotos.split(',').map((f) => f.trim()).filter(Boolean) : [],
    estatus: (fila.estatus || 'disponible') as Estatus,
    fecha_ingreso: fila.fecha_ingreso,
    tags: fila.tags ? fila.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
  };
}

function productoAFila(p: Producto): string[] {
  return [
    p.id,
    p.nombre,
    p.marca,
    p.genero,
    p.categoria,
    p.talla,
    p.medidas.pecho_cm?.toString() ?? '',
    p.medidas.largo_cm?.toString() ?? '',
    p.medidas.cintura_cm?.toString() ?? '',
    p.medidas.cadera_cm?.toString() ?? '',
    p.medidas.manga_cm?.toString() ?? '',
    p.medidas.nota ?? '',
    p.estado.puntuacion.toString(),
    p.estado.nota ?? '',
    p.material,
    p.color,
    p.precio_venta.toString(),
    p.precio_costo.toString(),
    p.origen,
    p.consignatario?.nombre ?? '',
    p.consignatario?.porcentaje?.toString() ?? '',
    p.fotos.join(', '),
    p.estatus,
    p.fecha_ingreso,
    p.tags.join(', '),
  ];
}

export async function listarProductosSheet(filtros: FiltrosProducto = {}): Promise<Producto[]> {
  const filas = await leerFilas(HOJA_PRODUCTOS, COLUMNAS_PRODUCTOS);
  let productos = filas.map(filaAProducto);

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

export async function obtenerProductoSheet(id: string): Promise<Producto | undefined> {
  const productos = await listarProductosSheet();
  return productos.find((p) => p.id === id);
}

export async function crearProductoSheet(nuevo: NuevoProducto): Promise<Producto> {
  const producto: Producto = {
    ...nuevo,
    id: generarId('p'),
    fecha_ingreso: nuevo.fecha_ingreso ?? new Date().toISOString().slice(0, 10),
    estatus: nuevo.estatus ?? 'disponible',
  };
  await sheetsClient().spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `${HOJA_PRODUCTOS}!A:A`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [productoAFila(producto)] },
  });
  return producto;
}

export async function actualizarEstatusProductoSheet(id: string, estatus: Estatus): Promise<Producto | undefined> {
  const fila = await encontrarFila(HOJA_PRODUCTOS, COLUMNAS_PRODUCTOS, id);
  if (!fila) return undefined;
  const colEstatus = COLUMNAS_PRODUCTOS.indexOf('estatus');
  await sheetsClient().spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${HOJA_PRODUCTOS}!${colLetter(colEstatus)}${fila}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [[estatus]] },
  });
  return obtenerProductoSheet(id);
}

export async function marcasDisponiblesSheet(): Promise<string[]> {
  const productos = await listarProductosSheet();
  return Array.from(new Set(productos.map((p) => p.marca))).sort();
}

export async function tallasDisponiblesSheet(): Promise<string[]> {
  const productos = await listarProductosSheet();
  return Array.from(new Set(productos.map((p) => p.talla))).sort();
}

export async function crearOfertaSheet(oferta: Omit<OfertaConsignacion, 'id' | 'fecha' | 'estatus'>): Promise<OfertaConsignacion> {
  const nueva: OfertaConsignacion = {
    ...oferta,
    id: generarId('o'),
    fecha: new Date().toISOString(),
    estatus: 'nueva',
  };
  await sheetsClient().spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `${HOJA_OFERTAS}!A:A`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[nueva.id, nueva.nombre, nueva.telefono, nueva.email ?? '', nueva.descripcion, nueva.modalidad, nueva.fotos.join(', '), nueva.fecha, nueva.estatus]],
    },
  });
  return nueva;
}

// --- Estado conversacional del bot de Telegram (una fila por chat) ---

export interface EstadoBot {
  chatId: string;
  paso: string;
  datos: Record<string, unknown>;
}

export async function obtenerEstadoBot(chatId: string): Promise<EstadoBot | null> {
  const filas = await leerFilas(HOJA_ESTADO_BOT, ['chat_id', 'paso', 'datos', 'actualizado']);
  const fila = filas.find((f) => f.chat_id === chatId);
  if (!fila) return null;
  return { chatId, paso: fila.paso, datos: fila.datos ? JSON.parse(fila.datos) : {} };
}

export async function guardarEstadoBot(estado: EstadoBot): Promise<void> {
  const filaExistente = await encontrarFila(HOJA_ESTADO_BOT, ['chat_id', 'paso', 'datos', 'actualizado'], estado.chatId);
  const valores = [estado.chatId, estado.paso, JSON.stringify(estado.datos), new Date().toISOString()];
  if (filaExistente) {
    await sheetsClient().spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${HOJA_ESTADO_BOT}!A${filaExistente}:D${filaExistente}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [valores] },
    });
  } else {
    await sheetsClient().spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${HOJA_ESTADO_BOT}!A:A`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [valores] },
    });
  }
}

export async function limpiarEstadoBot(chatId: string): Promise<void> {
  await guardarEstadoBot({ chatId, paso: 'inicio', datos: {} });
}

// --- Fotos: se descargan de Telegram y se re-suben a una carpeta de Drive ---

export async function subirFotoADrive(buffer: Buffer, nombreArchivo: string, mimeType: string): Promise<string> {
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  const drive = driveClient();
  const { Readable } = await import('node:stream');

  const { data } = await drive.files.create({
    requestBody: { name: nombreArchivo, parents: folderId ? [folderId] : undefined },
    media: { mimeType, body: Readable.from(buffer) },
    fields: 'id',
  });

  const fileId = data.id!;
  await drive.permissions.create({ fileId, requestBody: { role: 'reader', type: 'anyone' } });
  return `https://drive.google.com/uc?export=view&id=${fileId}`;
}

/** Crea las pestañas y encabezados si el Sheet está vacío. Segura de correr varias veces. */
export async function asegurarEstructuraSheet(): Promise<void> {
  const sheets = sheetsClient();
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
  const hojasExistentes = new Set(meta.data.sheets?.map((s) => s.properties?.title));

  const faltantes = [HOJA_PRODUCTOS, HOJA_OFERTAS, HOJA_ESTADO_BOT].filter((h) => !hojasExistentes.has(h));
  if (faltantes.length > 0) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: { requests: faltantes.map((title) => ({ addSheet: { properties: { title } } })) },
    });
  }

  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${HOJA_PRODUCTOS}!A1`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [[...COLUMNAS_PRODUCTOS]] },
  });
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${HOJA_OFERTAS}!A1`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [[...COLUMNAS_OFERTAS]] },
  });
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${HOJA_ESTADO_BOT}!A1`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [['chat_id', 'paso', 'datos', 'actualizado']] },
  });
}
