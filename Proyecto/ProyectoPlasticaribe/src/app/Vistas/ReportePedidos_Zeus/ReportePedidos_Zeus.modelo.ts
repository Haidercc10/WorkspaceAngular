import moment from 'moment';

/*
 * Modelo y funciones puras del módulo "Pedidos de Productos" (ReportePedidos_Zeus).
 * Sin dependencias de Angular para poder probarlas y reutilizarlas (tabla, KPI, gráficas, PDF y Excel).
 */

/** Semáforo de facturación de una línea o de un pedido completo. */
export type Semaforo = 'completo' | 'parcial' | 'sinStock';

/** Línea (ítem) de un pedido de Zeus, con los valores ya numéricos. */
export interface PedidoZeusLinea {
  id: number;
  consecutivo: string;
  nitCliente: string;
  cliente: string;
  ciudad: string;
  departamento: string;
  municipio: string;
  id_Producto: string;
  producto: string;
  cant_Pedida: number;
  cant_Facturada: number;
  cant_Pendiente: number;
  existencias: number;
  presentacion: string;
  precioUnidad: number;
  costo_Cant_Pendiente: number;
  costo_Cant_Total: number;
  estado: string;
  idVendedor: string;
  vendedor: string;
  orden_Compra_CLiente: string;
  fecha_Creacion: string;
  fecha_Entrega: string;
  fecha_Factura: string;
  /** La línea se puede facturar ya: stock ≥ pendiente. */
  facturable: boolean;
  /** Semáforo del pedido al que pertenece la línea (se repite en todas sus líneas). */
  semaforoPedido: Semaforo;
  /** Fecha de entrega anterior a hoy. */
  vencido: boolean;
  /** Días que faltan para la entrega (negativo si está vencido). */
  diasEntrega: number;
  /**
   * Días de atraso: solo si está vencido y la fecha de entrega es distinta a la de creación
   * (cuando son iguales la entrega no fue pactada y el atraso no es real). null en otro caso.
   */
  diasVencido: number | null;
  OT: string;
  Estado_OT: number | null;
  Proceso_OT: string;
  /** Texto normalizado para la búsqueda global (pedido, cliente, ítem, producto, OC y OT). */
  busqueda: string;
}

/** Arma el texto de búsqueda de una línea (se recalcula cuando llega la OT). */
export function textoBusqueda(l: PedidoZeusLinea): string {
  return normalizar(`${l.consecutivo} ${l.cliente} ${l.nitCliente} ${l.id_Producto} ${l.producto} ${l.orden_Compra_CLiente} ${l.OT}`);
}

/** Encabezado de un pedido (lo que se muestra en la fila de grupo de la tabla). */
export interface ResumenPedido {
  consecutivo: string;
  cliente: string;
  ciudad: string;
  fechaEntrega: string;
  vencido: boolean;
  /** Días de atraso de la línea con la entrega más antigua (ver PedidoZeusLinea.diasVencido). */
  diasVencido: number | null;
  totalPendiente: number;
  totalPedido: number;
  items: number;
  semaforo: Semaforo;
}

/** Lo que devuelve /Estados_ProcesosOT/getOtsForSalesOrder por cada línea (o null). */
export interface OtDePedido {
  ot: number;
  consecutivo: string;
  item: number;
  status: number;
  extrusion: number;
  impresión: number;
  rotograbado: number;
  laminado: number;
  corte: number;
  doblado: number;
  empaque: number;
  selladoUnd: number;
  selladoKg: number;
  wiketiadoUnd: number;
  wiketiadoKg: number;
}

const numero = (valor: any): number => Number(valor) || 0;
const fecha = (valor: any): string => valor ? String(valor).substring(0, 10) : '';

/** Quita tildes, espacios sobrantes y pasa a minúscula, para comparar nombres de lugares. */
export function normalizar(texto: string | null | undefined): string {
  return (texto ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();
}

/**
 * Nombres de municipios que en Zeus y en el DANE se escriben distinto (clave y valor normalizados).
 * La clave es como viene en Zeus; el valor, como viene en datos.gov.co.
 */
const ALIAS_MUNICIPIOS: Record<string, string> = {
  'cartagena': 'cartagena de indias',
  'bogota': 'bogota, d.c.',
  'bogota d.c.': 'bogota, d.c.',
  'bogota dc': 'bogota, d.c.',
};

/** Nombre normalizado de un municipio, aplicando los alias conocidos. */
export function normalizarMunicipio(texto: string | null | undefined): string {
  const nombre = normalizar(texto);
  return ALIAS_MUNICIPIOS[nombre] ?? nombre;
}

/**
 * La vista CLIENTES de Zeus entrega la ciudad como "Departamento-Municipio" (p. ej. "Antioquia-Bello").
 * Si no trae guion, se toma todo como municipio.
 */
export function parsearCiudad(ciudad: string | null | undefined): { departamento: string; municipio: string } {
  const texto = (ciudad ?? '').trim();
  const guion = texto.indexOf('-');
  if (guion < 0) return { departamento: '', municipio: texto };
  return { departamento: texto.substring(0, guion).trim(), municipio: texto.substring(guion + 1).trim() };
}

/** Ciudad para mostrar: "Bello (Antioquia)". */
export function ciudadLegible(linea: Pick<PedidoZeusLinea, 'departamento' | 'municipio' | 'ciudad'>): string {
  if (!linea.departamento) return linea.ciudad;
  return `${linea.municipio} (${linea.departamento})`;
}

/** Convierte una fila de /MovimientoItems/getPedidos en una línea tipada. */
export function mapearLinea(datos: any, indice: number, hoy: moment.Moment = moment().startOf('day')): PedidoZeusLinea {
  const { departamento, municipio } = parsearCiudad(datos.ciudad);
  const fechaEntrega = fecha(datos.fecha_Entrega);
  const diasEntrega = fechaEntrega ? moment(fechaEntrega).diff(hoy, 'days') : 0;
  const pendiente = numero(datos.cant_Pendiente);
  const existencias = numero(datos.existencias);
  const linea: PedidoZeusLinea = {
    id: indice,
    consecutivo: String(datos.consecutivo ?? '').trim(),
    nitCliente: String(datos.id_Cliente ?? '').trim(),
    cliente: datos.cliente ?? '',
    ciudad: datos.ciudad ?? '',
    departamento,
    municipio,
    id_Producto: String(datos.id_Producto ?? '').trim(),
    producto: datos.producto ?? '',
    cant_Pedida: numero(datos.cant_Pedida),
    cant_Facturada: numero(datos.cant_Facturada),
    cant_Pendiente: pendiente,
    existencias,
    presentacion: datos.presentacion ?? '',
    precioUnidad: numero(datos.precioUnidad),
    costo_Cant_Pendiente: numero(datos.costo_Cant_Pendiente),
    costo_Cant_Total: numero(datos.costo_Cant_Total),
    estado: datos.estado ?? '',
    idVendedor: String(datos.id_Vendedor ?? '').trim(),
    vendedor: datos.vendedor ?? '',
    orden_Compra_CLiente: datos.orden_Compra_CLiente ?? '',
    fecha_Creacion: fecha(datos.fecha_Creacion),
    fecha_Entrega: fechaEntrega,
    fecha_Factura: datos.fecha_Factura ?? '',
    facturable: existencias >= pendiente,
    semaforoPedido: 'sinStock',
    vencido: !!fechaEntrega && diasEntrega < 0,
    diasEntrega,
    diasVencido: fechaEntrega && diasEntrega < 0 && fechaEntrega !== fecha(datos.fecha_Creacion) ? -diasEntrega : null,
    OT: '',
    Estado_OT: null,
    Proceso_OT: '',
    busqueda: '',
  };
  linea.busqueda = textoBusqueda(linea);
  return linea;
}

/** Agrupa las líneas por consecutivo conservando el orden de llegada. */
export function agruparPorConsecutivo(lineas: PedidoZeusLinea[]): Map<string, PedidoZeusLinea[]> {
  const grupos = new Map<string, PedidoZeusLinea[]>();
  for (const linea of lineas) {
    const grupo = grupos.get(linea.consecutivo);
    if (grupo) grupo.push(linea);
    else grupos.set(linea.consecutivo, [linea]);
  }
  return grupos;
}

/**
 * Calcula el semáforo de cada pedido en una sola pasada y lo copia a sus líneas:
 * completo = todas las líneas facturables; parcial = algunas; sinStock = ninguna.
 */
export function calcularSemaforo(lineas: PedidoZeusLinea[]): void {
  for (const grupo of agruparPorConsecutivo(lineas).values()) {
    const facturables = grupo.filter(l => l.facturable).length;
    const semaforo: Semaforo = facturables === grupo.length ? 'completo' : facturables > 0 ? 'parcial' : 'sinStock';
    grupo.forEach(l => l.semaforoPedido = semaforo);
  }
}

/** Resumen (encabezado) de cada pedido presente en las líneas recibidas. */
export function resumirPedidos(lineas: PedidoZeusLinea[]): Map<string, ResumenPedido> {
  const resumenes = new Map<string, ResumenPedido>();
  for (const [consecutivo, grupo] of agruparPorConsecutivo(lineas)) {
    const primera = grupo[0];
    // Línea con la fecha de entrega más próxima (o la más atrasada) del pedido
    const masProxima = grupo.filter(l => l.fecha_Entrega).sort((a, b) => a.fecha_Entrega.localeCompare(b.fecha_Entrega))[0];
    const fechaEntrega = masProxima?.fecha_Entrega ?? '';
    resumenes.set(consecutivo, {
      consecutivo,
      cliente: primera.cliente,
      ciudad: ciudadLegible(primera),
      fechaEntrega,
      vencido: grupo.some(l => l.vencido),
      diasVencido: masProxima?.diasVencido ?? null,
      totalPendiente: grupo.reduce((a, l) => a + l.costo_Cant_Pendiente, 0),
      totalPedido: grupo.reduce((a, l) => a + l.costo_Cant_Total, 0),
      items: grupo.length,
      semaforo: primera.semaforoPedido,
    });
  }
  return resumenes;
}

/** Texto del proceso actual de la OT (el último proceso con producción registrada). */
export function procesoActualOt(ot: OtDePedido): string {
  const kg = (valor: number) => numero(valor).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  let proceso = '';
  if (ot.extrusion > 0) proceso = `Extrusión ${kg(ot.extrusion)} Kg`;
  if (ot.impresión > 0) proceso = `Impresión ${kg(ot.impresión)} Kg`;
  if (ot.rotograbado > 0) proceso = `Rotograbado ${kg(ot.rotograbado)} Kg`;
  if (ot.laminado > 0) proceso = `Laminado ${kg(ot.laminado)} Kg`;
  if (ot.corte > 0) proceso = `Corte ${kg(ot.corte)} Kg`;
  if (ot.doblado > 0) proceso = `Doblado ${kg(ot.doblado)} Kg`;
  if (ot.empaque > 0) proceso = `Empaque ${kg(ot.empaque)} Kg`;
  if (ot.selladoKg > 0) proceso = `Sellado ${kg(ot.selladoUnd)} Und - ${kg(ot.selladoKg)} Kg`;
  if (ot.wiketiadoKg > 0) proceso = `Wiketiado ${kg(ot.wiketiadoUnd)} Und - ${kg(ot.wiketiadoKg)} Kg`;
  return proceso;
}

/** Nombre de los estados de OT que se muestran como badge. */
export const ESTADOS_OT: Record<number, { nombre: string; clase: string }> = {
  3: { nombre: 'Anulada', clase: 'badge-peligro' },
  14: { nombre: 'Asignada', clase: 'badge-info' },
  15: { nombre: 'Abierta', clase: 'badge-advertencia' },
  16: { nombre: 'En proceso', clase: 'badge-advertencia' },
  17: { nombre: 'Terminada', clase: 'badge-exito' },
  18: { nombre: 'Cerrada', clase: 'badge-exito' },
};

/** Totales para los KPI. */
export interface IndicadoresPedidos {
  valorPendiente: number;
  pedidos: number;
  items: number;
  facturableValor: number;
  facturableItems: number;
  vencidoValor: number;
  vencidoItems: number;
  proximosValor: number;
  proximosItems: number;
  programadosValor: number;
  programadosItems: number;
  sinOtItems: number;
}

/** Días que se consideran "próximos" para la entrega. */
export const DIAS_PROXIMOS = 30;

export function calcularIndicadores(lineas: PedidoZeusLinea[]): IndicadoresPedidos {
  const r: IndicadoresPedidos = {
    valorPendiente: 0, pedidos: 0, items: lineas.length,
    facturableValor: 0, facturableItems: 0,
    vencidoValor: 0, vencidoItems: 0,
    proximosValor: 0, proximosItems: 0,
    programadosValor: 0, programadosItems: 0,
    sinOtItems: 0,
  };
  const pedidos = new Set<string>();
  for (const l of lineas) {
    pedidos.add(l.consecutivo);
    r.valorPendiente += l.costo_Cant_Pendiente;
    if (l.facturable) { r.facturableValor += l.costo_Cant_Pendiente; r.facturableItems++; }
    if (l.vencido) { r.vencidoValor += l.costo_Cant_Pendiente; r.vencidoItems++; }
    else if (l.diasEntrega <= DIAS_PROXIMOS) { r.proximosValor += l.costo_Cant_Pendiente; r.proximosItems++; }
    else { r.programadosValor += l.costo_Cant_Pendiente; r.programadosItems++; }
    if (!l.OT) r.sinOtItems++;
  }
  r.pedidos = pedidos.size;
  return r;
}

/** Suma un valor por clave y devuelve las claves ordenadas de mayor a menor. */
export function sumarPor<T>(lineas: T[], clave: (l: T) => string, valor: (l: T) => number): { clave: string; valor: number }[] {
  const totales = new Map<string, number>();
  lineas.forEach(l => totales.set(clave(l), (totales.get(clave(l)) ?? 0) + valor(l)));
  return [...totales.entries()].map(([k, v]) => ({ clave: k, valor: v })).sort((a, b) => b.valor - a.valor);
}
