import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import moment from 'moment';
import { BehaviorSubject, Observable, catchError, finalize, of, shareReplay, switchMap, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

/** Ids de la tabla Estados que usa un ticket. */
export const EstadoTicket = {
  CANCELADO: 4,
  ABIERTO: 28,
  EN_REVISION: 29,
  RESUELTO: 30,
} as const;

/**
 * Clase global (styles.css) del badge de estado, con el mismo criterio de colores de Mov. Precargue Rollos.
 */
export function claseEstadoTicket(estadoId : number | null) : string {
  switch (estadoId) {
    case EstadoTicket.ABIERTO: return 'bg-warning1';    // amarillo (ANULADO en precargue)
    case EstadoTicket.EN_REVISION: return 'bg-blue1';   // azul (ACEPTADO)
    case EstadoTicket.RESUELTO: return 'bg-success1';   // verde (FINALIZADO)
    case EstadoTicket.CANCELADO: return 'bg-danger1';   // rojo con letra blanca (PENDIENTE)
    default: return 'bg-secondary1';
  }
}

/** Rango por defecto de los listados de tickets: desde el mismo día de hace un año hasta hoy. */
export function rangoFechasTicketsPorDefecto() : { inicio: Date, fin: Date } {
  const fin = moment().startOf('day');
  return { inicio: fin.clone().subtract(1, 'year').toDate(), fin: fin.toDate() };
}

/** Las fechas viajan como 'YYYY-MM-DD' (sin hora ni zona) para que la API las tome como días completos. */
const paramsRango = (inicio : Date, fin : Date) : HttpParams => new HttpParams()
  .set('fechaInicio', moment(inicio).format('YYYY-MM-DD'))
  .set('fechaFin', moment(fin).format('YYYY-MM-DD'));

export interface TipoTicket { id: number; nombre: string; }

export interface ReportanteTicket { id: number; nombre: string; area: string; }

export interface TicketListado {
  codigo: number;
  asunto: string;
  tipo: string;
  estadoId: number;
  estado: string;
  fechaCreacion: string;
  fechaResolucion: string | null;
  usuarioId: number;
  usuario: string;
  area: string;
  /** Soporte que registró el ticket a nombre del reportante; null si lo creó el mismo reportante. */
  registradoPor: string | null;
}

export interface TicketHistorial {
  id: number;
  fecha: string;
  hora: string;
  usuario: string;
  estadoId: number | null;
  estado: string | null;
  comentario: string;
}

export interface TicketDetalle {
  ticket: TicketListado;
  descripcion: string;
  adjuntos: { nombre: string; url: string }[];
  historial: TicketHistorial[];
}

export interface CantidadesTickets { abiertos: number; enRevision: number; resueltosMes: number; }

/**
 * Usuario que gestiona los tickets y recibe el aviso de tickets abiertos al entrar a Inicio.
 * Para que el aviso aplique a todos los administradores (rol 1), quitar la condición que usa esta constante en PaginaPrincipal.
 */
export const USUARIO_AVISO_TICKETS = 7379;

/**
 * Llave de sessionStorage que marca que el aviso de tickets ya se mostró en la sesión actual.
 * El logout limpia sessionStorage, así que el aviso vuelve a salir en el siguiente inicio de sesión.
 */
const LLAVE_AVISO_TICKETS = 'avisoTicketsMostrado';

@Injectable({
  providedIn: 'root'
})
export class TicketsService {
  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

  /** Últimas cantidades de soporte conocidas (null = aún no consultadas o el rol no es soporte). Alimenta el botón de tickets de la barra superior. */
  private readonly cantidadesSoporte = new BehaviorSubject<CantidadesTickets | null>(null);
  readonly cantidadesSoporte$ = this.cantidadesSoporte.asObservable();
  private consultaSoporteEnCurso : Observable<CantidadesTickets | null> | null = null;

  constructor(private http : HttpClient) { }

  /** Indica si el aviso de tickets ya se mostró en esta sesión. */
  static avisoYaMostrado() : boolean {
    try { return sessionStorage.getItem(LLAVE_AVISO_TICKETS) === '1'; } catch { return false; }
  }

  static marcarAvisoMostrado() {
    try { sessionStorage.setItem(LLAVE_AVISO_TICKETS, '1'); } catch { /* sin almacenamiento: el aviso podría repetirse al recargar */ }
  }

  /**
   * Consulta las cantidades solo si el rol es soporte: /cantidades responde 403 a los demás y el interceptor cierra sesión con 403.
   * Si la barra superior e Inicio la piden a la vez, comparten la misma petición. Emite null si no es soporte o si falla.
   */
  cargarCantidadesSoporte() : Observable<CantidadesTickets | null> {
    this.consultaSoporteEnCurso ??= this.getPermisos().pipe(
      switchMap(p => p.esSoporte ? this.getCantidades() : of(null)),
      catchError(() => of(null)),
      finalize(() => this.consultaSoporteEnCurso = null),
      shareReplay({ bufferSize: 1, refCount: false }),
    );
    return this.consultaSoporteEnCurso;
  }

  getTipos = () : Observable<TipoTicket[]> => this.http.get<TipoTicket[]>(`${this.rutaPlasticaribeAPI}/Tickets/tipos`);

  getPermisos = () : Observable<{ esSoporte: boolean }> => this.http.get<{ esSoporte: boolean }>(`${this.rutaPlasticaribeAPI}/Tickets/permisos`);

  /** Solo soporte: usuarios activos a cuyo nombre se puede registrar un ticket. */
  getReportantes = () : Observable<ReportanteTicket[]> => this.http.get<ReportanteTicket[]>(`${this.rutaPlasticaribeAPI}/Tickets/reportantes`);

  /**
   * Crea el ticket y sube sus imágenes en una sola petición.
   * @param reportanteId Solo soporte: usuario a cuyo nombre queda el ticket; null = a nombre de quien lo crea.
   */
  crearTicket(asunto : string, tipoTicketId : number, descripcion : string, imagenes : File[], reportanteId : number | null = null) : Observable<{ codigo: number, reportante: string | null }> {
    const formData = new FormData();
    formData.append('Asunto', asunto);
    formData.append('TipoTicketId', String(tipoTicketId));
    formData.append('Descripcion', descripcion);
    if (reportanteId != null) formData.append('ReportanteId', String(reportanteId));
    imagenes.forEach(img => formData.append('Imagenes', img, img.name));
    return this.http.post<{ codigo: number, reportante: string | null }>(`${this.rutaPlasticaribeAPI}/Tickets`, formData);
  }

  /** Tickets propios creados entre `fechaInicio` y `fechaFin` (ambas inclusive). */
  getMisTickets = (fechaInicio : Date, fechaFin : Date) : Observable<TicketListado[]> =>
    this.http.get<TicketListado[]>(`${this.rutaPlasticaribeAPI}/Tickets/misTickets`, { params: paramsRango(fechaInicio, fechaFin) });

  /** Tickets para soporte creados entre `fechaInicio` y `fechaFin` (ambas inclusive). */
  getGestion = (fechaInicio : Date, fechaFin : Date, incluirFinalizados : boolean = false) : Observable<TicketListado[]> =>
    this.http.get<TicketListado[]>(`${this.rutaPlasticaribeAPI}/Tickets/gestion`,
      { params: paramsRango(fechaInicio, fechaFin).set('incluirFinalizados', String(incluirFinalizados)) });

  /** Solo soporte (403 para los demás). Cada respuesta actualiza también el badge de la barra superior. */
  getCantidades = () : Observable<CantidadesTickets> => this.http.get<CantidadesTickets>(`${this.rutaPlasticaribeAPI}/Tickets/cantidades`)
    .pipe(tap(c => this.cantidadesSoporte.next(c)));

  getDetalle = (codigo : number) : Observable<TicketDetalle> => this.http.get<TicketDetalle>(`${this.rutaPlasticaribeAPI}/Tickets/${codigo}`);

  /** Descarga una imagen adjunta; `url` es la ruta relativa que devuelve el detalle. */
  getAdjunto = (url : string) : Observable<Blob> => this.http.get(`${this.rutaPlasticaribeAPI}/${url}`, { responseType: 'blob' });

  cambiarEstado = (codigo : number, estadoId : number, comentario : string) : Observable<void> =>
    this.http.post<void>(`${this.rutaPlasticaribeAPI}/Tickets/${codigo}/estado`, { estadoId, comentario });

  comentar = (codigo : number, comentario : string) : Observable<void> =>
    this.http.post<void>(`${this.rutaPlasticaribeAPI}/Tickets/${codigo}/comentarios`, { comentario });
}
