
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { Observable } from 'rxjs';
import { AppComponent} from 'src/app/app.component';
import { rutaPlasticaribeAPI,  } from 'src/polyfills';
import { modelUsuario } from '../../Modelo/modelUsuario';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient,
    @Inject(SESSION_STORAGE) private storage: WebStorageService) {

    // if (this.storage.get('BD') == 1 || this.storage.get('BD') == undefined) this.rutaPlasticaribeAPI = rutaPlasticaribeAPI;
    // else if (this.storage.get('BD') == 2) this.rutaPlasticaribeAPI = ;
  }

//Metodo buscar lista de Usuario
  srvObtenerListaUsuario() {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/Usuarios')
  }

  srvObtenerListaPorId(id : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Usuarios/${id}`);
  }

  srvObtenerListaPorNombreUsuario(nombre : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Usuarios/nombreUsuario/${nombre}`);
  }

  srvObtenerListaPorIdConductor(id : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Usuarios/UsuarioConductor/${id}`);
  }

//Metodo agregar Usuario
  srvAgregarUsuario(data:any) {
    return this.http.post(this.rutaPlasticaribeAPI + '/Usuarios', data)
  }
//Metodo actualizar Usuario
  srvActualizarUsuario(id:number|String, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/Usuarios/${id}`, data);
  }
//Metodo eliminar Usuario
  srvEliminarUsuario(id:number|String) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/Usuarios/${id}`);
  }

  srvGuardarUsuario(data : modelUsuario): Observable<any> {
   return this.http.post(this.rutaPlasticaribeAPI + '/Usuarios', data);
  }

  getUsuariosxId(id : any) {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Usuarios/UsuariosxId/${id}`);
  }

  getUsuarios() {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Usuarios/UsuariosSinParametros`);
  }
}
