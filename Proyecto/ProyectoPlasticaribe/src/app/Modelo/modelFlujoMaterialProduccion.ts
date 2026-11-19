/** Tipos del flujo Solicitud de material de producción → Asignación de materia prima. */

/** Tipo de material que se descuenta del inventario (coincide con el enum del API). */
export enum TipoMaterialInventario {
  MateriaPrima = 1,
  Tinta = 2,
}

/**
 * Convierte el tipo de material que devuelve el API al enum numérico del front. El API serializa los enums como
 * texto (JsonStringEnumConverter: "MateriaPrima" / "Tinta"), así que compararlo directo con el enum nunca coincide.
 */
export function aTipoMaterial(valor: unknown): TipoMaterialInventario {
  if (valor === TipoMaterialInventario.Tinta || valor === 'Tinta' || valor === '2') return TipoMaterialInventario.Tinta;
  return TipoMaterialInventario.MateriaPrima;
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
  /** Finalizada y revisada por un administrador o superior de extrusión. */
  Verificada = 55,
}

/** Roles que pueden marcar una solicitud finalizada como verificada: ADMINISTRADOR (1) y SUPERIOR EXTRUSION 2 (85). Policy VerificarSolicitudMaterial del API. */
export const ROLES_VERIFICAR_SOLICITUD: number[] = [1, 85];

/** Roles que pueden consultar y editar solicitudes ya creadas: solo ADMINISTRADOR. Policy EditarSolicitudMaterial del API. */
export const ROLES_EDITAR_SOLICITUD: number[] = [1];

/** Roles que eligen el proceso de la solicitud (no tienen un proceso fijo por su rol). */
export const ROLES_ELEGIR_PROCESO: number[] = [1, 104];

/** Roles que asignan material y pueden finalizar o cancelar solicitudes. Policy GestionarSolicitudMaterial del API. */
export const ROLES_GESTIONAR_SOLICITUD: number[] = [1, 3, 7, 104];

/** Roles que ven el PDF de la solicitud en el reporte: quienes asignan y quienes verifican. */
export const ROLES_VER_PDF_SOLICITUD: number[] = [1, 3, 7, 104, 85];

/** Indica si la solicitud ya no admite ediciones ni asignaciones (cancelada, finalizada o verificada). */
export const solicitudCerrada = (estado: number): boolean =>
  [EstadoSolicitudMaterial.Cancelada, EstadoSolicitudMaterial.Finalizada, EstadoSolicitudMaterial.Verificada].includes(Number(estado));

/** Estados de la OT en BagPro en los que está cerrada y no admite solicitudes ni asignaciones. */
export const ESTADOS_OT_CERRADA: number[] = [1, 4];

/** Material elegido dentro de una subcategoría de la solicitud. */
export interface MaterialSolicitudRequest {
  TipoMaterial: TipoMaterialInventario;
  MaterialId: number;
  Cantidad: number;
}

/** Subcategoría y cantidad de una solicitud; la cantidad es la suma de sus materiales. */
export interface DetalleSolicitudRequest {
  SubCatMP_Id: number;
  Cantidad: number;
  UndMed_Id: string;
  /** Materiales de la subcategoría. Las subcategorías de solicitudes anteriores no tienen (null). */
  Materiales: MaterialSolicitudRequest[] | null;
}

/** Máquina de la solicitud y el porcentaje del material que le corresponde (suman 100). */
export interface MaquinaSolicitudRequest {
  Maquina: number;
  Porcentaje: number;
}

/** Datos para crear una solicitud de material. */
export interface CrearSolicitudRequest {
  OrdenTrabajo: number;
  Maquinas: MaquinaSolicitudRequest[];
  ProcesoId: string;
  Observacion?: string;
  FechaEstimadaEntrega: string;
  ConfirmarSaldoNegativo: boolean;
  /** Kg máximos de la OT (kg de la OT más el adicional). Obligatorio en Extrusión. */
  LimiteKgOT?: number | null;
  /** El usuario con permiso confirmó superar el límite de kg de la OT. */
  ConfirmarExcesoLimite: boolean;
  Detalles: DetalleSolicitudRequest[];
}

/** Datos para editar una solicitud de material activa. */
export interface EditarSolicitudRequest {
  Maquinas: MaquinaSolicitudRequest[];
  Observacion?: string;
  FechaEstimadaEntrega: string;
  ConfirmarSaldoNegativo: boolean;
  /** Kg máximos de la OT (kg de la OT más el adicional). Obligatorio en Extrusión. */
  LimiteKgOT?: number | null;
  /** El usuario con permiso confirmó superar el límite de kg de la OT. */
  ConfirmarExcesoLimite: boolean;
  Detalles: DetalleSolicitudRequest[];
}

/** Material de una subcategoría en el detalle de una solicitud (GET SolicitudesExtrusion/{id}). */
export interface MaterialDetalleSolicitud {
  tipoMaterial: TipoMaterialInventario;
  materialId: number;
  nombre: string;
  undMed_Id: string;
  stock: number;
  /** 0 si se entregó sin pedirse (sustituto). */
  solicitado: number;
  entregado: number;
  esSustituto: boolean;
}

/** Subcategoría en el detalle de una solicitud. */
export interface SubcategoriaDetalleSolicitud {
  codigo: number;
  subCatMP_Id: number;
  nombre: string;
  undMed_Id: string;
  solicitado: number;
  entregado: number;
  faltante: number;
  stock: number;
  disponible: number;
  /** False en las solicitudes anteriores, que se pedían solo por subcategoría. */
  conMateriales: boolean;
  materiales: MaterialDetalleSolicitud[];
}

/** Solicitud completa con sus máquinas, subcategorías y materiales. */
export interface DetalleSolicitudMaterial {
  id: number;
  ot: number;
  proceso_Id: string;
  proceso: string;
  estado_Id: number;
  estado: string;
  usua_Id: number;
  usuario: string;
  fecha: string;
  hora: string;
  fechaEntrega: string | null;
  observacion: string | null;
  maquinas: MaquinaDetalleSolicitud[];
  subcategorias: SubcategoriaDetalleSolicitud[];
  /** Asignaciones de la solicitud, de la más reciente a la más antigua. */
  asignaciones?: AsignacionDeSolicitud[];
}

/** Asignación de una solicitud (para generar sus PDF). */
export interface AsignacionDeSolicitud {
  id: number;
  fecha: string;
  hora: string | null;
  maquina: number;
  cantidad: number;
  conMateriasPrimas: boolean;
  conTintas: boolean;
}

/** Máquina de una solicitud con su parte del material (informativa) y lo ya entregado a ella. */
export interface MaquinaDetalleSolicitud {
  maquina: number;
  porcentaje: number;
  /** Lo que le toca del total solicitado (total × porcentaje). */
  objetivo: number;
  /** Lo entregado a esta máquina en las asignaciones de la solicitud. */
  entregado: number;
}

/** Material de una asignación en su PDF (GET Asignacion_MatPrima/{id}/pdf). */
export interface MaterialAsignadoPdf {
  tipoMaterial: TipoMaterialInventario | string;
  materialId: number;
  nombre: string;
  undMed_Id: string;
  /** Lo solicitado de este material (0 en asignaciones manuales o si es sustituto). */
  solicitado: number;
  /** Lo entregado en las asignaciones anteriores de la misma solicitud. */
  entregadoAntes: number;
  estaAsignacion: number;
  esSustituto: boolean;
}

/** Subcategoría de una asignación en su PDF, con sus materiales. */
export interface SubcategoriaAsignadaPdf {
  /** 0 para los materiales sin subcategoría. */
  subCatMP_Id: number;
  nombre: string;
  undMed_Id: string;
  solicitado: number;
  entregadoAntes: number;
  estaAsignacion: number;
  /** Lo que falta de la solicitud después de esta asignación. */
  faltante: number;
  materiales: MaterialAsignadoPdf[];
}

/** Solicitud de la que viene una asignación, con lo entregado por máquina hasta esa asignación. */
export interface SolicitudDeAsignacionPdf {
  id: number;
  estado: string | null;
  maquinas: MaquinaDetalleSolicitud[];
}

/** Datos del PDF de una asignación de materia prima y tintas. */
export interface DatosPdfAsignacion {
  id: number;
  ot: number;
  maquina: number;
  fecha: string;
  hora: string | null;
  fechaReal: string | null;
  usuario: string;
  observacion: string | null;
  /** Null en las asignaciones manuales (sin solicitud o con la genérica). */
  solicitud: SolicitudDeAsignacionPdf | null;
  subcategorias: SubcategoriaAsignadaPdf[];
}

/** Fila de la consulta de solicitudes (GET SolicitudesExtrusion/consulta). */
export interface SolicitudConsultada {
  id: number;
  ot: number;
  proceso_Id: string;
  proceso: string;
  estado_Id: number;
  estado: string;
  usua_Id: number;
  usuario: string;
  fecha: string;
  hora: string;
  fechaEntrega: string | null;
  observacion: string | null;
  maquinaPrincipal: number;
  maquinas: { maquina: number; porcentaje: number }[];
}

/** Filtros de la consulta de solicitudes. */
export interface FiltrosConsultaSolicitudes {
  desde?: string;
  hasta?: string;
  id?: number;
  ot?: number;
  estados?: number[];
  soloMias?: boolean;
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

/** Formato de números del flujo de material: punto decimal y coma de miles (1,234.56), igual que el pipe number y los campos. */
export const LOCALE_NUMEROS = 'en-US';
const FORMATO_NUMERO = new Intl.NumberFormat(LOCALE_NUMEROS, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function formatoNumero(valor: number | null | undefined): string {
  return FORMATO_NUMERO.format(Number(valor) || 0);
}
