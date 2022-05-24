import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelPedidoProducto } from '../Modelo/modelPedidoProducto';

@Injectable({
  providedIn: 'root'
})
export class PedidoProductosService {

  readonly rutaPlasticaribeAPI = "https://localhost:7137/api";

  constructor(private http : HttpClient) { }

  //Metodo buscar lista de Pedidos
  srvObtenerLista():Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/PedidoProductoes')
  }

  srvObtenerListaPorId(id : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/PedidoProductoes/${id}`)
  }

  //Metodo agregar Pedidos
  srvAgregar(datos_Pedidos:any) {
    return this.http.post(this.rutaPlasticaribeAPI + '/PedidoProductoes', datos_Pedidos)
  }

  //Metodo actualzar Pedidos
  srvActualizar(id:number|string, datos_Pedidos:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/PedidoProductoes/${id}`, datos_Pedidos);
  }

  //Metodo eliminar Pedidos
  srvEliminar(id:number|string) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/PedidoProductoes/${id}`);
  }

  //
  srvGuardar(data : modelPedidoProducto): Observable<any> {
    return this.http.post(this.rutaPlasticaribeAPI + '/PedidoProductoes', data)
  }

}
