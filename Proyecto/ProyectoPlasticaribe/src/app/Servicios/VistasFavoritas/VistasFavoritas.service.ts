import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VistasFavoritasService {
  
  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

  constructor(private http : HttpClient,) { }

  srvObtenerListaVistas = () => this.http.get<any>(this.rutaPlasticaribeAPI + '/VistasFavoritas');

  srvObtenerListaPorId = (id : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/VistasFavoritas/${id}`);

  getVistasFavUsuario = (id : number) => this.http.get<any>(this.rutaPlasticaribeAPI + `/VistasFavoritas/getVistasFavUsuario/${id}`);

  updateVistasFavoritas = (id:number|String, data:any) => this.http.put(this.rutaPlasticaribeAPI + `/VistasFavoritas/${id}`, data);

  deleteVistasFavoritas = (id:number|String) => this.http.delete(this.rutaPlasticaribeAPI + `/VistasFavoritas/${id}`);

  insertVistasFavoritas = (data : any): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/VistasFavoritas', data);
}
