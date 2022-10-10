import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { Observable } from 'rxjs';
import { modelRol } from '../Modelo/modelRol';
import { rutaPlasticaribeAPI,  } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})
export class RolesService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient,
    @Inject(SESSION_STORAGE) private storage: WebStorageService) {

    // if (this.storage.get('BD') == 1) this.rutaPlasticaribeAPI = rutaPlasticaribeAPI;
    // else if (this.storage.get('BD') == 2) this.rutaPlasticaribeAPI = ;
  }

  //Metodo buscar lista de roles
  srvObtenerLista():Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/Rol_Usuario')
  }

  srvObtenerListaPorId(id : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Rol_Usuario/${id}`);
  }

  //Metodo agregar roles
  srvAgregar(data:any) {
    return this.http.post(this.rutaPlasticaribeAPI + '/Rol_Usuario', data)
  }

  //Metodo actualzar roles
  srvActualizar(id:number|String, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/Rol_Usuario/${id}`, data);
  }

  //Metodo eliminar roles
  srvEliminar(id:number|String) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/Rol_Usuario/${id}`);
  }

  //
  srvGuardar(data : modelRol): Observable<any> {
    return this.http.post(this.rutaPlasticaribeAPI + '/Rol_Usuario', data)
  }

}
