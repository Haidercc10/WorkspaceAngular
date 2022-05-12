import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelEstado } from '../Modelo/modelEstado';

@Injectable({
  providedIn: 'root'
})
export class EstadosService {

  //Ruta del API
  readonly rutaPlasticaribeAPI = "https://localhost:7137/api";

//Encapsular httpclient en el constructor
  constructor(private http: HttpClient) { }

//Metodo buscar lista de Usuario

  srvObtenerListaEstados() {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/Estadoes')
  }
//Metodo agregar Usuario
  srvAgregarEstado(data:any) {
    return this.http.post(this.rutaPlasticaribeAPI + '/Estadoes', data)
  }
//Metodo actualzar Usuario
  srvActualizarEstado(id:number|String, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/Estadoes/${id}`, data);
  }
//Metodo eliminar Usuario
  srvEliminarEstado(id:number|String) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/Estadoes/${id}`);
  }



  srvObtenerListaUsuario() {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/Estadoes')
  }
//Metodo agregar Usuario
  srvAgregarUsuario(data:any) {
    return this.http.post(this.rutaPlasticaribeAPI + '/Estadoes', data)
  }
//Metodo actualzar Usuario
  srvActualizarUsuario(id:number|String, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/Estadoes/${id}`, data);
  }
//Metodo eliminar Usuario
  srvEliminarUsuario(id:number|String) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/Estadoes/${id}`);
  }

  srvGuardarUsuario(data : modelEstado): Observable<any> {

   return this.http.post(this.rutaPlasticaribeAPI + '/Estadoes', data);
  }

}



