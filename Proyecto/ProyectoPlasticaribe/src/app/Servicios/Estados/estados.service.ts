import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI, } from 'src/polyfills';
import { modelEstado } from '../../Modelo/modelEstado';

@Injectable({
  providedIn: 'root'
})
export class EstadosService {

  constructor(private http : HttpClient,) { }
  
  srvObtenerListaEstados = () => this.http.get<any>(rutaPlasticaribeAPI + '/Estadoes');

  srvObtenerListaPorNombreEstado = (nombre : any):Observable<any[]> => this.http.get<any>(rutaPlasticaribeAPI + `/Estadoes/nombreEstado/${nombre}`);
}


