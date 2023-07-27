import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaBagPro } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})
export class BagproService {

  constructor(private http : HttpClient) { }

  /********************************************************* PROCSELLADO **************************************************************/
  srvObtenerListaProcSellado = () :Observable<any[]> => this.http.get<any>(rutaBagPro + '/ProcSellado');

  srvObtenerListaProcSelladoOT = (ot : any):Observable<any[]> => this.http.get<any>(rutaBagPro + `/ProcSellado/OT/${ot}`);

  srvObtenerListaProcSelladoRollo = (ot : any):Observable<any[]> => this.http.get<any>(rutaBagPro + `/ProcSellado/Rollos/${ot}`);

  srvObtenerListaProcSelladoRollosOT = (ot : any):Observable<any[]> => this.http.get<any>(rutaBagPro + `/ProcSellado/RollosOT/${ot}`);

  srvObtenerListaProcSelladoFechas = (fecha1 : any, fecha2 : any):Observable<any[]> => this.http.get<any>(rutaBagPro + `/ProcSellado/Fechas/${fecha1}/${fecha2}`);

  srvObtenerListaProcSelladoFechasOT = (fecha1 : any, fecha2 : any, ot : any):Observable<any[]> => this.http.get<any>(rutaBagPro + `/ProcSellado/FechasOT/${fecha1}/${fecha2}/${ot}`);

  srvObtenerListaProcSelladoOT_FechaFinal = (ot : any):Observable<any> => this.http.get<any>(rutaBagPro + `/ProcSellado/FechaFinOT/${ot}`);

  srvObtenerListaProcSelladoProducido = (ot : any) => this.http.get<any>(rutaBagPro + `/ProcSellado/OtConSellado/${ot}`);

  srvObtenerListaProcSelladoProdPesoUnidades = (ot : any) => this.http.get<any>(rutaBagPro + `/ProcSellado/OtConSelladoPesoUnidad/${ot}`);

  srvObtenerListaFilasSelladoEnProcSellado = (ot : any) => this.http.get<any>(rutaBagPro + `/ProcSellado/ContarOtEnSellado/${ot}`);

  srvObtenerListaPorStatusSellado = (ot : any) => this.http.get<any>(rutaBagPro + `/ProcSellado/ObtenerDatosOTxSellado/${ot}`);

  srvObtenerListaPorStatusWiketiado = (ot : any) => this.http.get<any>(rutaBagPro + `/ProcSellado/ObtenerDatosOTxWiketiado/${ot}`);

  srvObtenerDataConsolidada_StatusSellado = (OT : any, Proceso: any) => this.http.get<any>(rutaBagPro + `/ProcSellado/MostrarDatosConsolidados_ProcSellado/${OT}/${Proceso}`);
  
  DeleteRollosSellado_Wiketiado = (id : any) => this.http.delete(rutaBagPro + `/ProcSellado/EliminarRollosSellado_Wiketiado/${id}`);

  srvObtenerListaFilasEmpaqueEnProcExtrusion = (ot : any) => this.http.get<any>(rutaBagPro + `/ProcSellado/ContarOtEnEmpaque/${ot}`);

  GetNominaSelladoAcumuladaItem = (fechaInicio : any, fechaFin : any) => this.http.get<any>(`${rutaBagPro}/ProcSellado/getNominaSelladoAcumuladaItem/${fechaInicio}/${fechaFin}`);

  GetNominaSelladoDetalladaItemPersona = (fechaInicio : any, fechaFin : any, item : any, persona : string) => this.http.get<any>(`${rutaBagPro}/ProcSellado/getNominaSelladoDetalladaItemPersona/${fechaInicio}/${fechaFin}/${item}/${persona}`);

  GetNominaSelladoDetalladaxBulto = (fechaInicio : any, fechaFin : any) => this.http.get<any>(`${rutaBagPro}/ProcSellado/GetNominaSelladoDetalladaxBulto/${fechaInicio}/${fechaFin}`);

  /***************************************************** PROCEXTRUSION ***************************************************************/
  srvObtenerListaProcExt = ():Observable<any[]> => this.http.get<any>(rutaBagPro + '/ProcExtrusion');

  srvObtenerListaProcExtOt = (ot : any):Observable<any[]> => this.http.get<any>(rutaBagPro + `/ProcExtrusion/OT/${ot}`);

  srvObtenerListaPorRollo = (rollo : any, produ : any):Observable<any[]> => this.http.get<any>(rutaBagPro + `/ProcExtrusion/MostrarRollos/${rollo}/${produ}`);
  
  srvObtenerListaProcExtOt_fechaFinal = (ot : any):Observable<any> => this.http.get<any>(rutaBagPro + `/ProcExtrusion/FechaFinOT/${ot}`);

  srvObtenerListaProcextrusionProducido = (ot : any) => this.http.get<any>(rutaBagPro + `/ProcExtrusion/OtConEmpaque/${ot}`);

  srvObtenerListaProcExtrusionRollosOT = (ot : any):Observable<any[]> => this.http.get<any>(rutaBagPro + `/ProcExtrusion/RollosOT/${ot}`);

  srvObtenerListaProcExtrusionRollos = (ot : any):Observable<any[]> => this.http.get<any>(rutaBagPro + `/ProcExtrusion/Rollos/${ot}`);

  srvObtenerListaProcExtrusionFechas = (fecha1 : any, fecha2 : any):Observable<any[]> => this.http.get<any>(rutaBagPro + `/ProcExtrusion/FechasRollos/${fecha1}/${fecha2}`);
  
  consultarFechas = (fecha1 : any, fecha2 : any):Observable<any[]> => this.http.get<any>(rutaBagPro + `/ProcExtrusion/Fechas/${fecha1}/${fecha2}`);

  srvObtenerListaProcExtrusionFechasOT = (fecha1 : any, fecha2 : any, ot : any):Observable<any[]> => this.http.get<any>(rutaBagPro + `/ProcExtrusion/FechasOTRollos/${fecha1}/${fecha2}/${ot}`);

  consultarRollo = (rollo : any):Observable<any[]> => this.http.get<any>(rutaBagPro + `/ProcExtrusion/consultarRollo/${rollo}`);

  Delete = (id : any) => this.http.delete(rutaBagPro + `/ProcExtrusion/EliminarRolloProcExtrusion/${id}`);

  DeleteRollosExtrusion_Empaque = (id : any) => this.http.delete(rutaBagPro + `/ProcExtrusion/EliminarRollosExtrusion_Empaque/${id}`);

  GetRollosExtrusion_Empaque_Sellado = (fechaInicial : any, fechaFinal : any, proceso : string, ruta : string) => this.http.get<any>(rutaBagPro + `/ProcExtrusion/getRollosExtrusion_Empaque_Sellado/${fechaInicial}/${fechaFinal}/${proceso}${ruta}`);

  GetProcExtrusion_ProcSellado = (fechaInicio : any, fechaFin : any, ruta : any) => this.http.get<any>(`${rutaBagPro}/ProcExtrusion/getProcExtrusion_ProcSellado/${fechaInicio}/${fechaFin}${ruta}`);

  getDatosxNomStatus = (status : any) => this.http.get<any>(rutaBagPro + `/ProcExtrusion/DatosxNomStatus/${status}`);

  getDatosxFechasxNomStatus = (fecha1 : any, fecha2 : any, status : any) => this.http.get<any>(rutaBagPro + `/ProcExtrusion/DatosxFechasxNomStatus/${fecha1}/${fecha2}/${status}`);

  getDatosxRolloxNomStatus = (rollo : any, status : any) => this.http.get<any>(rutaBagPro + `/ProcExtrusion/DatosxRolloxNomStatus/${rollo}/${status}`);

  getDatosxOTxNomStatus = (OT : any, status : any) => this.http.get<any>(rutaBagPro + `/ProcExtrusion/DatosxOTxNomStatus/${OT}/${status}`);

  srvObtenerListaProcExtrusionOT = (ot : any):Observable<any[]> => this.http.get<any>(rutaBagPro + `/ProcExtrusion/Orden_Trabajo/${ot}`);

  srvObtenerListaPorStatusExtrusion = (OT : any):Observable<any[]> => this.http.get<any>(rutaBagPro + `/ProcExtrusion/ObtenerDatosOTxExtrusion/${OT}`);

  srvObtenerListaPorStatusImpresion = (OT : any):Observable<any[]> => this.http.get<any>(rutaBagPro + `/ProcExtrusion/ObtenerDatosOTxImpresion/${OT}`);

  srvObtenerListaPorStatusRotograbado = (OT : any):Observable<any[]> => this.http.get<any>(rutaBagPro + `/ProcExtrusion/ObtenerDatosOTxRotograbado/${OT}`);

  srvObtenerListaPorStatusDoblado = (OT : any):Observable<any[]> => this.http.get<any>(rutaBagPro + `/ProcExtrusion/ObtenerDatosOTxDoblado/${OT}`);

  srvObtenerListaPorStatusLaminado = (OT : any):Observable<any[]> => this.http.get<any>(rutaBagPro + `/ProcExtrusion/ObtenerDatosOTxLaminado/${OT}`);

  srvObtenerListaPorStatusCorte = (OT : any):Observable<any[]> => this.http.get<any>(rutaBagPro + `/ProcExtrusion/ObtenerDatosOTxCorte/${OT}`);

  srvObtenerListaPorStatusEmpaque = (OT : any):Observable<any[]> => this.http.get<any>(rutaBagPro + `/ProcExtrusion/ObtenerDatosOTxEmpaque/${OT}`);

  srvObtenerDataConsolidada_StatusExtrusion = (OT : any, Proceso: any):Observable<any[]> => this.http.get<any>(rutaBagPro + `/ProcExtrusion/MostrarDatosConsolidados_ProcExtrusion/${OT}/${Proceso}`);

  /********************************************************** CLIENTESOT ****************************************************************/
  srvActualizar = (id:number|String, data:any, estado : any) => this.http.put(rutaBagPro + `/ClientesOt/CambioEstadoOT/${id}?Estado=${estado}`, data);

  srvObtenerListaClienteOT_Item = (ot : any):Observable<any[]> => this.http.get<any>(rutaBagPro + `/ClientesOt/OT/${ot}`);

  srvObtenerListaClienteOT_Item_Presentacion = (producto : number, presentacion : string):Observable<any[]> => this.http.get<any>(rutaBagPro + `/ClientesOt/OT_Cliente_Item_Presentacion/${producto}/${presentacion}`);

  srvObtenerListaClienteOT_Fecha = (fecha : any):Observable<any[]> => this.http.get<any>(rutaBagPro + `/ClientesOt/FechaCreacion/${fecha}`);

  srvObtenerListaClienteOT_Fechas = (fecha1 : any, fecha2 : any):Observable<any[]> => this.http.get<any>(rutaBagPro + `/ClientesOt/FechasCreacion?FechaCrea1=${fecha1}&FechaCrea2=${fecha2}`);

  srvObtenerListaClienteOT_ItemCostos = (ot : any):Observable<any[]> => this.http.get<any>(rutaBagPro + `/ClientesOt/CostosOT/${ot}`);

  srvObtenerListaClienteOT_UltimaOT = ():Observable<any> => this.http.get<any>(rutaBagPro + `/ClientesOt/UltimaOT/`);

  srvObtenerListaConsultarItem = (fecha1 : any, fecha2 : any, item : any, precio : any):Observable<any[]> => this.http.get<any>(rutaBagPro + `/ClientesOt/consultarItem/${fecha1}/${fecha2}/${item}/${precio}`);
  
  GetCostoOrdenesUltimoMes = (fecha1 : any, fecha2 : any):Observable<any[]> => this.http.get<any>(rutaBagPro + `/ClientesOt/getCostoOrdenesUltimoMes/${fecha1}/${fecha2}`);
  
  GetCostoOrdenesUltimoMes_Vendedores = (fecha1 : any, fecha2 : any):Observable<any[]> => this.http.get<any>(rutaBagPro + `/ClientesOt/getCostoOredenesUltimoMes_Vendedores/${fecha1}/${fecha2}`);
  
  GetCostoOrdenesUltimoMes_Clientes = (fecha1 : any, fecha2 : any):Observable<any[]> => this.http.get<any>(rutaBagPro + `/ClientesOt/getCostoOredenesUltimoMes_Clientes/${fecha1}/${fecha2}`);
  
  GetPesoProcesosUltimoMes = (fecha1 : any, fecha2 : any):Observable<any[]> => this.http.get<any>(rutaBagPro + `/ClientesOt/getPesoProcesosUltimoMes/${fecha1}/${fecha2}`);
  
  GetCantOrdenesMateriales = (fecha1 : any, fecha2 : any):Observable<any[]> => this.http.get<any>(rutaBagPro + `/ClientesOt/getCantOrdenesMateriales/${fecha1}/${fecha2}`);
  
  /**************************************************************** CLIENTESOTITEM *******************************************************/
  srvObtenerListaClienteOTItems = ():Observable<any[]> => this.http.get<any>(rutaBagPro + '/ClientesOtItems');

  srvObtenerItemsBagproXClienteItem = (codigo : any):Observable<any[]> => this.http.get<any>(rutaBagPro + `/ClientesOtItems/OtItem/${codigo}`);

  srvObtenerOTsPorVendedor = (OT: any):Observable<any[]> => this.http.get<any>(rutaBagPro + `/ClientesOt/BuscarOTxVendedores/${OT}`);

  /*********************************************************** DESPERDICIO **************************************************************/
  srvObtenerListaDespercicios = ():Observable<any[]> => this.http.get<any>(rutaBagPro + '/Procdesperdicio');

  srvObtenerListaDespercicios_Ot = (ot : any):Observable<any[]> => this.http.get<any>(rutaBagPro + `/Procdesperdicio/OT/${ot}`);

  consultarOTImpresion = (ot : any) => this.http.get<any>(rutaBagPro + `/ProcImpresionRollosBopp/consultaOtImpresion/${ot}`);

  /***************************************************************** Operarios **********************************************************/
  srvObtenerListaOperariosExtrusion = () => this.http.get<any>(rutaBagPro + '/OperariosProcesos/NombreOperarios');

  srvObtenerListaOperariosExtrusion2 = (nombre : any) => this.http.get<any>(rutaBagPro + `/OperariosProcesos/NombreOperarios2/${nombre}`);

  /************************************************************** Clientes **************************************************************/
  srvObtenerListaUltimosClientes = (fecha : any) => this.http.get<any>(rutaBagPro + `/Clientes/UltimosClientes/${fecha}`);

  srvObtenerListaUltimosClientes2 = (fecha : any, cliente : any) => this.http.get<any>(rutaBagPro + `/Clientes/UltimosClientes2/${fecha}/${cliente}`);

  getNominaSelladoAcumuladaItem = (fecha1 : any, fecha2 : any):Observable<any[]> => this.http.get<any>(rutaBagPro + `/ProcSellado/getNominaSelladoAcumuladaItem/${fecha1}/${fecha2}`);
}
