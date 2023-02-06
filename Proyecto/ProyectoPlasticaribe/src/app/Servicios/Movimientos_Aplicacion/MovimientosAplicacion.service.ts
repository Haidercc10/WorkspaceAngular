import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})
export class MovimientosAplicacionService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient, @Inject(SESSION_STORAGE) private storage: WebStorageService) { }

  getTodo() {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/MovientosAplicacion');
  }

  getId(id : number){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/MovientosAplicacion`);
  }

  putId(id: any, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/MovientosAplicacion/${id}`, data);
  }

  deleteID_(id: any) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/MovientosAplicacion/${id}`);
  }

  insert(data : any): Observable<any> {
    return this.http.post(this.rutaPlasticaribeAPI + '/MovientosAplicacion', data);
  }
}
