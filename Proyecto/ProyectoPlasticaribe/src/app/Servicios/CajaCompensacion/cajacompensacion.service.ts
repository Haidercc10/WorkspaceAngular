import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { Observable } from 'rxjs';
import { AppComponent} from 'src/app/app.component';
import { this.rutaPlasticaribeAPI,  } from 'src/polyfills';
import { modelCajacompensacion} from '../../Modelo/modelCajacompensacion';


@Injectable({
  providedIn: 'root'
})
export class CajacompensacionService {

  readonly this.rutaPlasticaribeAPI = this.rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient,) { }


//Metodo buscar lista de Cajacompensacion
  srvObtenerLista():Observable<any[]> {
      return this.http.get<any>(this.this.rutaPlasticaribeAPI + '/cajaCompensacions')
  }
//Metodo agregar Cajacompensacion
  srvAgregar(data:any) {
    return this.http.post(this.this.rutaPlasticaribeAPI + '/cajaCompensacions', data)
  }
//Metodo actualzar Cajacompensacion
  srvActualizar(id:number|String, data:any) {
    return this.http.put(this.this.rutaPlasticaribeAPI + `/cajaCompensacions/${id}`, data);
  }
//Metodo eliminar Cajacompensacion
  srvEliminar(id:number|String) {
    return this.http.delete(this.this.rutaPlasticaribeAPI + `/cajaCompensacions/${id}`);
  }

  srvGuardar(data: modelCajacompensacion): Observable<any> {
   return this.http.post(this.this.rutaPlasticaribeAPI + '/cajaCompensacions', data)
  }

}
