import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelOpedidoproducto } from '../Modelo/modelOpedidoproducto';

@Injectable({
  providedIn: 'root'
})
export class OpedidoproductoService {

  readonly rutaPlasticaribeAPI = "https://localhost:7137/api";

//Encapsular httpclient en el constructor
  constructor(private http: HttpClient) { }

//Metodo buscar lista de Pedidos de Productos
  srvObtenerListaPedidosProductos() {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/PedidoExternoes')
  }

  srvObtenerListaPorId(id : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/PedidoExternoes/${id}`);
  }

//Metodo agregar Pedidos de Productos
  srvAgregarPedidosProductos(data:any) {
    return this.http.post(this.rutaPlasticaribeAPI + '/PedidoExternoes', data)
  }
//Metodo actualzar Pedidos de Productos
  srvActualizarPedidosProdusctos(id:number|String, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/PedidoExternoes/${id}`, data);
  }
//Metodo eliminar Pedidos de Productos
  srvEliminarPedidosProductos(id:number|String) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/PedidoExternoes/${id}`);
  }

  srvGuardarPedidosProductos(data : any): Observable<any> {
   return this.http.post(this.rutaPlasticaribeAPI + '/PedidoExternoes', data);
  }



}
