import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})
export class VistasFavoritasService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient,) { }

//Metodo buscar lista de Usuario
  srvObtenerListaVistas() {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/VistasFavoritas')
  }

  srvObtenerListaPorId(id : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/VistasFavoritas/${id}`);
  }

  getVistasFavUsuario(id : number){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/VistasFavoritas/getVistasFavUsuario/${id}`);
  }

  updateVistasFavoritas(id:number|String, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/VistasFavoritas/${id}`, data);
  }

  deleteVistasFavoritas(id:number|String) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/VistasFavoritas/${id}`);
  }

  insertVistasFavoritas(data : any): Observable<any> {
   return this.http.post(this.rutaPlasticaribeAPI + '/VistasFavoritas', data);
  }

}
