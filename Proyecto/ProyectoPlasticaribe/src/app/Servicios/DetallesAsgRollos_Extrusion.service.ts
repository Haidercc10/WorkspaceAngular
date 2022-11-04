import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI } from 'src/polyfills';
import { modelDtAsgRollos_Extrusion } from '../Modelo/modelDtAsgRollos_Extrusion';

@Injectable({
  providedIn: 'root'
})
export class DetallesAsgRollos_ExtrusionService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient,
    @Inject(SESSION_STORAGE) private storage: WebStorageService) {

    // if (this.storage.get('BD') == 1) this.rutaPlasticaribeAPI = rutaPlasticaribeAPI;
    // else if (this.storage.get('BD') == 2) this.rutaPlasticaribeAPI = ;
  }

  srvObtenerLista() {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/DetallesAsgRollos_Extrusion');
  }
  srvObtenerListaPorId(dato : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetallesAsgRollos_Extrusion/${dato}`);
  }

  crearPdf(id : number){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetallesAsgRollos_Extrusion/getCrearPDFUltimoId/${id}`);
  }

  getconsultaRollosFechas(fechaInicial : any, fechaFinal : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetallesAsgRollos_Extrusion/getconsultaRollosFechas/${fechaInicial}/${fechaFinal}`);
  }

  getconsultaRollosOT(ot : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetallesAsgRollos_Extrusion/getconsultaRollosOT/${ot}`);
  }

  srvActualizar(id:number|string, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/DetallesAsgRollos_Extrusion/${id}`, data);
  }

  srvEliminar(id:number|string) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/DetallesAsgRollos_Extrusion/${id}`);
  }

  srvGuardar(data : modelDtAsgRollos_Extrusion): Observable<any> {
   return this.http.post(this.rutaPlasticaribeAPI + '/DetallesAsgRollos_Extrusion', data);
  }
}
