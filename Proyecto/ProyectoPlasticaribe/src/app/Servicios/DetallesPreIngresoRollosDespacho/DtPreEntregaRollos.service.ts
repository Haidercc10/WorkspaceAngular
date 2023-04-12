import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI, } from 'src/polyfills';
import { modelDtPreEntregaRollos } from '../../Modelo/modelDtPreEntregaRollo';

@Injectable({
  providedIn: 'root'
})
export class DtPreEntregaRollosService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient,) { }

  srvObtenerLista() {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/DetallePreEntrega_RolloDespacho');
  }

  srvCrearPDF(ot : number, proceso : string) {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetallePreEntrega_RolloDespacho/crearpdf/${ot}/${proceso}`);
  }

  srvCrearPDF2(ot : number, proceso : string) {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetallePreEntrega_RolloDespacho/crearpdf2/${ot}/${proceso}`);
  }

  cantidadRollosPorOT(ot : number, proceso : string) {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetallePreEntrega_RolloDespacho/cantidadRollosPorOT/${ot}/${proceso}`);
  }

  srvCrearPDFUltimoId(id : number) {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetallePreEntrega_RolloDespacho/CrearPDFUltimoID/${id}`);
  }

  srvObtenerVerificarRollo(dato : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetallePreEntrega_RolloDespacho/VerificarRollo/${dato}`);
  }

  getRollosPreEntregadosFechas(fecha1 : any, fecha2 : any, proceso : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetallePreEntrega_RolloDespacho/getRollosPreEntregadosFechas/${fecha1}/${fecha2}/${proceso}`);
  }

  getRollosPreEntregadosRollo(rollo : any, proceso : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetallePreEntrega_RolloDespacho/getRollosPreEntregadosRollo/${rollo}/${proceso}`);
  }

  getRollosPreEntregadosOT(ot : any, proceso : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetallePreEntrega_RolloDespacho/getRollosPreEntregadosOT/${ot}/${proceso}`);
  }

  getRollosProceso(proceso : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetallePreEntrega_RolloDespacho/getconsultaProceso/${proceso}`);
  }

  srvObtenerListaPorId(dato : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetallePreEntrega_RolloDespacho/${dato}`);
  }

  GetRollos(data : any []): Observable<any>{
    return this.http.post(this.rutaPlasticaribeAPI + '/DetallePreEntrega_RolloDespacho/getRollos', data);
  }

  GetRollos_Ingresar(fechaInicial : any, fechaFinal : any, proceso : string, ruta : string){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetallePreEntrega_RolloDespacho/getRollos_Ingresar/${fechaInicial}/${fechaFinal}/${proceso}/${ruta}`);
  }

  srvActualizar(id:number|string, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/DetallePreEntrega_RolloDespacho/${id}`, data);
  }

  srvEliminar(id:number|string) {
    return this.http.delete(this.rutaPlasticaribeAPI + `DetallePreEntrega_RolloDespacho//${id}`);
  }

  srvGuardar(data : modelDtPreEntregaRollos): Observable<any> {
   return this.http.post(this.rutaPlasticaribeAPI + '/DetallePreEntrega_RolloDespacho', data);
  }

  deleteRollosPreEntregados(id : any) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/DetallePreEntrega_RolloDespacho/EliminarRollo/${id}`);
  }
}
