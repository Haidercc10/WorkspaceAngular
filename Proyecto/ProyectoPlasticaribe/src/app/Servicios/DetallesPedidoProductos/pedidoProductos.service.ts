import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { modelPedidoProducto } from '../../Modelo/modelPedidoProducto';

@Injectable({
  providedIn: 'root'
})
export class PedidoProductosService {

  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

  constructor(private http : HttpClient,) { }

  srvObtenerListaPorIdProducto = (id_producto:any, presentacion : any):Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + `/PedidoProducto/IdProducto/${id_producto}/${presentacion}`);

  srvObtenerListaPorIdProductoPedido = (id_producto : any):Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + `/PedidoProducto/IdProductoPedido/${id_producto}`);
  
  srvObtenerListaPorIdProducto_Pedido = (id_producto : any, pedidoId : any):Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + `/PedidoProducto/IdProducto_Pedido/${id_producto}/${pedidoId}`);
  
  srvEliminar = (id_producto:number, id_pedido:number,) => this.http.delete(this.rutaPlasticaribeAPI + `/PedidoProducto?prod_Id=${id_producto}&pedExt_Id=${id_pedido}`);
  
  srvGuardar = (data : modelPedidoProducto): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/PedidoProducto', data);

  getPedidoPendiente = () => this.http.get<any>(this.rutaPlasticaribeAPI + '/PedidoProducto/PedidosPendientesCompletos');

  GetPedidosPendientesAgrupados = () => this.http.get<any>(this.rutaPlasticaribeAPI + `/PedidoProducto/getPedidosPendientesAgrupados`);
}
