import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TipoClienteService {
  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;
  
  constructor(private http : HttpClient,) { }

  srvObtenerLista = () => this.http.get<any>(this.rutaPlasticaribeAPI + '/TiposClientes');

  srvObtenerListaPorNombreTipoCliente = (nombre : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/TiposClientes/nombreTipoCliente/${nombre}`);
}
