import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribe3, rutaPlasticaribeAPI } from 'src/polyfills';
import { modelDetallesAsignacionBopp } from '../Modelo/modelDetallesAsignacionBopp';

@Injectable( { providedIn: 'root' } )

export class DetalleAsignacion_BOPPService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  constructor(private http : HttpClient) { }

  //Metodo buscar lista
  srvObtenerLista():Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/DetalleAsignacion_BOPP')
  }

  srvObtenerListaPorId(id : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleAsignacion_BOPP/${id}`)
  }

  srvObtenerListaPorAsignacion(id : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleAsignacion_BOPP/asignacion/${id}`)
  }

  srvObtenerListaPorBOPP(id : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleAsignacion_BOPP/BOPP/${id}`)
  }

  srvObtenerListaPorOt(id : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleAsignacion_BOPP/OT/${id}`)
  }

  srvObtenerListaPorEstadoOT(id : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleAsignacion_BOPP/estadoOT/${id}`)
  }

  //Metodo agregar
  srvAgregar(data:any) {
    return this.http.post(this.rutaPlasticaribeAPI + '/DetalleAsignacion_BOPP', data)
  }
  //Metodo actualzar
  srvActualizar(id:number|String, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/DetalleAsignacion_BOPP/${id}`, data);
  }
  //Metodo eliminar
  srvEliminar(id:number|String) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/DetalleAsignacion_BOPP/${id}`);
  }

  srvEliminarPorOT(idAsg : number, ot : number){
    return this.http.delete(this.rutaPlasticaribeAPI + `/DetalleAsignacion_BOPP/EliminarXOT_AsignacionBOPP?AsigBOPP_Id=${idAsg}&DtAsigBOPP_OrdenTrabajo=${ot}`);
  }

  srvEliminarPorBOPP(idAsg : number, idbopp : number){
    return this.http.delete(this.rutaPlasticaribeAPI + `/DetalleAsignacion_BOPP/EliminarXAsignacion_BOPP?AsigBOPP_Id=${idAsg}&BOPP_Id=${idbopp}`);
  }

  srvGuardar(data: modelDetallesAsignacionBopp): Observable<any> {
  return this.http.post(this.rutaPlasticaribeAPI + '/DetalleAsignacion_BOPP', data)
  }

}
