import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { Observable } from 'rxjs';
import { AppComponent} from 'src/app/app.component';
import { modelDevolucionProductos } from '../Modelo/modelDevolucionProductos';
import { rutaPlasticaribeAPI, rutaPlasticaribeAPIPrueba } from 'src/polyfills';
import { modelDtProductoDevuelto } from '../Modelo/modelDtProductoDevuelto';

@Injectable({
  providedIn: 'root'
})
export class DevolucionesProductosService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient,
    @Inject(SESSION_STORAGE) private storage: WebStorageService) {

    // if (this.storage.get('BD') == 1) this.rutaPlasticaribeAPI = rutaPlasticaribeAPI;
    // else if (this.storage.get('BD') == 2) this.rutaPlasticaribeAPI = rutaPlasticaribeAPIPrueba;
  }

  srvObtenerLista() {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/Devolucion_ProductoFacturado');
  }

  srvObteneUltimoId() {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/Devolucion_ProductoFacturado/UltimoId');
  }

  srvObtenerListaPorId(dato : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Devolucion_ProductoFacturado/${dato}`);
  }

  srvActualizar(id:number|string, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/Devolucion_ProductoFacturado/${id}`, data);
  }

  srvEliminar(id:number|string) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/Devolucion_ProductoFacturado/${id}`);
  }

  srvGuardar(data : modelDevolucionProductos): Observable<any> {
   return this.http.post(this.rutaPlasticaribeAPI + '/Devolucion_ProductoFacturado', data);
  }

}
