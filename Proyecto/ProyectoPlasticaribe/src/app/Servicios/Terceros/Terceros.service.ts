import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { Observable } from 'rxjs';
import { modelTercero } from 'src/app/Modelo/modelTercero';
import { rutaPlasticaribeAPI } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})
export class TercerosService {

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient,
    @Inject(SESSION_STORAGE) private storage: WebStorageService) { }

  getTodo() {
    return this.http.get<any>(rutaPlasticaribeAPI + '/Terceros');
  }

  getId(dato : any){
    return this.http.get<any>(rutaPlasticaribeAPI + `/Terceros/${dato}`);
  }

  getTerceroLike(nombre : string){
    return this.http.get<any>(rutaPlasticaribeAPI + `/Terceros/getTerceroLike/${nombre}`);
  }

  put(id:number|string, data:any) {
    return this.http.put(rutaPlasticaribeAPI + `/Terceros/${id}`, data);
  }

  delete(id:number|string) {
    return this.http.delete(rutaPlasticaribeAPI + `/Terceros/${id}`);
  }

  insert(data : modelTercero): Observable<any> {
    return this.http.post(rutaPlasticaribeAPI + '/Terceros', data);
  }

}
