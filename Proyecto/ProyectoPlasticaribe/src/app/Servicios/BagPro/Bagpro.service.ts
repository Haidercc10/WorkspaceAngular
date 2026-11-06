import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rollsToDelete } from 'src/app/Vistas/EliminarRollos_Produccion/EliminarRollos_Produccion.component';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BagproService {

  readonly rutaBagPro = environment.rutaBagPro;

  constructor(private http : HttpClient) { }

  /********************************************************* PROCSELLADO **************************************************************/
  srvObtenerListaProcSelladoOT = (ot : any):Observable<any[]> => this.http.get<any>(this.rutaBagPro + `/ProcSellado/OT/${ot}`);

  srvObtenerListaProcSelladoOT_FechaFinal = (ot : any):Observable<any> => this.http.get<any>(this.rutaBagPro + `/ProcSellado/FechaFinOT/${ot}`);

  DeleteRollosSellado_Wiketiado = (id : any) => this.http.delete(this.rutaBagPro + `/ProcSellado/EliminarRollosSellado_Wiketiado/${id}`);

  GetNominaSelladoAcumuladaItem = (fechaInicio : any, fechaFin : any) => this.http.get<any>(`${this.rutaBagPro}/ProcSellado/getNominaSelladoAcumuladaItem/${fechaInicio}/${fechaFin}`);

  GetNominaSelladoDespachoAcumuladaItem = (fechaInicio : any, fechaFin : any) => this.http.get<any>(`${this.rutaBagPro}/ProcSellado/getNominaSelladoDespachoAcumuladaItem/${fechaInicio}/${fechaFin}`);

  GetNominaSelladoDetalladaItemPersona = (fechaInicio : any, fechaFin : any, item : any, persona : string) => this.http.get<any>(`${this.rutaBagPro}/ProcSellado/getNominaSelladoDetalladaItemPersona/${fechaInicio}/${fechaFin}/${item}/${persona}`);

  GetNominaSelladoDetalladaxBulto = (fechaInicio : any, fechaFin : any) => this.http.get<any>(`${this.rutaBagPro}/ProcSellado/GetNominaSelladoDetalladaxBulto/${fechaInicio}/${fechaFin}`);

  AjusteExistenciaSellado = (rollos : number []) => this.http.post(`${this.rutaBagPro}/ProcSellado/ajusteExistencia`, rollos);

  EnvioZeusProcSellado = (rollo: number) => this.http.get(`${this.rutaBagPro}/ProcExtrusion/EnviarAjuste/${rollo}`);
  
  GetProduccionSellado = (ot : any) => this.http.get<any>(this.rutaBagPro + `/ProcSellado/getProduccionSellado/${ot}`);

  GetEtiquetaBagpro = (rollo : any, reimpresion : any) => this.http.get<any>(this.rutaBagPro + `/ProcSellado/getEtiquetaBagpro/${rollo}/${reimpresion}`);

  /***************************************************** PROCEXTRUSION ***************************************************************/

  srvObtenerListaProcExtOt = (ot : any):Observable<any[]> => this.http.get<any>(this.rutaBagPro + `/ProcExtrusion/OT/${ot}`);

  srvObtenerListaProcExtOt_fechaFinal = (ot : any):Observable<any> => this.http.get<any>(this.rutaBagPro + `/ProcExtrusion/FechaFinOT/${ot}`);

  Delete = (id : any) => this.http.delete(this.rutaBagPro + `/ProcExtrusion/EliminarRolloProcExtrusion/${id}`);

  GetRollosExtrusion_Empaque_Sellado = (fechaInicial : any, fechaFinal : any, proceso : string, ruta : string) => this.http.get<any>(this.rutaBagPro + `/ProcExtrusion/getRollosExtrusion_Empaque_Sellado/${fechaInicial}/${fechaFinal}/${proceso}${ruta}`);

  GetProcExtrusion_ProcSellado = (fechaInicio : any, fechaFin : any, ruta : any) => this.http.get<any>(`${this.rutaBagPro}/ProcExtrusion/getProcExtrusion_ProcSellado/${fechaInicio}/${fechaFin}${ruta}`);

  GetObtenerDatosxProcesos = (OT : any, proceso: any):Observable<any[]> => this.http.get<any>(this.rutaBagPro + `/ProcExtrusion/getObtenerDatosxProcesos/${OT}/${proceso}`);

  GetInformacionOrden_ProcesoExt = (orden : string, proceso : string) => this.http.get<any>(`${this.rutaBagPro}/ProcExtrusion/getInformacionOrden_Proceso/${orden}/${proceso}`);
  
  GetProduccionAreas = (anio : number) => this.http.get<any>(`${this.rutaBagPro}/ProcExtrusion/getProduccionAreas/${anio}`);

  GetProduccionDetalladaAreas = (inicio, fin, ruta) : Observable<any[]> => this.http.get<any>(`${this.rutaBagPro}/ProcExtrusion/getProduccionDetalladaAreas/${inicio}/${fin}${ruta}`);

  AjusteExistenciaEmpaque = (rollos : number []) => this.http.post(`${this.rutaBagPro}/ProcExtrusion/ajusteExistencia`, rollos);

  EnvioZeusProcExtrusion = (rollo: number) => this.http.get(`${this.rutaBagPro}/ProcExtrusion/EnviarAjuste/${rollo}`);

  GetDatosRollosPesados = (orden : string, proceso : string) : Observable<any[]> => this.http.get<any>(`${this.rutaBagPro}/ProcExtrusion/getDatosRollosPesados/${orden}/${proceso}`);

  GetProductionByNumber = (production : number, searchIn: string) : Observable<any[]> => this.http.get<any>(`${this.rutaBagPro}/ProcExtrusion/getProductionByNumber/${production}/${searchIn}`);

  getAvaibleProduction = (item: string, notAvaible: Array<number>): Observable<any> => this.http.post(`${this.rutaBagPro}/ProcExtrusion/getAvaibleProduction/${item}`, notAvaible);

  getRollProduction = (roll: number, url: string): Observable<any> => this.http.get<any>(`${this.rutaBagPro}/ProcExtrusion/getRollProduction/${roll}${url}`);

  putObservationDeletedRolls = (data : Array<rollsToDelete>) => this.http.post(`${this.rutaBagPro}/ProcExtrusion/putObservationDeletedRolls`, data);

  getAvailablesRollsOT = (ot: string, process : string, notAvaible: Array<number>): Observable<any> => this.http.post(`${this.rutaBagPro}/ProcExtrusion/getAvailablesRollsOT/${ot}/${process}`, notAvaible);

  GetInformactionProductionForTag = (production: number): Observable<any> => this.http.get<any>(`${this.rutaBagPro}/ProcExtrusion/getInformactionProductionForTag/${production}`);

  getInformationRoll = (production: number, ot : string): Observable<any> => this.http.get<any>(`${this.rutaBagPro}/ProcExtrusion/getInformationRoll/${production}/${ot}`);

  getPayRollCourt = (date1 : any, date2 : any): Observable<any> => this.http.get<any>(`${this.rutaBagPro}/ProcExtrusion/getPayRollCourt/${date1}/${date2}`);

  getProductionDay = (date1 : any, date2 : any, ot : any, url : string): Observable<any> => this.http.post(`${this.rutaBagPro}/ProcExtrusion/getProductionDay/${date1}/${date2}${url}`, ot);

  /********************************************************** CLIENTESOT ****************************************************************/

  srvActualizar = (id:number|String, data:any, estado : any) => this.http.put(this.rutaBagPro + `/ClientesOt/CambioEstadoOT/${id}?Estado=${estado}`, data);

  srvObtenerListaClienteOT_Item = (ot : any):Observable<any[]> => this.http.get<any>(this.rutaBagPro + `/ClientesOt/OT/${ot}`);

  /** Consulta la ficha actual del item en ClientesOtItem; sales es opcional (`?sales=001`) y filtra por vendedor. */
  srvObtenerListaClienteOT_Item_Presentacion = (producto : number, presentacion : string, sales : string = ''):Observable<any[]> => this.http.get<any>(this.rutaBagPro + `/ClientesOt/OT_Cliente_Item_Presentacion/${producto}/${presentacion}${sales}`);

  srvObtenerListaClienteOT_ItemCostos = (ot : any):Observable<any[]> => this.http.get<any>(this.rutaBagPro + `/ClientesOt/CostosOT/${ot}`);

  srvObtenerListaClienteOT_UltimaOT = ():Observable<any> => this.http.get<any>(this.rutaBagPro + `/ClientesOt/UltimaOT/`);

  GetCostoOrdenesUltimoMes = (fecha1 : any, fecha2 : any, sales? : string):Observable<any[]> => this.http.get<any>(this.rutaBagPro + `/ClientesOt/getCostoOrdenesUltimoMes/${fecha1}/${fecha2}${sales}`);

  GetCostoOrdenesUltimoMes_Vendedores = (fecha1 : any, fecha2 : any, sales? : string):Observable<any[]> => this.http.get<any>(this.rutaBagPro + `/ClientesOt/getCostoOredenesUltimoMes_Vendedores/${fecha1}/${fecha2}${sales}`);

  GetCostoOrdenesUltimoMes_Clientes = (fecha1 : any, fecha2 : any, sales? : string):Observable<any[]> => this.http.get<any>(this.rutaBagPro + `/ClientesOt/getCostoOredenesUltimoMes_Clientes/${fecha1}/${fecha2}${sales}`);

  GetCantOrdenesMateriales = (fecha1 : any, fecha2 : any, sales? : string):Observable<any[]> => this.http.get<any>(this.rutaBagPro + `/ClientesOt/getCantOrdenesMateriales/${fecha1}/${fecha2}${sales}`);

  GetOrdenTrabajo = (orden : number) => this.http.get<any>(this.rutaBagPro + `/ClientesOt/getOrdenTrabajo/${orden}`);

  GetPresentacionItem = (item : number) : Observable<any> => this.http.get<any>(this.rutaBagPro + `/ClientesOt/getPresentacionItem/${item}`);

  GetOrdenesTrabajo = (inicio : any, fin : any, ruta : string) => this.http.get<any>(`${this.rutaBagPro}/ClientesOt/getOrdenesTrabajo/${inicio}/${fin}${ruta}`);

  GetOrdenDeTrabajo = (ot : number, sales? : string):Observable<any[]> => this.http.get<any>(this.rutaBagPro + `/ClientesOt/GetOrdenDeTrabajo/${ot}${sales}`);
  
  getClientsForOT = (ot: number): Observable<any> => this.http.get<any>(`${this.rutaBagPro}/ClientesOt/getClientsForOT/${ot}`);

  getOtControlCalidadExtrusion = (OT : any, proceso: any):Observable<any[]> => this.http.get<any>(this.rutaBagPro + `/ClientesOt/getOtControlCalidadExtrusion/${OT}/${proceso}`);
  
  /**************************************************************** CLIENTESOTITEM *******************************************************/

  srvObtenerItemsBagproXClienteItem = (codigo : any[], sales? : string) => this.http.post<any>(this.rutaBagPro + `/ClientesOtItems/OtItem${sales}`, codigo);

  LikeReferencia = (ref : any):Observable<any[]> => this.http.get<any>(this.rutaBagPro + `/ClientesOtItems/likeReferencia/${ref}`);

  CalcularKilosItem = (items : any[]) => this.http.post<any>(this.rutaBagPro + `/ClientesOtItems/CalcularKilosItem`, items);
   
  /*********************************************************** DESPERDICIO **************************************************************/

  srvObtenerListaDespercicios_Ot = (ot : any):Observable<any[]> => this.http.get<any>(this.rutaBagPro + `/Procdesperdicio/OT/${ot}`);

  GetOtProcesoDesperdicio = (ot : any, ruta? : any):Observable<any[]> => this.http.get<any>(this.rutaBagPro + `/Procdesperdicio/getOtProcesoDesperdicio/${ot}${ruta}`);

  /*********************************************************** PROCIMPRESION **************************************************************/

  /***************************************************************** Operarios **********************************************************/

  /************************************************************** Clientes **************************************************************/

  GetClientesNombre = (nombre : any) => this.http.get<any>(this.rutaBagPro + `/Clientes/getClientesNombre/${nombre}`);

  /************************************************************** HORARIOS **************************************************************/
  GetHorarioProceso = (proceso : string) : Observable<string> => this.http.get<string>(`${this.rutaBagPro}/Horarios/getHorarioProceso/${proceso}`);

}