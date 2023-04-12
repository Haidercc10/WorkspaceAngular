import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI, } from 'src/polyfills';
import { modelProcesos } from '../../Modelo/modelProcesos';

@Injectable({
  providedIn: 'root'
})
export class ProcesosService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient,) { }

  //Metodo buscar lista de procesos
    srvObtenerLista():Observable<any[]> {
        return this.http.get<any>(this.rutaPlasticaribeAPI + '/Proceso')
    }

    srvObtenerListaPorId(dato : any){
      return this.http.get<any>(this.rutaPlasticaribeAPI + `/Proceso/${dato}`);
    }

  //Metodo agregar procesos
    srvAgregar(data:any) {
      return this.http.post(this.rutaPlasticaribeAPI + '/Proceso', data)
    }

  //Metodo actualzar procesos
    srvActualizar(id:number|String, data:any) {
      return this.http.put(this.rutaPlasticaribeAPI + `/Proceso/${id}`, data);
    }

  //Metodo eliminar procesos
    srvEliminar(id:number|String) {
      return this.http.delete(this.rutaPlasticaribeAPI + `/Proceso/${id}`);
    }

    //Duardar procesos
    srvGuardar(data : modelProcesos): Observable<any> {
     return this.http.post(this.rutaPlasticaribeAPI + '/Proceso', data);
   }

}
