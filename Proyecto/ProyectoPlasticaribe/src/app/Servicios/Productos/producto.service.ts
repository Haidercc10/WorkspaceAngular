import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI, } from 'src/polyfills';
import { modelProducto } from '../../Modelo/modelProducto';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient,) { }

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

  obtenerProductos(): Observable<any> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Producto/consultaGeneral`)
  }

  GetIdUltimoProducto(){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Producto/getIdUltimoProducto`);
  }

  //Metodo agregar Productos
  srvAgregar(datos_Productos:any) {
    return this.http.post(this.rutaPlasticaribeAPI + '/Producto', datos_Productos)
  }

  //Metodo actualzar Productos
  srvActualizar(id:any, datos_Productos:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/Producto/${id}`, datos_Productos);
  }

  //Metodo actualzar Productos
  PutEstadoProducto(id: number, datos_Productos:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/Producto/putEstadoProducto/${id}`, datos_Productos);
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
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Producto/ConsultaProductoExistencia/${id}`);
  }

  obtenerNombreProductos(idProducto : any): Observable<any> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Producto/consultaNombreProducto/${idProducto}`);
  }

  obtenerItemsLike(letras : any): Observable<any> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Producto/consultaNombreItem/${letras}`);
  }

  GetInfoProducto_Prod_Presentacion(id : number, presentacion : string) : Observable<any[]> {
    return this.http.get<any>(rutaPlasticaribeAPI + `/Producto/getInfoProducto_Prod_Presentacion/${id}/${presentacion}`);
  }
}
