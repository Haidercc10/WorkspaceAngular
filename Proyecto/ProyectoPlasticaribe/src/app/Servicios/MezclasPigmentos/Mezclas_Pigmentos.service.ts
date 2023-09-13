import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { this.rutaPlasticaribeAPI, } from 'src/polyfills';
import { modelMezPigmento } from '../../Modelo/modelMezPigmento';

@Injectable({
  providedIn: 'root'
})
export class Mezclas_PigmentosService {

  constructor(private http : HttpClient,) { }

  srvObtenerLista = ():Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + '/Mezcla_Pigmento');

  srvObtenerListaPorId = (id : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Mezcla_Pigmento/${id}`);

  getMezclasPigmentos = (nombre : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Mezcla_Pigmento/Nombres_Pigmentos/${nombre}`);

  srvActualizar = (id:number|String, data:any) => this.http.put(this.rutaPlasticaribeAPI + `/Mezcla_Pigmento/${id}`, data);

  srvGuardar = (data : modelMezPigmento): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/Mezcla_Pigmento', data);

}
