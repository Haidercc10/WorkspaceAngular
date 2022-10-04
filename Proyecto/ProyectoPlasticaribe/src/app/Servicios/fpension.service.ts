import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { Observable } from 'rxjs';
import { AppComponent} from 'src/app/app.component';
import { modelFpension} from '../Modelo/modelFpension';
import { rutaPlasticaribeAPI, rutaPlasticaribeAPIPrueba } from 'src/polyfills';


@Injectable({
  providedIn: 'root'
})
export class FpensionService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient,
    @Inject(SESSION_STORAGE) private storage: WebStorageService) {

    // if (this.storage.get('BD') == 1) this.rutaPlasticaribeAPI = rutaPlasticaribeAPI;
    // else if (this.storage.get('BD') == 2) this.rutaPlasticaribeAPI = rutaPlasticaribeAPIPrueba;
  }

//Metodo buscar lista de Eps
  srvObtenerListaFpension():Observable<any[]> {
      return this.http.get<any>(this.rutaPlasticaribeAPI + '/Fpension')
  }
//Metodo agregar Eps
  srvAgregarFpension(data:any) {
    return this.http.post(this.rutaPlasticaribeAPI + '/Fpension', data)
  }
//Metodo actualzar Eps
  srvActualizarFpension(id:number|String, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/Fpension/${id}`, data);
  }
//Metodo eliminar Eps
  srvEliminarFpension(id:number|String) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/Fpension/${id}`);
  }

 srvGuardarvFpension(data : modelFpension): Observable<any> {
    return this.http.post(this.rutaPlasticaribeAPI + '/Fpension', data)
   }

}
