import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI, } from 'src/polyfills';
import { modelLaminadoCapas } from '../../Modelo/modelLaminadoCapas';

@Injectable({
  providedIn: 'root'
})
export class Laminado_CapaService {

  constructor(private http : HttpClient,) { }

  srvObtenerLista = () => this.http.get<any>(rutaPlasticaribeAPI + '/Laminado_Capa');

  srvObtenerListaPorId = (dato : any) => this.http.get<any>(rutaPlasticaribeAPI + `/Laminado_Capa/${dato}`);
}
