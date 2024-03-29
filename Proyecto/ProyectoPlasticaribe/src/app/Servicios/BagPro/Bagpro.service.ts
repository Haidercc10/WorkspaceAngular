import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BagproService {

  readonly rutaBagPro = environment.rutaBagPro;

  constructor(private http : HttpClient) { }

  /********************************************************* PROCSELLADO **************************************************************/
  srvObtenerListaProcSellado = () :Observable<any[]> => this.http.get<any>(this.rutaBagPro + '/ProcSellado');

  srvObtenerListaProcSelladoOT = (ot : any):Observable<any[]> => this.http.get<any>(this.rutaBagPro + `/ProcSellado/OT/${ot}`);

  srvObtenerListaProcSelladoOT_FechaFinal = (ot : any):Observable<any> => this.http.get<any>(this.rutaBagPro + `/ProcSellado/FechaFinOT/${ot}`);

  DeleteRollosSellado_Wiketiado = (id : any) => this.http.delete(this.rutaBagPro + `/ProcSellado/EliminarRollosSellado_Wiketiado/${id}`);

  GetNominaSelladoAcumuladaItem = (fechaInicio : any, fechaFin : any) => this.http.get<any>(`${this.rutaBagPro}/ProcSellado/getNominaSelladoAcumuladaItem/${fechaInicio}/${fechaFin}`);

  GetNominaSelladoDetalladaItemPersona = (fechaInicio : any, fechaFin : any, item : any, persona : string) => this.http.get<any>(`${this.rutaBagPro}/ProcSellado/getNominaSelladoDetalladaItemPersona/${fechaInicio}/${fechaFin}/${item}/${persona}`);

  GetNominaSelladoDetalladaxBulto = (fechaInicio : any, fechaFin : any) => this.http.get<any>(`${this.rutaBagPro}/ProcSellado/GetNominaSelladoDetalladaxBulto/${fechaInicio}/${fechaFin}`);

  GetInformacionOrden_Proceso = (orden : string, proceso : string) => this.http.get<any>(`${this.rutaBagPro}/ProcSellado/getInformacionOrden_Proceso/${orden}/${proceso}`);

  /***************************************************** PROCEXTRUSION ***************************************************************/

  srvObtenerListaProcExt = ():Observable<any[]> => this.http.get<any>(this.rutaBagPro + '/ProcExtrusion');

  srvObtenerListaProcExtOt = (ot : any):Observable<any[]> => this.http.get<any>(this.rutaBagPro + `/ProcExtrusion/OT/${ot}`);

  srvObtenerListaProcExtOt_fechaFinal = (ot : any):Observable<any> => this.http.get<any>(this.rutaBagPro + `/ProcExtrusion/FechaFinOT/${ot}`);

  consultarRollo = (rollo : any):Observable<any[]> => this.http.get<any>(this.rutaBagPro + `/ProcExtrusion/consultarRollo/${rollo}`);

  Delete = (id : any) => this.http.delete(this.rutaBagPro + `/ProcExtrusion/EliminarRolloProcExtrusion/${id}`);

  GetRollosExtrusion_Empaque_Sellado = (fechaInicial : any, fechaFinal : any, proceso : string, ruta : string) => this.http.get<any>(this.rutaBagPro + `/ProcExtrusion/getRollosExtrusion_Empaque_Sellado/${fechaInicial}/${fechaFinal}/${proceso}${ruta}`);

  GetProcExtrusion_ProcSellado = (fechaInicio : any, fechaFin : any, ruta : any) => this.http.get<any>(`${this.rutaBagPro}/ProcExtrusion/getProcExtrusion_ProcSellado/${fechaInicio}/${fechaFin}${ruta}`);

  GetObtenerDatosxProcesos = (OT : any, proceso: any):Observable<any[]> => this.http.get<any>(this.rutaBagPro + `/ProcExtrusion/getObtenerDatosxProcesos/${OT}/${proceso}`);

  GetDatosConsolidados = (OT : any, proceso: any):Observable<any[]> => this.http.get<any>(this.rutaBagPro + `/ProcExtrusion/getDatosConsolidados/${OT}/${proceso}`);

  GetInformacionOrden_ProcesoExt = (orden : string, proceso : string) => this.http.get<any>(`${this.rutaBagPro}/ProcExtrusion/getInformacionOrden_Proceso/${orden}/${proceso}`);
  
  getOtControlCalidadExtrusion = (OT : any, proceso: any):Observable<any[]> => this.http.get<any>(this.rutaBagPro + `/ProcExtrusion/getOtControlCalidadExtrusion/${OT}/${proceso}`);

  GetProduccionAreas = (anio : number) => this.http.get<any>(`${this.rutaBagPro}/ProcExtrusion/getProduccionAreas/${anio}`);
  /********************************************************** CLIENTESOT ****************************************************************/

  srvActualizar = (id:number|String, data:any, estado : any) => this.http.put(this.rutaBagPro + `/ClientesOt/CambioEstadoOT/${id}?Estado=${estado}`, data);

  srvObtenerListaClienteOT_Item = (ot : any):Observable<any[]> => this.http.get<any>(this.rutaBagPro + `/ClientesOt/OT/${ot}`);

  srvObtenerListaClienteOT_Item_Presentacion = (producto : number, presentacion : string):Observable<any[]> => this.http.get<any>(this.rutaBagPro + `/ClientesOt/OT_Cliente_Item_Presentacion/${producto}/${presentacion}`);

  srvObtenerListaClienteOT_ItemCostos = (ot : any):Observable<any[]> => this.http.get<any>(this.rutaBagPro + `/ClientesOt/CostosOT/${ot}`);

  srvObtenerListaClienteOT_UltimaOT = ():Observable<any> => this.http.get<any>(this.rutaBagPro + `/ClientesOt/UltimaOT/`);

  srvObtenerOTsPorVendedor = (OT: any):Observable<any[]> => this.http.get<any>(this.rutaBagPro + `/ClientesOt/BuscarOTxVendedores/${OT}`);

  srvObtenerListaConsultarItem = (fecha1 : any, fecha2 : any, item : any, precio : any):Observable<any[]> => this.http.get<any>(this.rutaBagPro + `/ClientesOt/consultarItem/${fecha1}/${fecha2}/${item}/${precio}`);

  GetCostoOrdenesUltimoMes = (fecha1 : any, fecha2 : any):Observable<any[]> => this.http.get<any>(this.rutaBagPro + `/ClientesOt/getCostoOrdenesUltimoMes/${fecha1}/${fecha2}`);

  GetCostoOrdenesUltimoMes_Vendedores = (fecha1 : any, fecha2 : any):Observable<any[]> => this.http.get<any>(this.rutaBagPro + `/ClientesOt/getCostoOredenesUltimoMes_Vendedores/${fecha1}/${fecha2}`);

  GetCostoOrdenesUltimoMes_Clientes = (fecha1 : any, fecha2 : any):Observable<any[]> => this.http.get<any>(this.rutaBagPro + `/ClientesOt/getCostoOredenesUltimoMes_Clientes/${fecha1}/${fecha2}`);

  GetPesoProcesosUltimoMes = (fecha1 : any, fecha2 : any):Observable<any[]> => this.http.get<any>(this.rutaBagPro + `/ClientesOt/getPesoProcesosUltimoMes/${fecha1}/${fecha2}`);

  GetCantOrdenesMateriales = (fecha1 : any, fecha2 : any):Observable<any[]> => this.http.get<any>(this.rutaBagPro + `/ClientesOt/getCantOrdenesMateriales/${fecha1}/${fecha2}`);

  GetOrdenTrabajo = (orden : number) => this.http.get<any>(this.rutaBagPro + `/ClientesOt/getOrdenTrabajo/${orden}`);

  GetPresentacionItem = (item : number) : Observable<any> => this.http.get<any>(this.rutaBagPro + `/ClientesOt/getPresentacionItem/${item}`);

  /**************************************************************** CLIENTESOTITEM *******************************************************/

  srvObtenerListaClienteOTItems = ():Observable<any[]> => this.http.get<any>(this.rutaBagPro + '/ClientesOtItems');

  srvObtenerItemsBagproXClienteItem = (codigo : any):Observable<any[]> => this.http.get<any>(this.rutaBagPro + `/ClientesOtItems/OtItem/${codigo}`);

  LikeReferencia = (ref : any):Observable<any[]> => this.http.get<any>(this.rutaBagPro + `/ClientesOtItems/likeReferencia/${ref}`);
  /*********************************************************** DESPERDICIO **************************************************************/

  srvObtenerListaDespercicios = ():Observable<any[]> => this.http.get<any>(this.rutaBagPro + '/Procdesperdicio');

  srvObtenerListaDespercicios_Ot = (ot : any):Observable<any[]> => this.http.get<any>(this.rutaBagPro + `/Procdesperdicio/OT/${ot}`);

  /*********************************************************** PROCIMPRESION **************************************************************/

  consultarOTImpresion = (ot : any) => this.http.get<any>(this.rutaBagPro + `/ProcImpresionRollosBopp/consultaOtImpresion/${ot}`);

  /***************************************************************** Operarios **********************************************************/

  srvObtenerListaOperariosExtrusion = () => this.http.get<any>(this.rutaBagPro + '/OperariosProcesos/NombreOperarios');

  /************************************************************** Clientes **************************************************************/

  srvObtenerListaUltimosClientes = (fecha : any) => this.http.get<any>(this.rutaBagPro + `/Clientes/UltimosClientes/${fecha}`);

}
