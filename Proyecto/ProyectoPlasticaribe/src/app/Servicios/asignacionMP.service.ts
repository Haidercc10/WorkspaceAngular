import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribe3 } from 'src/polyfills';
import { modelAsignacionMP } from '../Modelo/modelAsignacionMP';

@Injectable({
  providedIn: 'root'
})
export class AsignacionMPService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribe3;

  //Encapsular httpclient en el constructor
    constructor(private http : HttpClient) { }

  //Metodo buscar lista de
    srvObtenerLista():Observable<any[]> {
        return this.http.get<any>(this.rutaPlasticaribeAPI + '/Asignacion_MatPrima')
    }

    srvObtenerListaPorId(dato : any){
      return this.http.get<any>(this.rutaPlasticaribeAPI + `/Asignacion_MatPrima/${dato}`);
    }

  //Metodo agregar
    srvAgregar(data:any) {
      return this.http.post(this.rutaPlasticaribeAPI + '/Asignacion_MatPrima', data)
    }

  //Metodo actualzar
    srvActualizar(id:number|String, data:any) {
      return this.http.put(this.rutaPlasticaribeAPI + `/Asignacion_MatPrima/${id}`, data);
    }

  //Metodo eliminar
    srvEliminar(id:number|String) {
      return this.http.delete(this.rutaPlasticaribeAPI + `/Asignacion_MatPrima/${id}`);
    }

    //Duardar
    srvGuardar(data : modelAsignacionMP): Observable<any> {
     return this.http.post(this.rutaPlasticaribeAPI + '/Asignacion_MatPrima', data);
   }

}
