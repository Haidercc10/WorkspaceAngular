import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TipoEstadosService {
  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;
  
  constructor(private http : HttpClient,) { }

  srvObtenerListaPorId = (id : number) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Tipo_Estado/${id}`);
}
