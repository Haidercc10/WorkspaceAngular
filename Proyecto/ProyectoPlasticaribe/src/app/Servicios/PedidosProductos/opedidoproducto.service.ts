import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { modelOpedidoproducto } from '../../Modelo/modelOpedidoproducto';

@Injectable({
  providedIn: 'root'
})
export class OpedidoproductoService {

  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

  constructor(private http : HttpClient,) { }

  srvObtenerListaPorId = (dato : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/PedidoExterno/${dato}`);

  srvObtenerListaPorIdPedidoLlenarPDF = (dato : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/PedidoExterno/idPedidoLlenarPDF/${dato}`);

  srvObtenerUltimoPedido = () : Observable<any> => this.http.get<any>(this.rutaPlasticaribeAPI + `/PedidoExterno/UltimoPedido/`);

  srvObtenerListaPedidoExterno = () => this.http.get<any>(this.rutaPlasticaribeAPI + `/PedidoExterno/PedidoExterno`);

  srvObtenerListaFechaCreacion = (fecha : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/PedidoExterno/FechaCreacion/${fecha}`);

  srvObtenerListaFechaEntrega = (fecha : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/PedidoExterno/FechaEntrega/${fecha}`);

  srvObtenerListaNombreCliente = (nombre : string) => this.http.get<any>(this.rutaPlasticaribeAPI + `/PedidoExterno/nombreCliente/${nombre}`);

  srvObtenerListaIdCliente = (id : number) => this.http.get<any>(this.rutaPlasticaribeAPI + `/PedidoExterno/idCliente/${id}`);

  srvObtenerListanomberVendeder = (nombre : string) => this.http.get<any>(this.rutaPlasticaribeAPI + `/PedidoExterno/nomberVendeder/${nombre}`);

  srvObtenerListaIDPedido = (id : number) => this.http.get<any>(this.rutaPlasticaribeAPI + `/PedidoExterno/idPedido/${id}`);

  srvObtenerListanombreEstado = (nombre : string) => this.http.get<any>(this.rutaPlasticaribeAPI + `/PedidoExterno/estadoNombre/${nombre}`);

  srvObtenerListaFechas = (fechaCreacion : any, fechaEntrega : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/PedidoExterno/fechacreacion/${fechaCreacion}/fechaEntrega${fechaEntrega}`);

  srvObtenerListaEstadoUsuario = (estado : any, usuario : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/PedidoExterno/estadoUsuario/${estado}/${usuario}`);

  srvObtenerListaFechaEntregaUsuario = (fecha : any, usuario : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/PedidoExterno/fechaEntregaUsuario/${fecha}/${usuario}`);

  srvObtenerListaFechaEntregaEstado = (fecha : any, estado : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/PedidoExterno/fechaEntregaEstado/${fecha}/${estado}`);

  srvObtenerListaFechaCreacionUsuario = (fecha : any, usuario : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/PedidoExterno/fechaCreacionUsuario/${fecha}/${usuario}`);

  srvObtenerListaFechaCreacionEstado = (fecha : any, estado : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/PedidoExterno/fechaCreacionEstado/${fecha}/${estado}`);

  srvObtenerListaFechaEntregaEstadoVendedor = (fecha : any, estado : any, usuario : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/PedidoExterno/fechaEntregaEstadoVendedor/${fecha}/${estado}/${usuario}`);

  srvObtenerListaFechaCreacionEstadoVendedor = (fecha : any, estado : any, usuario : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/PedidoExterno/fechaCreacionEstadoVendedor/${fecha}/${estado}/${usuario}`);

  srvObtenerListaFechasEstadoVendedor = (fecha : any, fechaEntrega : any, estado : any, usuario : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/PedidoExterno/fechasEstadoVendedor/${fecha}/${fechaEntrega}/${estado}/${usuario}`);

  srvObtenerListaFechasEstado = (fecha : any, fechaEntrega : any, estado : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/PedidoExterno/fechasEstado/${fecha}/${fechaEntrega}/${estado}`);

  GetPedidosSinOT = ():Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + `/PedidoExterno/PedidosSinOT`);

  GetInfoPedido = (pedido : number):Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + `/PedidoExterno/getInfoPedido/${pedido}`);

  GetCrearPdfUltPedido = (pedido : number):Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + `/PedidoExterno/getCrearPdfUltPedido/${pedido}`);

  GetInfoEditarPedido = (pedido : number):Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + `/PedidoExterno/getInfoEditarPedido/${pedido}` );
    
  srvActualizarPedidosProductos = (id:number|string, data:any) => this.http.put(this.rutaPlasticaribeAPI + `/PedidoExterno/${id}`, data);

  srvGuardarPedidosProductos = (data : modelOpedidoproducto): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/PedidoExterno', data);

}
