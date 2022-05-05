
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelUsuario } from '../Modelo/modelUsuario';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  //Ruta del API
  readonly rutaPlasticaribeAPI = "https://localhost:7137/api";

//Encapsular httpclient en el constructor
  constructor(private http: HttpClient) { }

//Metodo buscar lista de Usuario
  srvObtenerListaUsuario() {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/Usuarios')
  }
//Metodo agregar Usuario
  srvAgregarUsuario(data:any) {
    return this.http.post(this.rutaPlasticaribeAPI + '/Usuarios', data)
  }
//Metodo actualzar Usuario
  srvActualizarUsuario(id:number|String, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/Usuarios/${id}`, data);
  }
//Metodo eliminar Usuario
  srvEliminarUsuario(id:number|String) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/Usuarios/${id}`);
  }

  srvGuardarUsuario(Usuario : modelUsuario): Observable<any> {
   return this.http.post(this.rutaPlasticaribeAPI + '/Usuarios', Usuario);
  }

}
