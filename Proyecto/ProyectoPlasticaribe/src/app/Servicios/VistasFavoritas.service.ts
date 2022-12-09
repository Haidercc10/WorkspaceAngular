import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})
export class VistasFavoritasService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient,
    @Inject(SESSION_STORAGE) private storage: WebStorageService) {

    // if (this.storage.get('BD') == 1 || this.storage.get('BD') == undefined) this.rutaPlasticaribeAPI = rutaPlasticaribeAPI;
    // else if (this.storage.get('BD') == 2) this.rutaPlasticaribeAPI = ;
  }

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
