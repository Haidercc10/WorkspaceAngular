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
  srvObtenerLista(){
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/Estadoes')
  }
//Metodo agregar Usuario
  srvAgregar(data:any) {
    return this.http.post(this.rutaPlasticaribeAPI + '/Estadoes', data)
  }
//Metodo actualzar Usuario
  srvActualizar(id:number|String, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/Estadoes/${id}`, data);
  }
//Metodo eliminar Usuario
  srvEliminar(id:number|String) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/Estadoes/${id}`);
  }

  srvGuardar(data : modelEstado): Observable<any> {
   return this.http.post(this.rutaPlasticaribeAPI + '/Estadoes', data);
  }

}
