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

/**
 * Estados de la solicitud de material y de la solicitud de la OT (tipo de estado "Solicitud y asignación MP" del API,
 * EstadoEnum.SolicitudMp*). Una OT puede tener varias solicitudes.
 */
export enum EstadoSolicitudMaterial {
  /** Sin material asignado. */
  Pendiente = 56,
  /** Con material que no cubre lo solicitado (en la OT: aún no llega al tope con el adicional). */
  Parcial = 57,
  /** Solicitud: recibió todo lo que pidió o su OT se completó. OT: llegó al tope o se completó a mano. No se deshace. */
  Completada = 58,
  /** Se cerró la asignación de materiales de la OT. */
  Finalizada = 59,
  /** El solicitante comprobó físicamente lo recibido para la OT. */
  Verificada = 60,
  Cancelada = 61,
}

/** Roles que completan y finalizan la solicitud de la OT: ADMINISTRADOR (1), asignador (3) y solicitante (85). Policy GestionarSolicitudOT del API. */
export const ROLES_GESTIONAR_SOLICITUD_OT: number[] = [1, 3, 85];

/** Roles que verifican la solicitud de la OT finalizada: ADMINISTRADOR (1) y solicitante (85). Policy VerificarSolicitudMaterial del API. */
export const ROLES_VERIFICAR_SOLICITUD: number[] = [1, 85];

/** Roles que pueden consultar y editar solicitudes ya creadas: solo ADMINISTRADOR. Policy EditarSolicitudMaterial del API. */
export const ROLES_EDITAR_SOLICITUD: number[] = [1];

/** Roles que eligen el proceso de la solicitud (no tienen un proceso fijo por su rol). */
export const ROLES_ELEGIR_PROCESO: number[] = [1, 104];

/** Roles que asignan material y pueden cancelar solicitudes. Policy GestionarSolicitudMaterial del API. */
export const ROLES_GESTIONAR_SOLICITUD: number[] = [1, 3, 7, 104];

/** Roles que ven el PDF de la solicitud en el reporte: quienes asignan y quienes verifican. */
export const ROLES_VER_PDF_SOLICITUD: number[] = [1, 3, 7, 104, 85];

/** Indica si la solicitud (o la solicitud de la OT) está activa: pendiente o parcial. */
export const solicitudActiva = (estado: number): boolean =>
  [EstadoSolicitudMaterial.Pendiente, EstadoSolicitudMaterial.Parcial].includes(Number(estado));

/** Indica si la solicitud ya no admite ediciones ni asignaciones (completada, finalizada, verificada o cancelada). */
export const solicitudCerrada = (estado: number): boolean => !solicitudActiva(estado);

/**
 * Indica por qué la solicitud de la OT no admite solicitudes del proceso indicado (igual que el API), o null si las admite.
 * Completada no admite más materia prima (Extrusión); finalizada o verificada no admite nada.
 */
export function motivoOTCerrada(estadoOT: number | null | undefined, proceso: string, ot: number): string | null {
  if (estadoOT === EstadoSolicitudMaterial.Finalizada || estadoOT === EstadoSolicitudMaterial.Verificada)
    return `La asignación de materiales de la OT N° ${ot} ya está finalizada; no admite más solicitudes.`;
  if (estadoOT === EstadoSolicitudMaterial.Completada && proceso === 'EXT')
    return `La OT N° ${ot} ya está completada; no admite más solicitudes de materia prima.`;
  return null;
}

/** Cantidad de solicitudes de una OT en un estado. */
export interface ConteoEstadoOT {
  estado_Id: number;
  estado: string;
  cantidad: number;
}

/** Avance y estado de la solicitud de la OT (GET SolicitudesExtrusion/ot/{ot}). */
export interface ResumenSolicitudOT {
  ot: number;
  /** Kg de la OT (umbral, sin el adicional); null si aún no se conocen. */
  kgOT: number | null;
  /** Kg de la OT más el adicional. */
  topeKgOT: number | null;
  estado_Id: number;
  estado: string;
  /** Kg netos asignados a la OT (materia prima más BOPP, menos devoluciones). */
  kgAsignados: number;
  /** Kg de materia prima solicitados en las solicitudes no canceladas. */
  kgSolicitados: number;
  /** Kg solicitados que aún no se asignan en las solicitudes activas. */
  kgPendientesPorAsignar: number;
  umbralAlcanzado: boolean;
  topeAlcanzado: boolean;
  solicitudes: ConteoEstadoOT[];
  puedeCompletar: boolean;
  puedeFinalizar: boolean;
  puedeVerificar: boolean;
  fechaCompletada: string | null;
  /** Null si se completó sola al llegar al tope. */
  usuarioCompleta: string | null;
  fechaFinalizada: string | null;
  usuarioFinaliza: string | null;
  fechaVerificada: string | null;
  usuarioVerifica: string | null;
}

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
  /** Kg de la OT en BagPro, sin el adicional (umbral de la solicitud de la OT). */
  KgOT?: number | null;
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
  /** Kg de la OT en BagPro, sin el adicional (umbral de la solicitud de la OT). */
  KgOT?: number | null;
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
  /** Cancelación: motivo, fecha y quién la canceló (null si no está cancelada o se canceló antes de guardarse el motivo). */
  motivoCancelacion?: string | null;
  fechaCancelacion?: string | null;
  usuarioCancela?: string | null;
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
  /** Estado de la solicitud de la OT (todas las solicitudes de la OT). */
  estadoOT_Id: number | null;
  estadoOT: string | null;
  usua_Id: number;
  usuario: string;
  fecha: string;
  hora: string;
  fechaEntrega: string | null;
  observacion: string | null;
  maquinaPrincipal: number;
  /** Total solicitado de la solicitud (suma de sus subcategorías). */
  totalSolicitado: number;
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
  /** Kg de la OT en BagPro, sin el adicional (umbral de la solicitud de la OT). */
  KgOT?: number | null;
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

/**
 * Retraso (ms) de los tooltips de información o ayuda (y de los botones que piden confirmación) en Solicitud, Movimientos
 * y Asignación de materia prima. Los de botones que hacen su acción de inmediato salen sin retraso.
 */
export const RETRASO_TOOLTIP_AYUDA_MS = 1500;

/** Formato de números del flujo de material: punto decimal y coma de miles (1,234.56), igual que el pipe number y los campos. */
export const LOCALE_NUMEROS = 'en-US';
const FORMATO_NUMERO = new Intl.NumberFormat(LOCALE_NUMEROS, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function formatoNumero(valor: number | null | undefined): string {
  return FORMATO_NUMERO.format(Number(valor) || 0);
}
