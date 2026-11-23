import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  CrearSolicitudRequest,
  DetalleSolicitudMaterial,
  EditarSolicitudRequest,
  EstadoSolicitudMaterial,
  FiltrosConsultaSolicitudes,
  ReservaInventario,
  ResumenSolicitudOT,
  SolicitudConsultada,
} from 'src/app/Modelo/modelFlujoMaterialProduccion';
import { modelSolicitudMP_Extrusion } from 'src/app/Modelo/modelSolicitudMP_Extrusion';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

export class SolicitudMP_ExtrusionService {
  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

  constructor(private http : HttpClient) { }

  GetId = (id : number) : Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Solicitud_MatPrimaExtrusion/${id}`);

  GetTodo = () : Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Solicitud_MatPrimaExtrusion`);

  Post = (data : modelSolicitudMP_Extrusion) => this.http.post<any>(`${this.rutaPlasticaribeAPI}/Solicitud_MatPrimaExtrusion`, data);

  Put = (id : number, data : modelSolicitudMP_Extrusion) => this.http.put(`${this.rutaPlasticaribeAPI}/Solicitud_MatPrimaExtrusion/${id}`, data);

  Delete = (id : number) => this.http.delete(`${this.rutaPlasticaribeAPI}/Solicitud_MatPrimaExtrusion/${id}`);

  getEstadosSolicitudes = (): Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Solicitud_MatPrimaExtrusion/getEstadosSolicitudes`);

  /** Crea la solicitud y sus detalles en una sola transacción. Responde 409 si falta confirmar la disponibilidad. */
  crearSolicitud = (data : CrearSolicitudRequest) : Observable<{ solMpExt_Id : number; estado_Id : number }> =>
    this.http.post<{ solMpExt_Id : number; estado_Id : number }>(`${this.rutaPlasticaribeAPI}/SolicitudesExtrusion`, data);

  /** Edita la solicitud y sus detalles en una sola transacción y recalcula su estado. */
  editarSolicitud = (id : number, data : EditarSolicitudRequest) : Observable<{ solMpExt_Id : number; estado_Id : number }> =>
    this.http.put<{ solMpExt_Id : number; estado_Id : number }>(`${this.rutaPlasticaribeAPI}/SolicitudesExtrusion/${id}`, data);

  /** Solicitud completa: encabezado, máquinas y subcategorías con sus materiales (solicitado, entregado y stock). */
  obtenerSolicitud = (id : number) : Observable<DetalleSolicitudMaterial> =>
    this.http.get<DetalleSolicitudMaterial>(`${this.rutaPlasticaribeAPI}/SolicitudesExtrusion/${id}`);

  /** Consulta solicitudes (una fila por solicitud, de la más nueva a la más vieja). Por número de solicitud no aplica fechas. */
  consultarSolicitudes = (filtros : FiltrosConsultaSolicitudes) : Observable<SolicitudConsultada[]> => {
    let params = new HttpParams();
    if (filtros.desde) params = params.set('desde', filtros.desde);
    if (filtros.hasta) params = params.set('hasta', filtros.hasta);
    if (filtros.id != null) params = params.set('id', filtros.id);
    if (filtros.ot != null) params = params.set('ot', filtros.ot);
    if (filtros.estados?.length) params = params.set('estados', filtros.estados.join(','));
    if (filtros.soloMias) params = params.set('soloMias', true);
    return this.http.get<SolicitudConsultada[]>(`${this.rutaPlasticaribeAPI}/SolicitudesExtrusion/consulta`, { params });
  };

  /** Cantidad de solicitudes por estado (sin la solicitud genérica). */
  contarPorEstado = () : Observable<{ estado_Id : number; estado : string; cantidad : number }[]> =>
    this.http.get<{ estado_Id : number; estado : string; cantidad : number }[]>(`${this.rutaPlasticaribeAPI}/SolicitudesExtrusion/conteo-estados`);

  /**
   * Cancela una solicitud con su motivo; el API guarda el motivo, la fecha y el usuario que la canceló (las solicitudes
   * se finalizan con su OT, no una por una). Quien asigna cancela pendientes y parciales; el solicitante solo la suya
   * mientras esté pendiente. 400 sin motivo, 409 si cambió de estado, 403 sin permiso.
   */
  cancelarSolicitud = (id : number, motivo : string) =>
    this.http.put<{ solMpExt_Id : number; estado_Id : number }>(`${this.rutaPlasticaribeAPI}/SolicitudesExtrusion/${id}/estado`,
      { Estado: EstadoSolicitudMaterial.Cancelada, Motivo: motivo });

  // ───────────────────────── Solicitud de la OT ─────────────────────────

  /** Avance y estado de la solicitud de la OT (todas sus solicitudes). Responde 404 si la OT aún no tiene solicitudes. */
  obtenerResumenOT = (ot : number) : Observable<ResumenSolicitudOT> =>
    this.http.get<ResumenSolicitudOT>(`${this.rutaPlasticaribeAPI}/SolicitudesExtrusion/ot/${ot}`);

  /** Guarda los kg de la OT tomados de BagPro, recalcula su estado y devuelve el resumen. 404 si la OT no tiene solicitudes. */
  registrarKgOT = (ot : number, kgOT : number) : Observable<ResumenSolicitudOT> =>
    this.http.put<ResumenSolicitudOT>(`${this.rutaPlasticaribeAPI}/SolicitudesExtrusion/ot/${ot}/kg`, { KgOT: kgOT });

  /** Completa a mano la solicitud de la OT (lo asignado llegó a los kg de la OT). No se puede deshacer. Roles 1, 3 y 85. */
  completarOT = (ot : number) : Observable<ResumenSolicitudOT> =>
    this.http.put<ResumenSolicitudOT>(`${this.rutaPlasticaribeAPI}/SolicitudesExtrusion/ot/${ot}/completar`, null);

  /** Finaliza la solicitud de la OT (cierra la asignación de materiales). Roles 1, 3 y 85. */
  finalizarOT = (ot : number) : Observable<ResumenSolicitudOT> =>
    this.http.put<ResumenSolicitudOT>(`${this.rutaPlasticaribeAPI}/SolicitudesExtrusion/ot/${ot}/finalizar`, null);

  /** Verifica la solicitud de la OT finalizada (el solicitante comprobó lo recibido). Roles 1 y 85. */
  verificarOT = (ot : number) : Observable<ResumenSolicitudOT> =>
    this.http.put<ResumenSolicitudOT>(`${this.rutaPlasticaribeAPI}/SolicitudesExtrusion/ot/${ot}/verificar`, null);

  /** Consulta existencia, reserva informativa y disponible de las subcategorías indicadas. */
  getReservas = (subcategorias : number[]) : Observable<ReservaInventario[]> =>
    this.http.get<ReservaInventario[]>(`${this.rutaPlasticaribeAPI}/SolicitudesExtrusion/reservas`, { params: { subcategorias: subcategorias.join(',') } });
}
