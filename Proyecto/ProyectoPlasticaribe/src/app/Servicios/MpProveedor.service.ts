import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribe3 } from 'src/polyfills';
import { modelMpProveedor } from '../Modelo/modelMpProveedor';

@Injectable({
  providedIn: 'root'
})
export class MpProveedorService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribe3;

  //Encapsular httpclient en el constructor
    constructor(private http : HttpClient) { }

  //Metodo buscar lista de proveedor
    srvObtenerLista():Observable<any[]> {
        return this.http.get<any>(this.rutaPlasticaribeAPI + '/Proveedor_MateriaPrima')
    }

  //Metodo agregar proveedor
    srvAgregar(data:any) {
      return this.http.post(this.rutaPlasticaribeAPI + '/Proveedor_MateriaPrima', data)
    }

  //Metodo actualzar proveedor
    srvActualizar(id:number|String, data:any) {
      return this.http.put(this.rutaPlasticaribeAPI + `/Proveedor_MateriaPrima/${id}`, data);
    }

  //Metodo eliminar proveedor
    srvEliminar(id:number|String) {
      return this.http.delete(this.rutaPlasticaribeAPI + `/Proveedor_MateriaPrima/${id}`);
    }

    //Duardar proveedor
    srvGuardar(data : modelMpProveedor): Observable<any> {
     return this.http.post(this.rutaPlasticaribeAPI + '/Proveedor_MateriaPrima', data);
   }

}
