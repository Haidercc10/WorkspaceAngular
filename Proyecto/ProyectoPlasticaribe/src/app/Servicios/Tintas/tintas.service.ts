import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { Observable } from 'rxjs';
import { AppComponent} from 'src/app/app.component';
import { modelTintas } from '../../Modelo/modelTintas';
import { rutaPlasticaribeAPI,  } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})
export class TintasService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient,
    @Inject(SESSION_STORAGE) private storage: WebStorageService) {

    // if (this.storage.get('BD') == 1) this.rutaPlasticaribeAPI = rutaPlasticaribeAPI;
    // else if (this.storage.get('BD') == 2) this.rutaPlasticaribeAPI = ;
  }

  //Metodo buscar lista de Productos
  srvObtenerLista():Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/Tinta');
  }

  srvObtenerListaPorId(id : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Tinta/${id}`);
  }

  srvObtenerListaConsultaImpresion(t1 : string, t2 : string, t3 : string, t4 : string, t5 : string, t6 : string, t7 : string, t8 : string){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Tinta/consultaImpresion/${t1}/${t2}/${t3}/${t4}/${t5}/${t6}/${t7}/${t8}`);
  }

  //Metodo actualzar Productos
  srvActualizar(id:number|String, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/Tinta/${id}`, data);
  }

  //Metodo eliminar Productos
  srvEliminar(id:number|String) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/Tinta/${id}`);
  }

  //
  srvGuardar(data : modelTintas): Observable<any> {
    return this.http.post(this.rutaPlasticaribeAPI + '/Tinta', data)
  }

  /** Lista de tintas tipo solventes. */
  srvObtenerListaXColores():Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/Tinta/TintasColores');
  }

}
