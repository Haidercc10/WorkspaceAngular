import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { rutaPlasticaribeAPI, } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})
export class TipoClienteService {

  constructor(private http : HttpClient,) { }

  srvObtenerLista = () => this.http.get<any>(rutaPlasticaribeAPI + '/TiposClientes');

  srvObtenerListaPorNombreTipoCliente = (nombre : any) => this.http.get<any>(rutaPlasticaribeAPI + `/TiposClientes/nombreTipoCliente/${nombre}`);
}
