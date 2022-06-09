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
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/PedidoExterno');
  }

  srvObtenerListaPorId(dato : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/PedidoExterno/${dato}`);
  }

//Metodo agregar Pedidos de Productos
  srvAgregarPedidosProductos(data:any) {
    return this.http.post(this.rutaPlasticaribeAPI + '/PedidoExterno', data)
  }
  //Metodo actualzar Pedidos de Productos
  srvActualizarPedidosProdusctos(id:number|string, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/PedidoExterno/${id}`, data);
  }
  //Metodo eliminar Pedidos de Productos
  srvEliminarPedidosProductos(id:number|string) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/PedidoExterno/${id}`);
  }

  srvGuardarPedidosProductos(data : modelOpedidoproducto): Observable<any> {
   return this.http.post(this.rutaPlasticaribeAPI + '/PedidoExterno', data);
  }

  srvObtenerUltimoCodigoPedido(){
     return this.http.get<any>(this.rutaPlasticaribeAPI + '/PedidoExterno');
  }

}
