import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { Observable } from 'rxjs';
import { AppComponent} from 'src/app/app.component';
import { rutaPlasticaribeAPI, rutaPlasticaribeAPIPrueba } from 'src/polyfills';
import { modelDetallesAsignacion } from '../Modelo/modelDetallesAsignacion';

@Injectable({
  providedIn: 'root'
})
export class DetallesAsignacionService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient,
    @Inject(SESSION_STORAGE) private storage: WebStorageService) {

    // if (this.storage.get('BD') == 1) this.rutaPlasticaribeAPI = rutaPlasticaribeAPI;
    // else if (this.storage.get('BD') == 2) this.rutaPlasticaribeAPI = rutaPlasticaribeAPIPrueba;
  }

  //Metodo buscar lista de
  srvObtenerLista():Observable<any[]> {
      return this.http.get<any>(this.rutaPlasticaribeAPI + '/DetalleAsignacion_MateriaPrima')
  }

  srvObtenerListaPorId(asignacion : any, materiaPrima : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleAsignacion_MateriaPrima/ ?AsigMp_Id=${asignacion}&MatPri_Id=${materiaPrima}`);
  }

  srvObtenerListaPorAsigId(asignacion : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleAsignacion_MateriaPrima/asignacion/${asignacion}`);
  }

  srvObtenerListaPorMatPriId(materiaPrima : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleAsignacion_MateriaPrima/matPri/${materiaPrima}`);
  }

  srvObtenerListaPorMatPriIdFechaActual(materiaPrima : any, fecha :any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleAsignacion_MateriaPrima/matPriFechaActual/${materiaPrima}?AsigMp_FechaEntrega=${fecha}`);
  }

  srvObtenerListaPorOT(ot : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleAsignacion_MateriaPrima/AsignacionesAgrupadas/${ot}`);
  }

  srvObtenerListaPorAsignacionesOT(ot : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleAsignacion_MateriaPrima/AsignacionesTotales/${ot}`);
  }

  srvObtenerListaPorOT2(ot : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleAsignacion_MateriaPrima/AsignacionesAgrupadasXvalores/${ot}`);
  }

  srvObtenerListaPorEstadoOT(estado : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleAsignacion_MateriaPrima/estadoOT/${estado}`);
  }

  srvObtenerConsultaMov0(fechaIncial : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleAsignacion_MateriaPrima/consultaMovimientos0/${fechaIncial}`);
  }

  srvObtenerConsultaMov1(estado){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleAsignacion_MateriaPrima/consultaMovimientos1/${estado}`);
  }

  srvObtenerConsultaMov2(materiaPrima, fechaIncial : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleAsignacion_MateriaPrima/consultaMovimientos2/${materiaPrima}/${fechaIncial}`);
  }

  srvObtenerConsultaMov3(ot : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleAsignacion_MateriaPrima/consultaMovimientos3/${ot}`);
  }

  srvObtenerConsultaMov4(fechaIncial : any, fechaFinal : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleAsignacion_MateriaPrima/consultaMovimientos4/${fechaIncial}/${fechaFinal}`);
  }

  srvObtenerConsultaMov5(fechaIncial : any, materiaPrima : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleAsignacion_MateriaPrima/consultaMovimientos5/${fechaIncial}/${materiaPrima}`);
  }

  srvObtenerConsultaMov6(ot : number, fechaIncial : any, fechaFinal : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleAsignacion_MateriaPrima/consultaMovimientos6/${ot}/${fechaIncial}/${fechaFinal}`);
  }

  srvObtenerConsultaMov7(fechaIncial : any, fechaFinal : any, estado){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleAsignacion_MateriaPrima/consultaMovimientos7/${fechaIncial}/${fechaFinal}/${estado}`);
  }

  srvObtenerConsultaMov8(fechaIncial : any, fechaFinal : any, materiaPrima){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleAsignacion_MateriaPrima/consultaMovimientos8/${fechaIncial}/${fechaFinal}/${materiaPrima}`);
  }

  srvObtenerConsultaMov9(fechaIncial : any, fechaFinal : any, materiaPrima : any, estado : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleAsignacion_MateriaPrima/consultaMovimientos9/${fechaIncial}/${fechaFinal}/${materiaPrima}/${estado}`);
  }

  srvObtenerConsultaMov10(ot : number, fechaIncial : any, fechaFinal : any, materiaPrima, estado){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleAsignacion_MateriaPrima/consultaMovimientos10/${ot}/${fechaIncial}/${fechaFinal}/${materiaPrima}/${estado}`);
  }

  srvObtenerpdfMovimientos(ot : number){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleAsignacion_MateriaPrima/pdfMovimientos/${ot}`);
  }

//Metodo agregar
  srvAgregar(data:any) {
    return this.http.post(this.rutaPlasticaribeAPI + '/DetalleAsignacion_MateriaPrima', data)
  }

//Metodo actualzar
  srvActualizar(asignacion : any, materiaPrima : any | String, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/DetalleAsignacion_MateriaPrima/ ?AsigMp_Id=${asignacion}&MatPri_Id=${materiaPrima}`, data);
  }

//Metodo eliminar
  srvEliminar(id:number|String) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/DetalleAsignacion_MateriaPrima/${id}`);
  }

  //Duardar
  srvGuardar(data : modelDetallesAsignacion): Observable<any> {
    return this.http.post(this.rutaPlasticaribeAPI + '/DetalleAsignacion_MateriaPrima', data);
  }

}
