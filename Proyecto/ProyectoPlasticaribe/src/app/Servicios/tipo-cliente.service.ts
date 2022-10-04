import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { Observable } from 'rxjs';
import { AppComponent} from 'src/app/app.component';
import { modelTiposClientes } from '../Modelo/modelTiposClientes';
import { rutaPlasticaribeAPI, rutaPlasticaribeAPIPrueba } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})
export class TipoClienteService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient,
    @Inject(SESSION_STORAGE) private storage: WebStorageService) {

    // if (this.storage.get('BD') == 1) this.rutaPlasticaribeAPI = rutaPlasticaribeAPI;
    // else if (this.storage.get('BD') == 2) this.rutaPlasticaribeAPI = rutaPlasticaribeAPIPrueba;
  }

//Metodo buscar lista de Usuario
  srvObtenerLista() {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/TiposClientes')
  }

  srvObtenerListaPorId(id : number){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/TiposClientes/${id}`);
  }

  srvObtenerListaPorNombreTipoCliente(nombre : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/TiposClientes/nombreTipoCliente/${nombre}`);
  }

//Metodo agregar Usuario
  srvAgregar(data:any) {
    return this.http.post(this.rutaPlasticaribeAPI + '/TiposClientes', data)
  }
//Metodo actualzar Usuario
  srvActualizar(id:number|String, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/TiposClientes/${id}`, data);
  }
//Metodo eliminar Usuario
  srvEliminar(id:number|String) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/TiposClientes/${id}`);
  }

  srvGuardaro(data : modelTiposClientes): Observable<any> {
   return this.http.post(this.rutaPlasticaribeAPI + '/TiposClientes', data);
  }
}
