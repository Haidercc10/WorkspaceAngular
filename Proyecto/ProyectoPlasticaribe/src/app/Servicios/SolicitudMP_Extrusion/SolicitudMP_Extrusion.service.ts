import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CrearSolicitudRequest, EditarSolicitudRequest, ReservaInventario } from 'src/app/Modelo/modelFlujoMaterialProduccion';
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

  /** Consulta existencia, reserva informativa y disponible de las subcategorías indicadas. */
  getReservas = (subcategorias : number[]) : Observable<ReservaInventario[]> =>
    this.http.get<ReservaInventario[]>(`${this.rutaPlasticaribeAPI}/SolicitudesExtrusion/reservas`, { params: { subcategorias: subcategorias.join(',') } });
}
