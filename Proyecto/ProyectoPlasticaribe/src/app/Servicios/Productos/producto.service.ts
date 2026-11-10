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

  srvObtenerListaPorId = (id : any):Observable<any> => this.http.get<any>(this.rutaPlasticaribeAPI + `/Producto/${id}`);

  obtenerItemsLike = (letras : any): Observable<any> => this.http.get<any>(this.rutaPlasticaribeAPI + `/Producto/consultaNombreItem/${letras}`);

  srvObtenerListaPorIdProducto = (id : any):Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + `/Producto/IdProducto/${id}`);

  obtenerNombreProductos = (idProducto : any): Observable<any> => this.http.get<any>(this.rutaPlasticaribeAPI + `/Producto/consultaNombreProducto/${idProducto}`);

  GetIdUltimoProducto = () => this.http.get<any>(this.rutaPlasticaribeAPI + `/Producto/getIdUltimoProducto`);

  GetInfoProducto_Prod_Presentacion = (id : number, presentacion : string) : Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + `/Producto/getInfoProducto_Prod_Presentacion/${id}/${presentacion}`);

  GetProductsByName = (name : string) : Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Producto/getProductsByName/${name}`);

  GetProductsById = (id : number) : Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Producto/getProductsById/${id}`);

  srvActualizar = (id:any, datos_Productos:any) => this.http.put(this.rutaPlasticaribeAPI + `/Producto/${id}`, datos_Productos);

  PutEstadoProducto = (id: number, datos_Productos:any) => this.http.put(this.rutaPlasticaribeAPI + `/Producto/putEstadoProducto/${id}`, datos_Productos);

  srvGuardar = (data : modelProducto): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/Producto', data);

  /** PDF del arte del item (carpeta de artes de Aseguramiento de la Calidad, `{prodId}.pdf`); 404 si no tiene. */
  GetArteItem = (prodId : number) : Observable<Blob> => this.http.get(`${this.rutaPlasticaribeAPI}/Producto/arte/${prodId}`, { responseType: 'blob' });

  /** Historial de nombres (referencia) del producto, cambiados al crear o editar OT; del más reciente al más antiguo. */
  GetHistorialNombres = (prodId : number) : Observable<HistorialNombreProducto[]> => this.http.get<HistorialNombreProducto[]>(`${this.rutaPlasticaribeAPI}/Producto/historialNombres/${prodId}`);
}

/** Un cambio de nombre de un producto (GET Producto/historialNombres/{prodId}). */
export interface HistorialNombreProducto {
  fecha: string;
  nombreAnterior: string;
  nombreNuevo: string;
  numero_OT: number;
  /** "Creación" o "Edición" de la OT. */
  origen: string;
  usuario: string;
}
