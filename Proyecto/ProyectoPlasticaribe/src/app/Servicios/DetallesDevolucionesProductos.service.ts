import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { Observable } from 'rxjs';
import { AppComponent} from 'src/app/app.component';
import { rutaPlasticaribeAPI, rutaPlasticaribeAPIPrueba } from 'src/polyfills';
import { modelDtProductoDevuelto } from '../Modelo/modelDtProductoDevuelto';

@Injectable({
  providedIn: 'root'
})
export class DetallesDevolucionesProductosService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient,
    @Inject(SESSION_STORAGE) private storage: WebStorageService) {

    // if (this.storage.get('BD') == 1) this.rutaPlasticaribeAPI = rutaPlasticaribeAPI;
    // else if (this.storage.get('BD') == 2) this.rutaPlasticaribeAPI = rutaPlasticaribeAPIPrueba;
  }

  srvObtenerLista() {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/DetalleDevolucion_ProductoFacturado');
  }

  srvObtenerListaPorId(dato : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleDevolucion_ProductoFacturado/${dato}`);
  }

  srvObtenerListaPorRollo(dato : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleDevolucion_ProductoFacturado/consultarRollo/${dato}`);
  }

  srvObtenerCrearPDF(dato : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleDevolucion_ProductoFacturado/CrearPdf/${dato}`);
  }

  srvActualizar(id:number|string, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/DetalleDevolucion_ProductoFacturado/${id}`, data);
  }

  srvEliminar(id:number|string) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/DetalleDevolucion_ProductoFacturado/${id}`);
  }

  srvGuardar(data : modelDtProductoDevuelto): Observable<any> {
   return this.http.post(this.rutaPlasticaribeAPI + '/DetalleDevolucion_ProductoFacturado', data);
  }
}
