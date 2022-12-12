import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { Observable } from 'rxjs';
import { AppComponent} from 'src/app/app.component';
import { modelPigmento } from '../../Modelo/modelPigmento';
import { rutaPlasticaribeAPI,  } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})
export class PigmentoProductoService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient,
    @Inject(SESSION_STORAGE) private storage: WebStorageService) {

    // if (this.storage.get('BD') == 1) this.rutaPlasticaribeAPI = rutaPlasticaribeAPI;
    // else if (this.storage.get('BD') == 2) this.rutaPlasticaribeAPI = ;
  }

  //Metodo buscar lista de Pigmentos
  srvObtenerLista():Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/Pigmentoes');
  }

  srvObtenerListaPorId(id : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Pigmentoes/${id}`);
  }

  srvObtenerListaPorNombrePigmento(nombre : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Pigmentoes/nombrePigmento/${nombre}`);
  }

  //Metodo agregar Pigmentos
  srvAgregar(data:any) {
    return this.http.post(this.rutaPlasticaribeAPI + '/Pigmentoes', data)
  }

  //Metodo actualzar Pigmentos
  srvActualizar(id:number|String, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/Pigmentoes/${id}`, data);
  }

  //Metodo eliminar Pigmentos
  srvEliminar(id:number|String) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/Pigmentoes/${id}`);
  }

  //
  srvGuardar(data : modelPigmento): Observable<any> {
    return this.http.post(this.rutaPlasticaribeAPI + '/Pigmentoes', data)
  }
}
