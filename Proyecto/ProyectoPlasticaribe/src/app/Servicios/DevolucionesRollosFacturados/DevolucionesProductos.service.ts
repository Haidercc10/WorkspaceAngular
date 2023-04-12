import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI, } from 'src/polyfills';
import { modelDevolucionProductos } from '../../Modelo/modelDevolucionProductos';

@Injectable({
  providedIn: 'root'
})
export class DevolucionesProductosService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient,) { }

  srvObtenerLista() {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/Devolucion_ProductoFacturado');
  }

  srvObteneUltimoId() {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/Devolucion_ProductoFacturado/UltimoId');
  }

  srvObtenerListaPorId(dato : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Devolucion_ProductoFacturado/${dato}`);
  }

  srvActualizar(id:number|string, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/Devolucion_ProductoFacturado/${id}`, data);
  }

  srvEliminar(id:number|string) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/Devolucion_ProductoFacturado/${id}`);
  }

  srvGuardar(data : modelDevolucionProductos): Observable<any> {
   return this.http.post(this.rutaPlasticaribeAPI + '/Devolucion_ProductoFacturado', data);
  }

}
