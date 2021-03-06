import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribe3, rutaPlasticaribeAPI } from 'src/polyfills';
import { modelAsignacionMPxTintas } from '../Modelo/modelAsignacionMPxTintas';

@Injectable({
  providedIn: 'root'
})
export class AsignacionMPxTintasService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  constructor(private http : HttpClient) { }

  //Metodo buscar lista de Productos
  srvObtenerLista():Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/Asignacion_MatPrimaXTinta');
  }

  srvObtenerListaPorId(id : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Asignacion_MatPrimaXTinta/${id}`);
  }

  //Metodo agregar Productos
  srvAgregar(data : any) {
    return this.http.post(this.rutaPlasticaribeAPI + '/Asignacion_MatPrimaXTinta', data)
  }

  //Metodo actualzar Productos
  srvActualizar(id:number|String, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/Asignacion_MatPrimaXTinta/${id}`, data);
  }

  //Metodo eliminar Productos
  srvEliminar(id:number|String) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/Asignacion_MatPrimaXTinta/${id}`);
  }

  //
  srvGuardar(data : modelAsignacionMPxTintas): Observable<any> {
    return this.http.post(this.rutaPlasticaribeAPI + '/Asignacion_MatPrimaXTinta', data)
  }

}
