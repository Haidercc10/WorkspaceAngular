import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI } from 'src/polyfills';
import { modelBoppGenerico } from '../Modelo/modelBoppGenerico';

@Injectable({
  providedIn: 'root'
})
export class BoppGenericoService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient,
                @Inject(SESSION_STORAGE) private storage: WebStorageService) {

    // if (this.storage.get('BD') == 1) this.rutaPlasticaribeAPI = rutaPlasticaribeAPI;
    // else if (this.storage.get('BD') == 2) this.rutaPlasticaribeAPI = ;
  }

  srvObtenerLista() {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/Bopp_Generico');
  }
  srvObtenerListaPorId(dato : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Bopp_Generico/${dato}`);
  }

  obtenerUltimoId(){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Bopp_Generico/`);
  }

  srvActualizar(id:number|string, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/Bopp_Generico/${id}`, data);
  }

  srvEliminar(id:number|string) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/Bopp_Generico/${id}`);
  }

  srvGuardar(data : modelBoppGenerico): Observable<any> {
   return this.http.post(this.rutaPlasticaribeAPI + '/Bopp_Generico', data);
  }

}
