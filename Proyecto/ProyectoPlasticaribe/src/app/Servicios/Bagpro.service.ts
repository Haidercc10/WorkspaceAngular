import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BagproClientesOTItemService {

  readonly rutaPlasticaribeAPI = "https://localhost:7160/api";

  constructor(private http : HttpClient) { }

  // CONSULTA A LA TABLA CLIENTES_OT_ITEM DE BAGPRO
  srvObtenerListaClienteOTItems():Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/ClientesOtItems');
  }
  srvObtenerListaPorIdClienteOTItems(id : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/ClientesOtItems/${id}`);
  }

  // CONSULTAS A LA TABLA PROC_DESPERDICIOS DE BAGPRO
  srvObtenerListaDespercicios():Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/Procdesperdicios');
  }
  srvObtenerListaPorIdDespercicios(id : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Procdesperdicios/${id}`);
  }




}
