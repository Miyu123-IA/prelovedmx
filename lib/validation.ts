import { z } from 'zod';

export const medidasSchema = z.object({
  largo_cm: z.number().optional(),
  pecho_cm: z.number().optional(),
  cintura_cm: z.number().optional(),
  cadera_cm: z.number().optional(),
  manga_cm: z.number().optional(),
  nota: z.string().optional(),
});

export const estadoSchema = z.object({
  puntuacion: z.number().min(1).max(10),
  nota: z.string().optional(),
});

export const consignatarioSchema = z.object({
  nombre: z.string().min(1),
  porcentaje: z.number().min(0).max(100),
});

export const nuevoProductoSchema = z.object({
  nombre: z.string().min(1),
  marca: z.string().min(1),
  genero: z.enum(['hombre', 'mujer', 'unisex']),
  categoria: z.enum([
    'playeras',
    'camisas',
    'blusas',
    'pantalones',
    'chamarras',
    'vestidos',
    'sudaderas',
    'shorts',
    'faldas',
    'accesorios',
  ]),
  talla: z.string().min(1),
  medidas: medidasSchema.default({}),
  estado: estadoSchema,
  material: z.string().min(1),
  color: z.string().min(1),
  precio_venta: z.number().positive(),
  precio_costo: z.number().min(0),
  origen: z.enum(['donacion', 'consignacion']),
  consignatario: consignatarioSchema.optional(),
  fotos: z.array(z.string()).default([]),
  estatus: z.enum(['disponible', 'apartado', 'vendido']).optional(),
  fecha_ingreso: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

export const ofertaSchema = z.object({
  nombre: z.string().min(1),
  telefono: z.string().min(7),
  email: z.string().email().optional().or(z.literal('')),
  descripcion: z.string().min(5),
  modalidad: z.enum(['donacion', 'consignacion', 'no_seguro']),
  fotos: z.array(z.string()).default([]),
});

export const checkoutSchema = z.object({
  nombre: z.string().min(1),
  telefono: z.string().min(7),
  entrega: z.enum(['recoger', 'envio']),
  direccion: z.string().optional(),
  items: z.array(z.string()).min(1),
});
