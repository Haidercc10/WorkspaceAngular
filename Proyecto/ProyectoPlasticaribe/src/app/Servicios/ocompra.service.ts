import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { Observable } from 'rxjs';
import { AppComponent} from 'src/app/app.component';
import { modelOcompra } from '../Modelo/modelOcompra';
import { rutaPlasticaribeAPI,  } from 'src/polyfills';


@Injectable({
  providedIn: 'root'
})
export class OcompraService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient,
    @Inject(SESSION_STORAGE) private storage: WebStorageService) {

    // if (this.storage.get('BD') == 1) this.rutaPlasticaribeAPI = rutaPlasticaribeAPI;
    // else if (this.storage.get('BD') == 2) this.rutaPlasticaribeAPI = ;
  }

//Metodo buscar lista de Ocompra
  srvObtenerListaOcompra():Observable<any[]> {
      return this.http.get<any>(this.rutaPlasticaribeAPI + '/Ocompra')
  }
//Metodo agregar Ocompra
  srvAgregarOcompra(data:any) {
    return this.http.post(this.rutaPlasticaribeAPI + '/Ocompra', data)
  }
//Metodo actualzar Ocompra
  srvActualizarOcompra(id:number|String, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/Ocompra/${id}`, data);
  }
//Metodo eliminar Ocompra
  srvEliminarOcompra(id:number|String) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/Ocompra/${id}`);
  }

  srvGuardarOcompra(data : modelOcompra): Observable<any> {
   return this.http.post(this.rutaPlasticaribeAPI + '/Ocompra', data)
 }

}
