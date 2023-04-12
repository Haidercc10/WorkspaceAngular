import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI, } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})
export class AsignacionMPxTintasService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient,) { }


  //Metodo buscar lista de Productos
  srvObtenerLista():Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/Asignacion_MatPrimaXTinta');
  }

  srvObtenerUltimaAsignacion(){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Asignacion_MatPrimaXTinta/ultimoId`);
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
  srvGuardar(data : any /*modelAsignacionMPxTintas*/): Observable<any> {
    return this.http.post(this.rutaPlasticaribeAPI + '/Asignacion_MatPrimaXTinta', data)
  }

  /** Obtener lista de tintas y materias primas juntas */
  srvObtenerListaMatPrimas():Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/Asignacion_MatPrimaXTinta/CargarTintas_MatPrimas/');
  }


  srvObtenerListaMatPrimasPorId(ID : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Asignacion_MatPrimaXTinta/CargarMatPrimasXId/${ID}`);
  }

}
