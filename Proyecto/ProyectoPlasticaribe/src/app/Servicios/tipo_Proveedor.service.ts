import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribe3, rutaPlasticaribeAPI } from 'src/polyfills';
import { modelTipoProveedor } from '../Modelo/modelTipoProveedor';

@Injectable({
  providedIn: 'root'
})
export class Tipo_ProveedorService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
    constructor(private http : HttpClient) { }

  //Metodo buscar lista de proveedor
    srvObtenerLista():Observable<any[]> {
        return this.http.get<any>(this.rutaPlasticaribeAPI + '/Tipo_Proveedor')
    }

  //Metodo agregar proveedor
    srvAgregar(data:any) {
      return this.http.post(this.rutaPlasticaribeAPI + '/Tipo_Proveedor', data)
    }

  //Metodo actualzar proveedor
    srvActualizar(id:number|String, data:any) {
      return this.http.put(this.rutaPlasticaribeAPI + `/Tipo_Proveedor/${id}`, data);
    }

  //Metodo eliminar proveedor
    srvEliminar(id:number|String) {
      return this.http.delete(this.rutaPlasticaribeAPI + `/Tipo_Proveedor/${id}`);
    }

    //Duardar proveedor
    srvGuardar(data : modelTipoProveedor): Observable<any> {
     return this.http.post(this.rutaPlasticaribeAPI + '/Tipo_Proveedor', data);
   }

}
