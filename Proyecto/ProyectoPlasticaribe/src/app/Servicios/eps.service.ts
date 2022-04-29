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
  constructor(private httpEps : HttpClient) {


  }
//Metodo buscar lista de Eps
  srvObtenerListaEps():Observable<any[]> {
      return this.httpEps.get<any>(this.rutaPlasticaribeAPI + '/Eps')
  }
//Metodo agregar Eps
  srvAgregarAreas(data:any) {
    return this.httpEps.post(this.rutaPlasticaribeAPI + '/Eps', data)
  }
//Metodo actualzar Eps
  srvActualizarEps(id:number|String, data:any) {
    return this.httpEps.put(this.rutaPlasticaribeAPI + `/Eps/${id}`, data);
  }
//Metodo eliminar Eps
  srvEliminarEps(id:number|String) {
    return this.httpEps.delete(this.rutaPlasticaribeAPI + `/Eps/${id}`);
  }

  srvGuardarEps(Eps : modelEps): Observable<any> {
   return this.httpEps.post(this.rutaPlasticaribeAPI + '/Eps', Eps)
 }

}
