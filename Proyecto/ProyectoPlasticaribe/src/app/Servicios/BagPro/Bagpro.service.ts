import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaBagPro } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})
export class BagproService {

  readonly rutaBagPro = rutaBagPro;

  constructor(private http : HttpClient) { }

  /********************************************************* PROCSELLADO **************************************************************/
  srvObtenerListaProcSellado():Observable<any[]> {
    return this.http.get<any>(this.rutaBagPro + '/ProcSellado');
  }

  srvObtenerListaProcSelladoOT(ot : any):Observable<any[]> {
    return this.http.get<any>(this.rutaBagPro + `/ProcSellado/OT/${ot}`);
  }

  srvObtenerListaProcSelladoRollo(ot : any):Observable<any[]> {
    return this.http.get<any>(this.rutaBagPro + `/ProcSellado/Rollos/${ot}`);
  }

  srvObtenerListaProcSelladoRollosOT(ot : any):Observable<any[]> {
    return this.http.get<any>(this.rutaBagPro + `/ProcSellado/RollosOT/${ot}`);
  }

  srvObtenerListaProcSelladoFechas(fecha1 : any, fecha2 : any):Observable<any[]> {
    return this.http.get<any>(this.rutaBagPro + `/ProcSellado/Fechas/${fecha1}/${fecha2}`);
  }

  srvObtenerListaProcSelladoFechasOT(fecha1 : any, fecha2 : any, ot : any):Observable<any[]> {
    return this.http.get<any>(this.rutaBagPro + `/ProcSellado/FechasOT/${fecha1}/${fecha2}/${ot}`);
  }

  srvObtenerListaProcSelladoOT_FechaFinal(ot : any):Observable<any> {
    return this.http.get<any>(this.rutaBagPro + `/ProcSellado/FechaFinOT/${ot}`);
  }

  srvObtenerListaProcSelladoProducido(ot : any){
    return this.http.get<any>(this.rutaBagPro + `/ProcSellado/OtConSellado/${ot}`);
  }

  srvObtenerListaProcSelladoProdPesoUnidades(ot : any){
    return this.http.get<any>(this.rutaBagPro + `/ProcSellado/OtConSelladoPesoUnidad/${ot}`);
  }

   /** Nvo */
   srvObtenerListaFilasSelladoEnProcSellado(ot : any) {
    return this.http.get<any>(this.rutaBagPro + `/ProcSellado/ContarOtEnSellado/${ot}`);
  }

  /** Consultas por NomStatus en ProcSellado*/
  srvObtenerListaPorStatusSellado(ot : any) {
    return this.http.get<any>(this.rutaBagPro + `/ProcSellado/ObtenerDatosOTxSellado/${ot}`);
  }

  srvObtenerListaPorStatusWiketiado(ot : any) {
    return this.http.get<any>(this.rutaBagPro + `/ProcSellado/ObtenerDatosOTxWiketiado/${ot}`);
  }

  srvObtenerDataConsolidada_StatusSellado(OT : any, Proceso: any) {
    return this.http.get<any>(this.rutaBagPro + `/ProcSellado/MostrarDatosConsolidados_ProcSellado/${OT}/${Proceso}`);
  }

  DeleteRollosSellado_Wiketiado(id : any) {
    return this.http.delete(this.rutaBagPro + `/ProcSellado/EliminarRollosSellado_Wiketiado/${id}`);
  }

  /** Nvo */
  srvObtenerListaFilasEmpaqueEnProcExtrusion(ot : any) {
    return this.http.get<any>(this.rutaBagPro + `/ProcSellado/ContarOtEnEmpaque/${ot}`);
  }

  GetNominaSelladoAgrupada = (fechaInicio : any, fechaFin : any) => this.http.get<any>(`${this.rutaBagPro}/ProcSellado/getNominaSelladoAgrupada/${fechaInicio}/${fechaFin}`);
  /***************************************************** PROCEXTRUSION ***************************************************************/

  srvObtenerListaProcExt():Observable<any[]> {
    return this.http.get<any>(this.rutaBagPro + '/ProcExtrusion');
  }

  srvObtenerListaProcExtOt(ot : any):Observable<any[]> {
    return this.http.get<any>(this.rutaBagPro + `/ProcExtrusion/OT/${ot}`);
  }

  srvObtenerListaPorRollo(rollo : any, produ : any):Observable<any[]> {
    return this.http.get<any>(this.rutaBagPro + `/ProcExtrusion/MostrarRollos/${rollo}/${produ}`);
  }

  srvObtenerListaProcExtOt_fechaFinal(ot : any):Observable<any> {
    return this.http.get<any>(this.rutaBagPro + `/ProcExtrusion/FechaFinOT/${ot}`);
  }

  srvObtenerListaProcextrusionProducido(ot : any) {
    return this.http.get<any>(this.rutaBagPro + `/ProcExtrusion/OtConEmpaque/${ot}`);
  }

  srvObtenerListaProcExtrusionRollosOT(ot : any):Observable<any[]> {
    return this.http.get<any>(this.rutaBagPro + `/ProcExtrusion/RollosOT/${ot}`);
  }

  srvObtenerListaProcExtrusionRollos(ot : any):Observable<any[]> {
    return this.http.get<any>(this.rutaBagPro + `/ProcExtrusion/Rollos/${ot}`);
  }

  srvObtenerListaProcExtrusionFechas(fecha1 : any, fecha2 : any):Observable<any[]> {
    return this.http.get<any>(this.rutaBagPro + `/ProcExtrusion/FechasRollos/${fecha1}/${fecha2}`);
  }

  consultarFechas(fecha1 : any, fecha2 : any):Observable<any[]> {
    return this.http.get<any>(this.rutaBagPro + `/ProcExtrusion/Fechas/${fecha1}/${fecha2}`);
  }

  srvObtenerListaProcExtrusionFechasOT(fecha1 : any, fecha2 : any, ot : any):Observable<any[]> {
    return this.http.get<any>(this.rutaBagPro + `/ProcExtrusion/FechasOTRollos/${fecha1}/${fecha2}/${ot}`);
  }

  consultarRollo(rollo : any):Observable<any[]> {
    return this.http.get<any>(this.rutaBagPro + `/ProcExtrusion/consultarRollo/${rollo}`);
  }

  EliminarRollExtrusion(id : any) {
    return this.http.delete(this.rutaBagPro + `/ProcExtrusion/EliminarRollExtrusion/${id}`);
  }

  DeleteRollosExtrusion_Empaque(id : any) {
    return this.http.delete(this.rutaBagPro + `/ProcExtrusion/EliminarRollosExtrusion_Empaque/${id}`);
  }

  GetRollosExtrusion_Empaque_Sellado(fechaInicial : any, fechaFinal : any, proceso : string, ruta : string){
    return this.http.get<any>(this.rutaBagPro + `/ProcExtrusion/getRollosExtrusion_Empaque_Sellado/${fechaInicial}/${fechaFinal}/${proceso}${ruta}`);
  }

  /**  Obtener datos por NomStatus  */
  getDatosxNomStatus(status : any) {
    return this.http.get<any>(this.rutaBagPro + `/ProcExtrusion/DatosxNomStatus/${status}`);
  }

  getDatosxFechasxNomStatus(fecha1 : any, fecha2 : any, status : any) {
    return this.http.get<any>(this.rutaBagPro + `/ProcExtrusion/DatosxFechasxNomStatus/${fecha1}/${fecha2}/${status}`);
  }

  getDatosxRolloxNomStatus(rollo : any, status : any) {
    return this.http.get<any>(this.rutaBagPro + `/ProcExtrusion/DatosxRolloxNomStatus/${rollo}/${status}`);
  }

  getDatosxOTxNomStatus(OT : any, status : any) {
    return this.http.get<any>(this.rutaBagPro + `/ProcExtrusion/DatosxOTxNomStatus/${OT}/${status}`);
  }

  srvObtenerListaProcExtrusionOT(ot : any):Observable<any[]> {
    return this.http.get<any>(this.rutaBagPro + `/ProcExtrusion/Orden_Trabajo/${ot}`);
  }

  /** Consultas por NomStatus en ProcExtrusion */
  srvObtenerListaPorStatusExtrusion(OT : any):Observable<any[]> {
    return this.http.get<any>(this.rutaBagPro + `/ProcExtrusion/ObtenerDatosOTxExtrusion/${OT}`);
  }

  srvObtenerListaPorStatusImpresion(OT : any):Observable<any[]> {
    return this.http.get<any>(this.rutaBagPro + `/ProcExtrusion/ObtenerDatosOTxImpresion/${OT}`);
  }

  srvObtenerListaPorStatusRotograbado(OT : any):Observable<any[]> {
    return this.http.get<any>(this.rutaBagPro + `/ProcExtrusion/ObtenerDatosOTxRotograbado/${OT}`);
  }

  srvObtenerListaPorStatusDoblado(OT : any):Observable<any[]> {
    return this.http.get<any>(this.rutaBagPro + `/ProcExtrusion/ObtenerDatosOTxDoblado/${OT}`);
  }

  srvObtenerListaPorStatusLaminado(OT : any):Observable<any[]> {
    return this.http.get<any>(this.rutaBagPro + `/ProcExtrusion/ObtenerDatosOTxLaminado/${OT}`);
  }

  srvObtenerListaPorStatusCorte(OT : any):Observable<any[]> {
    return this.http.get<any>(this.rutaBagPro + `/ProcExtrusion/ObtenerDatosOTxCorte/${OT}`);
  }

  srvObtenerListaPorStatusEmpaque(OT : any):Observable<any[]> {
    return this.http.get<any>(this.rutaBagPro + `/ProcExtrusion/ObtenerDatosOTxEmpaque/${OT}`);
  }

/** Servcios de datos consolidados para Estados Procesos OT */
  srvObtenerDataConsolidada_StatusExtrusion(OT : any, Proceso: any):Observable<any[]> {
    return this.http.get<any>(this.rutaBagPro + `/ProcExtrusion/MostrarDatosConsolidados_ProcExtrusion/${OT}/${Proceso}`);
  }

  /********************************************************** CLIENTESOT ****************************************************************/

  srvActualizar(id:number|String, data:any, estado : any) {
    return this.http.put(this.rutaBagPro + `/ClientesOt/CambioEstadoOT/${id}?Estado=${estado}`, data);
  }

  // CONSULTA A LA TABLA CLIENTES_OT_ITEM DE BAGPRO
  srvObtenerListaClienteOT_Item(ot : any):Observable<any[]> {
    return this.http.get<any>(this.rutaBagPro + `/ClientesOt/OT/${ot}`);
  }

   // CONSULTA A LA TABLA CLIENTES_OT_ITEM DE BAGPRO
   srvObtenerListaClienteOT_Item_Presentacion(producto : number, presentacion : string):Observable<any[]> {
    return this.http.get<any>(this.rutaBagPro + `/ClientesOt/OT_Cliente_Item_Presentacion/${producto}/${presentacion}`);
  }

  srvObtenerListaClienteOT_Fecha(fecha : any):Observable<any[]> {
    return this.http.get<any>(this.rutaBagPro + `/ClientesOt/FechaCreacion/${fecha}`);
  }

  srvObtenerListaClienteOT_Fechas(fecha1 : any, fecha2 : any):Observable<any[]> {
    return this.http.get<any>(this.rutaBagPro + `/ClientesOt/FechasCreacion?FechaCrea1=${fecha1}&FechaCrea2=${fecha2}`);
  }

  srvObtenerListaClienteOT_ItemCostos(ot : any):Observable<any[]> {
    return this.http.get<any>(this.rutaBagPro + `/ClientesOt/CostosOT/${ot}`);
  }

  srvObtenerListaClienteOT_UltimaOT():Observable<any> {
    return this.http.get<any>(this.rutaBagPro + `/ClientesOt/UltimaOT/`);
  }

  srvObtenerListaConsultarItem(fecha1 : any, fecha2 : any, item : any, precio : any):Observable<any[]> {
    return this.http.get<any>(this.rutaBagPro + `/ClientesOt/consultarItem/${fecha1}/${fecha2}/${item}/${precio}`);
  }

  GetCostoOrdenesUltimoMes(fecha1 : any, fecha2 : any):Observable<any[]> {
    return this.http.get<any>(this.rutaBagPro + `/ClientesOt/getCostoOrdenesUltimoMes/${fecha1}/${fecha2}`);
  }

  GetCostoOrdenesUltimoMes_Vendedores(fecha1 : any, fecha2 : any):Observable<any[]> {
    return this.http.get<any>(this.rutaBagPro + `/ClientesOt/getCostoOredenesUltimoMes_Vendedores/${fecha1}/${fecha2}`);
  }

  GetCostoOrdenesUltimoMes_Clientes(fecha1 : any, fecha2 : any):Observable<any[]> {
    return this.http.get<any>(this.rutaBagPro + `/ClientesOt/getCostoOredenesUltimoMes_Clientes/${fecha1}/${fecha2}`);
  }

  GetPesoProcesosUltimoMes(fecha1 : any, fecha2 : any):Observable<any[]> {
    return this.http.get<any>(this.rutaBagPro + `/ClientesOt/getPesoProcesosUltimoMes/${fecha1}/${fecha2}`);
  }

  GetCantOrdenesMateriales(fecha1 : any, fecha2 : any):Observable<any[]> {
    return this.http.get<any>(this.rutaBagPro + `/ClientesOt/getCantOrdenesMateriales/${fecha1}/${fecha2}`);
  }

  /**************************************************************** CLIENTESOTITEM *******************************************************/

  // CONSULTA A LA TABLA CLIENTES_OT_ITEM DE BAGPRO
  srvObtenerListaClienteOTItems():Observable<any[]> {
    return this.http.get<any>(this.rutaBagPro + '/ClientesOtItems');
  }

  srvObtenerItemsBagproXClienteItem(codigo : any):Observable<any[]> {
    return this.http.get<any>(this.rutaBagPro + `/ClientesOtItems/OtItem/${codigo}`);
  }

  srvObtenerOTsPorVendedor(/*vendedor : any,*/ OT: any):Observable<any[]> {
    return this.http.get<any>(this.rutaBagPro + `/ClientesOt/BuscarOTxVendedores/${OT}`);
  }

  /*********************************************************** DESPERDICIO **************************************************************/

  // CONSULTAS A LA TABLA PROC_DESPERDICIOS DE BAGPRO
  srvObtenerListaDespercicios():Observable<any[]> {
    return this.http.get<any>(this.rutaBagPro + '/Procdesperdicio');
  }

  srvObtenerListaDespercicios_Ot(ot : any):Observable<any[]> {
    return this.http.get<any>(this.rutaBagPro + `/Procdesperdicio/OT/${ot}`);
  }

  /* Rutas para consultas a la tabla de ProcImpresion_RolloBOPP*/
  consultarOTImpresion(ot : any) {
    return this.http.get<any>(this.rutaBagPro + `/ProcImpresionRollosBopp/consultaOtImpresion/${ot}`);
  }

  /***************************************************************** Operarios **********************************************************/
  srvObtenerListaOperariosExtrusion() {
    return this.http.get<any>(this.rutaBagPro + '/OperariosProcesos/NombreOperarios');
  }

  srvObtenerListaOperariosExtrusion2(nombre : any) {
    return this.http.get<any>(this.rutaBagPro + `/OperariosProcesos/NombreOperarios2/${nombre}`);
  }

  /************************************************************** Clientes **************************************************************/

  srvObtenerListaUltimosClientes(fecha : any) {
    return this.http.get<any>(this.rutaBagPro + `/Clientes/UltimosClientes/${fecha}`);
  }

  srvObtenerListaUltimosClientes2(fecha : any, cliente : any) {
    return this.http.get<any>(this.rutaBagPro + `/Clientes/UltimosClientes2/${fecha}/${cliente}`);
  }

  /** ProcSellado */
  getNominaSellado = (fecha1 : any, fecha2 : any):Observable<any[]> =>( this.http.get<any>(this.rutaBagPro + `/ProcSellado/getNominaSellado/${fecha1}/${fecha2}`));
}
