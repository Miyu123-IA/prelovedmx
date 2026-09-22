import { NextRequest, NextResponse } from 'next/server';
import { procesarActualizacion } from '@/lib/telegram-bot';
import { enviarMensaje, type TelegramUpdate } from '@/lib/telegram';

/**
 * Telegram llama aquí (POST) cada vez que alguien le escribe al bot.
 * El "secret token" evita que cualquiera en internet pueda mandarnos
 * updates falsos haciéndose pasar por Telegram — Telegram lo manda de
 * vuelta en este header en cada llamada, una vez configurado en setWebhook.
 */
export async function POST(req: NextRequest) {
  const secretRecibido = req.headers.get('x-telegram-bot-api-secret-token');
  const secretEsperado = process.env.TELEGRAM_WEBHOOK_SECRET;

  if (secretEsperado && secretRecibido !== secretEsperado) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const update = (await req.json().catch(() => null)) as TelegramUpdate | null;
  if (!update) {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  try {
    await procesarActualizacion(update);
  } catch (err) {
    console.error('Error procesando update de Telegram:', err);
    const chatId = update.message?.chat.id ?? update.callback_query?.message?.chat.id;
    if (chatId) {
      await enviarMensaje(chatId, '⚠️ Algo falló de mi lado. Intenta de nuevo o escribe /cancelar y vuelve a empezar con /nuevo.').catch(() => {});
    }
  }

  // Siempre 200: si le respondemos error a Telegram, reintenta el mismo
  // update varias veces y duplicaría mensajes.
  return NextResponse.json({ ok: true });
}
