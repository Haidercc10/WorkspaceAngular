import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  CrearSolicitudRequest,
  DetalleSolicitudMaterial,
  EditarSolicitudRequest,
  FiltrosConsultaSolicitudes,
  ReservaInventario,
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

  /** Marca como verificada (estado 55) una solicitud finalizada. Responde 409 si no está finalizada y 403 si el rol no tiene permiso. */
  verificarSolicitud = (id : number) => this.http.put(`${this.rutaPlasticaribeAPI}/Solicitud_MatPrimaExtrusion/verificar/${id}`, null);

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
   * Finaliza (5) o cancela (4) una solicitud. Quien asigna lo hace con pendientes y parciales; el solicitante solo
   * cancela la suya mientras esté pendiente. Responde 409 si la solicitud cambió de estado y 403 sin permiso.
   */
  cambiarEstado = (id : number, estado : number) =>
    this.http.put<{ solMpExt_Id : number; estado_Id : number }>(`${this.rutaPlasticaribeAPI}/SolicitudesExtrusion/${id}/estado`, { Estado: estado });

  /** Consulta existencia, reserva informativa y disponible de las subcategorías indicadas. */
  getReservas = (subcategorias : number[]) : Observable<ReservaInventario[]> =>
    this.http.get<ReservaInventario[]>(`${this.rutaPlasticaribeAPI}/SolicitudesExtrusion/reservas`, { params: { subcategorias: subcategorias.join(',') } });
}
