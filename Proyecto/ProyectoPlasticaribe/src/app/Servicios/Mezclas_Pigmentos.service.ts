import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI } from 'src/polyfills';
import { modelMezPigmento } from '../Modelo/modelMezPigmento';

@Injectable({
  providedIn: 'root'
})
export class Mezclas_PigmentosService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  constructor(private http : HttpClient) { }

  //
  srvObtenerLista():Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/Mezcla_Pigmento');
  }

  srvObtenerListaPorId(id : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Mezcla_Pigmento/${id}`);
  }

  //
  srvActualizar(id:number|String, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/Mezcla_Pigmento/${id}`, data);
  }

  //
  srvEliminar(id:number|String) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/Mezcla_Pigmento/${id}`);
  }

  //
  srvGuardar(data : modelMezPigmento): Observable<any> {
    return this.http.post(this.rutaPlasticaribeAPI + '/Mezcla_Pigmento', data)
  }

}
