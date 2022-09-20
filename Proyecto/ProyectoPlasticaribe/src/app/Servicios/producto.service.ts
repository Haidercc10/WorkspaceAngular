import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI } from 'src/polyfills';
import { modelProducto } from '../Modelo/modelProducto';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  constructor(private http : HttpClient) { }

  //Metodo buscar lista de Productos
  srvObtenerLista():Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/Producto')
  }

  srvObtenerListaPorId(id : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Producto/${id}`)
  }

  srvObtenerListaPorIdProducto(id : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Producto/IdProducto/${id}`)
  }

  //Metodo agregar Productos
  srvAgregar(datos_Productos:any) {
    return this.http.post(this.rutaPlasticaribeAPI + '/Producto', datos_Productos)
  }

  //Metodo actualzar Productos
  srvActualizar(id:any, datos_Productos:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/Producto/${id}`, datos_Productos);
  }

  //Metodo eliminar Productos
  srvEliminar(id:number|String) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/Producto/${id}`);
  }

  //
  srvGuardar(data : modelProducto): Observable<any> {
    return this.http.post(this.rutaPlasticaribeAPI + '/Producto', data)
  }

  /** Obtener Info Producto de existencias */
  srvObtenerPresentacionProducto(id : number|String):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Producto/ConsultaProductoExistencia/${id}`)
  }


}
