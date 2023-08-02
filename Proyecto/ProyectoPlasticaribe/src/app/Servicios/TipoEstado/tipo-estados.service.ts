import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { rutaPlasticaribeAPI, } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})
export class TipoEstadosService {

  constructor(private http : HttpClient,) { }

  srvObtenerListaPorId = (id : number) => this.http.get<any>(rutaPlasticaribeAPI + `/Tipo_Estado/${id}`);
}
