import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { Observable } from 'rxjs';
import { AppComponent} from 'src/app/app.component';
import { rutaPlasticaribeAPI,  } from 'src/polyfills';
import { modelDtPreEntregaRollos } from '../Modelo/modelDtPreEntregaRollo';

@Injectable({
  providedIn: 'root'
})
export class DtPreEntregaRollosService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient,
    @Inject(SESSION_STORAGE) private storage: WebStorageService) {

    // if (this.storage.get('BD') == 1) this.rutaPlasticaribeAPI = rutaPlasticaribeAPI;
    // else if (this.storage.get('BD') == 2) this.rutaPlasticaribeAPI = ;
  }

  srvObtenerLista() {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/DetallePreEntrega_RolloDespacho');
  }


  srvCrearPDFUltimoId(id : number) {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetallePreEntrega_RolloDespacho/CrearPDFUltimoID/${id}`);
  }

  srvObtenerVerificarRollo(dato : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetallePreEntrega_RolloDespacho/VerificarRollo/${dato}`);
  }

  srvObtenerListaPorId(dato : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetallePreEntrega_RolloDespacho/${dato}`);
  }

  srvActualizar(id:number|string, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/DetallePreEntrega_RolloDespacho/${id}`, data);
  }

  srvEliminar(id:number|string) {
    return this.http.delete(this.rutaPlasticaribeAPI + `DetallePreEntrega_RolloDespacho//${id}`);
  }

  srvGuardar(data : modelDtPreEntregaRollos): Observable<any> {
   return this.http.post(this.rutaPlasticaribeAPI + '/DetallePreEntrega_RolloDespacho', data);
  }

}
