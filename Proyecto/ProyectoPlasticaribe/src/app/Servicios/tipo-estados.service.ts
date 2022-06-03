import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelTipoEstado } from '../Modelo/modelTipoEstado';

@Injectable({
  providedIn: 'root'
})
export class TipoEstadosService {

  //Ruta del API
  readonly rutaPlasticaribeAPI = "https://192.168.0.153:7137/api";

//Encapsular httpclient en el constructor
  constructor(private http: HttpClient) { }

//Metodo buscar lista de Usuario
  srvObtenerListaUsuario() {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/Tipo_Estado')
  }

  srvObtenerListaPorId(id : number){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Tipo_Estado/${id}`);
  }
//Metodo agregar Usuario
  srvAgregarUsuario(data:any) {
    return this.http.post(this.rutaPlasticaribeAPI + '/Tipo_Estado', data)
  }
//Metodo actualzar Usuario
  srvActualizarUsuario(id:number|String, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/Tipo_Estado/${id}`, data);
  }
//Metodo eliminar Usuario
  srvEliminarUsuario(id:number|String) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/Tipo_Estado/${id}`);
  }

  srvGuardarUsuario(data : modelTipoEstado): Observable<any> {
   return this.http.post(this.rutaPlasticaribeAPI + '/Tipo_Estado', data);
  }

}
