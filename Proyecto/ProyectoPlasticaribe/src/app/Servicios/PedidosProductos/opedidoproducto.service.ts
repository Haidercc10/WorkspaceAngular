import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { Observable } from 'rxjs';
import { AppComponent} from 'src/app/app.component';
// import { AppComponent} from 'src/app/app.component';
import { modelOpedidoproducto } from '../../Modelo/modelOpedidoproducto';
import { rutaPlasticaribeAPI,  } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})
export class OpedidoproductoService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient,
    @Inject(SESSION_STORAGE) private storage: WebStorageService) {

    // if (this.storage.get('BD') == 1) this.rutaPlasticaribeAPI = rutaPlasticaribeAPI;
    // else if (this.storage.get('BD') == 2) this.rutaPlasticaribeAPI = ;
  }

//Metodo buscar lista de Pedidos de Productos
  srvObtenerListaPedidosProductos() {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/PedidoExterno');
  }

  srvObtenerListaPorId(dato : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/PedidoExterno/${dato}`);
  }

  srvObtenerListaPorIdPedidoLlenarPDF(dato : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/PedidoExterno/idPedidoLlenarPDF/${dato}`);
  }

  srvObtenerUltimoPedido(){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/PedidoExterno/UltimoPedido/`);
  }

  srvObtenerListaPedidoExterno(){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/PedidoExterno/PedidoExterno`);
  }

  srvObtenerListaFechaCreacion(fecha : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/PedidoExterno/FechaCreacion/${fecha}`);
  }

  srvObtenerListaFechaEntrega(fecha : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/PedidoExterno/FechaEntrega/${fecha}`);
  }

  srvObtenerListaNombreCliente(nombre : string){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/PedidoExterno/nombreCliente/${nombre}`);
  }

  srvObtenerListaIdCliente(id : number){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/PedidoExterno/idCliente/${id}`);
  }

  srvObtenerListanomberVendeder(nombre : string){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/PedidoExterno/nomberVendeder/${nombre}`);
  }

  srvObtenerListaIDPedido(id : number){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/PedidoExterno/idPedido/${id}`);
  }

  srvObtenerListanombreEstado(nombre : string){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/PedidoExterno/estadoNombre/${nombre}`);
  }

  srvObtenerListaFechas(fechaCreacion : any, fechaEntrega : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/PedidoExterno/fechacreacion/${fechaCreacion}/fechaEntrega${fechaEntrega}`);
  }

  srvObtenerListaEstadoUsuario(estado : any, usuario : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/PedidoExterno/estadoUsuario/${estado}/${usuario}`);
  }

  srvObtenerListaFechaEntregaUsuario(fecha : any, usuario : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/PedidoExterno/fechaEntregaUsuario/${fecha}/${usuario}`);
  }

  srvObtenerListaFechaEntregaEstado(fecha : any, estado : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/PedidoExterno/fechaEntregaEstado/${fecha}/${estado}`);
  }

  srvObtenerListaFechaCreacionUsuario(fecha : any, usuario : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/PedidoExterno/fechaCreacionUsuario/${fecha}/${usuario}`);
  }

  srvObtenerListaFechaCreacionEstado(fecha : any, estado : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/PedidoExterno/fechaCreacionEstado/${fecha}/${estado}`);
  }

  srvObtenerListaFechaEntregaEstadoVendedor(fecha : any, estado : any, usuario : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/PedidoExterno/fechaEntregaEstadoVendedor/${fecha}/${estado}/${usuario}`);
  }

  srvObtenerListaFechaCreacionEstadoVendedor(fecha : any, estado : any, usuario : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/PedidoExterno/fechaCreacionEstadoVendedor/${fecha}/${estado}/${usuario}`);
  }

  srvObtenerListaFechasEstadoVendedor(fecha : any, fechaEntrega : any, estado : any, usuario : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/PedidoExterno/fechasEstadoVendedor/${fecha}/${fechaEntrega}/${estado}/${usuario}`);
  }

  srvObtenerListaFechasEstado(fecha : any, fechaEntrega : any, estado : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/PedidoExterno/fechasEstado/${fecha}/${fechaEntrega}/${estado}`);
  }

  GetPedidosSinOT():Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/PedidoExterno/PedidosSinOT`);
  }

  GetInfoPedido(pedido : number):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/PedidoExterno/getInfoPedido/${pedido}`);
  }

  GetCrearPdfUltPedido(pedido : number):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/PedidoExterno/getCrearPdfUltPedido/${pedido}`);
  }

//Metodo agregar Pedidos de Productos
  srvAgregarPedidosProductos(data:any) {
    return this.http.post(this.rutaPlasticaribeAPI + '/PedidoExterno', data)
  }
  //Metodo actualzar Pedidos de Productos
  srvActualizarPedidosProductos(id:number|string, data:any) {
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
