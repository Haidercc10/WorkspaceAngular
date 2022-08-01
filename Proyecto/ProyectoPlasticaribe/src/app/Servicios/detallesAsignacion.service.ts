import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribe3, rutaPlasticaribeAPI } from 'src/polyfills';
import { modelDetallesAsignacion } from '../Modelo/modelDetallesAsignacion';

@Injectable({
  providedIn: 'root'
})
export class DetallesAsignacionService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
    constructor(private http : HttpClient) { }

  //Metodo buscar lista de
    srvObtenerLista():Observable<any[]> {
        return this.http.get<any>(this.rutaPlasticaribeAPI + '/DetalleAsignacion_MateriaPrima')
    }

    srvObtenerListaPorId(asignacion : any, materiaPrima : any){
      return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleAsignacion_MateriaPrima/ ?AsigMp_Id=${asignacion}&MatPri_Id=${materiaPrima}`);
    }

    srvObtenerListaPorAsigId(asignacion : any){
      return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleAsignacion_MateriaPrima/asignacion/${asignacion}`);
    }

    srvObtenerListaPorMatPriId(materiaPrima : any){
      return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleAsignacion_MateriaPrima/matPri/${materiaPrima}`);
    }

    srvObtenerListaPorOT(ot : any){
      return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleAsignacion_MateriaPrima/AsignacionesAgrupadas/${ot}`);
    }

    srvObtenerListaPorOT2(ot : any){
      return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleAsignacion_MateriaPrima/AsignacionesAgrupadasXvalores/${ot}`);
    }

    srvObtenerListaPorEstadoOT(estado : any){
      return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleAsignacion_MateriaPrima/estadoOT/${estado}`);
    }


  //Metodo agregar
    srvAgregar(data:any) {
      return this.http.post(this.rutaPlasticaribeAPI + '/DetalleAsignacion_MateriaPrima', data)
    }

  //Metodo actualzar
    srvActualizar(asignacion : any, materiaPrima : any | String, data:any) {
      return this.http.put(this.rutaPlasticaribeAPI + `/DetalleAsignacion_MateriaPrima/ ?AsigMp_Id=${asignacion}&MatPri_Id=${materiaPrima}`, data);
    }

  //Metodo eliminar
    srvEliminar(id:number|String) {
      return this.http.delete(this.rutaPlasticaribeAPI + `/DetalleAsignacion_MateriaPrima/${id}`);
    }

    //Duardar
    srvGuardar(data : modelDetallesAsignacion): Observable<any> {
     return this.http.post(this.rutaPlasticaribeAPI + '/DetalleAsignacion_MateriaPrima', data);
   }

}
