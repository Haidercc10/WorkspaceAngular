import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { Observable } from 'rxjs';
import { AppComponent} from 'src/app/app.component';
import { rutaPlasticaribeAPI,  } from 'src/polyfills';
import { modelCliente } from '../../Modelo/modelCliente';

@Injectable({
  providedIn: 'root'
})
export class ClientesService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient,
    @Inject(SESSION_STORAGE) private storage: WebStorageService) {

    // if (this.storage.get('BD') == 1) this.rutaPlasticaribeAPI = rutaPlasticaribeAPI;
    // else if (this.storage.get('BD') == 2) this.rutaPlasticaribeAPI = ;
  }

  //Metodo buscar lista de Productos
  srvObtenerLista():Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/Clientes');
  }

  srvObtenerListaPorId(id : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Clientes/${id}`);
  }

  srvObtenerListaPorEstado(id : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Clientes/estadoId/${id}`);
  }

  srvObtenerListaPorNombreCliente(nombre : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Clientes/nombreCliente/${nombre}`);
  }

  //Metodo agregar Productos
  srvAgregar(data:any) {
    return this.http.post(this.rutaPlasticaribeAPI + '/Clientes', data)
  }

  //Metodo actualzar Productos
  srvActualizar(id:number|String, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/Clientes/${id}`, data);
  }

  //Metodo actualzar Productos
  PutEstadoCliente(id:number|String, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/Clientes/putEstadoCliente/${id}`, data);
  }

  //Metodo eliminar Productos
  srvEliminar(id:number|String) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/Clientes/${id}`);
  }

  //
  srvGuardar(data : modelCliente): Observable<any> {
    return this.http.post(this.rutaPlasticaribeAPI + '/Clientes', data)
  }
}
