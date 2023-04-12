import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI, } from 'src/polyfills';
import { modelTipoImpresion } from '../../Modelo/modelTipoImpresion';

@Injectable({
  providedIn: 'root'
})
export class Tipos_ImpresionService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient,) { }

  srvObtenerLista() {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/Tipos_Impresion');
  }

  srvObtenerListaPorId(dato : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Tipos_Impresion/${dato}`);
  }

  srvActualizar(id:number|string, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/Tipos_Impresion/${id}`, data);
  }

  srvEliminarPedidosProductos(id:number|string) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/Tipos_Impresion/${id}`);
  }

  srvGuardar(data : modelTipoImpresion): Observable<any> {
   return this.http.post(this.rutaPlasticaribeAPI + '/Tipos_Impresion', data);
  }

}
