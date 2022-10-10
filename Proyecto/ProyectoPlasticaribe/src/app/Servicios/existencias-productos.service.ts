import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { Observable } from 'rxjs';
import { AppComponent} from 'src/app/app.component';
import { modelExistenciaProductos } from '../Modelo/modelExisteciaProductos';
import { rutaPlasticaribeAPI,  } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})
export class ExistenciasProductosService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient,
    @Inject(SESSION_STORAGE) private storage: WebStorageService) {

    // if (this.storage.get('BD') == 1) this.rutaPlasticaribeAPI = rutaPlasticaribeAPI;
    // else if (this.storage.get('BD') == 2) this.rutaPlasticaribeAPI = ;
  }

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
