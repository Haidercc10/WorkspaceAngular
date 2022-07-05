import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribe3, rutaPlasticaribeAPI } from 'src/polyfills';
import { modelRemision } from '../Modelo/modelRemision';

@Injectable({
  providedIn: 'root'
})
export class RemisionService {


  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
    constructor(private http : HttpClient) { }

  //Metodo buscar lista de proveedor
    srvObtenerLista():Observable<any[]> {
        return this.http.get<any>(this.rutaPlasticaribeAPI + '/Remision')
    }

    srvObtenerListaPorId(id : any){
      return this.http.get<any>(this.rutaPlasticaribeAPI + `/Remision/${id}`);
    }

  //Metodo agregar proveedor
    srvAgregar(data:any) {
      return this.http.post(this.rutaPlasticaribeAPI + '/Remision', data)
    }

  //Metodo actualzar proveedor
    srvActualizar(id:number|String, data:any) {
      return this.http.put(this.rutaPlasticaribeAPI + `/Remision/${id}`, data);
    }

  //Metodo eliminar proveedor
    srvEliminar(id:number|String) {
      return this.http.delete(this.rutaPlasticaribeAPI + `/Remision/${id}`);
    }

    //Metodo Guardar proveedor con un modelo
    srvGuardar(data : modelRemision): Observable<any> {
     return this.http.post(this.rutaPlasticaribeAPI + '/Remision', data);
   }


}
