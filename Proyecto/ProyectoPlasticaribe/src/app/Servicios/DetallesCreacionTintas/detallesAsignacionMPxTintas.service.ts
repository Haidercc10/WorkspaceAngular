import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI, } from 'src/polyfills';
import { modelDetallesAsignacionMPxTintas } from '../../Modelo/modelDetallesAsignacionMPxTintas';

@Injectable({
  providedIn: 'root'
})
export class DetallesAsignacionMPxTintasService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient,) { }

  //Metodo buscar lista de Productos
  srvObtenerLista():Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/DetalleAsignacion_MatPrimaXTinta');
  }

  srvObtenerListaPorId(id : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleAsignacion_MatPrimaXTinta/${id}`);
  }

  getCreatPdf(id : number){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleAsignacion_MatPrimaXTinta/getCreatPdf/${id}`)
  }

  GetTintasCreadasMes(fecha1 : any, fecha2 : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleAsignacion_MatPrimaXTinta/getTintasCreadasMes/${fecha1}/${fecha2}`);
  }

  GetMateriasPrimasCrearTintasMes(fecha1 : any, fecha2 : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleAsignacion_MatPrimaXTinta/getMateriasPrimasCrearTintasMes/${fecha1}/${fecha2}`);
  }

  //Metodo agregar Productos
  srvAgregar(data : any) {
    return this.http.post(this.rutaPlasticaribeAPI + '/DetalleAsignacion_MatPrimaXTinta', data)
  }

  //Metodo actualzar Productos
  srvActualizar(id:number|String, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/DetalleAsignacion_MatPrimaXTinta/${id}`, data);
  }

  //Metodo eliminar Productos
  srvEliminar(id:number|String) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/DetalleAsignacion_MatPrimaXTinta/${id}`);
  }

  //
  srvGuardar(data : modelDetallesAsignacionMPxTintas): Observable<any> {
    return this.http.post(this.rutaPlasticaribeAPI + '/DetalleAsignacion_MatPrimaXTinta', data)
  }

}
