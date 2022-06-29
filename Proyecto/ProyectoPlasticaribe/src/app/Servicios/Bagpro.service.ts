import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BagproService {

  readonly rutaPlasticaribeAPI = "https://localhost:7160/api";

  constructor(private http : HttpClient) { }

  // CONSULTA A LA TABLA CLIENTES_OT_ITEM DE BAGPRO
  srvObtenerListaClienteOTItems():Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/ClientesOtItems');
  }

  // CONSULTA A LA TABLA CLIENTES_OT_ITEM DE BAGPRO
  srvObtenerListaClienteOT():Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/ClientesOt');
  }

  // CONSULTA A LA TABLA CLIENTES_OT_ITEM DE BAGPRO
  srvObtenerListaProcExt():Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/ProcExtrusion');
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
