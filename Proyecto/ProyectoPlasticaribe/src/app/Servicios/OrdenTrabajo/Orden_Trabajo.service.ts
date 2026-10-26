import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { modelOrden_Trabajo } from '../../Modelo/modelOrden_Trabajo';

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

  /** Crea la OT y sus procesos (extrusión, impresión, laminado y sellado/corte) en una sola transacción. */
  crearOrdenCompleta = (data : any): Observable<{ ot_Id: number, numero_OT: number }> => this.http.post<{ ot_Id: number, numero_OT: number }>(this.rutaPlasticaribeAPI + '/Orden_Trabajo/crearCompleta', data);

  /** Actualiza la OT y sus procesos de forma atómica; la API crea los procesos que le falten a la OT. */
  editarOrdenCompleta = (otId : number, data : any): Observable<{ ot_Id: number, numero_OT: number }> => this.http.put<{ ot_Id: number, numero_OT: number }>(this.rutaPlasticaribeAPI + `/Orden_Trabajo/editarCompleta/${otId}`, data);
}
