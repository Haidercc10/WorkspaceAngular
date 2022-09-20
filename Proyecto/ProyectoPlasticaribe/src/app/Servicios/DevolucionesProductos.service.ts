import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI } from 'src/polyfills';
import { modelDevolucionProductos } from '../Modelo/modelDevolucionProductos';
import { modelDtProductoDevuelto } from '../Modelo/modelDtProductoDevuelto';

@Injectable({
  providedIn: 'root'
})
export class DevolucionesProductosService {

  readonly rutaPlasticaribeAPI =  rutaPlasticaribeAPI; /*"https://localhost:7137/api"*/;

  //Encapsular httpclient en el constructor
  constructor(private http: HttpClient) { }

  srvObtenerLista() {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/');
  }

  srvObtenerListaPorId(dato : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `//${dato}`);
  }

  srvActualizar(id:number|string, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `//${id}`, data);
  }

  srvEliminar(id:number|string) {
    return this.http.delete(this.rutaPlasticaribeAPI + `//${id}`);
  }

  srvGuardar(data : modelDevolucionProductos): Observable<any> {
   return this.http.post(this.rutaPlasticaribeAPI + '/', data);
  }

}
