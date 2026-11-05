import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
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

@Injectable({
  providedIn: 'root'
})
export class TicketsService {
  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

  constructor(private http : HttpClient) { }

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

  getMisTickets = () : Observable<TicketListado[]> => this.http.get<TicketListado[]>(`${this.rutaPlasticaribeAPI}/Tickets/misTickets`);

  getGestion = (incluirFinalizados : boolean = false) : Observable<TicketListado[]> =>
    this.http.get<TicketListado[]>(`${this.rutaPlasticaribeAPI}/Tickets/gestion?incluirFinalizados=${incluirFinalizados}`);

  getCantidades = () : Observable<CantidadesTickets> => this.http.get<CantidadesTickets>(`${this.rutaPlasticaribeAPI}/Tickets/cantidades`);

  getDetalle = (codigo : number) : Observable<TicketDetalle> => this.http.get<TicketDetalle>(`${this.rutaPlasticaribeAPI}/Tickets/${codigo}`);

  /** Descarga una imagen adjunta; `url` es la ruta relativa que devuelve el detalle. */
  getAdjunto = (url : string) : Observable<Blob> => this.http.get(`${this.rutaPlasticaribeAPI}/${url}`, { responseType: 'blob' });

  cambiarEstado = (codigo : number, estadoId : number, comentario : string) : Observable<void> =>
    this.http.post<void>(`${this.rutaPlasticaribeAPI}/Tickets/${codigo}/estado`, { estadoId, comentario });

  comentar = (codigo : number, comentario : string) : Observable<void> =>
    this.http.post<void>(`${this.rutaPlasticaribeAPI}/Tickets/${codigo}/comentarios`, { comentario });
}
