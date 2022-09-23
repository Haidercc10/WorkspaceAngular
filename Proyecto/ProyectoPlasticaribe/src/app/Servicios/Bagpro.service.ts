import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaBagPro } from 'src/polyfills';
import internal from 'stream';

@Injectable({
  providedIn: 'root'
})
export class BagproService {

  readonly rutaBagPro = rutaBagPro;

  constructor(private http : HttpClient) { }

  /* PROCSELLADO */

  srvObtenerListaProcSellado():Observable<any[]> {
    return this.http.get<any>(this.rutaBagPro + '/ProcSellado');
  }

  srvObtenerListaProcSelladoOT(ot : any):Observable<any[]> {
    return this.http.get<any>(this.rutaBagPro + `/ProcSellado/OT/${ot}`);
  }

  srvObtenerListaProcSelladoOT_FechaFinal(ot : any):Observable<any[]> {
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

  /* PROCEXTRUSION */

  srvObtenerListaProcExt():Observable<any[]> {
    return this.http.get<any>(this.rutaBagPro + '/ProcExtrusion');
  }

  srvObtenerListaProcExtOt(ot : any):Observable<any[]> {
    return this.http.get<any>(this.rutaBagPro + `/ProcExtrusion/OT/${ot}`);
  }

  srvObtenerListaPorRollo(rollo : any, produ : any):Observable<any[]> {
    return this.http.get<any>(this.rutaBagPro + `/ProcExtrusion/MostrarRollos/${rollo}/${produ}`);
  }

  srvObtenerListaProcExtOt_fechaFinal(ot : any):Observable<any[]> {
    return this.http.get<any>(this.rutaBagPro + `/ProcExtrusion/FechaFinOT/${ot}`);
  }

  srvObtenerListaProcextrusionProducido(ot : any) {
    return this.http.get<any>(this.rutaBagPro + `/ProcExtrusion/OtConEmpaque/${ot}`);
  }

  /** Nvo */
  srvObtenerListaFilasEmpaqueEnProcExtrusion(ot : any) {
    return this.http.get<any>(this.rutaBagPro + `/ProcSellado/ContarOtEnEmpaque/${ot}`);
  }



  /* CLIENTESOT */

  srvActualizar(id:number|String, data:any, estado : any) {
    return this.http.put(this.rutaBagPro + `/ClientesOt/CambioEstadoOT/${id}?Estado=${estado}`, data);
  }

  // CONSULTA A LA TABLA CLIENTES_OT_ITEM DE BAGPRO
  srvObtenerListaClienteOT_Item(ot : any):Observable<any[]> {
    return this.http.get<any>(this.rutaBagPro + `/ClientesOt/OT/${ot}`);
  }

   // CONSULTA A LA TABLA CLIENTES_OT_ITEM DE BAGPRO
   srvObtenerListaClienteOT_Cliente_Item_Presentacion(clienteNom : string, producto : number, presentacion : string):Observable<any[]> {
    return this.http.get<any>(this.rutaBagPro + `/ClientesOt/OT_Cliente_Item_Presentacion/${clienteNom}/${producto}/${presentacion}`);
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

  srvObtenerListaClienteOT_UltimaOT():Observable<any[]> {
    return this.http.get<any>(this.rutaBagPro + `/ClientesOt/UltimaOT/`);
  }

  srvObtenerListaConsultarItem(fecha1 : any, fecha2 : any, item : any, precio : any):Observable<any[]> {
    return this.http.get<any>(this.rutaBagPro + `/ClientesOt/consultarItem/${fecha1}/${fecha2}/${item}/${precio}`);
  }

  /* CLIENTESOTITEM */

  // CONSULTA A LA TABLA CLIENTES_OT_ITEM DE BAGPRO
  srvObtenerListaClienteOTItems():Observable<any[]> {
    return this.http.get<any>(this.rutaBagPro + '/ClientesOtItems');
  }

  srvObtenerItemsBagproXClienteItem(codigo : any):Observable<any[]> {
    return this.http.get<any>(this.rutaBagPro + `/ClientesOtItems/OtItem/${codigo}`);
  }

  /* DESPERDICIO */

  // CONSULTAS A LA TABLA PROC_DESPERDICIOS DE BAGPRO
  srvObtenerListaDespercicios():Observable<any[]> {
    return this.http.get<any>(this.rutaBagPro + '/Procdesperdicio');
  }

  srvObtenerListaDespercicios_Ot(ot : any):Observable<any[]> {
    return this.http.get<any>(this.rutaBagPro + `/Procdesperdicio/OT/${ot}`);
  }




}
