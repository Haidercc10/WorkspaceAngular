import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI, } from 'src/polyfills';
import { modelOT_Extrusion } from '../../Modelo/modelOT_Extrusion';

@Injectable({
  providedIn: 'root'
})
export class OT_ExtrusionService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient,) { }

  srvObtenerListaOrden_Trabajo() {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/OT_Extrusion');
  }

  GetOT_Extrusion(ot : number) {
    return this.http.get<any>(rutaPlasticaribeAPI + `/OT_Extrusion/getOT_Extrusion/${ot}`);
  }

  srvObtenerListaPorId(dato : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/OT_Extrusion/${dato}`);
  }

  //Metodo actualzar
  srvActualizar(id:number|string, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/OT_Extrusion/${id}`, data);
  }
  //Metodo eliminar
  srvEliminar(id:number|string) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/OT_Extrusion/${id}`);
  }

  srvGuardar(data : modelOT_Extrusion): Observable<any> {
   return this.http.post(this.rutaPlasticaribeAPI + '/OT_Extrusion', data);
  }

}
