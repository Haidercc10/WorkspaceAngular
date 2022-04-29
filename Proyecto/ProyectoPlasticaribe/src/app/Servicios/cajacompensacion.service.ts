import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelCajacompensacion} from '../Modelo/modelCajacompensacion';


@Injectable({
  providedIn: 'root'
})
export class CajacompensacionService {

  //Ruta del API
  readonly rutaPlasticaribeAPI = "https://localhost:7137/api";

//Encapsular httpclient en el constructor
  constructor(private httpCajacompensacion : HttpClient) {


  }
//Metodo buscar lista de Cajacompensacion
  srvObtenerListaCajacompensacion():Observable<any[]> {
      return this.httpCajacompensacion.get<any>(this.rutaPlasticaribeAPI + '/Cajacompensacion')
  }
//Metodo agregar Cajacompensacion
  srvAgregarCajacompensacion(data:any) {
    return this.httpCajacompensacion.post(this.rutaPlasticaribeAPI + '/Cajacompensacion', data)
  }
//Metodo actualzar Cajacompensacion
  srvActualizarCajacompensacion(id:number|String, data:any) {
    return this.httpCajacompensacion.put(this.rutaPlasticaribeAPI + `/Cajacompensacion/${id}`, data);
  }
//Metodo eliminar Cajacompensacion
  srvEliminarCajacompensacion(id:number|String) {
    return this.httpCajacompensacion.delete(this.rutaPlasticaribeAPI + `/Cajacompensacion/${id}`);
  }

  srvGuardarCajacompensacion(Cajacompensacion: modelCajacompensacion): Observable<any> {
   return this.httpCajacompensacion.post(this.rutaPlasticaribeAPI + '/Cajacompensacion', Cajacompensacion)
  }

}
