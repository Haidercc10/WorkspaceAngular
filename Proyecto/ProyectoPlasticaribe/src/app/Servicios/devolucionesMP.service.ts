import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { Observable } from 'rxjs';
import { AppComponent} from 'src/app/app.component';
import { rutaPlasticaribeAPI, rutaPlasticaribeAPIPrueba } from 'src/polyfills';
import { modelDevolucionMP } from '../Modelo/modelDevolucionMP';

@Injectable({
  providedIn: 'root'
})
export class DevolucionesMPService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient,
    @Inject(SESSION_STORAGE) private storage: WebStorageService) {

    // if (this.storage.get('BD') == 1) this.rutaPlasticaribeAPI = rutaPlasticaribeAPI;
    // else if (this.storage.get('BD') == 2) this.rutaPlasticaribeAPI = rutaPlasticaribeAPIPrueba;
  }

  //Metodo buscar lista de
  srvObtenerLista() {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/DetalleDevolucion_MateriaPrima')
  }

  srvObtenerListaPorId(dev : any, mp : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleDevolucion_MateriaPrima/%20?DevMatPri_Id=${dev}&MatPri_Id=${mp}`);
  }

  srvObtenerListaPorDevId(id : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleDevolucion_MateriaPrima/devolucion/${id}`);
  }

  srvObtenerListaPorMPId(id : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleDevolucion_MateriaPrima/materiaPrima/${id}`);
  }

  srvObtenerListaPorMPIdFechaActual(id : any, fecha : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleDevolucion_MateriaPrima/materiaPrimaFechaActual/${id}?DevMatPri_Fecha=${fecha}`);
  }

  srvObtenerConsultaMov0(fechaIncial : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleDevolucion_MateriaPrima/consultaMovimientos0/${fechaIncial}`);
  }

  srvObtenerConsultaMov1(materiaPrima : any, fechaIncial : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleDevolucion_MateriaPrima/consultaMovimientos1/${materiaPrima}/${fechaIncial}`);
  }

  srvObtenerConsultaMov2(ot : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleDevolucion_MateriaPrima/consultaMovimientos2/${ot}`);
  }

  srvObtenerConsultaMov3(fechaIncial : any, fechaFinal : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleDevolucion_MateriaPrima/consultaMovimientos3/${fechaIncial}/${fechaFinal}`);
  }

  srvObtenerConsultaMov4(fechaIncial : any, materiaPrima : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleDevolucion_MateriaPrima/consultaMovimientos4/${fechaIncial}/${materiaPrima}`);
  }

  srvObtenerConsultaMov5(ot : number, fechaIncial : any, fechaFinal : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleDevolucion_MateriaPrima/consultaMovimientos5/${ot}/${fechaIncial}/${fechaFinal}`);
  }

  srvObtenerConsultaMov6(fechaIncial : any, fechaFinal : any, materiaPrima){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleDevolucion_MateriaPrima/consultaMovimientos6/${fechaIncial}/${fechaFinal}/${materiaPrima}`);
  }

  srvObtenerpdfMovimientos(ot : number){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleDevolucion_MateriaPrima/pdfMovimientos/${ot}`);
  }

  //Metodo agregar
  srvAgregar(data:any) {
    return this.http.post(this.rutaPlasticaribeAPI + '/DetalleDevolucion_MateriaPrima', data)
  }

  //Metodo actualizar
  srvActualizar(id:number|String, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/DetalleDevolucion_MateriaPrima/${id}`, data);
  }

  //Metodo eliminar
  srvEliminar(id:number|String) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/DetalleDevolucion_MateriaPrima/${id}`);
  }

  srvGuardar(data : modelDevolucionMP): Observable<any> {
   return this.http.post(this.rutaPlasticaribeAPI + '/DetalleDevolucion_MateriaPrima', data);
  }

}
