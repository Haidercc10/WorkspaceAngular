import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI } from 'src/polyfills';
import { modelOpedido } from '../Modelo/modelOpedido';


@Injectable({
  providedIn: 'root'
})
export class OpedidoService {

  //Ruta del API
  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

//Encapsular httpclient en el constructor
  constructor(private httpOpedido : HttpClient) {


  }
//Metodo buscar lista de Opedido
  srvObtenerListaOpedido():Observable<any[]> {
      return this.httpOpedido.get<any>(this.rutaPlasticaribeAPI + '/Opedido')
  }
//Metodo agregar Opedido
  srvAgregarOpedido(data:any) {
    return this.httpOpedido.post(this.rutaPlasticaribeAPI + '/Opedido', data)
  }
//Metodo actualzar Opedido
  srvActualizarOpedido(id:number|String, data:any) {
    return this.httpOpedido.put(this.rutaPlasticaribeAPI + `/Opedido/${id}`, data);
  }
//Metodo eliminar Opedido
  srvEliminarOpedido(id:number|String) {
    return this.httpOpedido.delete(this.rutaPlasticaribeAPI + `/Opedido/${id}`);
  }

  srvGuardarOpedido(data : modelOpedido): Observable<any> {
   return this.httpOpedido.post(this.rutaPlasticaribeAPI + '/Opedido', data)
 }

}
