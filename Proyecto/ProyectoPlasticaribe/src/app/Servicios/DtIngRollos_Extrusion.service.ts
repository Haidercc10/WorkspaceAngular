import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI } from 'src/polyfills';
import { modelDtIngRollo_Extrusion } from '../Modelo/modelDtIngRollo_Extrusion';

@Injectable({
  providedIn: 'root'
})
export class DtIngRollos_ExtrusionService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient,
    @Inject(SESSION_STORAGE) private storage: WebStorageService) {

    // if (this.storage.get('BD') == 1) this.rutaPlasticaribeAPI = rutaPlasticaribeAPI;
    // else if (this.storage.get('BD') == 2) this.rutaPlasticaribeAPI = ;
  }

  srvObtenerLista() {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/DetallesIngRollos_Extrusion');
  }
  srvObtenerListaPorId(dato : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetallesIngRollos_Extrusion/${dato}`);
  }

  consultarRollos(){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetallesIngRollos_Extrusion/consultaRollos`);
  }

  srvActualizar(id:number|string, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/DetallesIngRollos_Extrusion/${id}`, data);
  }

  srvEliminar(id:number|string) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/DetallesIngRollos_Extrusion/${id}`);
  }

  srvGuardar(data : modelDtIngRollo_Extrusion): Observable<any> {
   return this.http.post(this.rutaPlasticaribeAPI + '/DetallesIngRollos_Extrusion', data);
  }

}
