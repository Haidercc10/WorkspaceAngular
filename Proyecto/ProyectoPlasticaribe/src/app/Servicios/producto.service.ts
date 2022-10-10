import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { Observable } from 'rxjs';
import { AppComponent} from 'src/app/app.component';
import { modelProducto } from '../Modelo/modelProducto';
import { rutaPlasticaribeAPI,  } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient,
    @Inject(SESSION_STORAGE) private storage: WebStorageService) {

    // if (this.storage.get('BD') == 1) this.rutaPlasticaribeAPI = rutaPlasticaribeAPI;
    // else if (this.storage.get('BD') == 2) this.rutaPlasticaribeAPI = ;
  }

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
