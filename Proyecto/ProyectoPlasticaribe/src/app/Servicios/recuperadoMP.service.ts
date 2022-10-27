import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { Observable } from 'rxjs';
import { AppComponent} from 'src/app/app.component';
import { modelRecuperadoMP } from '../Modelo/modelRecuperadoMP';
import { rutaPlasticaribeAPI,  } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})
export class RecuperadoMPService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient,
    @Inject(SESSION_STORAGE) private storage: WebStorageService) {

    // if (this.storage.get('BD') == 1) this.rutaPlasticaribeAPI = rutaPlasticaribeAPI;
    // else if (this.storage.get('BD') == 2) this.rutaPlasticaribeAPI = ;
  }

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

  srvObtenerpdfMovimientos(id : number){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleRecuperado_MateriaPrima/pdfMovimientos/${id}`);
  }

  consultaRecuperado(fecha1 : any, fecha2 : any, operario : any, turno : any, materiaPrima : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleRecuperado_MateriaPrima/MostrarMPRecuperada/${fecha1}/${fecha2}/${operario}/${turno}/${materiaPrima}`);
  }

  consultaRecuperadoModal(fecha1 : any, fecha2 : any, turno : any, materiaPrima : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleRecuperado_MateriaPrima/MostrarRecuperadoModal/${fecha1}/${fecha2}/${turno}/${materiaPrima}`);
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
