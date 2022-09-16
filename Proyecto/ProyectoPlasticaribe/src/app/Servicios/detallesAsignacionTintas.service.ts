import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribe3, rutaPlasticaribeAPI } from 'src/polyfills';
import { modelDetallesAsignacionTintas } from '../Modelo/modelDetallesAsignacionTintas';

@Injectable({
  providedIn: 'root'
})
export class DetallesAsignacionTintasService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  constructor(private http : HttpClient) { }

  //Metodo buscar lista de Productos
  srvObtenerLista():Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/DetalleAsignacion_Tinta');
  }

  srvObtenerListaPorId(id : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleAsignacion_Tinta/${id}`);
  }

  srvObtenerListaPor_Asignacion(id : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleAsignacion_Tinta/asignacion/${id}`);
  }

  srvObtenerSumaCantidadesTintas_MatPrimas(OT : any):Observable<any[]>{
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleAsignacion_Tinta/SumaTintas_MatPrimasAsignadas/${OT}`);
  }

  //Metodo agregar Productos
  srvAgregar(data : any) {
    return this.http.post(this.rutaPlasticaribeAPI + '/DetalleAsignacion_Tinta', data)
  }

  //Metodo actualzar Productos
  srvActualizar(id:number|String, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/DetalleAsignacion_Tinta/${id}`, data);
  }

  //Metodo eliminar Productos
  srvEliminar(id:number|String) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/DetalleAsignacion_Tinta/${id}`);
  }

  //
  srvGuardar(data : modelDetallesAsignacionTintas): Observable<any> {
    return this.http.post(this.rutaPlasticaribeAPI + '/DetalleAsignacion_Tinta', data)
  }


  /*** Metodo para obtener la informacion de las tintas asignadas por OT */
  srvObtenerTintasAsignadasxOT(OT : number) :Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleAsignacion_Tinta/AsignacionesTintasxOT/${OT}`);
  }

  /*** Consultas para Movimientos Tintas */
  srvObtenerConsultaMov0(fechaEntrega : any) {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleAsignacion_Tinta/MovTintasxFechaEntrega/${fechaEntrega}`);
  }

  srvObtenerConsultaMov1(Estado : any) {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleAsignacion_Tinta/MovTintasxEstado/${Estado}`);
  }

  srvObtenerConsultaMov2(Tinta : any, FechaEntrega : any) {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleAsignacion_Tinta/MovTintasxIdxFechaEntrega/${Tinta}/${FechaEntrega}`);
  }

  srvObtenerConsultaMov3(OT : number) {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleAsignacion_Tinta/MovTintasxOT/${OT}`);
  }

  srvObtenerConsultaMov4(FechaInicial : any, FechaFinal : any) {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleAsignacion_Tinta/MovTintasxFechas/${FechaInicial}/${FechaFinal}`);
  }

  srvObtenerConsultaMov6(OT : number, FechaInicial : any, FechaFinal : any) {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleAsignacion_Tinta/MovTintasxOTxFechas/${OT}/${FechaInicial}/${FechaFinal}`);
  }

  srvObtenerConsultaMov7(FechaInicial : any, FechaFinal : any, Estado : any) {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleAsignacion_Tinta/MovTintasxFechasxEstado/${FechaInicial}/${FechaFinal}/${Estado}`);
  }

  srvObtenerConsultaMov8(FechaInicial : any, FechaFinal : any, Tinta : any) {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleAsignacion_Tinta/MovTintasxFechasxTinta/${FechaInicial}/${FechaFinal}/${Tinta}`);
  }

  srvObtenerConsultaMov9(FechaInicial : any, FechaFinal : any, Tinta : any, Estado : any) {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleAsignacion_Tinta/MovTintasxFechasxTintaxEstado/${FechaInicial}/${FechaFinal}/${Tinta}/${Estado}`);
  }


  srvObtenerConsultaMov10(OT: number, FechaIni: any, FechaFin: any, Tinta : any, Estado : any) {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleAsignacion_Tinta/MovTintasxOTxFechasxTintaxEstado/${OT}/${FechaIni}/${FechaFin}/${Tinta}/${Estado}`);
  }

  srvObtenerpdfMovimientos(OT : number) {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleAsignacion_Tinta/pdfMovTintasXOT/${OT}`);
  }

}
