/** Presentaciones de BagPro con las que se puede crear un item. */
export type PresentacionItem = 'Kilo' | 'Unidad' | 'Paquete' | 'MTS';

/** Capa de laminado de la ficha técnica (LamCapaN, LamCalibreN, cantN de BagPro). */
export interface CapaLaminadoItem {
  capa: number;
  calibre?: number | null;
  cantidad?: number | null;
}

/**
 * Ficha técnica para crear un item en BagPro (`POST api/ClientesOtItems/crear`).
 * Los códigos de catálogo son los de BagPro.
 */
export interface CrearItemDto {
  cliente: number;
  clienteNom: string;
  nombre: string;
  formato: number;
  formatoExtrusion?: number | null;
  material: number;
  pigmento?: number | null;
  tratado?: number | null;
  unidad: number;
  ancho: number;
  largo: number;
  fuelle: number;
  calibre: number;
  anchoExtrusion1?: number | null;
  anchoExtrusion2?: number | null;
  anchoExtrusion3?: number | null;
  extrusion: boolean;
  impresion: boolean;
  laminado: boolean;
  rotograbado: boolean;
  corte: boolean;
  sellado: boolean;
  cyrel: boolean;
  tipoImpresion?: number | null;
  rodillo?: number | null;
  pista?: number | null;
  tintas?: number[];
  capasLaminado?: CapaLaminadoItem[];
  tipoSellado?: number | null;
  cantidadPaquete?: number | null;
  cantidadBulto?: number | null;
  pesoMillar?: number | null;
  peso?: number | null;
  presentacion: PresentacionItem;
  precio: number;
  vendedor?: string | null;
  observacion?: string | null;
}

/** Ficha de un item existente (`GET api/ClientesOtItems/{codigo}/ficha`). */
export interface FichaItem extends Omit<CrearItemDto, 'presentacion' | 'precio'> {
  clienteItems: number;
  presentacion?: string | null;
  precio?: number | null;
  formatoNom?: string | null;
  formatoExtrusionNom?: string | null;
  materialNom?: string | null;
  pigmentoNom?: string | null;
  tratadoNom?: string | null;
  unidadNom?: string | null;
  tipoImpresionNom?: string | null;
  tipoSelladoNom?: string | null;
}

/** Respuesta de la creación de un item o de una presentación en BagPro. */
export interface ItemCreado {
  clienteItems: number;
  nombre: string;
  presentacion: string;
}

/** Presentación de un item en BagPro (`GET api/ClientesOtItems/{codigo}/presentaciones`). */
export interface PresentacionBagPro {
  presentacion: string;
  codigoPresentacion: string | null;
  precio: number | null;
  /** Nombre del item tal como está guardado (ClienteItemsNom). */
  nombre?: string | null;
  /** Nombre del cliente (ClienteNom). */
  clienteNom?: string | null;
}

/** Item encontrado por nombre o código (`GET api/ClientesOtItems/buscar?texto=`). */
export interface ItemBusqueda {
  codigo: number;
  nombre: string;
  /** Texto que muestra el autocompletado: "código - nombre". */
  etiqueta?: string;
}

/** Artículo de Zeus de un producto en una presentación (`GET api/Producto/{codigo}/articulosZeus`). */
export interface ArticuloZeus {
  codigo: string;
  presentacion: string;
  nombre: string | null;
  descripcion: string | null;
  grupo: string | null;
  grupoFacturacion: string | null;
  precio: number | null;
  costo: number | null;
}

/** Duplicado devuelto por BagPro con 409. */
export interface ItemDuplicado {
  tipo: 'nombre' | 'ficha';
  codigo: number;
  nombre: string;
}

/** Resultado de crear el artículo en Zeus (`POST api/Producto/{codigo}/articuloZeus/{presentacion}`). */
export interface ArticuloZeusCreado {
  creado: boolean;
  yaExistia: boolean;
}
