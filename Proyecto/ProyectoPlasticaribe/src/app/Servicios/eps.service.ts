import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelEps } from '../Modelo/modelEps';

@Injectable({
  providedIn: 'root'
})
export class EpsService {

 //Ruta del API
 readonly rutaPlasticaribeAPI = "https://localhost:7137/api";

 //Encapsular httpclient en el constructor
   constructor(private http : HttpClient) { }
   
 //Metodo buscar lista de Cajacompensacion
   srvObtenerLista():Observable<any[]> {
       return this.http.get<any>(this.rutaPlasticaribeAPI + '/EPS')
   }
 //Metodo agregar Cajacompensacion
   srvAgregar(data:any) {
     return this.http.post(this.rutaPlasticaribeAPI + '/EPS', data)
   }
 //Metodo actualzar Cajacompensacion
   srvActualizar(id:number|String, data:any) {
     return this.http.put(this.rutaPlasticaribeAPI + `/EPS/${id}`, data);
   }
 //Metodo eliminar Cajacompensacion
   srvEliminar(id:number|String) {
     return this.http.delete(this.rutaPlasticaribeAPI + `/EPS/${id}`);
   }
 
   srvGuardar(eps: modelEps): Observable<any> {
    return this.http.post(this.rutaPlasticaribeAPI + '/EPS', eps)
   }

}
