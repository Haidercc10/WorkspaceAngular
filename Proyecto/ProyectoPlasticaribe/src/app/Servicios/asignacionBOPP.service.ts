import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribe3 } from 'src/polyfills';
import { modelAsignacionBOPP } from '../Modelo/modelAsignacionBOPP';

@Injectable( { providedIn: 'root' } )

export class AsignacionBOPPService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribe3;

  constructor(private http : HttpClient) { }

  //Metodo buscar lista
  srvObtenerLista():Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/Asignacion_BOPP')
  }

  srvObtenerListaPorId(id : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Asignacion_BOPP/${id}`)
  }

  //Metodo agregar
  srvAgregar(data:any) {
    return this.http.post(this.rutaPlasticaribeAPI + '/Asignacion_BOPP', data)
  }
  //Metodo actualzar
  srvActualizar(id:number|String, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/Asignacion_BOPP/${id}`, data);
  }
  //Metodo eliminar
  srvEliminar(id:number|String) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/Asignacion_BOPP/${id}`);
  }

  srvGuardar(data: modelAsignacionBOPP): Observable<any> {
  return this.http.post(this.rutaPlasticaribeAPI + '/Asignacion_BOPP', data)
  }

}
