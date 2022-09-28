import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI } from 'src/polyfills';
import { modelDtPreEntregaRollos } from '../Modelo/modelDtPreEntregaRollo';

@Injectable({
  providedIn: 'root'
})
export class DtPreEntregaRollosService {

  readonly rutaPlasticaribeAPI =  rutaPlasticaribeAPI; /*"https://localhost:7137/api"*/;

  //Encapsular httpclient en el constructor
  constructor(private http: HttpClient) { }

  srvObtenerLista() {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/DetallePreEntrega_RolloDespacho');
  }


  srvCrearPDFUltimoId(id : number) {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetallePreEntrega_RolloDespacho/CrearPDFUltimoID/${id}`);
  }

  srvObtenerVerificarRollo(dato : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetallePreEntrega_RolloDespacho/VerificarRollo/${dato}`);
  }

  srvObtenerListaPorId(dato : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetallePreEntrega_RolloDespacho/${dato}`);
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

}
