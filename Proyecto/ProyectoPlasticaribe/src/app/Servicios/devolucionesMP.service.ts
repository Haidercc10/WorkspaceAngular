import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribe3, rutaPlasticaribeAPI } from 'src/polyfills';
import { modelDevolucionMP } from '../Modelo/modelDevolucionMP';

@Injectable({
  providedIn: 'root'
})
export class DevolucionesMPService {

  //Ruta del API
  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
  constructor(private http: HttpClient) { }

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

  srvObtenerConsultaMov10(ot : number, fechaIncial : any, fechaFinal : any, materiaPrima){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleDevolucion_MateriaPrima/consultaMovimientos1/${ot}/${fechaIncial}/${fechaFinal}/${materiaPrima}`);
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
