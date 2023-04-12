import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI } from 'src/polyfills';
import { modelDtIngRollo_Extrusion } from '../../Modelo/modelDtIngRollo_Extrusion';

@Injectable({
  providedIn: 'root'
})
export class DtIngRollos_ExtrusionService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient,) { }

  srvObtenerLista() {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/DetallesIngRollos_Extrusion');
  }

  srvObtenerListaRollosDisponible() {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/DetallesIngRollos_Extrusion/getTodosRollosDisponibles');
  }

  srvObtenerListaPorId(dato : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetallesIngRollos_Extrusion/${dato}`);
  }

  consultarRollos(){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetallesIngRollos_Extrusion/consultaRollos`);
  }

  consultarRollo(rollo : number){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetallesIngRollos_Extrusion/consultaRollo/${rollo}`);
  }

  crearPdf(id : number){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetallesIngRollos_Extrusion/getCrearPDFUltimoId/${id}`);
  }

  getRollosDisponibles(hoy : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetallesIngRollos_Extrusion/getRollosDisponibles/${hoy}`);
  }

  getRollosDisponiblesOT(ot : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetallesIngRollos_Extrusion/getRollosDisponiblesOT/${ot}`);
  }

  getTodosRollosDisponiblesAgrupados(){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetallesIngRollos_Extrusion/getTodosRollosDisponiblesAgrupados`);
  }

  getRollosDisponiblesRollo(rollo : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetallesIngRollos_Extrusion/getRollosDisponiblesRollo/${rollo}`);
  }

  getRollosDisponiblesFechas(fechaInicial : any, fechaFinal : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetallesIngRollos_Extrusion/getRollosDisponiblesFechas/${fechaInicial}/${fechaFinal}`);
  }

  getconsultaRollosFechas(fechaInicial : any, fechaFinal : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetallesIngRollos_Extrusion/getconsultaRollosFechas/${fechaInicial}/${fechaFinal}`);
  }

  getconsultaRollosOT(ot : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetallesIngRollos_Extrusion/getconsultaRollosOT/${ot}`);
  }

  getCrearPdfEntrada(id : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetallesIngRollos_Extrusion/getCrearPdfEntrada/${id}`);
  }

  GetRollos(data : any []): Observable<any> {
    return this.http.post(this.rutaPlasticaribeAPI + `/DetallesIngRollos_Extrusion/getRollos`, data);
  }

  srvActualizar(id:number|string, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/DetallesIngRollos_Extrusion/${id}`, data);
  }

  EliminarRollExtrusion(id : any) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/DetallesIngRollos_Extrusion/EliminarRolloIngresados/${id}`);
  }

  srvGuardar(data : modelDtIngRollo_Extrusion): Observable<any> {
   return this.http.post(this.rutaPlasticaribeAPI + '/DetallesIngRollos_Extrusion', data);
  }

}
