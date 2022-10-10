import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { Observable } from 'rxjs';
import { AppComponent} from 'src/app/app.component';
import { modelOT_Extrusion } from '../Modelo/modelOT_Extrusion';
import { rutaPlasticaribeAPI,  } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})
export class OT_ExtrusionService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient,
    @Inject(SESSION_STORAGE) private storage: WebStorageService) {

    // if (this.storage.get('BD') == 1) this.rutaPlasticaribeAPI = rutaPlasticaribeAPI;
    // else if (this.storage.get('BD') == 2) this.rutaPlasticaribeAPI = ;
  }

  srvObtenerListaOrden_Trabajo() {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/OT_Extrusion');
  }

  srvObtenerListaPorId(dato : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/OT_Extrusion/${dato}`);
  }

  //Metodo actualzar
  srvActualizar(id:number|string, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/OT_Extrusion/${id}`, data);
  }
  //Metodo eliminar
  srvEliminar(id:number|string) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/OT_Extrusion/${id}`);
  }

  srvGuardar(data : modelOT_Extrusion): Observable<any> {
   return this.http.post(this.rutaPlasticaribeAPI + '/OT_Extrusion', data);
  }

}
