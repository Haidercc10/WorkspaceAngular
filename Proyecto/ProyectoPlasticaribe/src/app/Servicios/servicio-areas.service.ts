import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelAreas } from '../Modelo/modelAreas';


@Injectable({
  providedIn: 'root'
})
export class ServicioAreasService {

  //Ruta del API
  readonly rutaPlasticaribeAPI = "https://localhost:7137/api";

//Encapsular httpclient en el constructor
  constructor(private httpAreas : HttpClient) {


  }
//Metodo buscar lista de areas
  srvObtenerListaAreas():Observable<any[]> {
      return this.httpAreas.get<any>(this.rutaPlasticaribeAPI + '/Areas')
  }
//Metodo agregar areas
  srvAgregarAreas(data:any) {
    return this.httpAreas.post(this.rutaPlasticaribeAPI + '/Areas', data)
  }
//Metodo actualzar areas
  srvActualizarAreas(id:number|String, data:any) {
    return this.httpAreas.put(this.rutaPlasticaribeAPI + `/Areas/${id}`, data);
  }
//Metodo eliminar areas
  srvEliminarAreas(id:number|String) {
    return this.httpAreas.delete(this.rutaPlasticaribeAPI + `/Areas/${id}`);
  }

  srvGuardarArea(Area : modelAreas): Observable<any> {
    return this.httpAreas.post(this.rutaPlasticaribeAPI + '/Areas', Area)
  }

}