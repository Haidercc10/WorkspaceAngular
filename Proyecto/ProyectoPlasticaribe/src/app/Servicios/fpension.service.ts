import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelFpension} from '../Modelo/modelFpension';


@Injectable({
  providedIn: 'root'
})
export class FpensionService {

  //Ruta del API
  readonly rutaPlasticaribeAPI = "https://localhost:7137/api";

//Encapsular httpclient en el constructor
  constructor(private httpFpension : HttpClient) {


  }
//Metodo buscar lista de Eps
  srvObtenerListaFpension():Observable<any[]> {
      return this.httpFpension.get<any>(this.rutaPlasticaribeAPI + '/Fpension')
  }
//Metodo agregar Eps
  srvAgregarFpension(data:any) {
    return this.httpFpension.post(this.rutaPlasticaribeAPI + '/Fpension', data)
  }
//Metodo actualzar Eps
  srvActualizarFpension(id:number|String, data:any) {
    return this.httpFpension.put(this.rutaPlasticaribeAPI + `/Fpension/${id}`, data);
  }
//Metodo eliminar Eps
  srvEliminarFpension(id:number|String) {
    return this.httpFpension.delete(this.rutaPlasticaribeAPI + `/Fpension/${id}`);
  }

 srvGuardarvFpension(Fpension : modelFpension): Observable<any> {
    return this.httpFpension.post(this.rutaPlasticaribeAPI + '/Fpension', Fpension)
   }

}
