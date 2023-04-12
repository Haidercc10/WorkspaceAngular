import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI, } from 'src/polyfills';
import { modelDtProductoDevuelto } from '../../Modelo/modelDtProductoDevuelto';

@Injectable({
  providedIn: 'root'
})
export class DetallesDevolucionesProductosService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient,) { }

  srvObtenerLista() {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/DetalleDevolucion_ProductoFacturado');
  }

  srvObtenerListaPorId(dato : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleDevolucion_ProductoFacturado/${dato}`);
  }

  srvObtenerListaPorRollo(dato : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleDevolucion_ProductoFacturado/consultarRollo/${dato}`);
  }

  srvObtenerCrearPDF(dato : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleDevolucion_ProductoFacturado/CrearPdf/${dato}`);
  }

  srvActualizar(id:number|string, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/DetalleDevolucion_ProductoFacturado/${id}`, data);
  }

  srvEliminar(id:number|string) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/DetalleDevolucion_ProductoFacturado/${id}`);
  }

  srvGuardar(data : modelDtProductoDevuelto): Observable<any> {
   return this.http.post(this.rutaPlasticaribeAPI + '/DetalleDevolucion_ProductoFacturado', data);
  }
}
