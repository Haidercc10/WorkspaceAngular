import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelTipoProducto } from '../Modelo/modelTipoProducto';

@Injectable({
  providedIn: 'root'
})
export class TipoProductoService {

  readonly rutaPlasticaribeAPI = "http://192.168.0.153:9085/api";

  constructor(private http : HttpClient) { }

  //Metodo buscar lista de Productos
  srvObtenerLista():Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/Tipo_Producto')
  }

  srvObtenerListaPorId(id : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Tipo_Producto/${id}`);
  }
  //Metodo agregar Productos
  srvAgregar(data:any) {
    return this.http.post(this.rutaPlasticaribeAPI + '/Tipo_Producto', data)
  }

  //Metodo actualzar Productos
  srvActualizar(id:number|String, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/Tipo_Producto/${id}`, data);
  }

  //Metodo eliminar Productos
  srvEliminar(id:number|String) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/Tipo_Producto/${id}`);
  }

  //
  srvGuardar(data : modelTipoProducto): Observable<any> {
    return this.http.post(this.rutaPlasticaribeAPI + '/Tipo_Producto', data)
  }
}
