import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI, } from 'src/polyfills';
import { modelPedidoProducto } from '../../Modelo/modelPedidoProducto';

@Injectable({
  providedIn: 'root'
})
export class PedidoProductosService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient,) { }

  //Metodo buscar lista de Pedidos
  srvObtenerLista():Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/PedidoProducto')
  }

  srvObtenerListaPorId(id : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/PedidoProducto/${id}`);
  }

  // Precio de Ultima Venta
  srvObtenerListaPorIdProducto(id_producto:any, presentacion : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/PedidoProducto/IdProducto/${id_producto}/${presentacion}`);
  }

  // Precio de Ultima Venta
  srvObtenerListaPorIdProductoPedido(id_producto : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/PedidoProducto/IdProductoPedido/${id_producto}`);
  }

  srvObtenerListaPorIdProducto_Pedido(id_producto : any, pedidoId : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/PedidoProducto/IdProducto_Pedido/${id_producto}/${pedidoId}`);
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
    return this.http.delete(this.rutaPlasticaribeAPI + `/PedidoProducto?prod_Id=${id_producto}&pedExt_Id=${id_pedido}`);
  }

  //
  srvGuardar(data : modelPedidoProducto): Observable<any> {
    return this.http.post(this.rutaPlasticaribeAPI + '/PedidoProducto', data)
  }

  /**  */
  getPedidoPendiente(){
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/PedidoProducto/PedidosPendientesCompletos');
  }

  /**  */
  getPedidoPendientexId(pedido : number){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/PedidoProducto/getPedidosPendientesAgrupadosxId/${pedido}`);
  }

  GetPedidosPendientesAgrupados(){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/PedidoProducto/getPedidosPendientesAgrupados`);
  }
}
