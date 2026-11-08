/**
 * Contrato de crear y editar una OT completa (PlasticaribeAPI, Orden_TrabajoController: crearCompleta y editarCompleta).
 * Refleja los DTOs de PlasticaribeAPI/DTOs/OrdenTrabajoCompletaDtos.cs. Solo datos planos, sin navegaciones ni Ids de
 * procesos: el número de OT, el creador (token), la fecha, la hora y el estado inicial los fija el servidor.
 */

/** Campos de la OT comunes a crear y editar (lista blanca de edición). */
export interface OrdenTrabajoDatosBase {
  /** Cantidad pedida en la presentación de la OT; debe ser mayor que 0. */
  Ot_CantidadPedida: number;
  /** Precio por unidad de la presentación; no puede ser negativo. */
  Ot_ValorUnidad: number;
  /** Margen adicional en porcentaje; no puede ser negativo. */
  Ot_MargenAdicional: number;
  /** Peso neto en kilos calculado en el front; el servidor lo valida. */
  Ot_PesoNetoKg: number;
  /** Valor del kilo calculado en el front; el servidor lo valida (en MTS lo fija el servidor). */
  Ot_ValorKg: number;
  /** Valor total de la OT (cantidad × precio); el servidor lo valida. */
  Ot_ValorOT: number;
  Extrusion: boolean;
  Impresion: boolean;
  /** Proceso descontinuado; se conserva la columna. */
  Rotograbado: boolean;
  Laminado: boolean;
  Ot_Corte: boolean;
  Sellado: boolean;
  Ot_Cyrel: boolean;
  Mezcla_Id: number;
  /** Vendedor (Usua_Id) de la OT. */
  Id_Vendedor: number;
  Ot_Observacion: string | null;
  MotrarEmpresaEtiquetas: boolean;
  /** Fecha de entrega (YYYY-MM-DD); obligatoria y no anterior a la fecha de creación. */
  Ot_FechaEntrega: string | null;
}

/** Datos generales para crear una OT. */
export interface CrearOrdenTrabajoDatos extends OrdenTrabajoDatosBase {
  /** Sede del cliente (SedeCli_Id). */
  SedeCli_Id: number;
  /** Producto (item) de la OT. */
  Prod_Id: number;
  /** Presentación; al crear solo se permiten Kg, Paquete, Und y MTS. */
  UndMed_Id: string;
  /** Pedido externo asociado (517: sin pedido). */
  PedExt_Id: number;
}

/**
 * Datos generales para editar una OT. Producto, presentación, sede y estado no se pueden cambiar: si se envían y
 * difieren de los guardados, la API responde 422. Se envían solo para que la API compruebe que no cambiaron.
 */
export interface EditarOrdenTrabajoDatos extends OrdenTrabajoDatosBase {
  SedeCli_Id?: number | null;
  Prod_Id?: number | null;
  UndMed_Id?: string | null;
  Estado_Id?: number | null;
}

/** Datos del proceso de extrusión (sin Ids ni navegaciones). */
export interface OtExtrusionDatos {
  Material_Id: number;
  Formato_Id: number;
  Pigmt_Id: number;
  Extrusion_Calibre: number;
  Extrusion_Ancho1: number;
  Extrusion_Ancho2: number;
  Extrusion_Ancho3: number;
  /** Unidad de medida de extrusión (Cms o Plgs). */
  UndMed_Id: string;
  Tratado_Id: number;
  Extrusion_Peso: number;
  Extrusion_Grafilado: boolean | null;
  Extrusion_Observacion: string | null;
}

/** Datos del proceso de impresión (sin Ids ni navegaciones). */
export interface OtImpresionDatos {
  TpImpresion_Id: number;
  Rodillo_Id: number;
  Pista_Id: number;
  Tinta1_Id: number;
  Tinta2_Id: number;
  Tinta3_Id: number;
  Tinta4_Id: number;
  Tinta5_Id: number;
  Tinta6_Id: number;
  Tinta7_Id: number;
  Tinta8_Id: number;
  Impresion_Observacion: string | null;
}

/** Datos del proceso de laminado (sin Ids ni navegaciones). */
export interface OtLaminadoDatos {
  Capa_Id1: number;
  Capa_Id2: number;
  Capa_Id3: number;
  LamCapa_Calibre1: number;
  LamCapa_Calibre2: number;
  LamCapa_Calibre3: number;
  LamCapa_Cantidad1: number;
  LamCapa_Cantidad2: number;
  LamCapa_Cantidad3: number;
  Laminado_Observacion: string | null;
}

/** Datos del proceso de sellado o corte (sin Ids ni navegaciones). */
export interface OtSelladoCorteDatos {
  Corte: boolean;
  Sellado: boolean;
  /** Formato del producto terminado (Tipos_Productos.TpProd_Id); su nombre decide la regla D2 en el servidor. */
  Formato_Id: number;
  SelladoCorte_Ancho: number;
  SelladoCorte_Largo: number;
  SelladoCorte_Fuelle: number | null;
  SelladoCorte_Solapa: number | null;
  SelladoCorte_Ancho1: number | null;
  SelladoCorte_Ancho2: number | null;
  SelladoCorte_Ancho3: number | null;
  /** Peso millar del producto (base del cálculo de costos). */
  SelladoCorte_PesoMillar: number;
  TpSellado_Id: number;
  SelladoCorte_PrecioSelladoDia: number;
  SelladoCorte_PrecioSelladoNoche: number;
  /** Bolsas por paquete; la que se guarda y la que usa el cálculo del Valor Kg de Paquete (H-C). */
  SelladoCorte_CantBolsasPaquete: number;
  SelladoCorte_CantBolsasBulto: number;
  SelladoCorte_PesoPaquete: number;
  SelladoCorte_PesoBulto: number;
  SelladoCorte_PesoProducto: number;
  SelladoCorte_Etiqueta_Ancho: string;
  SelladoCorte_Etiqueta_Largo: string;
  SelladoCorte_Etiqueta_Fuelle: string;
  SelladoCorte_PrecioDia_Wik_Mq50: number;
  SelladoCorte_PrecioNoche_Wik_Mq50: number;
  SelladoCorte_PrecioDia_Wik_Mq9: number;
  SelladoCorte_PrecioNoche_Wik_Mq9: number;
  SelladoCorte_Observacion: string | null;
  SelladoCorte_Calibre: number | null;
}

/** Información de los cuatro procesos de la OT. */
export interface ProcesosOrdenTrabajo {
  Extrusion: OtExtrusionDatos;
  Impresion: OtImpresionDatos;
  Laminado: OtLaminadoDatos;
  SelladoCorte: OtSelladoCorteDatos;
}

/** Solicitud de crearCompleta. */
export interface CrearOrdenTrabajoCompleta extends ProcesosOrdenTrabajo {
  OrdenTrabajo: CrearOrdenTrabajoDatos;
}

/** Solicitud de editarCompleta. */
export interface EditarOrdenTrabajoCompleta extends ProcesosOrdenTrabajo {
  /** Versión de la fila (base64) recibida al consultar la OT (getOrdenTrabajo, rowVersion); si cambió, la API responde 409. */
  Ot_RowVersion: string;
  OrdenTrabajo: EditarOrdenTrabajoDatos;
}

/** Respuesta de crearCompleta (201) y editarCompleta (200). */
export interface RespuestaOrdenTrabajoCompleta {
  ot_Id: number;
  numero_OT: number;
}
