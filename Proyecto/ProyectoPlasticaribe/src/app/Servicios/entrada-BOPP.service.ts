import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { Observable } from 'rxjs';
import { AppComponent} from 'src/app/app.component';
import { modelBOPP } from '../Modelo/modelBOPP';
import { rutaPlasticaribeAPI,  } from 'src/polyfills';

@Injectable( { providedIn: 'root' } )

export class EntradaBOPPService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient,
    @Inject(SESSION_STORAGE) private storage: WebStorageService) {

    // if (this.storage.get('BD') == 1) this.rutaPlasticaribeAPI = rutaPlasticaribeAPI;
    // else if (this.storage.get('BD') == 2) this.rutaPlasticaribeAPI = ;
  }

  //Metodo buscar lista
  srvObtenerLista():Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/BOPP')
  }

  srvObtenerListaPorId(id : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/BOPP/${id}`)
  }

  srvObtenerListaPorSerial(id : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/BOPP/serial/${id}`)
  }

  srvObtenerListaPorFecha(id : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/BOPP/fecha/${id}`)
  }

  srvObtenerListaPorFechas(fecha1 : any, fecha2 : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/BOPP/fechas?BOPP_FechaIngreso1=${fecha1}&BOPP_FechaIngreso2=${fecha2}`)
  }

  srvObtenerListaAgrupada():Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/BOPP/BoppAgrupado`)
  }

  srvObtenerConsultaMov0(fechaIncial : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/BOPP/consultaMovimientos0/${fechaIncial}`);
  }

  srvObtenerConsultaMov1(id, fechaIncial : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/BOPP/consultaMovimientos1/${id}/${fechaIncial}`);
  }

  srvObtenerConsultaMov2(id : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/BOPP/consultaMovimientos2/${id}`);
  }

  srvObtenerConsultaMov3(fechaIncial : any, fechaFinal : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/BOPP/consultaMovimientos3/${fechaIncial}/${fechaFinal}`);
  }

  srvObtenerConsultaMov4(ot : number, fechaIncial : any, fechaFinal : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/BOPP/consultaMovimientos4/${ot}/${fechaIncial}/${fechaFinal}`);
  }

  srvObtenerConsultaMov5(fechaIncial : any, fechaFinal : any, id){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/BOPP/consultaMovimientos5/${fechaIncial}/${fechaFinal}/${id}`);
  }

  srvObtenerpdfMovimientos(ot : number){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/BOPP/pdfMovimientos/${ot}`);
  }

  srvObtenerConsultaMov6(id : any, fechaIncial : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/BOPP/consultaMovimientos6/${id}/${fechaIncial}`);
  }


  //Metodo agregar
  srvAgregar(data:any) {
    return this.http.post(this.rutaPlasticaribeAPI + '/BOPP', data)
  }

  //Metodo actualzar
  srvActualizar(id:any, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/BOPP/${id}`, data);
  }

  //Metodo eliminar
  srvEliminar(id:number|String) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/BOPP/${id}`);
  }

  srvGuardar(data: modelBOPP): Observable<any> {
    return this.http.post(this.rutaPlasticaribeAPI + '/BOPP', data)
  }

}
