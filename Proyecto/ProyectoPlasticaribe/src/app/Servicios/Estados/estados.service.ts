import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { modelEstado } from '../../Modelo/modelEstado';

@Injectable({
  providedIn: 'root'
})
export class EstadosService {

  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

  constructor(private http : HttpClient,) { }
  
  srvObtenerListaEstados = () => this.http.get<any>(this.rutaPlasticaribeAPI + '/Estadoes');

  srvObtenerListaPorNombreEstado = (nombre : any):Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + `/Estadoes/nombreEstado/${nombre}`);
}


