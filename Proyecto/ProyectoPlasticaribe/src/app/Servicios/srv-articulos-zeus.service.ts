import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SrvArticulosZeusService {

  readonly rutaPlasticaribeAPIZeus = "http://192.168.0.137:9055/api";

  constructor(private http : HttpClient) { }

  //Metodo buscar lista de articulos
  srvObtenerLista():Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPIZeus + '/articulos');
  }

  //Metodo buscar articulos por Id.
  srvObtenerListaPorId(id : any){
    return this.http.get<any>(this.rutaPlasticaribeAPIZeus + `/articulos/${id}`);
  }

}
