import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI, } from 'src/polyfills';
import { modelMezMaterial } from '../../Modelo/modelMezMaterial';

@Injectable({
  providedIn: 'root'
})
export class Mezclas_MaterialesService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient,) { }


  //
  srvObtenerLista():Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/Mezcla_Material');
  }

  srvObtenerListaPorId(id : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Mezcla_Material/${id}`);
  }

  getMezclasMateriales(nombre : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Mezcla_Material/Nombres_Materiales/${nombre}`);
  }

  //
  srvActualizar(id:number|String, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/Mezcla_Material/${id}`, data);
  }

  //
  srvEliminar(id:number|String) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/Mezcla_Material/${id}`);
  }

  //
  srvGuardar(data : modelMezMaterial): Observable<any> {
    return this.http.post(this.rutaPlasticaribeAPI + '/Mezcla_Material', data)
  }

}
