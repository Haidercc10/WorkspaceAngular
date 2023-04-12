import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI, } from 'src/polyfills';
import { modelMezclas } from '../../Modelo/modelMezclas';

@Injectable({
  providedIn: 'root'
})
export class MezclasService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient,) { }


  //
  srvObtenerLista():Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/Mezclas');
  }

  srvObtenerListaPorId(id : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Mezclas/${id}`);
  }

  getMezclaNombre(nombre : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Mezclas/getMezclaNombre/${nombre}`);
  }

  srvObtenerListaPorNombre(nombre : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Mezclas/combinacionMezclas/${nombre}`);
  }

  //
  srvActualizar(id:number|String, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/Mezclas/${id}`, data);
  }

  //
  srvEliminar(id:number|String) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/Mezclas/${id}`);
  }

  //
  srvGuardar(data : modelMezclas): Observable<any> {
    return this.http.post(this.rutaPlasticaribeAPI + '/Mezclas', data)
  }

}
