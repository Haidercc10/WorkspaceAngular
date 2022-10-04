import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { Observable } from 'rxjs';
import { AppComponent} from 'src/app/app.component';
import { modelEstado } from '../Modelo/modelEstado';
import { rutaPlasticaribeAPI, rutaPlasticaribeAPIPrueba } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})
export class EstadosService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient,
    @Inject(SESSION_STORAGE) private storage: WebStorageService) {

    // if (this.storage.get('BD') == 1) this.rutaPlasticaribeAPI = rutaPlasticaribeAPI;
    // else if (this.storage.get('BD') == 2) this.rutaPlasticaribeAPI = rutaPlasticaribeAPIPrueba;
  }

//Metodo buscar lista de Usuario
  srvObtenerListaEstados() {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/Estadoes')
  }

  srvObtenerListaPorId(id : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Estadoes/${id}`)
  }

  srvObtenerListaPorNombreEstado(nombre : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Estadoes/nombreEstado/${nombre}`)
  }

//Metodo agregar Usuario
  srvAgregarEstado(data:any) {
    return this.http.post(this.rutaPlasticaribeAPI + '/Estadoes', data)
  }
//Metodo actualzar Usuario
  srvActualizarEstado(id:number|String, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/Estadoes/${id}`, data);
  }
//Metodo eliminar Usuario
  srvEliminarEstado(id:number|String) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/Estadoes/${id}`);
  }

  srvGuardar(data : modelEstado): Observable<any> {
   return this.http.post(this.rutaPlasticaribeAPI + '/Estadoes', data);
  }

  srvObtenerEstadosRollos():Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Estadoes/cargarEstadosRollos`);
  }

}


