import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaZeus } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})
export class InventarioZeusService {

 //Encapsular httpClient en Constructor.
  constructor(private http : HttpClient) { }

  //Crear ruta del api
  readonly rutaInventarioZeusAPI = rutaZeus;

  /************************************************************ ARTICULOS **************************************************************/
  LikeGetClientes(texto : any){
    return this.http.get<any>(this.rutaInventarioZeusAPI + `/Articulos/getClientes/${texto}`);
  }

  LikeGetVendedores(texto: any){
    return this.http.get<any>(this.rutaInventarioZeusAPI + `/Articulos/getVendedores/${texto}`);
  }

  LikeGetItems(texto: any){
    return this.http.get<any>(this.rutaInventarioZeusAPI + `/Articulos/getArticulos/${texto}`);
  }

  /************************************************************ EXISTENCIAS **************************************************************/
  srvObtenerExistenciasZeus():Observable<any[]> {
    return this.http.get<any>(this.rutaInventarioZeusAPI + '/existencias');
  }

  getExistenciasProductos(item : number, presentacion: any) {
    return this.http.get<any>(this.rutaInventarioZeusAPI + `/Existencias/getExistenciasProductos/${item}/${presentacion}`);
  }

  srvObtenerExistenciasZeusXId(Articulo : number):Observable<any[]> {
    return this.http.get<any>(this.rutaInventarioZeusAPI + `/existencias/idArticulo/${Articulo}`);
  }

  srvObtenerExistenciasArticulosZeus():Observable<any[]> {
    return this.http.get<any>(this.rutaInventarioZeusAPI + '/existencias/BusquedaCodigoArticulo');
  }

  GetExistenciasArticulo(id : string):Observable<any[]> {
    return this.http.get<any>(this.rutaInventarioZeusAPI + `/existencias/getExistenciasArticulo/${id}`);
  }

  GetPrecioUltimoPrecioFacturado(producto : string, presentacion : string):Observable<any> {
    return this.http.get<any>(this.rutaInventarioZeusAPI + `/existencias/getPrecioUltimoPrecioFacturado/${producto}/${presentacion}`);
  }

  /************************************************************ DOCUMENTOS ITEMS **************************************************************/
  GetProductosFacturados(fecha1 : any, fecha2 : any){
    return this.http.get<any>(this.rutaInventarioZeusAPI + `/DocumentoItems/ProductosFacturados/${fecha1}/${fecha2}`);
  }

  /************************************************************ FACTURACION DE CLIENTES **************************************************************/
  GetValorFacturadoHoy(){
    return this.http.get<any>(this.rutaInventarioZeusAPI + `/FacturaDeCliente/ValorFacturadoHoy`);
  }
  /************************************************************ MOVIMIENTOS ITEMS **************************************************************/
  GetFacturacionMensual(fecha1 : any, fecha2 : any){
    return this.http.get<any>(this.rutaInventarioZeusAPI + `/MovimientoItems/FacturacionMensual/${fecha1}/${fecha2}`);
  }

  GetFacturacionTodosMeses(mes : number, ano : number){
    return this.http.get<any>(this.rutaInventarioZeusAPI + `/MovimientoItems/FacturacionTodosMeses/${mes}/${ano}`);
  }

  GetIvaVentaMensual(fecha1 : any, fecha2 : any){
    return this.http.get<any>(this.rutaInventarioZeusAPI + `/MovimientoItems/GetIvaVentaMensual/${fecha1}/${fecha2}`);
  }

  GetIvaCompraMensual(fecha1 : any, fecha2 : any){
    return this.http.get<any>(this.rutaInventarioZeusAPI + `/MovimientoItems/GetIvaCompraMensual/${fecha1}/${fecha2}`);
  }

  GetIvaCompraTodosMeses(mes : any){
    return this.http.get<any>(this.rutaInventarioZeusAPI + `/MovimientoItems/GetIvaCompraTodosMeses/${mes}`);
  }

  GetPedidosAgrupados(){
    return this.http.get<any>(this.rutaInventarioZeusAPI + `/MovimientoItems/getPedidosAgrupados`);
  }

  GetPedidos(){
    return this.http.get<any>(this.rutaInventarioZeusAPI + `/MovimientoItems/getPedidos`);
  }

  getClientesxVendedor(vendedor : any){
    return this.http.get<any>(this.rutaInventarioZeusAPI + `/Articulos/getClientesxVendedor/${vendedor}`);
  }

  getClientesxId(idcliente : any){
    return this.http.get<any>(this.rutaInventarioZeusAPI + `/Articulos/getClientesxId/${idcliente}`);
  }

  getVendedoresxId(id: any){
    return this.http.get<any>(this.rutaInventarioZeusAPI + `/Articulos/getVendedoresxId/${id}`);
  }

  getArticulosxId(id: any){
    return this.http.get<any>(this.rutaInventarioZeusAPI + `/Articulos/getArticulosxId/${id}`);
  }

  getArticulosxCliente(id: any){
    return this.http.get<any>(this.rutaInventarioZeusAPI + `/MovimientoItems/getArticulosxCliente/${id}`);
  }

  getPedidosXConsecutivo(id : any) {
    return this.http.get<any>(this.rutaInventarioZeusAPI + `/MovimientoItems/getPedidosPorConsecutivo/${id}`);
  }

  getPedidosCliente() {
    return this.http.get<any>(this.rutaInventarioZeusAPI + `/MovimientoItems/getPedidosCliente`);
  }

  getPedidosProductos() {
    return this.http.get<any>(this.rutaInventarioZeusAPI + `/MovimientoItems/getPedidosProductos`);
  }

  getPedidosVendedores() {
    return this.http.get<any>(this.rutaInventarioZeusAPI + `/MovimientoItems/getPedidosVendedores`);
  }

  getPedidosEstados() {
    return this.http.get<any>(this.rutaInventarioZeusAPI + `/MovimientoItems/getPedidosEstados`);
  }

  getPedidosStock() {
    return this.http.get<any>(this.rutaInventarioZeusAPI + `/MovimientoItems/getPedidosStock`);
  }

  GetConsolidadClientesArticulo(ano1 : number, ano2 : number, ruta : string) {
    return this.http.get<any>(this.rutaInventarioZeusAPI + `/MovimientoItems/getConsolidadoClientesArticulo/${ano1}/${ano2}/${ruta}`);
  }

  GetInfoPedido_Consecutivo(id : number) : Observable<any[]> {
    return this.http.get<any>(this.rutaInventarioZeusAPI + `/MovimientoItems/getInfoPedido_Consecutivo/${id}`);
  }
}
