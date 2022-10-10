import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { Observable } from 'rxjs';
import { AppComponent} from 'src/app/app.component';
import { modelOT_Impresion } from '../Modelo/modelOT_Impresion';
import { rutaPlasticaribeAPI,  } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})
export class OT_ImpresionService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient,
    @Inject(SESSION_STORAGE) private storage: WebStorageService) {

    // if (this.storage.get('BD') == 1) this.rutaPlasticaribeAPI = rutaPlasticaribeAPI;
    // else if (this.storage.get('BD') == 2) this.rutaPlasticaribeAPI = ;
  }

  srvObtenerListaOrden_Trabajo() {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/OT_Impresion');
  }

  srvObtenerListaPorId(dato : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/OT_Impresion/${dato}`);
  }

  //Metodo actualzar
  srvActualizar(id:number|string, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/OT_Impresion/${id}`, data);
  }
  //Metodo eliminar
  srvEliminar(id:number|string) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/OT_Impresion/${id}`);
  }

  srvGuardar(data : modelOT_Impresion): Observable<any> {
   return this.http.post(this.rutaPlasticaribeAPI + '/OT_Impresion', data);
  }

}
