import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { Observable } from 'rxjs';
import { AppComponent} from 'src/app/app.component';
import { modelLaminadoCapas } from '../../Modelo/modelLaminadoCapas';
import { rutaPlasticaribeAPI,  } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})
export class Laminado_CapaService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient,
    @Inject(SESSION_STORAGE) private storage: WebStorageService) {

    // if (this.storage.get('BD') == 1) this.rutaPlasticaribeAPI = rutaPlasticaribeAPI;
    // else if (this.storage.get('BD') == 2) this.rutaPlasticaribeAPI = ;
  }


  srvObtenerLista() {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/Laminado_Capa');
  }

  srvObtenerListaPorId(dato : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Laminado_Capa/${dato}`);
  }

  srvObtenerListaPorConsultaLaminado(c1 : string, c2 : string, c3 : string){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Laminado_Capa/consultaLaminado/${c1}/${c2}/${c3}`);
  }

  srvActualizar(id:number|string, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/Laminado_Capa/${id}`, data);
  }

  srvEliminar(id:number|string) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/Laminado_Capa/${id}`);
  }

  srvGuardar(data : modelLaminadoCapas): Observable<any> {
   return this.http.post(this.rutaPlasticaribeAPI + '/Laminado_Capa', data);
  }

}
