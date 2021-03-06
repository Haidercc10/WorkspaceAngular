import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaBagPro, rutaBagProLocate } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})
export class BagproService {

  readonly rutaBagPro = rutaBagPro;

  constructor(private http : HttpClient) { }

  /* PROCSELLADO */

  // CONSULTA A LA TABLA CLIENTES_OT_ITEM DE BAGPRO
  srvObtenerListaProcSellado():Observable<any[]> {
    return this.http.get<any>(this.rutaBagPro + '/ProcSellado');
  }

  srvObtenerListaProcSelladoOT(ot : any):Observable<any[]> {
    return this.http.get<any>(this.rutaBagPro + `/ProcSellado/OT/${ot}`);
  }

  srvObtenerListaProcSelladoOT_FechaFinal(ot : any):Observable<any[]> {
    return this.http.get<any>(this.rutaBagPro + `/ProcSellado/FechaFinOT/${ot}`);
  }

  /* PROCEXTRUSION */

  // CONSULTA A LA TABLA CLIENTES_OT_ITEM DE BAGPRO
  srvObtenerListaProcExt():Observable<any[]> {
    return this.http.get<any>(this.rutaBagPro + '/ProcExtrusion');
  }

  srvObtenerListaProcExtOt(ot : any):Observable<any[]> {
    return this.http.get<any>(this.rutaBagPro + `/ProcExtrusion/OT/${ot}`);
  }

  srvObtenerListaProcExtOt_fechaFinal(ot : any):Observable<any[]> {
    return this.http.get<any>(this.rutaBagPro + `/ProcExtrusion/FechaFinOT/${ot}`);
  }

  /* CLIENTESOT */

  srvActualizar(id:number|String, data:any, estado : string) {
    return this.http.put(this.rutaBagPro + `/ClientesOt/CambioEstadoOT/${id}?Estado=${estado}`, data);
  }

  // CONSULTA A LA TABLA CLIENTES_OT_ITEM DE BAGPRO
  srvObtenerListaClienteOT_Item(ot : any):Observable<any[]> {
    return this.http.get<any>(this.rutaBagPro + `/ClientesOt/OT/${ot}`);
  }

  srvObtenerListaClienteOT_ItemCostos(ot : any):Observable<any[]> {
    return this.http.get<any>(this.rutaBagPro + `/ClientesOt/CostosOT/${ot}`);
  }

  /* CLIENTESOTITEM */

  // CONSULTA A LA TABLA CLIENTES_OT_ITEM DE BAGPRO
  srvObtenerListaClienteOTItems():Observable<any[]> {
    return this.http.get<any>(this.rutaBagPro + '/ClientesOtItems');
  }

  srvObtenerListaClienteOTItemsXItem(idItem : number):Observable<any[]> {
    return this.http.get<any>(this.rutaBagPro + `/ClientesOtItems/OtItem/${idItem}`);
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
