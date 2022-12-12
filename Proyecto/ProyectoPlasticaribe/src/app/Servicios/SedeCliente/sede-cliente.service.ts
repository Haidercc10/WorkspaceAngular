import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { Observable } from 'rxjs';
import { AppComponent} from 'src/app/app.component';
import { modelSedesClientes } from '../../Modelo/modelSedesClientes';
import { rutaPlasticaribeAPI,  } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})
export class SedeClienteService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient,
    @Inject(SESSION_STORAGE) private storage: WebStorageService) {

    // if (this.storage.get('BD') == 1) this.rutaPlasticaribeAPI = rutaPlasticaribeAPI;
    // else if (this.storage.get('BD') == 2) this.rutaPlasticaribeAPI = ;
  }

  //Metodo buscar lista de Productos
  srvObtenerLista():Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/SedesClientes');
  }

  srvObtenerListaPorId(id : number){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/SedesClientes/${id}`);
  }

  srvObtenerListaPorCliente(id : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/SedesClientes/cliente/${id}`);
  }

  srvObtenerListaPorNombreCliente(nombre : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/SedesClientes/clienteNombre/${nombre}`);
  }

  srvObtenerListaPorClienteSede(cliente : any, ciudad : any, direccion : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/SedesClientes/clienteSede/${cliente}/${ciudad}/${direccion}`);
  }

  //Metodo agregar Productos
  srvAgregar(data:any) {
    return this.http.post(this.rutaPlasticaribeAPI + '/SedesClientes', data)
  }

  //Metodo actualzar Productos
  srvActualizar(id:number|String, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/SedesClientes/${id}`, data);
  }

  //Metodo eliminar Productos
  srvEliminar(id:number|String) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/SedesClientes/${id}`);
  }

  //
  srvGuardar(data : modelSedesClientes): Observable<any> {
    return this.http.post(this.rutaPlasticaribeAPI + '/SedesClientes', data)
  }
}
