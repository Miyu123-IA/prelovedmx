import { actualizarEstatusProducto, crearProducto, listarProductos } from './db';
import { subirFotoADrive } from './sheets';
import { obtenerEstadoBot, guardarEstadoBot, limpiarEstadoBot, type EstadoBot } from './sheets';
import { enviarMensaje, responderCallback, obtenerArchivo, type TelegramUpdate } from './telegram';
import { CATEGORIAS, GENEROS, formatoMXN } from './utils';
import type { Categoria, Estatus, Genero, Origen } from './types';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://prelovedmx.vercel.app';

function chatIdsAutorizados(): string[] | null {
  const raw = process.env.TELEGRAM_ALLOWED_CHAT_IDS;
  if (!raw) return null; // null = sin restricción (no recomendado en producción)
  return raw.split(',').map((s) => s.trim());
}

const BOTONES_GENERO = [
  [{ text: 'Hombre', data: 'genero:hombre' }, { text: 'Mujer', data: 'genero:mujer' }, { text: 'Unisex', data: 'genero:unisex' }],
];

const BOTONES_CATEGORIA = (() => {
  const entradas = Object.entries(CATEGORIAS);
  const filas: { text: string; data: string }[][] = [];
  for (let i = 0; i < entradas.length; i += 3) {
    filas.push(entradas.slice(i, i + 3).map(([valor, etiqueta]) => ({ text: etiqueta, data: `categoria:${valor}` })));
  }
  return filas;
})();

const BOTONES_ESTADO = [
  [1, 2, 3, 4, 5].map((n) => ({ text: String(n), data: `estado:${n}` })),
  [6, 7, 8, 9, 10].map((n) => ({ text: String(n), data: `estado:${n}` })),
];

const BOTONES_ORIGEN = [[{ text: 'Donación', data: 'origen:donacion' }, { text: 'Consignación', data: 'origen:consignacion' }]];

const TEXTO_AYUDA = `<b>Bot de inventario PRELOVEDMX</b>

/nuevo — sube una prenda nueva paso a paso
/listado — últimas 10 prendas con su ID
/disponible ID — márcala disponible
/apartado ID — márcala apartada
/vendido ID — márcala vendida
/cancelar — cancela lo que estabas subiendo
/ayuda — este mensaje`;

async function preguntar(chatId: number, paso: EstadoBot['paso'], datos: Record<string, unknown>, texto: string, botones?: { text: string; data: string }[][]) {
  await guardarEstadoBot({ chatId: String(chatId), paso, datos });
  await enviarMensaje(chatId, texto, botones);
}

async function finalizarProducto(chatId: number, datos: Record<string, unknown>) {
  const producto = await crearProducto({
    nombre: String(datos.nombre),
    marca: String(datos.marca),
    genero: datos.genero as Genero,
    categoria: datos.categoria as Categoria,
    talla: String(datos.talla),
    medidas: {},
    estado: { puntuacion: Number(datos.estado_puntuacion), nota: datos.estado_nota ? String(datos.estado_nota) : undefined },
    material: String(datos.material),
    color: String(datos.color),
    precio_venta: Number(datos.precio_venta),
    precio_costo: 0,
    origen: datos.origen as Origen,
    consignatario:
      datos.origen === 'consignacion'
        ? { nombre: String(datos.consignatario_nombre), porcentaje: Number(datos.consignatario_porcentaje) }
        : undefined,
    fotos: (datos.fotos as string[] | undefined) ?? [],
    tags: [],
  });

  await limpiarEstadoBot(String(chatId));
  await enviarMensaje(
    chatId,
    `✅ <b>${producto.nombre}</b> publicada.\n${formatoMXN(producto.precio_venta)} · talla ${producto.talla}\nID: <code>${producto.id}</code>\n${SITE_URL}/tienda/${producto.id}`
  );
}

async function manejarTexto(chatId: number, texto: string) {
  const comando = texto.trim().split(/\s+/)[0].toLowerCase();

  if (comando === '/start' || comando === '/ayuda') {
    await enviarMensaje(chatId, TEXTO_AYUDA);
    return;
  }

  if (comando === '/cancelar') {
    await limpiarEstadoBot(String(chatId));
    await enviarMensaje(chatId, 'Cancelado. Nada se guardó.');
    return;
  }

  if (comando === '/nuevo') {
    await preguntar(chatId, 'esperando_nombre', {}, '👕 ¿Nombre de la prenda? (ej. "Polo clásico piqué")');
    return;
  }

  if (comando === '/listado') {
    const productos = (await listarProductos({ orden: 'recientes' })).slice(0, 10);
    if (productos.length === 0) {
      await enviarMensaje(chatId, 'Todavía no hay productos.');
      return;
    }
    const lineas = productos.map((p) => `<code>${p.id}</code> — ${p.nombre} (${p.marca}) — ${formatoMXN(p.precio_venta)} — ${p.estatus}`);
    await enviarMensaje(chatId, lineas.join('\n'));
    return;
  }

  if (['/disponible', '/apartado', '/vendido'].includes(comando)) {
    const id = texto.trim().split(/\s+/)[1];
    if (!id) {
      await enviarMensaje(chatId, `Uso: ${comando} ID (usa /listado para ver los IDs)`);
      return;
    }
    const estatus = comando.replace('/', '') as Estatus;
    const producto = await actualizarEstatusProducto(id, estatus);
    if (!producto) {
      await enviarMensaje(chatId, `No encontré ningún producto con ID ${id}.`);
      return;
    }
    await enviarMensaje(chatId, `${producto.nombre} ahora está <b>${estatus}</b>.`);
    return;
  }

  // Fuera de un comando reconocido: seguimos el flujo activo, si hay uno.
  const estado = await obtenerEstadoBot(String(chatId));
  if (!estado || estado.paso === 'inicio') {
    await enviarMensaje(chatId, 'No entendí. Escribe /ayuda para ver los comandos disponibles.');
    return;
  }

  const datos = estado.datos;

  switch (estado.paso) {
    case 'esperando_nombre':
      datos.nombre = texto.trim();
      await preguntar(chatId, 'esperando_marca', datos, '🏷️ ¿Marca?');
      return;

    case 'esperando_marca':
      datos.marca = texto.trim();
      await preguntar(chatId, 'esperando_genero', datos, '¿Para quién es?', BOTONES_GENERO);
      return;

    case 'esperando_talla':
      datos.talla = texto.trim();
      await preguntar(chatId, 'esperando_color', datos, '🎨 ¿Color?');
      return;

    case 'esperando_color':
      datos.color = texto.trim();
      await preguntar(chatId, 'esperando_material', datos, '🧵 ¿Material? (ej. "Algodón 100%")');
      return;

    case 'esperando_material':
      datos.material = texto.trim();
      await preguntar(chatId, 'esperando_estado', datos, '⭐ ¿Estado de la prenda? (1 = muy usada, 10 = como nueva)', BOTONES_ESTADO);
      return;

    case 'esperando_estado_nota':
      datos.estado_nota = texto.trim() === '/saltar' ? undefined : texto.trim();
      await preguntar(chatId, 'esperando_precio', datos, '💰 ¿Precio de venta? (solo el número, en pesos)');
      return;

    case 'esperando_precio': {
      const precio = Number(texto.replace(/[^\d.]/g, ''));
      if (!precio || precio <= 0) {
        await enviarMensaje(chatId, 'Mándame solo el número, ej. 450');
        return;
      }
      datos.precio_venta = precio;
      await preguntar(chatId, 'esperando_origen', datos, '¿Cómo llegó la prenda?', BOTONES_ORIGEN);
      return;
    }

    case 'esperando_consignatario_nombre':
      datos.consignatario_nombre = texto.trim();
      await preguntar(chatId, 'esperando_consignatario_porcentaje', datos, '¿Qué % le toca a esa persona al venderse? (solo el número, ej. 60)');
      return;

    case 'esperando_consignatario_porcentaje': {
      const pct = Number(texto.replace(/[^\d.]/g, ''));
      if (!pct || pct <= 0 || pct > 100) {
        await enviarMensaje(chatId, 'Mándame un número entre 1 y 100.');
        return;
      }
      datos.consignatario_porcentaje = pct;
      await preguntar(chatId, 'esperando_fotos', datos, '📸 Mándame las fotos de la prenda (una o varias). Cuando termines escribe /listo');
      return;
    }

    case 'esperando_fotos':
      if (comando === '/listo') {
        if (!((datos.fotos as string[] | undefined)?.length)) {
          await enviarMensaje(chatId, 'Necesito al menos una foto antes de publicar. Mándala y luego /listo.');
          return;
        }
        await finalizarProducto(chatId, datos);
        return;
      }
      await enviarMensaje(chatId, 'Mándame la foto, o escribe /listo si ya terminaste.');
      return;

    default:
      await enviarMensaje(chatId, 'No entendí. Escribe /ayuda.');
  }
}

async function manejarFoto(chatId: number, fileId: string) {
  const estado = await obtenerEstadoBot(String(chatId));
  if (!estado || estado.paso !== 'esperando_fotos') {
    await enviarMensaje(chatId, 'Primero escribe /nuevo para empezar a subir una prenda.');
    return;
  }

  const archivo = await obtenerArchivo(fileId);
  if (!archivo) {
    await enviarMensaje(chatId, 'No pude descargar esa foto, intenta de nuevo.');
    return;
  }

  try {
    const url = await subirFotoADrive(archivo.buffer, `${Date.now()}-${fileId}.jpg`, archivo.mimeType);
    const fotos = (estado.datos.fotos as string[] | undefined) ?? [];
    fotos.push(url);
    estado.datos.fotos = fotos;
    await guardarEstadoBot(estado);
    await enviarMensaje(chatId, `Foto ${fotos.length} agregada ✅. Manda otra o escribe /listo.`);
  } catch (err) {
    console.error('subirFotoADrive falló:', err);
    await enviarMensaje(chatId, '⚠️ No pude subir esa foto a Drive. Intenta mandarla otra vez.');
  }
}

async function manejarCallback(chatId: number, callbackId: string, data: string) {
  await responderCallback(callbackId);
  const estado = await obtenerEstadoBot(String(chatId));
  if (!estado) return;
  const datos = estado.datos;
  const [tipo, valor] = data.split(':');

  if (tipo === 'genero' && estado.paso === 'esperando_genero') {
    datos.genero = valor;
    await preguntar(chatId, 'esperando_categoria', datos, `📦 ¿Categoría? (${GENEROS[valor]})`, BOTONES_CATEGORIA);
    return;
  }

  if (tipo === 'categoria' && estado.paso === 'esperando_categoria') {
    datos.categoria = valor;
    await preguntar(chatId, 'esperando_talla', datos, '📏 ¿Talla? (ej. "M" o "32")');
    return;
  }

  if (tipo === 'estado' && estado.paso === 'esperando_estado') {
    datos.estado_puntuacion = Number(valor);
    await preguntar(chatId, 'esperando_estado_nota', datos, '¿Algún defecto que debamos mencionar? Escribe cuál, o manda /saltar si no hay.');
    return;
  }

  if (tipo === 'origen' && estado.paso === 'esperando_origen') {
    datos.origen = valor;
    if (valor === 'consignacion') {
      await preguntar(chatId, 'esperando_consignatario_nombre', datos, '¿Nombre de quién dejó la prenda en consignación?');
    } else {
      await preguntar(chatId, 'esperando_fotos', datos, '📸 Mándame las fotos de la prenda (una o varias). Cuando termines escribe /listo');
    }
    return;
  }
}

export async function procesarActualizacion(update: TelegramUpdate) {
  const chatId = update.message?.chat.id ?? update.callback_query?.message?.chat.id;
  if (!chatId) return;

  const permitidos = chatIdsAutorizados();
  if (permitidos && !permitidos.includes(String(chatId))) {
    await enviarMensaje(chatId, `No tienes permiso para usar este bot. Tu chat ID es ${chatId}; pídele al dueño que lo autorice.`);
    return;
  }

  if (update.callback_query) {
    await manejarCallback(chatId, update.callback_query.id, update.callback_query.data ?? '');
    return;
  }

  if (update.message?.photo?.length) {
    const mejorFoto = update.message.photo[update.message.photo.length - 1];
    await manejarFoto(chatId, mejorFoto.file_id);
    return;
  }

  if (update.message?.text) {
    await manejarTexto(chatId, update.message.text);
  }
}
