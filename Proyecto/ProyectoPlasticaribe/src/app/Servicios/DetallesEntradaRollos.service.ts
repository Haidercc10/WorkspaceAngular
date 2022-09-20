import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI } from 'src/polyfills';
import { modelDtEntradaRollos } from '../Modelo/modelDtEntradaRollos';

@Injectable({
  providedIn: 'root'
})
export class DetallesEntradaRollosService {

  readonly rutaPlasticaribeAPI =  rutaPlasticaribeAPI; /*"https://localhost:7137/api"*/;

  //Encapsular httpclient en el constructor
  constructor(private http: HttpClient) { }

  srvObtenerLista() {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/DetalleEntradaRollo_Producto');
  }

  srvObtenerListaPorId(dato : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleEntradaRollo_Producto/${dato}`);
  }

  srvObtenerVerificarRollo(dato : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleEntradaRollo_Producto/VerificarRollo/${dato}`);
  }

  srvActualizar(id:number|string, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/DetalleEntradaRollo_Producto/${id}`, data);
  }

  srvEliminar(id:number|string) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/DetalleEntradaRollo_Producto/${id}`);
  }

  srvGuardar(data : modelDtEntradaRollos): Observable<any> {
   return this.http.post(this.rutaPlasticaribeAPI + '/DetalleEntradaRollo_Producto', data);
  }

}
