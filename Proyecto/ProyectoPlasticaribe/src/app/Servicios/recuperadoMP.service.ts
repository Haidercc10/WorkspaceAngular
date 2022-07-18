import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribe3, rutaPlasticaribeAPI } from 'src/polyfills';
import { modelRecuperadoMP } from '../Modelo/modelRecuperadoMP';

@Injectable({
  providedIn: 'root'
})
export class RecuperadoMPService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
    constructor(private http : HttpClient) { }

  //Metodo buscar lista de proveedor
    srvObtenerLista():Observable<any[]> {
        return this.http.get<any>(this.rutaPlasticaribeAPI + '/DetalleRecuperado_MateriaPrima')
    }

    srvObtenerListaPorId(id : any){
      return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleRecuperado_MateriaPrima/${id}`);
    }

    srvObtenerListaPorMatPriId(id : any){
      return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleRecuperado_MateriaPrima/materiaPrima/${id}`);
    }

    srvObtenerListaPorRecuperadoId(id : any){
      return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleRecuperado_MateriaPrima/recuperado/${id}`);
    }

  //Metodo agregar proveedor
    srvAgregar(data:any) {
      return this.http.post(this.rutaPlasticaribeAPI + '/DetalleRecuperado_MateriaPrima', data)
    }

  //Metodo actualzar proveedor
    srvActualizar(id:number|String, data:any) {
      return this.http.put(this.rutaPlasticaribeAPI + `/DetalleRecuperado_MateriaPrima/${id}`, data);
    }

  //Metodo eliminar proveedor
    srvEliminar(id:number|String) {
      return this.http.delete(this.rutaPlasticaribeAPI + `/DetalleRecuperado_MateriaPrima/${id}`);
    }

    //Metodo Guardar proveedor con un modelo
    srvGuardar(data : modelRecuperadoMP): Observable<any> {
     return this.http.post(this.rutaPlasticaribeAPI + '/DetalleRecuperado_MateriaPrima', data);
   }

}
