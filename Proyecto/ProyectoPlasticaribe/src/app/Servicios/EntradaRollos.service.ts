import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { Observable } from 'rxjs';
import { AppComponent} from 'src/app/app.component';
import { modelEntradaRollos } from '../Modelo/modelEntradaRollos';
import { rutaPlasticaribeAPI, rutaPlasticaribeAPIPrueba } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})
export class EntradaRollosService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient,
    @Inject(SESSION_STORAGE) private storage: WebStorageService) {

    // if (this.storage.get('BD') == 1) this.rutaPlasticaribeAPI = rutaPlasticaribeAPI;
    // else if (this.storage.get('BD') == 2) this.rutaPlasticaribeAPI = rutaPlasticaribeAPIPrueba;
  }

  srvObtenerLista() {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/EntradaRollo_Producto');
  }

  srvObtenerListaPorId(dato : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/EntradaRollo_Producto/${dato}`);
  }

  srvObtenerUltimoId(){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/EntradaRollo_Producto/UltumoID`);
  }

  srvActualizar(id:number|string, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/EntradaRollo_Producto/${id}`, data);
  }

  srvEliminar(id:number|string) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/EntradaRollo_Producto/${id}`);
  }

  srvGuardar(data : modelEntradaRollos): Observable<any> {
   return this.http.post(this.rutaPlasticaribeAPI + '/EntradaRollo_Producto', data);
  }
}
