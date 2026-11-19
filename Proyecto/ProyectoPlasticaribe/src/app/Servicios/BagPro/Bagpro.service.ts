import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelOrden_Trabajo_BagPro } from 'src/app/Modelo/modelOrden_Trabajo';
import { CrearItemDto, FichaItem, ItemBusqueda, ItemCreado, MezclaPredefinida, PresentacionBagPro, TintaBagPro, ValidacionItem } from 'src/app/Modelo/modelCrearItem';
import { rollsToDelete } from 'src/app/Vistas/EliminarRollos_Produccion/EliminarRollos_Produccion.component';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BagproService {

  readonly rutaBagPro = environment.rutaBagPro;

  constructor(private http : HttpClient) { }

  /********************************************************* PROCSELLADO **************************************************************/
  srvObtenerListaProcSellado = () :Observable<any[]> => this.http.get<any>(this.rutaBagPro + '/ProcSellado'); //**

  srvObtenerListaProcSelladoOT = (ot : any):Observable<any[]> => this.http.get<any>(this.rutaBagPro + `/ProcSellado/OT/${ot}`);

  srvObtenerListaProcSelladoOT_FechaFinal = (ot : any):Observable<any> => this.http.get<any>(this.rutaBagPro + `/ProcSellado/FechaFinOT/${ot}`);

  DeleteRollosSellado_Wiketiado = (id : any) => this.http.delete(this.rutaBagPro + `/ProcSellado/EliminarRollosSellado_Wiketiado/${id}`);

  GetNominaSelladoAcumuladaItem = (fechaInicio : any, fechaFin : any) => this.http.get<any>(`${this.rutaBagPro}/ProcSellado/getNominaSelladoAcumuladaItem/${fechaInicio}/${fechaFin}`);

  GetNominaSelladoDespachoAcumuladaItem = (fechaInicio : any, fechaFin : any) => this.http.get<any>(`${this.rutaBagPro}/ProcSellado/getNominaSelladoDespachoAcumuladaItem/${fechaInicio}/${fechaFin}`);

  GetNominaSelladoDetalladaItemPersona = (fechaInicio : any, fechaFin : any, item : any, persona : string) => this.http.get<any>(`${this.rutaBagPro}/ProcSellado/getNominaSelladoDetalladaItemPersona/${fechaInicio}/${fechaFin}/${item}/${persona}`);

  GetNominaSelladoDetalladaxBulto = (fechaInicio : any, fechaFin : any) => this.http.get<any>(`${this.rutaBagPro}/ProcSellado/GetNominaSelladoDetalladaxBulto/${fechaInicio}/${fechaFin}`);

  GetInformacionOrden_Proceso = (orden : string, proceso : string) => this.http.get<any>(`${this.rutaBagPro}/ProcSellado/getInformacionOrden_Proceso/${orden}/${proceso}`);

  AjusteExistenciaSellado = (rollos : number []) => this.http.post(`${this.rutaBagPro}/ProcSellado/ajusteExistencia`, rollos);

  EnvioZeusProcSellado = (rollo: number) => this.http.get(`${this.rutaBagPro}/ProcExtrusion/EnviarAjuste/${rollo}`);
  
  GetProduccionSellado = (ot : any) => this.http.get<any>(this.rutaBagPro + `/ProcSellado/getProduccionSellado/${ot}`);

  GetEtiquetaBagpro = (rollo : any, reimpresion : any) => this.http.get<any>(this.rutaBagPro + `/ProcSellado/getEtiquetaBagpro/${rollo}/${reimpresion}`);

  PutEnvioZeusSellado = (rollo: number) => this.http.get<any>(`${this.rutaBagPro}/ProcSellado/putEnvioZeus/${rollo}`);

  putReversionEnvioZeus_ProcSellado = (rollos: any[]) => this.http.post(`${this.rutaBagPro}/ProcSellado/putReversionEnvioZeus_ProcSellado`, rollos);

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
  
  GetProduccionAreas = (anio : number) => this.http.get<any>(`${this.rutaBagPro}/ProcExtrusion/getProduccionAreas/${anio}`);

  GetProduccionDetalladaAreas = (inicio, fin, ruta) : Observable<any[]> => this.http.get<any>(`${this.rutaBagPro}/ProcExtrusion/getProduccionDetalladaAreas/${inicio}/${fin}${ruta}`);

  AjusteExistenciaEmpaque = (rollos : number []) => this.http.post(`${this.rutaBagPro}/ProcExtrusion/ajusteExistencia`, rollos);

  EnvioZeusProcExtrusion = (rollo: number) => this.http.get(`${this.rutaBagPro}/ProcExtrusion/EnviarAjuste/${rollo}`);

  GetDatosRollosPesados = (orden : string, proceso : string) : Observable<any[]> => this.http.get<any>(`${this.rutaBagPro}/ProcExtrusion/getDatosRollosPesados/${orden}/${proceso}`);

  GetProductionByNumber = (production : number, searchIn: string) : Observable<any[]> => this.http.get<any>(`${this.rutaBagPro}/ProcExtrusion/getProductionByNumber/${production}/${searchIn}`);

  GetProductionForExitByNumber = (production : number) : Observable<any[]> => this.http.get<any>(`${this.rutaBagPro}/ProcExtrusion/getProductionForExitByNumber/${production}`);

  GetNumberReelByNumberAndProcess = (number: number, process: string): Observable<any[]> => this.http.get<any>(`${this.rutaBagPro}/ProcExtrusion/getNumberReelByNumberAndProcess/${number}/${process}`);

  GetProductionByProduction = (production : number) : Observable<any[]> => this.http.get<any>(`${this.rutaBagPro}/ProcExtrusion/getProductionByProduction/${production}`);

  getAvaibleProduction = (item: string, notAvaible: Array<number>): Observable<any> => this.http.post(`${this.rutaBagPro}/ProcExtrusion/getAvaibleProduction/${item}`, notAvaible);

  getRollProduction = (roll: number, url: string): Observable<any> => this.http.get<any>(`${this.rutaBagPro}/ProcExtrusion/getRollProduction/${roll}${url}`);

  PutEnvioZeusExtrusion = (rollo: number) => this.http.put<any>(`${this.rutaBagPro}/ProcExtrusion/putEnvioZeus/${rollo}`, rollo);

  putReversionEnvioZeus_ProcExtrusion = (rollos: any[]) => this.http.post(`${this.rutaBagPro}/ProcExtrusion/putReversionEnvioZeus_ProcExtrusion`, rollos);

  putObservationDeletedRolls = (data : Array<rollsToDelete>) => this.http.post(`${this.rutaBagPro}/ProcExtrusion/putObservationDeletedRolls`, data);

  putObservationDeletedRolls2 = (data : Array<rollsToDelete>): Observable<{ updatedExtrusion: number, updatedSellado: number, notFound: number[] }> =>
    this.http.post<{ updatedExtrusion: number, updatedSellado: number, notFound: number[] }>(`${this.rutaBagPro}/ProcExtrusion/putObservationDeletedRolls2`, data);

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

  srvObtenerOTsPorVendedor = (OT: any):Observable<any[]> => this.http.get<any>(this.rutaBagPro + `/ClientesOt/BuscarOTxVendedores/${OT}`);

  srvObtenerListaConsultarItem = (fecha1 : any, fecha2 : any, item : any, precio : any):Observable<any[]> => this.http.get<any>(this.rutaBagPro + `/ClientesOt/consultarItem/${fecha1}/${fecha2}/${item}/${precio}`);

  GetCostoOrdenesUltimoMes = (fecha1 : any, fecha2 : any, sales? : string):Observable<any[]> => this.http.get<any>(this.rutaBagPro + `/ClientesOt/getCostoOrdenesUltimoMes/${fecha1}/${fecha2}${sales}`);

  GetCostoOrdenesUltimoMes_Vendedores = (fecha1 : any, fecha2 : any, sales? : string):Observable<any[]> => this.http.get<any>(this.rutaBagPro + `/ClientesOt/getCostoOredenesUltimoMes_Vendedores/${fecha1}/${fecha2}${sales}`);

  GetCostoOrdenesUltimoMes_Clientes = (fecha1 : any, fecha2 : any, sales? : string):Observable<any[]> => this.http.get<any>(this.rutaBagPro + `/ClientesOt/getCostoOredenesUltimoMes_Clientes/${fecha1}/${fecha2}${sales}`);

  GetPesoProcesosUltimoMes = (fecha1 : any, fecha2 : any):Observable<any[]> => this.http.get<any>(this.rutaBagPro + `/ClientesOt/getPesoProcesosUltimoMes/${fecha1}/${fecha2}`);

  GetCantOrdenesMateriales = (fecha1 : any, fecha2 : any, sales? : string):Observable<any[]> => this.http.get<any>(this.rutaBagPro + `/ClientesOt/getCantOrdenesMateriales/${fecha1}/${fecha2}${sales}`);

  GetOrdenTrabajo = (orden : number) => this.http.get<any>(this.rutaBagPro + `/ClientesOt/getOrdenTrabajo/${orden}`);

  GetPresentacionItem = (item : number) : Observable<any> => this.http.get<any>(this.rutaBagPro + `/ClientesOt/getPresentacionItem/${item}`);

  GetOrdenesTrabajo = (inicio : any, fin : any, ruta : string) => this.http.get<any>(`${this.rutaBagPro}/ClientesOt/getOrdenesTrabajo/${inicio}/${fin}${ruta}`);

  GetOrdenDeTrabajo = (ot : number, sales? : string):Observable<any[]> => this.http.get<any>(this.rutaBagPro + `/ClientesOt/GetOrdenDeTrabajo/${ot}${sales}`);
  
  PutOrdenTrabajo = (orden : number, data : modelOrden_Trabajo_BagPro) => this.http.put(`${this.rutaBagPro}/ClientesOt/putOrdenTrabajo/${orden}`, data);

  getClientsForOT = (ot: number): Observable<any> => this.http.get<any>(`${this.rutaBagPro}/ClientesOt/getClientsForOT/${ot}`);

  getOtsForCustomerOrders1 = (date1: any, date2 : any, item : number, presentation : string, idClient : number, consecutivo : string): Observable<any> => this.http.get<any>(`${this.rutaBagPro}/ClientesOt/getOtsForCustomerOrders1/${date1}/${date2}/${item}/${presentation}/${idClient}/${consecutivo}`);

  getOtsForCustomerOrders2 = (pedidos : any[]) => this.http.post<any>(`${this.rutaBagPro}/ClientesOt/getOtsForCustomerOrders2`, pedidos);

  getOtControlCalidadExtrusion = (OT : any, proceso: any):Observable<any[]> => this.http.get<any>(this.rutaBagPro + `/ClientesOt/getOtControlCalidadExtrusion/${OT}/${proceso}`);
  
  /**************************************************************** CLIENTESOTITEM *******************************************************/

  srvObtenerListaClienteOTItems = ():Observable<any[]> => this.http.get<any>(this.rutaBagPro + '/ClientesOtItems');

  srvObtenerItemsBagproXClienteItem = (codigo : any[], sales? : string) => this.http.post<any>(this.rutaBagPro + `/ClientesOtItems/OtItem${sales}`, codigo);

  OtItem2 = (codigo : any[], sales? : string) => this.http.post<any>(this.rutaBagPro + `/ClientesOtItems/OtItem2${sales}`, codigo);

  LikeReferencia = (ref : any):Observable<any[]> => this.http.get<any>(this.rutaBagPro + `/ClientesOtItems/likeReferencia/${ref}`);

  CalcularKilosItem = (items : any[]) => this.http.post<any>(this.rutaBagPro + `/ClientesOtItems/CalcularKilosItem`, items);

  /**
   * Indica si ya existe un item con el mismo nombre normalizado o la misma ficha técnica.
   * @param ficha Ficha del item a crear.
   * @returns Observable con `{ duplicado: false }`; si hay duplicado responde 409 con `{ tipo, codigo, nombre }`.
   */
  PostValidarDuplicadoItem = (ficha : CrearItemDto) => this.http.post<ValidacionItem>(`${this.rutaBagPro}/ClientesOtItems/validarDuplicado`, ficha);

  /**
   * Crea el item en ClientesOT_Item; BagPro asigna el código y su trigger crea el producto en Plasticaribe.
   * @param ficha Ficha del item a crear.
   * @returns Observable con `{ clienteItems, nombre, presentacion }`; 409 si hay duplicado o la numeración está ocupada.
   */
  PostCrearItem = (ficha : CrearItemDto) : Observable<ItemCreado> => this.http.post<ItemCreado>(`${this.rutaBagPro}/ClientesOtItems/crear`, ficha);

  /**
   * Agrega una presentación a un item existente de BagPro.
   * @param codigo Código del item (ClienteItems).
   * @param presentacion Presentación nueva: Kilo, Unidad, Paquete o MTS.
   * @param precio Precio de venta de la presentación.
   * @returns Observable con `{ clienteItems, nombre, presentacion }`; 404 si el item no existe, 409 si la presentación ya existe.
   */
  PostPresentacionItem = (codigo : number, presentacion : string, precio : number) : Observable<ItemCreado> => this.http.post<ItemCreado>(`${this.rutaBagPro}/ClientesOtItems/${codigo}/presentaciones`, { presentacion, precio });

  /**
   * Presentaciones que tiene un item en BagPro, con su precio.
   * @param codigo Código del item (ClienteItems).
   * @returns Observable con la lista de presentaciones; 404 si el item no existe.
   */
  GetPresentacionesItem = (codigo : number) : Observable<PresentacionBagPro[]> => this.http.get<PresentacionBagPro[]>(`${this.rutaBagPro}/ClientesOtItems/${codigo}/presentaciones`);

  /**
   * Busca items por nombre (contiene) o código (empieza por); máximo 20, del más reciente al más antiguo.
   * @param texto Texto a buscar, mínimo 3 caracteres.
   * @returns Observable con los items encontrados (código y nombre).
   */
  GetBuscarItems = (texto : string) : Observable<ItemBusqueda[]> => this.http.get<ItemBusqueda[]>(`${this.rutaBagPro}/ClientesOtItems/buscar`, { params: { texto } });

  /**
   * Mezclas predefinidas de BagPro (bpMezclasPreDef) para la creación de items.
   * @returns Observable con las mezclas ordenadas por nombre.
   */
  GetMezclasPredefinidas = () : Observable<MezclaPredefinida[]> => this.http.get<MezclaPredefinida[]>(`${this.rutaBagPro}/ClientesOtItems/catalogos/mezclas`);

  /**
   * Tintas de impresión de BagPro para la creación de items (sin la tinta 1, que significa "sin tinta").
   * @returns Observable con las tintas ordenadas por nombre.
   */
  GetTintasItem = () : Observable<TintaBagPro[]> => this.http.get<TintaBagPro[]>(`${this.rutaBagPro}/ClientesOtItems/catalogos/tintas`);

  /**
   * Ficha técnica de un item (primera fila en BagPro), para copiarla en un item nuevo.
   * @param codigo Código del item (ClienteItems).
   * @returns Observable con la ficha y los nombres de catálogo; 404 si el item no existe.
   */
  GetFichaItem = (codigo : number) : Observable<FichaItem> => this.http.get<FichaItem>(`${this.rutaBagPro}/ClientesOtItems/${codigo}/ficha`);
   
  /*********************************************************** DESPERDICIO **************************************************************/

  srvObtenerListaDespercicios = ():Observable<any[]> => this.http.get<any>(this.rutaBagPro + '/Procdesperdicio');

  srvObtenerListaDespercicios_Ot = (ot : any):Observable<any[]> => this.http.get<any>(this.rutaBagPro + `/Procdesperdicio/OT/${ot}`);

  GetOtProcesoDesperdicio = (ot : any, ruta? : any):Observable<any[]> => this.http.get<any>(this.rutaBagPro + `/Procdesperdicio/getOtProcesoDesperdicio/${ot}${ruta}`);

  /*********************************************************** PROCIMPRESION **************************************************************/

  consultarOTImpresion = (ot : any) => this.http.get<any>(this.rutaBagPro + `/ProcImpresionRollosBopp/consultaOtImpresion/${ot}`);

  /***************************************************************** Operarios **********************************************************/

  srvObtenerListaOperariosExtrusion = () => this.http.get<any>(this.rutaBagPro + '/OperariosProcesos/NombreOperarios');

  /************************************************************** Clientes **************************************************************/

  srvObtenerListaUltimosClientes = (fecha : any) => this.http.get<any>(this.rutaBagPro + `/Clientes/UltimosClientes/${fecha}`);

  GetClientesNombre = (nombre : any) => this.http.get<any>(this.rutaBagPro + `/Clientes/getClientesNombre/${nombre}`);

  /************************************************************** HORARIOS **************************************************************/
  GetHorarioProceso = (proceso : string) : Observable<string> => this.http.get<string>(`${this.rutaBagPro}/Horarios/getHorarioProceso/${proceso}`);

  /***************************************************************** PRUEBA *********************************************************************/
  /*Prueba(){
   return this.http.get(this.rutaBagPro + `/ClientesOt/Prueba`, { responseType: 'arraybuffer'}).subscribe((pdfData :  ArrayBuffer) => {
      console.log(pdfData)
      let blob = new Blob([pdfData], { type : 'application/pdf' });
      let url = URL.createObjectURL(blob);
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = url;
      document.body.appendChild(iframe);
      //iframe.contentWindow.print();
      setTimeout(() => {
        console.log(iframe.contentDocument.getElementsByTagName('embed')[0])
        iframe.contentDocument.getElementsByTagName('embed')[0].click()
        console.log('hola')
      }, 7000);
    });
  }*/
}