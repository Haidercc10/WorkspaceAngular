import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI, } from 'src/polyfills';
import { modelProducto } from '../../Modelo/modelProducto';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {

  constructor(private http : HttpClient,) { }

  srvObtenerListaPorId = (id : any):Observable<any[]> => this.http.get<any>(rutaPlasticaribeAPI + `/Producto/${id}`);

  srvObtenerListaPorIdProducto = (id : any):Observable<any[]> => this.http.get<any>(rutaPlasticaribeAPI + `/Producto/IdProducto/${id}`);

  GetIdUltimoProducto = () => this.http.get<any>(rutaPlasticaribeAPI + `/Producto/getIdUltimoProducto`);

  srvActualizar = (id:any, datos_Productos:any) => this.http.put(rutaPlasticaribeAPI + `/Producto/${id}`, datos_Productos);

  PutEstadoProducto = (id: number, datos_Productos:any) => this.http.put(rutaPlasticaribeAPI + `/Producto/putEstadoProducto/${id}`, datos_Productos);

  srvGuardar = (data : modelProducto): Observable<any> => this.http.post(rutaPlasticaribeAPI + '/Producto', data);

  obtenerNombreProductos = (idProducto : any): Observable<any> => this.http.get<any>(rutaPlasticaribeAPI + `/Producto/consultaNombreProducto/${idProducto}`);

  obtenerItemsLike = (letras : any): Observable<any> => this.http.get<any>(rutaPlasticaribeAPI + `/Producto/consultaNombreItem/${letras}`);

  GetInfoProducto_Prod_Presentacion = (id : number, presentacion : string) : Observable<any[]> => this.http.get<any>(rutaPlasticaribeAPI + `/Producto/getInfoProducto_Prod_Presentacion/${id}/${presentacion}`);
}
