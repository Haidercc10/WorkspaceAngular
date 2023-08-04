import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI, } from 'src/polyfills';
import { modelExistenciaProductos } from '../../Modelo/modelExisteciaProductos';

@Injectable({
  providedIn: 'root'
})
export class ExistenciasProductosService {

  constructor(private http : HttpClient,) { }

  srvObtenerListaPorIdProducto = (id : any):Observable<any[]> => this.http.get<any>(rutaPlasticaribeAPI + `/Existencia_Productos/IdProducto/${id}`);

  srvObtenerListaPorIdProducto2 = (id : any):Observable<any[]> => this.http.get<any>(rutaPlasticaribeAPI + `/Existencia_Productos/IdProductoPBDDXCodigoArticuloZeus/${id}`);

  srvObtenerListaPorIdProductoPresentacion = (id : any, presentacion : any):Observable<any[]> => this.http.get<any>(rutaPlasticaribeAPI + `/Existencia_Productos/IdProductoPresentacion/${id}/${presentacion}`);

  IdProductoPresentacionInventario = (id : any, presentacion : any):Observable<any[]> => this.http.get<any>(rutaPlasticaribeAPI + `/Existencia_Productos/IdProductoPresentacionInventario/${id}/${presentacion}`);

  srvActualizar = (id:number|String, datos_Productos:any) => this.http.put(rutaPlasticaribeAPI + `/Existencia_Productos/${id}`, datos_Productos);

  srvActualizarProductoPresentacion = (prod : any, presentacion : any, datos_Productos:any) => this.http.put(rutaPlasticaribeAPI + `/Existencia_Productos/ActualizacionProducto/${prod}/${presentacion}`, datos_Productos);

  srvActualizarExistenciaCantidadMinima = (id : any, datos_Productos:any) => this.http.put(rutaPlasticaribeAPI + `/Existencia_Productos/ActualizacionCantMinima/${id}`, datos_Productos);;

  srvGuardar = (data : modelExistenciaProductos): Observable<any> => this.http.post(rutaPlasticaribeAPI + '/Existencia_Productos', data);

  srvObtenerInventarioExistencias = (): Observable<any> => this.http.get(rutaPlasticaribeAPI + '/Existencia_Productos/InventarioProductos');
}
