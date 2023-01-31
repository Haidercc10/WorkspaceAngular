import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { Observable } from 'rxjs';
import { modelOrdenTrabajo_SelladoCorte } from 'src/app/Modelo/modelOrdenTrabajo_Sellado_Corte';
import { rutaPlasticaribeAPI } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})

export class OrdenTrabajo_Sellado_CorteService {


  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient,
    @Inject(SESSION_STORAGE) private storage: WebStorageService) {

    // if (this.storage.get('BD') == 1) this.rutaPlasticaribeAPI = rutaPlasticaribeAPI;
    // else if (this.storage.get('BD') == 2) this.rutaPlasticaribeAPI = ;
  }

  getTodo() {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/OT_SelladoCorte');
  }

  getInfoPorId(dato : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/OT_SelladoCorte/${dato}`);
  }

  //Metodo actualzar
  put(id:number|string, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/OT_SelladoCorte/${id}`, data);
  }
  //Metodo eliminar
  delete(id:number|string) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/OT_SelladoCorte/${id}`);
  }

  post(data : modelOrdenTrabajo_SelladoCorte): Observable<any> {
   return this.http.post(this.rutaPlasticaribeAPI + '/OT_SelladoCorte', data);
  }

}
