import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})
export class VistasFavoritasService {

  constructor(private http : HttpClient,) { }

  srvObtenerListaVistas = () => this.http.get<any>(rutaPlasticaribeAPI + '/VistasFavoritas');

  srvObtenerListaPorId = (id : any) => this.http.get<any>(rutaPlasticaribeAPI + `/VistasFavoritas/${id}`);

  getVistasFavUsuario = (id : number) => this.http.get<any>(rutaPlasticaribeAPI + `/VistasFavoritas/getVistasFavUsuario/${id}`);

  updateVistasFavoritas = (id:number|String, data:any) => this.http.put(rutaPlasticaribeAPI + `/VistasFavoritas/${id}`, data);

  deleteVistasFavoritas = (id:number|String) => this.http.delete(rutaPlasticaribeAPI + `/VistasFavoritas/${id}`);

  insertVistasFavoritas = (data : any): Observable<any> => this.http.post(rutaPlasticaribeAPI + '/VistasFavoritas', data);
}
