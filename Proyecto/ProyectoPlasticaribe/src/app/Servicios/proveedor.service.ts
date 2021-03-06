import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribe, rutaPlasticaribe3, rutaPlasticaribeAPI } from 'src/polyfills';
import { modelProveedor } from '../Modelo/modelProveedor';

@Injectable({
  providedIn: 'root'
})
export class ProveedorService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
    constructor(private http : HttpClient) { }

  //Metodo buscar lista de proveedor
    srvObtenerLista():Observable<any[]> {
        return this.http.get<any>(this.rutaPlasticaribeAPI + '/Proveedor')
    }

    srvObtenerListaPorId(id : any){
      return this.http.get<any>(this.rutaPlasticaribeAPI + `/Proveedor/${id}`);
    }

  //Metodo agregar proveedor
    srvAgregar(data:any) {
      return this.http.post(this.rutaPlasticaribeAPI + '/Proveedor', data)
    }

  //Metodo actualzar proveedor
    srvActualizar(id:number|String, data:any) {
      return this.http.put(this.rutaPlasticaribeAPI + `/Proveedor/${id}`, data);
    }

  //Metodo eliminar proveedor
    srvEliminar(id:number|String) {
      return this.http.delete(this.rutaPlasticaribeAPI + `/Proveedor/${id}`);
    }

    //Metodo Guardar proveedor con un modelo
    srvGuardar(data : modelProveedor): Observable<any> {
     return this.http.post(this.rutaPlasticaribeAPI + '/Proveedor', data);
   }

}
