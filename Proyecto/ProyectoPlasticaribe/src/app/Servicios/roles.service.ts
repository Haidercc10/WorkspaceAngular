import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelRol } from '../Modelo/modelRol';

@Injectable({
  providedIn: 'root'
})
export class RolesService {

  //Ruta del API
  readonly rutaPlasticaribeAPI = "https://localhost:7137/api";

  constructor(private http : HttpClient) { }

  //Metodo buscar lista de roles
  srvObtenerLista():Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/Roles_Usuarios')
  }

  //Metodo agregar roles
  srvAgregar(data:any) {
    return this.http.post(this.rutaPlasticaribeAPI + '/Roles_Usuarios', data)
  }

  //Metodo actualzar roles
  srvActualizar(id:number|String, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/Roles_Usuarios/${id}`, data);
  }

  //Metodo eliminar roles
  srvEliminar(id:number|String) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/Roles_Usuarios/${id}`);
  }

  //
  srvGuardar(Roles : modelRol): Observable<any> {
    return this.http.post(this.rutaPlasticaribeAPI + '/Roles_Usuarios', Roles)
  }

}
