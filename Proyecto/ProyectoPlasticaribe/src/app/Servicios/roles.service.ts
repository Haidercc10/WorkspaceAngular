import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI } from 'src/polyfills';
import { modelRol } from '../Modelo/modelRol';

@Injectable({
  providedIn: 'root'
})
export class RolesService {

  //Ruta del API
  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  constructor(private http : HttpClient) { }

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
