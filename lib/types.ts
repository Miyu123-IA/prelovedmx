export type Genero = 'hombre' | 'mujer' | 'unisex';

export type Categoria =
  | 'playeras'
  | 'camisas'
  | 'pantalones'
  | 'chamarras'
  | 'vestidos'
  | 'sudaderas'
  | 'shorts'
  | 'faldas'
  | 'accesorios';

export type Origen = 'donacion' | 'consignacion';

export type Estatus = 'disponible' | 'apartado' | 'vendido';

export interface Consignatario {
  nombre: string;
  porcentaje: number;
}

export interface Medidas {
  largo_cm?: number;
  pecho_cm?: number;
  cintura_cm?: number;
  cadera_cm?: number;
  manga_cm?: number;
  nota?: string;
}

export interface Estado {
  puntuacion: number; // 1-10
  nota?: string; // defectos honestos, ej. "leve decoloración en manga izquierda"
}

export interface Producto {
  id: string;
  nombre: string;
  marca: string;
  genero: Genero;
  categoria: Categoria;
  talla: string;
  medidas: Medidas;
  estado: Estado;
  material: string;
  color: string;
  precio_venta: number;
  precio_costo: number;
  origen: Origen;
  consignatario?: Consignatario;
  fotos: string[];
  estatus: Estatus;
  fecha_ingreso: string; // ISO date
  tags: string[];
}

export type NuevoProducto = Omit<Producto, 'id' | 'fecha_ingreso' | 'estatus'> & {
  estatus?: Estatus;
  fecha_ingreso?: string;
};

export interface OfertaConsignacion {
  id: string;
  nombre: string;
  telefono: string;
  email?: string;
  descripcion: string;
  modalidad: 'donacion' | 'consignacion' | 'no_seguro';
  fotos: string[];
  fecha: string;
  estatus: 'nueva' | 'contactado' | 'cerrada';
}

export interface FiltrosProducto {
  genero?: Genero;
  marca?: string;
  talla?: string;
  categoria?: Categoria;
  precioMin?: number;
  precioMax?: number;
  estadoMin?: number;
  estatus?: Estatus;
  q?: string;
  orden?: 'recientes' | 'precio_asc' | 'precio_desc';
}
