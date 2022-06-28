import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribe3 } from 'src/polyfills';
import { modelDetallesAsignacion } from '../Modelo/modelDetallesAsignacion';

@Injectable({
  providedIn: 'root'
})
export class DetallesAsignacionService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribe3;

  //Encapsular httpclient en el constructor
    constructor(private http : HttpClient) { }

  //Metodo buscar lista de
    srvObtenerLista():Observable<any[]> {
        return this.http.get<any>(this.rutaPlasticaribeAPI + '/DetalleAsignacion_MateriaPrima')
    }

    srvObtenerListaPorId(dato : any){
      return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleAsignacion_MateriaPrima/${dato}`);
    }

  //Metodo agregar
    srvAgregar(data:any) {
      return this.http.post(this.rutaPlasticaribeAPI + '/DetalleAsignacion_MateriaPrima', data)
    }

  //Metodo actualzar
    srvActualizar(id:number|String, data:any) {
      return this.http.put(this.rutaPlasticaribeAPI + `/DetalleAsignacion_MateriaPrima/${id}`, data);
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
