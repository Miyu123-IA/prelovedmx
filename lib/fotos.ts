import { put } from '@vercel/blob';

/**
 * Fotos de producto: se suben a Vercel Blob (no a Google Drive — las
 * cuentas de servicio de Google no tienen cuota propia de almacenamiento
 * y no pueden escribir en Drive normal, solo en Shared Drives de Workspace).
 */
export async function subirFoto(buffer: Buffer, nombreArchivo: string, mimeType: string): Promise<string> {
  const { url } = await put(`prendas/${nombreArchivo}`, buffer, {
    access: 'public',
    contentType: mimeType,
    addRandomSuffix: true,
  });
  return url;
}
