import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI, } from 'src/polyfills';
import { modelFallasTecnicas } from '../../Modelo/modelFallasTecnicas';

@Injectable({
  providedIn: 'root'
})
export class FallasTecnicasService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient,) { }

  srvObtenerLista() {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/Falla_Tecnica');
  }

  srvObtenerListaPorId(dato : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Falla_Tecnica/${dato}`);
  }

  srvActualizar(id:number|string, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/Falla_Tecnica/${id}`, data);
  }

  srvEliminar(id:number|string) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/Falla_Tecnica/${id}`);
  }

  srvGuardar(data : modelFallasTecnicas): Observable<any> {
   return this.http.post(this.rutaPlasticaribeAPI + '/Falla_Tecnica', data);
  }

}
