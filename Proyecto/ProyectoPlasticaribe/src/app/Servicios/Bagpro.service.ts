import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaBagPro, rutaBagProLocate } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})
export class BagproService {

  readonly rutaPlasticaribeAPI = rutaBagProLocate;

  constructor(private http : HttpClient) { }

  // CONSULTA A LA TABLA CLIENTES_OT_ITEM DE BAGPRO
  srvObtenerListaClienteOTItems():Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/ClientesOtItems');
  }

  srvObtenerListaClienteOTItemsXItem(idItem : number):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/ClientesOtItems/OtItem/${idItem}`);
  }

  // CONSULTA A LA TABLA CLIENTES_OT_ITEM DE BAGPRO
  srvObtenerListaClienteOT_Item(ot : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/ClientesOt/OT/${ot}`);
  }

  srvObtenerListaClienteOT_ItemCostos(ot : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/ClientesOt/CostosOT/${ot}`);
  }

  // CONSULTA A LA TABLA CLIENTES_OT_ITEM DE BAGPRO
  srvObtenerListaProcExt():Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/ProcExtrusion');
  }

  srvObtenerListaProcExtOt(ot : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/ProcExtrusion/OT/${ot}`);
  }

  // CONSULTA A LA TABLA CLIENTES_OT_ITEM DE BAGPRO
  srvObtenerListaProcSellado():Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/ProcSellado');
  }

  srvObtenerListaProcSelladoOT(ot : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/ProcSellado/OT/${ot}`);
  }

  // CONSULTAS A LA TABLA PROC_DESPERDICIOS DE BAGPRO
  srvObtenerListaDespercicios():Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/Procdesperdicio');
  }

  srvObtenerListaDespercicios_Ot(ot : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Procdesperdicio/OT/${ot}`);
  }





}
