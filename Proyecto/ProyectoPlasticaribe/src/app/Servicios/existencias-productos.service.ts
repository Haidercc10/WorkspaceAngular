import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI } from 'src/polyfills';
import { modelExistenciaProductos } from '../Modelo/modelExisteciaProductos';

@Injectable({
  providedIn: 'root'
})
export class ExistenciasProductosService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  constructor(private http : HttpClient) { }

  //Metodo buscar lista
  srvObtenerLista():Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/Existencia_Productos')
  }

  srvObtenerListaPorId(id : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Existencia_Productos/${id}`)
  }

  srvObtenerListaPorIdProducto(id : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Existencia_Productos/IdProducto/${id}`)
  }

  srvObtenerListaPorIdProducto2(id : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Existencia_Productos/IdProductoPBDDXCodigoArticuloZeus/${id}`)
  }

  srvObtenerListaPorIdProductoPresentacion(id : any, presentacion : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Existencia_Productos/IdProductoPresentacion/${id}/${presentacion}`)
  }

  //Metodo agregar
  srvAgregar(datos_Productos:any) {
    return this.http.post(this.rutaPlasticaribeAPI + '/Existencia_Productos', datos_Productos)
  }

  //Metodo actualzar
  srvActualizar(id:number|String, datos_Productos:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/Existencia_Productos/${id}`, datos_Productos);
  }

  //Metodo actualzar segun el producto y su presentacion
  srvActualizarProductoPresentacion(prod : any, presentacion : any, datos_Productos:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/Existencia_Productos/ActualizacionProducto/${prod}/${presentacion}`, datos_Productos);
  }

  //Metodo actualzar segun el producto y su presentacion
  srvActualizarExistencia(id : any, datos_Productos:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/Existencia_Productos/ActualizacionExistencia/${id}`, datos_Productos);
  }

  srvActualizarExistenciaCantidadMinima(id : any, datos_Productos:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/Existencia_Productos/ActualizacionCantMinima/${id}`, datos_Productos);
  }

  //Metodo eliminar
  srvEliminar(id:number|String) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/Existencia_Productos/${id}`);
  }

  //
  srvGuardar(data : modelExistenciaProductos): Observable<any> {
    return this.http.post(this.rutaPlasticaribeAPI + '/Existencia_Productos', data)
  }

  srvObtenerInventarioExistencias(): Observable<any> {
    return this.http.get(this.rutaPlasticaribeAPI + '/Existencia_Productos/InventarioProductos');
  }
}
