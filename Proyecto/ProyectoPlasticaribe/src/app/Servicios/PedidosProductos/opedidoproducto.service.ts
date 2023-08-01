import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI, } from 'src/polyfills';
import { modelOpedidoproducto } from '../../Modelo/modelOpedidoproducto';

@Injectable({
  providedIn: 'root'
})
export class OpedidoproductoService {

  constructor(private http : HttpClient,) { }

  srvObtenerListaPorId = (dato : any) => this.http.get<any>(rutaPlasticaribeAPI + `/PedidoExterno/${dato}`);

  srvObtenerListaPorIdPedidoLlenarPDF = (dato : any) => this.http.get<any>(rutaPlasticaribeAPI + `/PedidoExterno/idPedidoLlenarPDF/${dato}`);

  srvObtenerUltimoPedido = () : Observable<any> => this.http.get<any>(rutaPlasticaribeAPI + `/PedidoExterno/UltimoPedido/`);

  srvObtenerListaPedidoExterno = () => this.http.get<any>(rutaPlasticaribeAPI + `/PedidoExterno/PedidoExterno`);

  srvObtenerListaFechaCreacion = (fecha : any) => this.http.get<any>(rutaPlasticaribeAPI + `/PedidoExterno/FechaCreacion/${fecha}`);

  srvObtenerListaFechaEntrega = (fecha : any) => this.http.get<any>(rutaPlasticaribeAPI + `/PedidoExterno/FechaEntrega/${fecha}`);

  srvObtenerListaNombreCliente = (nombre : string) => this.http.get<any>(rutaPlasticaribeAPI + `/PedidoExterno/nombreCliente/${nombre}`);

  srvObtenerListaIdCliente = (id : number) => this.http.get<any>(rutaPlasticaribeAPI + `/PedidoExterno/idCliente/${id}`);

  srvObtenerListanomberVendeder = (nombre : string) => this.http.get<any>(rutaPlasticaribeAPI + `/PedidoExterno/nomberVendeder/${nombre}`);

  srvObtenerListaIDPedido = (id : number) => this.http.get<any>(rutaPlasticaribeAPI + `/PedidoExterno/idPedido/${id}`);

  srvObtenerListanombreEstado = (nombre : string) => this.http.get<any>(rutaPlasticaribeAPI + `/PedidoExterno/estadoNombre/${nombre}`);

  srvObtenerListaFechas = (fechaCreacion : any, fechaEntrega : any) => this.http.get<any>(rutaPlasticaribeAPI + `/PedidoExterno/fechacreacion/${fechaCreacion}/fechaEntrega${fechaEntrega}`);

  srvObtenerListaEstadoUsuario = (estado : any, usuario : any) => this.http.get<any>(rutaPlasticaribeAPI + `/PedidoExterno/estadoUsuario/${estado}/${usuario}`);

  srvObtenerListaFechaEntregaUsuario = (fecha : any, usuario : any) => this.http.get<any>(rutaPlasticaribeAPI + `/PedidoExterno/fechaEntregaUsuario/${fecha}/${usuario}`);

  srvObtenerListaFechaEntregaEstado = (fecha : any, estado : any) => this.http.get<any>(rutaPlasticaribeAPI + `/PedidoExterno/fechaEntregaEstado/${fecha}/${estado}`);

  srvObtenerListaFechaCreacionUsuario = (fecha : any, usuario : any) => this.http.get<any>(rutaPlasticaribeAPI + `/PedidoExterno/fechaCreacionUsuario/${fecha}/${usuario}`);

  srvObtenerListaFechaCreacionEstado = (fecha : any, estado : any) => this.http.get<any>(rutaPlasticaribeAPI + `/PedidoExterno/fechaCreacionEstado/${fecha}/${estado}`);

  srvObtenerListaFechaEntregaEstadoVendedor = (fecha : any, estado : any, usuario : any) => this.http.get<any>(rutaPlasticaribeAPI + `/PedidoExterno/fechaEntregaEstadoVendedor/${fecha}/${estado}/${usuario}`);

  srvObtenerListaFechaCreacionEstadoVendedor = (fecha : any, estado : any, usuario : any) => this.http.get<any>(rutaPlasticaribeAPI + `/PedidoExterno/fechaCreacionEstadoVendedor/${fecha}/${estado}/${usuario}`);

  srvObtenerListaFechasEstadoVendedor = (fecha : any, fechaEntrega : any, estado : any, usuario : any) => this.http.get<any>(rutaPlasticaribeAPI + `/PedidoExterno/fechasEstadoVendedor/${fecha}/${fechaEntrega}/${estado}/${usuario}`);

  srvObtenerListaFechasEstado = (fecha : any, fechaEntrega : any, estado : any) => this.http.get<any>(rutaPlasticaribeAPI + `/PedidoExterno/fechasEstado/${fecha}/${fechaEntrega}/${estado}`);

  GetPedidosSinOT = ():Observable<any[]> => this.http.get<any>(rutaPlasticaribeAPI + `/PedidoExterno/PedidosSinOT`);

  GetInfoPedido = (pedido : number):Observable<any[]> => this.http.get<any>(rutaPlasticaribeAPI + `/PedidoExterno/getInfoPedido/${pedido}`);

  GetCrearPdfUltPedido = (pedido : number):Observable<any[]> => this.http.get<any>(rutaPlasticaribeAPI + `/PedidoExterno/getCrearPdfUltPedido/${pedido}`);

  GetInfoEditarPedido = (pedido : number):Observable<any[]> => this.http.get<any>(rutaPlasticaribeAPI + `/PedidoExterno/getInfoEditarPedido/${pedido}` );
    
  srvActualizarPedidosProductos = (id:number|string, data:any) => this.http.put(rutaPlasticaribeAPI + `/PedidoExterno/${id}`, data);

  srvGuardarPedidosProductos = (data : modelOpedidoproducto): Observable<any> => this.http.post(rutaPlasticaribeAPI + '/PedidoExterno', data);

}
