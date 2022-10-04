import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { Observable } from 'rxjs';
import { AppComponent} from 'src/app/app.component';
import { modelTipoBodega } from '../Modelo/modelTipoBodega';
import { rutaPlasticaribeAPI, rutaPlasticaribeAPIPrueba } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})
export class TipoBodegaService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient,
    @Inject(SESSION_STORAGE) private storage: WebStorageService) {

    // if (this.storage.get('BD') == 1) this.rutaPlasticaribeAPI = rutaPlasticaribeAPI;
    // else if (this.storage.get('BD') == 2) this.rutaPlasticaribeAPI = rutaPlasticaribeAPIPrueba;
  }

  //Metodo buscar lista de Materia Prima
    srvObtenerLista():Observable<any[]> {
        return this.http.get<any>(this.rutaPlasticaribeAPI + '/Tipo_Bodega')
    }

    srvObtenerListaPorId(dato : any){
      return this.http.get<any>(this.rutaPlasticaribeAPI + `/Tipo_Bodega/${dato}`);
    }

  //Metodo agregar Materia Prima
    srvAgregar(data:any) {
      return this.http.post(this.rutaPlasticaribeAPI + '/Tipo_Bodega', data)
    }

  //Metodo actualzar Materia Prima
    srvActualizar(id:number|String, data:any) {
      return this.http.put(this.rutaPlasticaribeAPI + `/Tipo_Bodega/${id}`, data);
    }

  //Metodo eliminar Materia Prima
    srvEliminar(id:number|String) {
      return this.http.delete(this.rutaPlasticaribeAPI + `/Tipo_Bodega/${id}`);
    }

    //Duardar Materia Prima
    srvGuardar(data : modelTipoBodega): Observable<any> {
     return this.http.post(this.rutaPlasticaribeAPI + '/Tipo_Bodega', data);
   }

}
