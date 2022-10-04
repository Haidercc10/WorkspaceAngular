import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { Observable } from 'rxjs';
import { AppComponent} from 'src/app/app.component';
import { rutaPlasticaribeAPI, rutaPlasticaribeAPIPrueba } from 'src/polyfills';
import { modelDetallesAsignacionBopp } from '../Modelo/modelDetallesAsignacionBopp';

@Injectable( { providedIn: 'root' } )

export class DetalleAsignacion_BOPPService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient,
    @Inject(SESSION_STORAGE) private storage: WebStorageService) {

    // if (this.storage.get('BD') == 1) this.rutaPlasticaribeAPI = rutaPlasticaribeAPI;
    // else if (this.storage.get('BD') == 2) this.rutaPlasticaribeAPI = rutaPlasticaribeAPIPrueba;
  }


  //Metodo buscar lista
  srvObtenerLista():Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/DetalleAsignacion_BOPP')
  }

  srvObtenerListaPorId(id : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleAsignacion_BOPP/${id}`)
  }

  srvObtenerListaPorAsignacion(id : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleAsignacion_BOPP/asignacion/${id}`)
  }

  srvObtenerListaPorBOPP(id : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleAsignacion_BOPP/BOPP/${id}`)
  }

  srvObtenerListaPorBOPPFechaActual(id : any, fecha : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleAsignacion_BOPP/BOPPFechaActual/${id}?AsigBOPP_FechaEntrega=${fecha}`)
  }

  srvObtenerListaPorOt(id : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleAsignacion_BOPP/OT/${id}`)
  }

  srvObtenerListaPorEstadoOT(id : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleAsignacion_BOPP/estadoOT/${id}`)
  }

  srvObtenerConsultaMov0(fechaIncial : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleAsignacion_BOPP/consultaMovimientos0/${fechaIncial}`);
  }

  srvObtenerConsultaMov1(estado){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleAsignacion_BOPP/consultaMovimientos1/${estado}`);
  }

  srvObtenerConsultaMov2(materiaPrima, fechaIncial : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleAsignacion_BOPP/consultaMovimientos2/${materiaPrima}/${fechaIncial}`);
  }

  srvObtenerConsultaMov3(ot : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleAsignacion_BOPP/consultaMovimientos3/${ot}`);
  }

  srvObtenerConsultaMov4(fechaIncial : any, fechaFinal : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleAsignacion_BOPP/consultaMovimientos4/${fechaIncial}/${fechaFinal}`);
  }

  srvObtenerConsultaMov5(fechaIncial : any, materiaPrima : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleAsignacion_BOPP/consultaMovimientos5/${fechaIncial}/${materiaPrima}`);
  }

  srvObtenerConsultaMov6(ot : number, fechaIncial : any, fechaFinal : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleAsignacion_BOPP/consultaMovimientos6/${ot}/${fechaIncial}/${fechaFinal}`);
  }

  srvObtenerConsultaMov7(fechaIncial : any, fechaFinal : any, estado){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleAsignacion_BOPP/consultaMovimientos7/${fechaIncial}/${fechaFinal}/${estado}`);
  }

  srvObtenerConsultaMov8(fechaIncial : any, fechaFinal : any, materiaPrima){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleAsignacion_BOPP/consultaMovimientos8/${fechaIncial}/${fechaFinal}/${materiaPrima}`);
  }

  srvObtenerConsultaMov9(fechaIncial : any, fechaFinal : any, materiaPrima : any, estado : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleAsignacion_BOPP/consultaMovimientos9/${fechaIncial}/${fechaFinal}/${materiaPrima}/${estado}`);
  }

  srvObtenerConsultaMov10(ot : number, fechaIncial : any, fechaFinal : any, materiaPrima, estado){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleAsignacion_BOPP/consultaMovimientos10/${ot}/${fechaIncial}/${fechaFinal}/${materiaPrima}/${estado}`);
  }

  srvObtenerpdfMovimientos(ot : number){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleAsignacion_BOPP/pdfMovimientos/${ot}`);
  }


  //Metodo agregar
  srvAgregar(data:any) {
    return this.http.post(this.rutaPlasticaribeAPI + '/DetalleAsignacion_BOPP', data)
  }
  //Metodo actualzar
  srvActualizar(id:number|String, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/DetalleAsignacion_BOPP/${id}`, data);
  }
  //Metodo eliminar
  srvEliminar(id:number|String) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/DetalleAsignacion_BOPP/${id}`);
  }

  srvEliminarPorOT(idAsg : number, ot : number){
    return this.http.delete(this.rutaPlasticaribeAPI + `/DetalleAsignacion_BOPP/EliminarXOT_AsignacionBOPP?AsigBOPP_Id=${idAsg}&DtAsigBOPP_OrdenTrabajo=${ot}`);
  }

  srvEliminarPorBOPP(idAsg : number, idbopp : number){
    return this.http.delete(this.rutaPlasticaribeAPI + `/DetalleAsignacion_BOPP/EliminarXAsignacion_BOPP?AsigBOPP_Id=${idAsg}&BOPP_Id=${idbopp}`);
  }

  srvGuardar(data: modelDetallesAsignacionBopp): Observable<any> {
  return this.http.post(this.rutaPlasticaribeAPI + '/DetalleAsignacion_BOPP', data)
  }

}
