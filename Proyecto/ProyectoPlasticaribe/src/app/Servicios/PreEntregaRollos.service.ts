import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI } from 'src/polyfills';
import { modelPreentregaRollos } from '../Modelo/modelPreEntregaRollo';

@Injectable({
  providedIn: 'root'
})
export class PreEntregaRollosService {

  readonly rutaPlasticaribeAPI =  rutaPlasticaribeAPI; /*"https://localhost:7137/api"*/;

  //Encapsular httpclient en el constructor
  constructor(private http: HttpClient) { }

  srvObtenerLista() {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/');
  }

  srvObtenerListaPorId(dato : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `//${dato}`);
  }

  srvObtenerUltimoId(){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `//UltumoID`);
  }

  srvActualizar(id:number|string, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `//${id}`, data);
  }

  srvEliminar(id:number|string) {
    return this.http.delete(this.rutaPlasticaribeAPI + `//${id}`);
  }

  srvGuardar(data : modelPreentregaRollos): Observable<any> {
   return this.http.post(this.rutaPlasticaribeAPI + '/', data);
  }

}
