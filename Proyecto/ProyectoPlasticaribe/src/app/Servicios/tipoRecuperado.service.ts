import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribe3, rutaPlasticaribeAPI } from 'src/polyfills';
import { modelTpRecuperado } from '../Modelo/modelTpRecuperado';

@Injectable({
  providedIn: 'root'
})
export class TipoRecuperadoService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
    constructor(private http : HttpClient) { }

  //Metodo buscar lista de proveedor
    srvObtenerLista():Observable<any[]> {
        return this.http.get<any>(this.rutaPlasticaribeAPI + '/Tipo_Recuperado')
    }

    srvObtenerListaPorId(id : any){
      return this.http.get<any>(this.rutaPlasticaribeAPI + `/Tipo_Recuperado/${id}`);
    }

  //Metodo agregar proveedor
    srvAgregar(data:any) {
      return this.http.post(this.rutaPlasticaribeAPI + '/Tipo_Recuperado', data)
    }

  //Metodo actualzar proveedor
    srvActualizar(id:number|String, data:any) {
      return this.http.put(this.rutaPlasticaribeAPI + `/Tipo_Recuperado/${id}`, data);
    }

  //Metodo eliminar proveedor
    srvEliminar(id:number|String) {
      return this.http.delete(this.rutaPlasticaribeAPI + `/Tipo_Recuperado/${id}`);
    }

    //Metodo Guardar proveedor con un modelo
    srvGuardar(data : modelTpRecuperado): Observable<any> {
     return this.http.post(this.rutaPlasticaribeAPI + '/Tipo_Recuperado', data);
   }

}
