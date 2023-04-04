import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { Observable } from 'rxjs';
import { AppComponent} from 'src/app/app.component';
import { rutaPlasticaribeAPI,  } from 'src/polyfills';
import { modelDtEntradaRollos } from '../../Modelo/modelDtEntradaRollos';

@Injectable({
  providedIn: 'root'
})
export class DetallesEntradaRollosService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient,
    @Inject(SESSION_STORAGE) private storage: WebStorageService) {

    // if (this.storage.get('BD') == 1) this.rutaPlasticaribeAPI = rutaPlasticaribeAPI;
    // else if (this.storage.get('BD') == 2) this.rutaPlasticaribeAPI = ;
  }


  srvObtenerLista() {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/DetalleEntradaRollo_Producto');
  }

  getRollosProceso(proceso : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleEntradaRollo_Producto/GetRollosProceso/${proceso}`);
  }

  srvObtenerListaPorId(dato : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleEntradaRollo_Producto/${dato}`);
  }

  srvObtenerVerificarRollo(dato : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleEntradaRollo_Producto/VerificarRollo/${dato}`);
  }

  srvConsultarProducto(dato : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleEntradaRollo_Producto/consultarProducto/${dato}`);
  }

  srvConsultaRollo(dato : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleEntradaRollo_Producto/consultarRollo/${dato}`);
  }

  srvObtenerCrearPDF(dato : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleEntradaRollo_Producto/CrearPdf/${dato}`);
  }

  srvObtenerCrearPDF2(dato : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleEntradaRollo_Producto/CrearPdf2/${dato}`);
  }

  srvCrearPDFUltimoId(id : number) {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleEntradaRollo_Producto/CrearPDFUltimoID/${id}`);
  }

  srvConsultarOTEntradas(ot : number) {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleEntradaRollo_Producto/ConsultarOTReporteProcesosActual/${ot}`);
  }

  srvConsultarOtSalidas(ot : number) {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleEntradaRollo_Producto/ConsultarOTReporteProcesosSalidas/${ot}`);
  }

  GetRollos(data : any []): Observable<any>{
    return this.http.post(this.rutaPlasticaribeAPI + '/DetalleEntradaRollo_Producto/getRollos', data);
  }

  srvActualizar(id:number|string, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/DetalleEntradaRollo_Producto/${id}`, data);
  }

  srvEliminar(id:number|string) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/DetalleEntradaRollo_Producto/${id}`);
  }

  srvGuardar(data : modelDtEntradaRollos): Observable<any> {
   return this.http.post(this.rutaPlasticaribeAPI + '/DetalleEntradaRollo_Producto', data);
  }

  deleteRollosDespacho(id : any) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/DetalleEntradaRollo_Producto/EliminarRollo/${id}`);
  }
}
