const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const API = () => `https://api.telegram.org/bot${TOKEN}`;
const FILE_API = () => `https://api.telegram.org/file/bot${TOKEN}`;

export function telegramConfigurado(): boolean {
  return Boolean(TOKEN);
}

export interface TecladoInline {
  text: string;
  data: string;
}

async function llamar(metodo: string, payload: Record<string, unknown>) {
  const res = await fetch(`${API()}/${metodo}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!data.ok) console.warn(`Telegram ${metodo} falló:`, data);
  return data;
}

export async function enviarMensaje(chatId: string | number, texto: string, botones?: TecladoInline[][]) {
  return llamar('sendMessage', {
    chat_id: chatId,
    text: texto,
    parse_mode: 'HTML',
    reply_markup: botones ? { inline_keyboard: botones.map((fila) => fila.map((b) => ({ text: b.text, callback_data: b.data }))) } : undefined,
  });
}

export async function responderCallback(callbackQueryId: string, texto?: string) {
  return llamar('answerCallbackQuery', { callback_query_id: callbackQueryId, text: texto });
}

export async function obtenerArchivo(fileId: string): Promise<{ buffer: Buffer; mimeType: string } | null> {
  const info = await llamar('getFile', { file_id: fileId });
  const filePath = info.result?.file_path;
  if (!filePath) return null;
  const res = await fetch(`${FILE_API()}/${filePath}`);
  if (!res.ok) return null;
  const arrayBuffer = await res.arrayBuffer();
  const mimeType = res.headers.get('content-type') ?? 'image/jpeg';
  return { buffer: Buffer.from(arrayBuffer), mimeType };
}

export async function configurarWebhook(url: string, secretToken: string) {
  return llamar('setWebhook', { url, secret_token: secretToken });
}

// --- Tipos mínimos del Update de Telegram que usamos ---

export interface TelegramUpdate {
  message?: {
    message_id: number;
    chat: { id: number };
    text?: string;
    photo?: { file_id: string; file_size?: number }[];
  };
  callback_query?: {
    id: string;
    data?: string;
    message?: { chat: { id: number } };
  };
}
