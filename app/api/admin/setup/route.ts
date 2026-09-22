import { NextRequest, NextResponse } from 'next/server';
import { asegurarEstructuraSheet, sheetsConfigurado } from '@/lib/sheets';
import { configurarWebhook, telegramConfigurado } from '@/lib/telegram';

/**
 * Setup de un solo uso (o para repetir si rotas el token/dominio):
 * GET /api/admin/setup?secret=ADMIN_SETUP_SECRET
 *
 * - Crea las pestañas y encabezados del Google Sheet si no existen
 * - Registra el webhook del bot de Telegram apuntando a este dominio
 *
 * Protegido por ADMIN_SETUP_SECRET porque registra el webhook (cualquiera
 * con el secret podría apuntar el bot a otro servidor).
 */
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');
  if (!process.env.ADMIN_SETUP_SECRET || secret !== process.env.ADMIN_SETUP_SECRET) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const resultado: Record<string, unknown> = {};

  if (sheetsConfigurado()) {
    try {
      await asegurarEstructuraSheet();
      resultado.sheet = 'Pestañas y encabezados listos.';
    } catch (err) {
      resultado.sheetError = String(err);
    }
  } else {
    resultado.sheet = 'GOOGLE_SHEET_ID / credenciales no configuradas todavía.';
  }

  if (telegramConfigurado() && process.env.TELEGRAM_WEBHOOK_SECRET) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? `https://${req.headers.get('host')}`;
    const res = await configurarWebhook(`${siteUrl}/api/telegram/webhook`, process.env.TELEGRAM_WEBHOOK_SECRET);
    resultado.webhook = res;
  } else {
    resultado.webhook = 'TELEGRAM_BOT_TOKEN / TELEGRAM_WEBHOOK_SECRET no configurados todavía.';
  }

  return NextResponse.json(resultado);
}
