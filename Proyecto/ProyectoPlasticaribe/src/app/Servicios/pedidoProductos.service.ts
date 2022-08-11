import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI } from 'src/polyfills';
import { modelPedidoProducto } from '../Modelo/modelPedidoProducto';

@Injectable({
  providedIn: 'root'
})
export class PedidoProductosService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  constructor(private http : HttpClient) { }

  //Metodo buscar lista de Pedidos
  srvObtenerLista():Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/PedidoProducto')
  }

  srvObtenerListaPorId(id_producto:any, id_pedido:any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/PedidoProducto/ ?Prod_Id=${id_producto}&PedExt_Id=${id_pedido}`);
  }

  // Precio de Ultima Venta
  srvObtenerListaPorIdProducto(id_producto:any, presentacion : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/PedidoProducto/IdProducto/${id_producto}/${presentacion}`);
  }

  // Precio de Ultima Venta
  srvObtenerListaPorIdProductoPedido(id_producto:any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/PedidoProducto/IdProductoPedido/${id_producto}`);
  }

  //Metodo agregar Pedidos
  srvAgregar(datos_Pedidos:any) {
    return this.http.post(this.rutaPlasticaribeAPI + '/PedidoProducto', datos_Pedidos)
  }

  //Metodo actualzar Pedidos
  srvActualizar(id_producto:number, id_pedido:number, datos_Pedidos:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/PedidoProducto/ ?prod_Id=${id_producto}&pedExt_Id=${id_pedido}`, datos_Pedidos);
  }

  //Metodo eliminar Pedidos
  srvEliminar(id_producto:number, id_pedido:number,) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/PedidoProducto/ ?prod_Id=${id_producto}&pedExt_Id=${id_pedido}`);
  }

  //
  srvGuardar(data : modelPedidoProducto): Observable<any> {
    return this.http.post(this.rutaPlasticaribeAPI + '/PedidoProducto', data)
  }

}
