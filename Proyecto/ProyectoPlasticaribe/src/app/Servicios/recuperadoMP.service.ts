import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribe3, rutaPlasticaribeAPI } from 'src/polyfills';
import { modelRecuperadoMP } from '../Modelo/modelRecuperadoMP';

@Injectable({
  providedIn: 'root'
})
export class RecuperadoMPService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient) { }

  //Metodo buscar lista de proveedor
  srvObtenerLista():Observable<any[]> {
      return this.http.get<any>(this.rutaPlasticaribeAPI + '/DetalleRecuperado_MateriaPrima')
  }

  srvObtenerListaPorId(id : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleRecuperado_MateriaPrima/${id}`);
  }

  srvObtenerListaPorMatPriId(id : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleRecuperado_MateriaPrima/materiaPrima/${id}`);
  }

  srvObtenerListaPorMatPriIdFechaActual(id : any, fecha : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleRecuperado_MateriaPrima/materiaPrimaFechaActual/${id}?RecMp_FechaIngreso=${fecha}`);
  }

  srvObtenerListaPorRecuperadoId(id : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleRecuperado_MateriaPrima/recuperado/${id}`);
  }

  srvObtenerConsultaMov0(fechaIncial : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleRecuperado_MateriaPrima/consultaMovimientos0/${fechaIncial}`);
  }

  srvObtenerConsultaMov1(materiaPrima : any, fecha : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleRecuperado_MateriaPrima/consultaMovimiento1/${materiaPrima}/${fecha}`);
  }

  srvObtenerConsultaMov2(id : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleRecuperado_MateriaPrima/consultaMovimientos2/${id}`);
  }

  srvObtenerConsultaMov3(fechaIncial : any, fechaFinal : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleRecuperado_MateriaPrima/consultaMovimientos3/${fechaIncial}/${fechaFinal}`);
  }

  srvObtenerConsultaMov4(fechaIncial : any, materiaPrima : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleRecuperado_MateriaPrima/consultaMovimientos4/${fechaIncial}/${materiaPrima}`);
  }

  srvObtenerConsultaMov5(ot : number, fechaIncial : any, fechaFinal : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleRecuperado_MateriaPrima/consultaMovimientos5/${ot}/${fechaIncial}/${fechaFinal}`);
  }

  srvObtenerConsultaMov6(fechaIncial : any, fechaFinal : any, materiaPrima){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleRecuperado_MateriaPrima/consultaMovimientos6/${fechaIncial}/${fechaFinal}/${materiaPrima}`);
  }

//Metodo agregar proveedor
  srvAgregar(data:any) {
    return this.http.post(this.rutaPlasticaribeAPI + '/DetalleRecuperado_MateriaPrima', data)
  }

//Metodo actualzar proveedor
  srvActualizar(id:number|String, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/DetalleRecuperado_MateriaPrima/${id}`, data);
  }

//Metodo eliminar proveedor
  srvEliminar(id:number|String) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/DetalleRecuperado_MateriaPrima/${id}`);
  }

  //Metodo Guardar proveedor con un modelo
  srvGuardar(data : modelRecuperadoMP): Observable<any> {
    return this.http.post(this.rutaPlasticaribeAPI + '/DetalleRecuperado_MateriaPrima', data);
  }

}
