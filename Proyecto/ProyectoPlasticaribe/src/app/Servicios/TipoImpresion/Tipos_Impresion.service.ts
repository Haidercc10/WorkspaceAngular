import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { this.rutaPlasticaribeAPI, } from 'src/polyfills';
import { modelTipoImpresion } from '../../Modelo/modelTipoImpresion';

@Injectable({
  providedIn: 'root'
})
export class Tipos_ImpresionService {

  constructor(private http : HttpClient,) { }

  srvObtenerLista = () => this.http.get<any>(this.rutaPlasticaribeAPI + '/Tipos_Impresion');

}
