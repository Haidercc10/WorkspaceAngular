import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribe3 } from 'src/polyfills';
import { modelDetallesAsignacionBopp } from '../Modelo/modelDetallesAsignacionBopp';

@Injectable( { providedIn: 'root' } )

export class DetalleAsignacion_BOPPService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribe3;

  constructor(private http : HttpClient) { }

  //Metodo buscar lista
  srvObtenerLista():Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/DetalleAsignacion_BOPP')
  }

  srvObtenerListaPorId(id : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleAsignacion_BOPP/${id}`)
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

  srvGuardar(data: modelDetallesAsignacionBopp): Observable<any> {
  return this.http.post(this.rutaPlasticaribeAPI + '/DetalleAsignacion_BOPP', data)
  }

}
