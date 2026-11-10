import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { modelOrden_Trabajo } from '../../Modelo/modelOrden_Trabajo';
import { CrearOrdenTrabajoCompleta, EditarOrdenTrabajoCompleta, RespuestaOrdenTrabajoCompleta } from '../../Modelo/modelOrdenTrabajoCompleta';

@Injectable({
  providedIn: 'root'
})
export class Orden_TrabajoService {

  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

  constructor(private http : HttpClient,) { }

  srvObtenerListaOrden_Trabajo = () => this.http.get<any>(this.rutaPlasticaribeAPI + '/Orden_Trabajo');

  srvObtenerListaPorId = (dato : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Orden_Trabajo/${dato}`);

  srvObtenerListaNumeroOt = (dato : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Orden_Trabajo/NumeroOt/${dato}`);

  srvObtenerListaNumeroPedido = (dato : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Orden_Trabajo/NumeroPedido/${dato}`);

  GetDatosOrden = (orden : number) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Orden_Trabajo/getDatosOrden/${orden}`);

  GetOrdenTrabajo = (orden : number, sales? : string) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Orden_Trabajo/getOrdenTrabajo/${orden}${sales}`);

  GetOrdenesTrabajo = (inicio : any, fin : any, ruta : string) => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Orden_Trabajo/getOrdenesTrabajo/${inicio}/${fin}${ruta}`);

  GetInfoUltOT = (producto : number, presentacion : string) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Orden_Trabajo/getInfoUltOT/${producto}/${presentacion}`);

  GetUlt_Numero_OT = () : Observable<number> => this.http.get<number>(this.rutaPlasticaribeAPI + `/Orden_Trabajo/getUlt_Numero_OT`);

  srvActualizar = (id:number|string, data:any) => this.http.put(this.rutaPlasticaribeAPI + `/Orden_Trabajo/${id}`, data);
  
  srvEliminar = (id:number|string) => this.http.delete(this.rutaPlasticaribeAPI + `/Orden_Trabajo/${id}`);

  srvGuardar = (data : modelOrden_Trabajo): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/Orden_Trabajo', data);

  /**
   * Crea la OT y sus procesos (extrusión, impresión, laminado y sellado/corte) en una sola transacción.
   * El número de OT, el creador, la fecha, la hora y el estado inicial los asigna la API.
   * @param data Datos planos de la OT y de cada proceso.
   * @returns Observable con el Ot_Id y el Numero_OT asignados; los errores llegan como ProblemDetails (400, 409, 422, 502).
   */
  crearOrdenCompleta = (data : CrearOrdenTrabajoCompleta): Observable<RespuestaOrdenTrabajoCompleta> => this.http.post<RespuestaOrdenTrabajoCompleta>(this.rutaPlasticaribeAPI + '/Orden_Trabajo/crearCompleta', data);

  /**
   * Actualiza la OT y sus procesos de forma atómica; la API crea los procesos que le falten a la OT.
   * Producto, presentación, sede y estado no se pueden cambiar (422) y si la OT cambió desde que se cargó responde 409.
   * @param otId Identificador interno (Ot_Id) de la OT.
   * @param data Datos planos de la OT y de cada proceso, con la versión de la fila (Ot_RowVersion).
   * @returns Observable con el Ot_Id y el Numero_OT; los errores llegan como ProblemDetails (400, 404, 409, 422, 502).
   */
  editarOrdenCompleta = (otId : number, data : EditarOrdenTrabajoCompleta): Observable<RespuestaOrdenTrabajoCompleta> => this.http.put<RespuestaOrdenTrabajoCompleta>(this.rutaPlasticaribeAPI + `/Orden_Trabajo/editarCompleta/${otId}`, data);
}
