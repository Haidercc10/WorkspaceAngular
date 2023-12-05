import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

export class InventarioZeusService {

 //Encapsular httpClient en Constructor.
  constructor(private http : HttpClient) { }

  //Crear ruta del api
  readonly rutaInventarioZeusAPI = environment.rutaZeus;

  /************************************************************ ARTICULOS **************************************************************/
  LikeGetClientes(texto : any){
    return this.http.get<any>(this.rutaInventarioZeusAPI + `/Articulos/getClientes/${texto}`);
  }

  GetCliente_Vendedor_LikeNombre = (vendedor : string, nombre : string) : Observable<any> => this.http.get<any>(`${this.rutaInventarioZeusAPI}/Articulos/GetCliente_Vendedor_LikeNombre/${vendedor}/${nombre}`);

  LikeGetVendedores(texto: any){
    return this.http.get<any>(this.rutaInventarioZeusAPI + `/Articulos/getVendedores/${texto}`);
  }

  LikeGetItems(texto: any){
    return this.http.get<any>(this.rutaInventarioZeusAPI + `/Articulos/getArticulos/${texto}`);
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

  /************************************************************ EXISTENCIAS **************************************************************/
  srvObtenerExistenciasZeus():Observable<any[]> {
    return this.http.get<any>(this.rutaInventarioZeusAPI + '/existencias');
  }

  getExistenciasProductos(item : any, presentacion: any) {
    return this.http.get<any>(this.rutaInventarioZeusAPI + `/Existencias/getExistenciasProductos/${item}/${presentacion}`);
  }

  srvObtenerExistenciasZeusXId(Articulo : any):Observable<any[]> {
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

  /************************************************************ FACTURACION DE CLIENTES **************************************************************/
  GetValorFacturadoHoy(){
    return this.http.get<any>(this.rutaInventarioZeusAPI + `/FacturaDeCliente/ValorFacturadoHoy`);
  }
  /************************************************************ MOVIMIENTOS ITEMS **************************************************************/
  GetFacturacionMensual(fecha1 : any, fecha2 : any){
    return this.http.get<any>(this.rutaInventarioZeusAPI + `/MovimientoItems/FacturacionMensual/${fecha1}/${fecha2}`);
  }

  GetFacturacionTodosMeses(mes : any, ano : any){
    return this.http.get<any>(this.rutaInventarioZeusAPI + `/MovimientoItems/FacturacionTodosMeses/${mes}/${ano}`);
  }

  GetFacturacion_Mes_Mes = (anio : string) => this.http.get<any>(this.rutaInventarioZeusAPI + `/MovimientoItems/getFacturacion_Mes_Mes/${anio}`);

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

  GetConsolidadClientesArticulo(ano1 : any, ano2 : any, ruta : string) {
    return this.http.get<any>(this.rutaInventarioZeusAPI + `/MovimientoItems/getConsolidadoClientesArticulo/${ano1}/${ano2}/${ruta}`);
  }

  GetDevoluciones(ano1 : any, ano2 : any) {
    return this.http.get<any>(this.rutaInventarioZeusAPI + `/MovimientoItems/getDevoluciones/${ano1}/${ano2}`);
  }

  GetInfoPedido_Consecutivo(id : any) : Observable<any[]> {
    return this.http.get<any>(this.rutaInventarioZeusAPI + `/MovimientoItems/getInfoPedido_Consecutivo/${id}`);
  }

  GetCostoFacturado_Vendedor = (vendedor : string, mes : any, anio : any) => this.http.get<any>(this.rutaInventarioZeusAPI + `/MovimientoItems/getCostoFacturado_Vendedor/${vendedor}/${mes}/${anio}`);

  GetClienteFacturadosMes = () : Observable<any> => this.http.get<any>(`${this.rutaInventarioZeusAPI}/MovimientoItems/getClienteFacturadosMes`);

  GetProductosFaturadosMes = () : Observable<any> => this.http.get<any>(`${this.rutaInventarioZeusAPI}/MovimientoItems/getProductosFaturadosMes`);

  GetVendedoresFacturasMes = () : Observable<any> => this.http.get<any>(`${this.rutaInventarioZeusAPI}/MovimientoItems/getVendedoresFacturasMes`);

  GetComprasMes = (anio : any, mes : any) : Observable<any> => this.http.get<any>(`${this.rutaInventarioZeusAPI}/MovimientoItems/getComprasMes/${anio}/${mes}`);

  GetComprasMesInverGoal_InverSuez = (anio : any, mes : any, id : string) : Observable<any> => this.http.get<any>(`${this.rutaInventarioZeusAPI}/MovimientoItems/getComprasMesInverGoal_InverSuez/${anio}/${mes}/${id}`);

  GetComprasMes_Mes_Plasticaribe = (anio : any) : Observable<any> => this.http.get<any>(`${this.rutaInventarioZeusAPI}/MovimientoItems/getComprasMes_Mes_Plasticaribe/${anio}`);

  GetComprasMes_Mes_InverGoal_InverSuez = (anio : any, id : string) : Observable<any> => this.http.get<any>(`${this.rutaInventarioZeusAPI}/MovimientoItems/getComprasMes_Mes_InverGoal_InverSuez/${anio}/${id}`);

  GetComprasDetalladas = (proveedor : any, factura : any) : Observable<any> => this.http.get<any>(`${this.rutaInventarioZeusAPI}/MovimientoItems/getComprasDetalladas/${proveedor}/${factura}`);

  GetFacturasEcopetrol = (factura, trm, valor, fecha) : Observable<any> => this.http.get<any>(`${this.rutaInventarioZeusAPI}/MovimientoItems/getFacturasEcopetrol/${factura}/${trm}/${valor}/${fecha}`);

  GetFacturacionDetallada = (fecha1 : any, fecha2 : any, ruta? : string) : Observable<any> => this.http.get<any>(`${this.rutaInventarioZeusAPI}/MovimientoItems/getFacturacionDetallada/${fecha1}/${fecha2}${ruta}`);

  GetFacturacionConsolidada = (fecha1 : any, fecha2 : any, ruta? : string) : Observable<any> => this.http.get<any>(`${this.rutaInventarioZeusAPI}/MovimientoItems/getFacturacionConsolidada/${fecha1}/${fecha2}${ruta}`);

  GetDevolucionesDetalladas = (fecha1 : any, fecha2 : any, indicadorCPI : any, ruta? : string) : Observable<any> => this.http.get<any>(`${this.rutaInventarioZeusAPI}/MovimientoItems/GetDevolucionesDetalladas/${fecha1}/${fecha2}/${indicadorCPI}${ruta}`);

  getNuevaFacturacionConsolidada = (fecha1 : any, fecha2 : any, ruta? : string) : Observable<any> => this.http.get<any>(`${this.rutaInventarioZeusAPI}/MovimientoItems/getNuevaFacturacionConsolidada/${fecha1}/${fecha2}${ruta}`);

  getNuevaDevolucionConsolidada = (fecha1 : any, fecha2 : any, ruta? : string) : Observable<any> => this.http.get<any>(`${this.rutaInventarioZeusAPI}/MovimientoItems/getNuevaDevolucionConsolidada/${fecha1}/${fecha2}${ruta}`);

  //*********************************************************************** TRANSAC ******************************************************************************/
  GetRecibosCaja = (fecha1 : any, fecha2 : any) : Observable<any> => this.http.get<any>(`${this.rutaInventarioZeusAPI}/Transac/getRecibosCaja/${fecha1}/${fecha2}`);

  ValorTotalFacturadoHoy = () : Observable<any> => this.http.get<any>(`${this.rutaInventarioZeusAPI}/Transac/ValorTotalFacturadoHoy`);
}
