import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { Observable } from 'rxjs';
import { AppComponent} from 'src/app/app.component';
import { modelTipoProveedor } from '../Modelo/modelTipoProveedor';
import { rutaPlasticaribeAPI,  } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})
export class Tipo_ProveedorService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient,
    @Inject(SESSION_STORAGE) private storage: WebStorageService) {

    // if (this.storage.get('BD') == 1) this.rutaPlasticaribeAPI = rutaPlasticaribeAPI;
    // else if (this.storage.get('BD') == 2) this.rutaPlasticaribeAPI = ;
  }

  //Metodo buscar lista de proveedor
    srvObtenerLista():Observable<any[]> {
        return this.http.get<any>(this.rutaPlasticaribeAPI + '/Tipo_Proveedor')
    }

  //Metodo agregar proveedor
    srvAgregar(data:any) {
      return this.http.post(this.rutaPlasticaribeAPI + '/Tipo_Proveedor', data)
    }

  //Metodo actualzar proveedor
    srvActualizar(id:number|String, data:any) {
      return this.http.put(this.rutaPlasticaribeAPI + `/Tipo_Proveedor/${id}`, data);
    }

  //Metodo eliminar proveedor
    srvEliminar(id:number|String) {
      return this.http.delete(this.rutaPlasticaribeAPI + `/Tipo_Proveedor/${id}`);
    }

    //Duardar proveedor
    srvGuardar(data : modelTipoProveedor): Observable<any> {
     return this.http.post(this.rutaPlasticaribeAPI + '/Tipo_Proveedor', data);
   }

}
