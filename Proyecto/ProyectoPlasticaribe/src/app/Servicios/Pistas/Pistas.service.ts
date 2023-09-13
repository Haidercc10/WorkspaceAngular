import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { modelPistas } from '../../Modelo/modelPistas';

@Injectable({
  providedIn: 'root'
})
export class PistasService {

  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

  constructor(private http : HttpClient,) { }

  srvObtenerLista = () => this.http.get<any>(this.rutaPlasticaribeAPI + '/Pistas');

  srvObtenerListaPorId = (dato : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Pistas/${dato}`);

  srvActualizar = (id:number|string, data:any) => this.http.put(this.rutaPlasticaribeAPI + `/Pistas/${id}`, data);

  srvEliminar = (id:number|string) => this.http.delete(this.rutaPlasticaribeAPI + `/Pistas/${id}`);

  srvGuardar = (data : modelPistas): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/Pistas', data);
}
