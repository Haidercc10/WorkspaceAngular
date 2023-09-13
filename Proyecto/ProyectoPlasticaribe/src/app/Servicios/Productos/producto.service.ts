import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { modelProducto } from '../../Modelo/modelProducto';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {

  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

  constructor(private http : HttpClient,) { }

  srvObtenerListaPorId = (id : any):Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + `/Producto/${id}`);

  obtenerItemsLike = (letras : any): Observable<any> => this.http.get<any>(this.rutaPlasticaribeAPI + `/Producto/consultaNombreItem/${letras}`);

  srvObtenerListaPorIdProducto = (id : any):Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + `/Producto/IdProducto/${id}`);

  obtenerNombreProductos = (idProducto : any): Observable<any> => this.http.get<any>(this.rutaPlasticaribeAPI + `/Producto/consultaNombreProducto/${idProducto}`);

  GetIdUltimoProducto = () => this.http.get<any>(this.rutaPlasticaribeAPI + `/Producto/getIdUltimoProducto`);

  GetInfoProducto_Prod_Presentacion = (id : number, presentacion : string) : Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + `/Producto/getInfoProducto_Prod_Presentacion/${id}/${presentacion}`);

  srvActualizar = (id:any, datos_Productos:any) => this.http.put(this.rutaPlasticaribeAPI + `/Producto/${id}`, datos_Productos);

  PutEstadoProducto = (id: number, datos_Productos:any) => this.http.put(this.rutaPlasticaribeAPI + `/Producto/putEstadoProducto/${id}`, datos_Productos);

  srvGuardar = (data : modelProducto): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/Producto', data);
}
