import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI } from 'src/polyfills';
import { modelIngRollo_Extrusion } from '../../Modelo/modelIngRollo_Extrusion';

@Injectable({
  providedIn: 'root'
})
export class IngRollos_ExtrusuionService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient,) { }

  srvObtenerLista() {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/IngresoRollos_Extrusion');
  }
  srvObtenerListaPorId(dato : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/IngresoRollos_Extrusion/${dato}`);
  }
  obtenerUltimoId(){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/IngresoRollos_Extrusion/getObtenerUltimoID`);
  }

  srvActualizar(id:number|string, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/IngresoRollos_Extrusion/${id}`, data);
  }

  srvEliminar(id:number|string) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/IngresoRollos_Extrusion/${id}`);
  }

  srvGuardar(data : modelIngRollo_Extrusion): Observable<any> {
   return this.http.post(this.rutaPlasticaribeAPI + '/IngresoRollos_Extrusion', data);
  }

}
