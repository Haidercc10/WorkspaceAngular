import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI, } from 'src/polyfills';
import { modelOT_Impresion } from '../../Modelo/modelOT_Impresion';

@Injectable({
  providedIn: 'root'
})
export class OT_ImpresionService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient,) { }

  srvObtenerListaOrden_Trabajo() {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/OT_Impresion');
  }

  srvObtenerListaPorId(dato : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/OT_Impresion/${dato}`);
  }

  GetOT_Impresion(ot : number) {
    return this.http.get<any>(rutaPlasticaribeAPI + `/OT_Impresion/getOT_Impresion/${ot}`);
  }

  //Metodo actualzar
  srvActualizar(id:number|string, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/OT_Impresion/${id}`, data);
  }
  //Metodo eliminar
  srvEliminar(id:number|string) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/OT_Impresion/${id}`);
  }

  srvGuardar(data : modelOT_Impresion): Observable<any> {
   return this.http.post(this.rutaPlasticaribeAPI + '/OT_Impresion', data);
  }

}
