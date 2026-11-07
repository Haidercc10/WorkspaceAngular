/** Tipos del flujo Solicitud de material de producción → Asignación de materia prima. */

/** Tipo de material que se descuenta del inventario (coincide con el enum del API). */
export enum TipoMaterialInventario {
  MateriaPrima = 1,
  Tinta = 2,
}

/** Porcentaje adicional de kg que se permite solicitar y asignar sobre los kg de la OT. */
export const ADICIONAL_KG_OT = 0.05;

/** Roles que pueden superar el límite de kg de una OT (policy ExcederLimiteOT del API). */
export const ROLES_EXCEDER_LIMITE_OT: number[] = [1, 104];

/** Estados de la solicitud de material. */
export enum EstadoSolicitudMaterial {
  Cancelada = 4,
  Finalizada = 5,
  Pendiente = 11,
  Parcial = 12,
}

/** Subcategoría y cantidad de una solicitud. */
export interface DetalleSolicitudRequest {
  SubCatMP_Id: number;
  Cantidad: number;
  UndMed_Id: string;
}

/** Datos para crear una solicitud de material. */
export interface CrearSolicitudRequest {
  OrdenTrabajo: number;
  Maquina: number;
  ProcesoId: string;
  Observacion?: string;
  FechaEstimadaEntrega?: string | null;
  ConfirmarSaldoNegativo: boolean;
  Detalles: DetalleSolicitudRequest[];
}

/** Datos para editar una solicitud de material activa. */
export interface EditarSolicitudRequest {
  Maquina: number;
  Observacion?: string;
  FechaEstimadaEntrega?: string | null;
  ConfirmarSaldoNegativo: boolean;
  Detalles: DetalleSolicitudRequest[];
}

/** Existencia, reserva y disponibilidad informativa de una subcategoría. */
export interface ReservaInventario {
  subCatMP_Id: number;
  subCatMP_Nombre: string;
  tipo: TipoMaterialInventario;
  existencia: number;
  reservaPendiente: number;
  disponible: number;
}

/** Advertencia de disponibilidad que devuelve el API con un 409. */
export interface AdvertenciaDisponibilidad {
  subCatMP_Id: number;
  nombre: string;
  solicitado: number;
  aumento: number;
  disponible: number;
}

/** Material a asignar. */
export interface MaterialAsignacionRequest {
  TipoMaterial: TipoMaterialInventario;
  MaterialId: number;
  Cantidad: number;
  ProcesoId: string;
}

/** Datos para registrar una asignación completa en una sola operación. */
export interface RegistrarAsignacionRequest {
  OrdenTrabajo: number;
  Maquina: number;
  Observacion?: string;
  FechaRealEntrega: string;
  SolicitudId?: number | null;
  ProductoId: number;
  CantidadPedidaOT: number;
  UnidadMedidaOT: string;
  LimiteKgOT: number;
  ConfirmarExceso: boolean;
  Materiales: MaterialAsignacionRequest[];
}

/** Respuesta del registro de una asignación (también llega en el cuerpo de los errores). */
export interface RegistrarAsignacionResult {
  statusCode: number;
  mensaje: string;
  asignacionId?: number;
  estadoSolicitud?: number;
  requiereAutorizacion: boolean;
  excesoKg?: number;
}

/** Solicitud de autorización de exceso pendiente de respuesta. */
export interface AutorizacionExcesoPendiente {
  autEx_Id: number;
  autEx_OrdenTrabajo: number;
  autEx_CantidadKg: number;
  autEx_Motivo: string;
  usuarioSolicitaId: number;
  usuarioSolicita: string;
  autEx_FechaSolicitudUtc: string;
}

/** Material asignado o devuelto en una OT (materia prima, tinta o BOPP). */
export interface MaterialAsignadoOT {
  tipo: 'MP' | 'TINTA' | 'BOPP';
  id: number;
  nombre: string;
  /** Siempre positiva; si es devolución resta de lo asignado. */
  cantidad: number;
  undMedida: string;
  precio: number;
  subTotal: number;
  procesoId: string;
  proceso: string;
  esDevolucion: boolean;
}
