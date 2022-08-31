import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI } from 'src/polyfills';
import { modelOrden_Trabajo } from '../Modelo/modelOrden_Trabajo';

@Injectable({
  providedIn: 'root'
})
export class Orden_TrabajoService {

  readonly rutaPlasticaribeAPI =  rutaPlasticaribeAPI; /*"https://localhost:7137/api"*/;

  //Encapsular httpclient en el constructor
  constructor(private http: HttpClient) { }

  srvObtenerListaOrden_Trabajo() {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/Orden_Trabajo');
  }

  srvObtenerListaPorId(dato : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Orden_Trabajo/${dato}`);
  }

  srvObtenerListaNumeroOt(dato : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Orden_Trabajo/NumeroOt/${dato}`);
  }

  srvObtenerListaNumeroPedido(dato : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Orden_Trabajo/NumeroPedido/${dato}`);
  }

  srvObtenerListaPdfOTInsertada(dato : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Orden_Trabajo/PdfOTInsertada/${dato}`);
  }

  //Metodo actualzar Pedidos de Productos
  srvActualizar(id:number|string, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/Orden_Trabajo/${id}`, data);
  }
  //Metodo eliminar Pedidos de Productos
  srvEliminar(id:number|string) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/Orden_Trabajo/${id}`);
  }

  srvGuardar(data : modelOrden_Trabajo): Observable<any> {
   return this.http.post(this.rutaPlasticaribeAPI + '/Orden_Trabajo', data);
  }
}
