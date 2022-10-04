import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { Observable } from 'rxjs';
import { AppComponent} from 'src/app/app.component';
import { rutaPlasticaribeAPI, rutaPlasticaribeAPIPrueba } from 'src/polyfills';
import { modelAsigProductosFacturas } from '../Modelo/modelAsigProductosFacturas';

@Injectable({
  providedIn: 'root'
})
export class AsignacionProductosFacturaService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient,
    @Inject(SESSION_STORAGE) private storage: WebStorageService) {

    // if (this.storage.get('BD') == 1) this.rutaPlasticaribeAPI = rutaPlasticaribeAPI;
    // else if (this.storage.get('BD') == 2) this.rutaPlasticaribeAPI = rutaPlasticaribeAPIPrueba;
  }


  srvObtenerLista() {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/AsignacionProducto_FacturaVenta');
  }

  srvObtenerUltimoId() {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/AsignacionProducto_FacturaVenta/UltimoId');
  }

  srvObtenerListaPorId(dato : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/AsignacionProducto_FacturaVenta/${dato}`);
  }

  srvObtenerListaPorFactura(dato : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/AsignacionProducto_FacturaVenta/CodigoFactura/${dato}`);
  }

  srvActualizar(id:number|string, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/AsignacionProducto_FacturaVenta/${id}`, data);
  }

  srvActualizarFactura(id:number|string, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/AsignacionProducto_FacturaVenta/ActualizacionFactura/${id}`, data);
  }

  srvEliminar(id:number|string) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/AsignacionProducto_FacturaVenta/${id}`);
  }

  srvGuardar(data : modelAsigProductosFacturas): Observable<any> {
   return this.http.post(this.rutaPlasticaribeAPI + '/AsignacionProducto_FacturaVenta', data);
  }

}
