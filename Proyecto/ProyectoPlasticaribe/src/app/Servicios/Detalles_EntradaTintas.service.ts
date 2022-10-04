import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { Observable } from 'rxjs';
import { AppComponent} from 'src/app/app.component';
import { rutaPlasticaribeAPI, rutaPlasticaribeAPIPrueba } from 'src/polyfills';
import { modelDetallesEntradaTintas } from '../Modelo/modelDetallesEntradaTintas';


@Injectable({
  providedIn: 'root'
})
export class Detalles_EntradaTintasService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient,
    @Inject(SESSION_STORAGE) private storage: WebStorageService) {

    // if (this.storage.get('BD') == 1) this.rutaPlasticaribeAPI = rutaPlasticaribeAPI;
    // else if (this.storage.get('BD') == 2) this.rutaPlasticaribeAPI = rutaPlasticaribeAPIPrueba;
  }

  //
  srvObtenerLista():Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/Detalles_EntradaTintas');
  }

  srvObtenerListaPorId(id : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Detalles_EntradaTintas/${id}`);
  }

  srvObtenerListaPorFecha(fecha : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Detalles_EntradaTintas/consultarPorFecha/${fecha}`);
  }

  srvObtenerListaPorFechas(fecha1 : any, fecha2 : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Detalles_EntradaTintas/consultarPorFechas/${fecha1}/${fecha2}`);
  }

  //
  srvActualizar(id:number|String, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/Detalles_EntradaTintas/${id}`, data);
  }

  //
  srvEliminar(id:number|String) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/Detalles_EntradaTintas/${id}`);
  }

  //
  srvGuardar(data : modelDetallesEntradaTintas): Observable<any> {
    return this.http.post(this.rutaPlasticaribeAPI + '/Detalles_EntradaTintas', data)
  }
}
