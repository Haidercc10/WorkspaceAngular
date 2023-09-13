import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { this.rutaPlasticaribeAPI, } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})
export class FallasTecnicasService {

  constructor(private http : HttpClient,) { }

  srvObtenerLista = () => this.http.get<any>(this.rutaPlasticaribeAPI + '/Falla_Tecnica');
}
