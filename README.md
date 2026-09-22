# PRELOVEDMX

Tienda online de ropa vintage y pre-owned multimarca, curada en Mazatlán, México.

## Correr en local

```bash
npm install
npm run dev
```

Abre http://localhost:3000

## Cómo alimentar el inventario

Hay dos formas, ambas pasan por `lib/db.ts` (que decide solo si usa Google
Sheets o el JSON local — ver "Google Sheets + bot de Telegram" abajo):

1. **Bot de Telegram** (`@Preloved_inventario_bot`): `/nuevo` y responde las
   preguntas — marca, categoría, talla, precio, fotos, etc. Pensado para
   subir inventario desde el celular sin tocar código.
2. **API REST directa**, por si más adelante conectas otra herramienta.

**Crear una prenda** — `POST /api/products`

```json
{
  "nombre": "Polo clásico piqué",
  "marca": "Lacoste",
  "genero": "hombre",
  "categoria": "playeras",
  "talla": "M",
  "medidas": { "pecho_cm": 52, "largo_cm": 71 },
  "estado": { "puntuacion": 8, "nota": "Ligero desgaste en el cuello." },
  "material": "Piqué de algodón 100%",
  "color": "Verde botella",
  "precio_venta": 450,
  "precio_costo": 180,
  "origen": "consignacion",
  "consignatario": { "nombre": "Ana Ibarra", "porcentaje": 60 },
  "fotos": ["https://..."],
  "tags": ["preppy"]
}
```

`genero`: `hombre` | `mujer` | `unisex`
`categoria`: `playeras` | `camisas` | `pantalones` | `chamarras` | `vestidos` | `sudaderas` | `shorts` | `faldas` | `accesorios`
`origen`: `donacion` | `consignacion` (si es `consignacion`, incluye `consignatario`)

**Actualizar estatus** (marcar vendido/apartado/disponible) — `PATCH /api/products/:id`
```json
{ "estatus": "vendido" }
```

**Listar / filtrar** — `GET /api/products?genero=mujer&categoria=vestidos&marca=Zara`

**Ofertas de consignación/donación** enviadas desde `/vende` llegan a
`data/ofertas.json` vía `POST /api/ofertas` — revísalas ahí o conecta el bot
para que te avise cuando entre una nueva.

## Google Sheets + bot de Telegram

`lib/db.ts` usa Google Sheets automáticamente en cuanto detecta
`GOOGLE_SHEET_ID` + las credenciales de la cuenta de servicio; si no,
sigue usando `data/products.json` (así el desarrollo local no depende de
tener esas credenciales a la mano). En Vercel, ese archivo JSON es de solo
lectura en producción de cualquier forma, así que en producción **Sheets no
es opcional** — sin configurarlo, crear/actualizar productos no persiste.

**Variables de entorno** (ver `.env.example` para la lista completa):

| Variable | De dónde sale |
|---|---|
| `GOOGLE_SHEET_ID` | El ID en la URL del Sheet: `docs.google.com/spreadsheets/d/`**`ESTE_ID`**`/edit` |
| `GOOGLE_DRIVE_FOLDER_ID` | El ID en la URL de la carpeta de Drive para fotos |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Campo `client_email` del JSON de la cuenta de servicio |
| `GOOGLE_PRIVATE_KEY` | Campo `private_key` del mismo JSON (con los `\n` tal cual, en una sola línea) |
| `TELEGRAM_BOT_TOKEN` | Te lo da @BotFather al crear el bot |
| `TELEGRAM_WEBHOOK_SECRET` | Cualquier cadena aleatoria que tú inventes |
| `TELEGRAM_ALLOWED_CHAT_IDS` | Chat IDs de Telegram con permiso de usar el bot, separados por coma |
| `ADMIN_SETUP_SECRET` | Otra cadena aleatoria, para proteger `/api/admin/setup` |

**Importante:** la cuenta de servicio necesita acceso de **Editor** tanto al
Google Sheet como a la carpeta de Drive de las fotos — compártelos con el
email de `GOOGLE_SERVICE_ACCOUNT_EMAIL` como harías con cualquier persona.

**Después de configurar las variables en Vercel** (Project → Settings →
Environment Variables → redeploy), corre una sola vez:

```
GET https://tu-dominio/api/admin/setup?secret=EL_ADMIN_SETUP_SECRET
```

Esto crea las pestañas y encabezados del Sheet (`Productos`, `Ofertas`,
`BotEstado`) si no existen, y registra el webhook del bot con Telegram. La
respuesta te confirma si cada paso funcionó.

**Para migrar a Postgres/Supabase/MySQL** en vez de Sheets: reescribe
`lib/sheets.ts` manteniendo las mismas firmas de función — `lib/db.ts` y el
resto de la app no necesitan cambiar.

## Desplegar en Vercel

1. El repo ya está en GitHub: https://github.com/Miyu123-IA/prelovedmx
2. Entra a https://vercel.com/new con tu cuenta (o créala con GitHub)
3. "Import Git Repository" → autoriza acceso al repo `prelovedmx` si te lo pide → selecciónalo
4. Framework se detecta solo como Next.js. No hace falta configurar nada más → **Deploy**
5. Cuando termine, te da una URL tipo `prelovedmx.vercel.app` para probar antes de conectar el dominio

### Conectar el dominio

1. En el proyecto en Vercel → **Settings → Domains** → agrega tu dominio (ej. `prelovedmx.mx`)
2. Vercel te muestra los registros DNS exactos (normalmente un `A` a `76.76.21.21`
   y/o un `CNAME` en `www` a `cname.vercel-dns.com`) — cópialos
3. Entra al panel de tu registrador (donde compraste el dominio) → DNS → agrega esos registros
4. Espera de unos minutos a un par de horas a que propague; Vercel emite HTTPS automático

## Pendiente antes de producción

- No hay pasarela de pago conectada: el checkout aparta la prenda y pasa el
  pedido a WhatsApp para acordar pago y entrega. Conectar Stripe/Conekta/
  Mercado Pago requiere las credenciales propias del negocio.
- Las fotos de producto son un marcador visual (silueta ilustrada) hasta que
  el bot suba fotos reales al campo `fotos`.
- Cambiar el número de WhatsApp e Instagram reales en `lib/utils.ts` (`TIENDA`).
- `npm audit` marca 2 avisos de seguridad en Next.js 14.2.x (RCE en la API de
  optimización de imágenes con AVIF, y un problema de PostCSS interno de
  Next). El sitio no usa `next/image` ni sube imágenes de usuarios, así que
  la superficie de ataque real es baja, pero conviene subir a Next 15/16
  más adelante (cambio mayor, requiere probar todo de nuevo).
- Bot de Telegram y capa de Google Sheets ya están escritos (`lib/telegram*.ts`,
  `lib/sheets.ts`); falta cargar las variables de entorno en Vercel y correr
  `/api/admin/setup` una vez — ver "Google Sheets + bot de Telegram" arriba.
