import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { Observable } from 'rxjs';
import { AppComponent} from 'src/app/app.component';
import { modelUnidadMedida } from '../Modelo/modelUnidadMedida';
import { rutaPlasticaribeAPI,  } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})
export class UnidadMedidaService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient,
    @Inject(SESSION_STORAGE) private storage: WebStorageService) {

    // if (this.storage.get('BD') == 1) this.rutaPlasticaribeAPI = rutaPlasticaribeAPI;
    // else if (this.storage.get('BD') == 2) this.rutaPlasticaribeAPI = ;
  }

  //Metodo buscar lista de Productos
  srvObtenerLista():Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/Unidad_Medida')
  }

  //Metodo agregar Productos
  srvAgregar(data:any) {
    return this.http.post(this.rutaPlasticaribeAPI + '/Unidad_Medida', data)
  }

  //Metodo actualzar Productos
  srvActualizar(id:number|String, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/Unidad_Medida/${id}`, data);
  }

  //Metodo eliminar Productos
  srvEliminar(id:number|String) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/Unidad_Medida/${id}`);
  }

  //
  srvGuardar(data : modelUnidadMedida): Observable<any> {
    return this.http.post(this.rutaPlasticaribeAPI + '/Unidad_Medida', data)
  }
}
