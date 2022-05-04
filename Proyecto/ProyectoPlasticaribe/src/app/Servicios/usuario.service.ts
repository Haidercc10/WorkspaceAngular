
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelPedidomateriaprima } from '../Modelo/modelPedidomateriaprima';
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
  srvObtenerListaUsuario():Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/Usuario')
  }
//Metodo agregar Usuario
  srvAgregarUsuario(data:any) {
    return this.http.post(this.rutaPlasticaribeAPI + '/Usuario', data)
  }
//Metodo actualzar Usuario
  srvActualizarUsuario(id:number|String, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/Usuario/${id}`, data);
  }
//Metodo eliminar Usuario
  srvEliminarUsuario(id:number|String) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/Usuario/${id}`);
  }

  srvGuardarUsuario(Usuario : modelUsuario): Observable<any> {
   return this.http.post(this.rutaPlasticaribeAPI + '/Usuario', Usuario);
  }

}