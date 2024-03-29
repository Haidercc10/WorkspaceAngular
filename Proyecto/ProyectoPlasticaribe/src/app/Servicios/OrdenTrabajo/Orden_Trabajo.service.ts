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

  srvObtenerListaPdfOTInsertada = (dato : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Orden_Trabajo/getPdfOTInsertada/${dato}`);

  GetDatosOrden = (orden : number) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Orden_Trabajo/getDatosOrden/${orden}`);

  GetOrdenTrabajo = (orden : number) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Orden_Trabajo/getOrdenTrabajo/${orden}`);

  GetInfoUltOT = (producto : number, presentacion : string) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Orden_Trabajo/getInfoUltOT/${producto}/${presentacion}`);

  GetUlt_Numero_OT = () : Observable<number> => this.http.get<number>(this.rutaPlasticaribeAPI + `/Orden_Trabajo/getUlt_Numero_OT`);

  srvActualizar = (id:number|string, data:any) => this.http.put(this.rutaPlasticaribeAPI + `/Orden_Trabajo/${id}`, data);
  
  srvEliminar = (id:number|string) => this.http.delete(this.rutaPlasticaribeAPI + `/Orden_Trabajo/${id}`);

  srvGuardar = (data : modelOrden_Trabajo): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/Orden_Trabajo', data);
}
