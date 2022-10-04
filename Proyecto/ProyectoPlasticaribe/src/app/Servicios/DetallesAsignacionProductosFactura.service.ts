import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { Observable } from 'rxjs';
import { AppComponent} from 'src/app/app.component';
import { rutaPlasticaribeAPI, rutaPlasticaribeAPIPrueba } from 'src/polyfills';
import { modelDtAsgProductoFactura } from '../Modelo/modelDtAsgProductoFactura';

@Injectable({
  providedIn: 'root'
})
export class DetallesAsignacionProductosFacturaService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient,
    @Inject(SESSION_STORAGE) private storage: WebStorageService) {

    // if (this.storage.get('BD') == 1) this.rutaPlasticaribeAPI = rutaPlasticaribeAPI;
    // else if (this.storage.get('BD') == 2) this.rutaPlasticaribeAPI = rutaPlasticaribeAPIPrueba;
  }

  srvObtenerLista() {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/DetallesAsignacionProducto_FacturaVenta');
  }

  srvObtenerListaPorId(dato : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetallesAsignacionProducto_FacturaVenta/${dato}`);
  }

  srvObtenerListaPorCodigoFactura(dato : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetallesAsignacionProducto_FacturaVenta/CodigoFactura/${dato}`);
  }

  srvObtenerListaParaPDF(dato : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetallesAsignacionProducto_FacturaVenta/CrearPdf/${dato}`);
  }

  srvObtenerListaParaPDF2(dato : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetallesAsignacionProducto_FacturaVenta/CrearPdf2/${dato}`);
  }

  srvConsultarPorFiltroFechas(fecha1 : any, fecha2 : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetallesAsignacionProducto_FacturaVenta/FiltroFechas/${fecha1}/${fecha2}`);
  }

  srvConsultarPorFiltroFactura(factura : any, ot : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetallesAsignacionProducto_FacturaVenta/FiltroFactura/${factura}/${ot}`);
  }

  srvActualizar(id:number|string, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/DetallesAsignacionProducto_FacturaVenta/${id}`, data);
  }

  srvEliminar(id:number|string) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/DetallesAsignacionProducto_FacturaVenta/${id}`);
  }

  srvGuardar(data : modelDtAsgProductoFactura): Observable<any> {
   return this.http.post(this.rutaPlasticaribeAPI + '/DetallesAsignacionProducto_FacturaVenta', data);
  }

  srvObtenerDocumentosXFechas(fechaInicio : any, fechaFinal : any) : Observable<any> {
    return this.http.get(this.rutaPlasticaribeAPI + `/DetallesAsignacionProducto_FacturaVenta/FiltroFechas/${fechaInicio}/${fechaFinal}`);
  }

}
