import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { Observable } from 'rxjs';
import { AppComponent} from 'src/app/app.component';
import { modelRemisionMP } from '../../Modelo/modelRemisionMP';
import { rutaPlasticaribeAPI,  } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})
export class RemisionesMPService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient,
    @Inject(SESSION_STORAGE) private storage: WebStorageService) {

    // if (this.storage.get('BD') == 1) this.rutaPlasticaribeAPI = rutaPlasticaribeAPI;
    // else if (this.storage.get('BD') == 2) this.rutaPlasticaribeAPI = ;
  }

  //Metodo buscar lista de proveedor
  srvObtenerLista():Observable<any[]> {
      return this.http.get<any>(this.rutaPlasticaribeAPI + '/Remision_MateriaPrima')
  }

  srvObtenerListaPorId(id : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Remision_MateriaPrima/${id}`);
  }

  srvObtenerListaPorRemId(id : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Remision_MateriaPrima/remision/${id}`);
  }

  srvObtenerListaPorMpId(id : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Remision_MateriaPrima/MP/${id}`);
  }

  srvObtenerListaPorMpIdFechaActual(id : any, fecha : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Remision_MateriaPrima/MPFechaActual/${id}?Rem_Fecha=${fecha}`);
  }

  srvObtenerListaMov0(fecha : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Remision_MateriaPrima/consultaMovimiento0/${fecha}`);
  }

  srvObtenerListaMov1(materiaPrima : any, fecha : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Remision_MateriaPrima/consultaMovimiento1/${materiaPrima}/${fecha}`);
  }

  srvObtenerListaMov2(id : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Remision_MateriaPrima/consultaMovimientos2/${id}`);
  }

  srvObtenerListaMov3(fechaIncial : any, fechaFinal : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Remision_MateriaPrima/consultaMovimientos3/${fechaIncial}/${fechaFinal}`);
  }

  srvObtenerConsultaMov4(fechaIncial : any, materiaPrima : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Remision_MateriaPrima/consultaMovimientos4/${fechaIncial}/${materiaPrima}`);
  }

  srvObtenerConsultaMov5(ot : number, fechaIncial : any, fechaFinal : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Remision_MateriaPrima/consultaMovimientos5/${ot}/${fechaIncial}/${fechaFinal}`);
  }

  srvObtenerConsultaMov6(fechaIncial : any, fechaFinal : any, materiaPrima){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Remision_MateriaPrima/consultaMovimientos6/${fechaIncial}/${fechaFinal}/${materiaPrima}`);
  }

  srvObtenerpdfMovimientos(codigo : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Remision_MateriaPrima/pdfMovimientos/${codigo}`);
  }

  GetRemisionSinFactura(codigo : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Remision_MateriaPrima/GetRemisionSinFactura/${codigo}`);
  }

//Metodo agregar proveedor
  srvAgregar(data:any) {
    return this.http.post(this.rutaPlasticaribeAPI + '/Remision_MateriaPrima', data)
  }

//Metodo actualzar proveedor
  srvActualizar(id:number|String, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/Remision_MateriaPrima/${id}`, data);
  }

//Metodo eliminar proveedor
  srvEliminar(id:number|String) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/Remision_MateriaPrima/${id}`);
  }

  //Metodo Guardar proveedor con un modelo
  srvGuardar(data : modelRemisionMP): Observable<any> {
    return this.http.post(this.rutaPlasticaribeAPI + '/Remision_MateriaPrima', data);
  }

}
