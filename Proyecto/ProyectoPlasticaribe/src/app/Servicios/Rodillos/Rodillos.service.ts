import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { Observable } from 'rxjs';
import { AppComponent} from 'src/app/app.component';
import { modelRodillo } from '../../Modelo/modelRodillo';
import { rutaPlasticaribeAPI,  } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})
export class RodillosService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient,
    @Inject(SESSION_STORAGE) private storage: WebStorageService) {

    // if (this.storage.get('BD') == 1) this.rutaPlasticaribeAPI = rutaPlasticaribeAPI;
    // else if (this.storage.get('BD') == 2) this.rutaPlasticaribeAPI = ;
  }

  srvObtenerLista() {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/Rodillos');
  }

  srvObtenerListaPorId(dato : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Rodillos/${dato}`);
  }

  srvActualizar(id:number|string, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/Rodillos/${id}`, data);
  }

  srvEliminar(id:number|string) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/Rodillos/${id}`);
  }

  srvGuardar(data : modelRodillo): Observable<any> {
   return this.http.post(this.rutaPlasticaribeAPI + '/Rodillos', data);
  }

}