import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { modelExistenciaProductos } from '../../Modelo/modelExisteciaProductos';

@Injectable({
  providedIn: 'root'
})
export class ExistenciasProductosService {

  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

  constructor(private http : HttpClient,) { }

  srvObtenerListaPorIdProducto = (id : any):Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + `/Existencia_Productos/IdProducto/${id}`);

  srvObtenerListaPorIdProducto2 = (id : any):Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + `/Existencia_Productos/IdProductoPBDDXCodigoArticuloZeus/${id}`);

  srvObtenerListaPorIdProductoPresentacion = (id : any, presentacion : any):Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + `/Existencia_Productos/IdProductoPresentacion/${id}/${presentacion}`);

  IdProductoPresentacionInventario = (id : any, presentacion : any):Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + `/Existencia_Productos/IdProductoPresentacionInventario/${id}/${presentacion}`);

  GetInfoProducto = (producto : string) : Observable<any> => this.http.get<any>(this.rutaPlasticaribeAPI + `/Existencia_Productos/getInfoProducto/${producto}`);

  GetStockProducts_AvaibleProduction = (): Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Existencia_Productos/getStockProducts_AvaibleProduction`);

  GetStockProducts_Process = (process: 'EMP' | 'SELLA' | 'WIKE'): Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Existencia_Productos/getStockProducts_Process/${process}`);

  GetStockDelivered_NoAvaible = (): Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Existencia_Productos/getStockDelivered_NoAvaible`);

  srvActualizar = (id:number|String, datos_Productos:any) => this.http.put(this.rutaPlasticaribeAPI + `/Existencia_Productos/${id}`, datos_Productos);

  srvActualizarProductoPresentacion = (prod : any, presentacion : any, datos_Productos:any) => this.http.put(this.rutaPlasticaribeAPI + `/Existencia_Productos/ActualizacionProducto/${prod}/${presentacion}`, datos_Productos);

  srvActualizarExistenciaCantidadMinima = (id : any, cantMinima:any) => this.http.put(this.rutaPlasticaribeAPI + `/Existencia_Productos/ActualizacionCantMinima/${id}/${cantMinima}`, cantMinima);

  PutExistencia = (item: number, presentation: string, quantity: number, price: number) => this.http.put(this.rutaPlasticaribeAPI + `/Existencia_Productos/tutExistencia`, null);

  srvGuardar = (data : modelExistenciaProductos): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/Existencia_Productos', data);

  srvObtenerInventarioExistencias = (): Observable<any> => this.http.get(this.rutaPlasticaribeAPI + '/Existencia_Productos/InventarioProductos');
}
