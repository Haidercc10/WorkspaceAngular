import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribe3, rutaPlasticaribeAPI } from 'src/polyfills';
import { modelDetallesAsignacionTintas } from '../Modelo/modelDetallesAsignacionTintas';

@Injectable({
  providedIn: 'root'
})
export class DetallesAsignacionTintasService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  constructor(private http : HttpClient) { }

  //Metodo buscar lista de Productos
  srvObtenerLista():Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/DetalleAsignacion_Tinta');
  }

  srvObtenerListaPorId(id : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleAsignacion_Tinta/${id}`);
  }

  srvObtenerListaPor_Asignacion(id : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleAsignacion_Tinta/aisgnacion/${id}`);
  }

  //Metodo agregar Productos
  srvAgregar(data : any) {
    return this.http.post(this.rutaPlasticaribeAPI + '/DetalleAsignacion_Tinta', data)
  }

  //Metodo actualzar Productos
  srvActualizar(id:number|String, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/DetalleAsignacion_Tinta/${id}`, data);
  }

  //Metodo eliminar Productos
  srvEliminar(id:number|String) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/DetalleAsignacion_Tinta/${id}`);
  }

  //
  srvGuardar(data : modelDetallesAsignacionTintas): Observable<any> {
    return this.http.post(this.rutaPlasticaribeAPI + '/DetalleAsignacion_Tinta', data)
  }

}
