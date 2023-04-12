import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI, } from 'src/polyfills';
import { modelFpension } from '../../Modelo/modelFpension';


@Injectable({
  providedIn: 'root'
})
export class FpensionService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient,) { }

//Metodo buscar lista de Eps
  srvObtenerListaFpension():Observable<any[]> {
      return this.http.get<any>(this.rutaPlasticaribeAPI + '/Fpension')
  }
//Metodo agregar Eps
  srvAgregarFpension(data:any) {
    return this.http.post(this.rutaPlasticaribeAPI + '/Fpension', data)
  }
//Metodo actualzar Eps
  srvActualizarFpension(id:number|String, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/Fpension/${id}`, data);
  }
//Metodo eliminar Eps
  srvEliminarFpension(id:number|String) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/Fpension/${id}`);
  }

 srvGuardarvFpension(data : modelFpension): Observable<any> {
    return this.http.post(this.rutaPlasticaribeAPI + '/Fpension', data)
   }

}
