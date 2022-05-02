import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelOcompra } from '../Modelo/modelOcompra';


@Injectable({
  providedIn: 'root'
})
export class OcompraService {

  //Ruta del API
  readonly rutaPlasticaribeAPI = "https://localhost:7137/api";

//Encapsular httpclient en el constructor
  constructor(private httpOcompra : HttpClient) {


  }
//Metodo buscar lista de Ocompra
  srvObtenerListaOcompra():Observable<any[]> {
      return this.httpOcompra.get<any>(this.rutaPlasticaribeAPI + '/Ocompra')
  }
//Metodo agregar Ocompra
  srvAgregarOcompra(data:any) {
    return this.httpOcompra.post(this.rutaPlasticaribeAPI + '/Ocompra', data)
  }
//Metodo actualzar Ocompra
  srvActualizarOcompra(id:number|String, data:any) {
    return this.httpOcompra.put(this.rutaPlasticaribeAPI + `/Ocompra/${id}`, data);
  }
//Metodo eliminar Ocompra
  srvEliminarOcompra(id:number|String) {
    return this.httpOcompra.delete(this.rutaPlasticaribeAPI + `/Ocompra/${id}`);
  }

  srvGuardarOcompra(Ocompra : modelOcompra): Observable<any> {
   return this.httpOcompra.post(this.rutaPlasticaribeAPI + '/Ocompra', Ocompra)
 }

}
