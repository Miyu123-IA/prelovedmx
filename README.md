# PRELOVEDMX

Tienda online de ropa vintage y pre-owned multimarca, curada en Mazatlán, México.

## Correr en local

```bash
npm install
npm run dev
```

Abre http://localhost:3000

## Cómo alimentar el inventario desde el bot

Los productos viven en `data/products.json` a través de `lib/db.ts`. El bot no
debe tocar ese archivo directamente: usa la API REST.

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

## Migrar a una base de datos real

Todo el acceso a datos pasa por `lib/db.ts`. Para usar Postgres/Supabase/MySQL
en vez del archivo JSON, reescribe las funciones de ese archivo manteniendo
las mismas firmas — nada más en la app necesita cambiar.

**Plan acordado:** migrar `lib/db.ts` para leer/escribir un Google Sheet (el
bot de Telegram del inventario escribe ahí directamente). Mientras eso no
esté conectado, el sitio corre con `data/products.json` — en Vercel ese
archivo es de solo lectura en producción, así que las escrituras (crear
producto, marcar apartado/vendido, enviar oferta) no persisten entre
despliegues; `lib/db.ts` ya no truena por esto (ver `escribirJSON`), solo
deja de guardar el cambio.

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
- Bot de Telegram + Google Sheet para subir inventario (marca, categoría,
  precio, fotos, disponibilidad): pendiente para la siguiente sesión. Hace
  falta un token de bot (@BotFather) y una cuenta de servicio de Google con
  acceso al Sheet.
