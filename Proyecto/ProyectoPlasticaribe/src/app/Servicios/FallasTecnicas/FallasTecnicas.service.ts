import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { rutaPlasticaribeAPI, } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})
export class FallasTecnicasService {

  constructor(private http : HttpClient,) { }

  srvObtenerLista = () => this.http.get<any>(rutaPlasticaribeAPI + '/Falla_Tecnica');
}
