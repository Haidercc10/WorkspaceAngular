import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelPedidomateriaprima } from '../Modelo/modelPedidomateriaprima';


@Injectable({
  providedIn: 'root'
})
export class PedidomateriaprimaService {

  //Ruta del API
  readonly rutaPlasticaribeAPI = "https://localhost:7137/api";

//Encapsular httpclient en el constructor
  constructor(private httpPedidomateriaprima : HttpClient) {


  }
//Metodo buscar lista de Pedidomateriaprima
  srvObtenerListaPedidomateriaprima():Observable<any[]> {
      return this.httpPedidomateriaprima.get<any>(this.rutaPlasticaribeAPI + '/Pedidomateriaprima')
  }
//Metodo agregar Pedidomateriaprima
  srvAgregarPedidomateriaprima(data:any) {
    return this.httpPedidomateriaprima.post(this.rutaPlasticaribeAPI + '/Pedidomateriaprimao', data)
  }
//Metodo actualzar Pedidomateriaprima
  srvActualizarPedidomateriaprima(id:number|String, data:any) {
    return this.httpPedidomateriaprima.put(this.rutaPlasticaribeAPI + `/Pedidomateriaprima/${id}`, data);
  }
//Metodo eliminar Pedidomateriaprima
  srvEliminarPedidomateriaprima(id:number|String) {
    return this.httpPedidomateriaprima.delete(this.rutaPlasticaribeAPI + `/Pedidomateriaprima/${id}`);
  }

  srvGuardarPedidomateriaprima(Pedidomateriaprima : modelPedidomateriaprima): Observable<any> {
   return this.httpPedidomateriaprima.post(this.rutaPlasticaribeAPI + '/Pedidomateriaprima', Pedidomateriaprima)
 }

}
