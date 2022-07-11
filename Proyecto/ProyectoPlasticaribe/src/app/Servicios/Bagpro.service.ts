import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaBagPro, rutaBagProLocate } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})
export class BagproService {

  readonly rutaPlasticaribeAPI = rutaBagPro;

  constructor(private http : HttpClient) { }

  // CONSULTA A LA TABLA CLIENTES_OT_ITEM DE BAGPRO
  srvObtenerListaClienteOTItems():Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/ClientesOtItems');
  }

  srvObtenerListaClienteOTItemsXItem(idItem : number):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/ClientesOtItems/OtItem/${idItem}`);
  }

  // CONSULTA A LA TABLA CLIENTES_OT_ITEM DE BAGPRO
  srvObtenerListaClienteOT():Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/ClientesOt');
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

  // CONSULTAS A LA TABLA PROC_DESPERDICIOS DE BAGPRO
  srvObtenerListaDespercicios():Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/Procdesperdicios');
  }





}
