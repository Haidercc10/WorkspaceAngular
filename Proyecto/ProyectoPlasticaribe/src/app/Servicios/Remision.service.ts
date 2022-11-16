import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { Observable } from 'rxjs';
import { AppComponent} from 'src/app/app.component';
import { modelRemision } from '../Modelo/modelRemision';
import { rutaPlasticaribeAPI,  } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})
export class RemisionService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient,
    @Inject(SESSION_STORAGE) private storage: WebStorageService) {

    // if (this.storage.get('BD') == 1) this.rutaPlasticaribeAPI = rutaPlasticaribeAPI;
    // else if (this.storage.get('BD') == 2) this.rutaPlasticaribeAPI = ;
  }

  //Metodo buscar lista de proveedor
  srvObtenerLista():Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/Remision')
  }

  UltimoIdRemision():Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/Remision/UltimoIdRemision')
  }

  srvObtenerListaPorId(id : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Remision/${id}`);
  }

  srvObtenerListaPorProv(id : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Remision/P/${id}`);
  }

  srvObtenerListaPorFecha(id : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Remision/fecha/${id}`);
  }

  srvObtenerListaPorFechas(fecha1 : any, fecha2 : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Remision/fecha?Rem_Fecha1=${fecha1}&Rem_Fecha2=${fecha2}`);
  }

  srvObtenerListaPorcodigo(codigo : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Remision/codigo/${codigo}`);
  }

  //Metodo agregar proveedor
  srvAgregar(data:any) {
    return this.http.post(this.rutaPlasticaribeAPI + '/Remision', data)
  }

  //Metodo actualzar proveedor
  srvActualizar(id:number|String, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/Remision/${id}`, data);
  }

  //Metodo eliminar proveedor
  srvEliminar(id:number|String) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/Remision/${id}`);
  }

  //Metodo Guardar proveedor con un modelo
  srvGuardar(data : modelRemision): Observable<any> {
    return this.http.post(this.rutaPlasticaribeAPI + '/Remision', data);
  }


}
