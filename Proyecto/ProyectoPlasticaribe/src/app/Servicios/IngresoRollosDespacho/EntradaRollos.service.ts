import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI, } from 'src/polyfills';
import { modelEntradaRollos } from '../../Modelo/modelEntradaRollos';

@Injectable({
  providedIn: 'root'
})
export class EntradaRollosService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient,) { }

  srvObtenerLista() {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/EntradaRollo_Producto');
  }

  srvObtenerListaPorId(dato : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/EntradaRollo_Producto/${dato}`);
  }

  srvObtenerUltimoId(){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/EntradaRollo_Producto/UltumoID`);
  }

  srvActualizar(id:number|string, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/EntradaRollo_Producto/${id}`, data);
  }

  srvEliminar(id:number|string) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/EntradaRollo_Producto/${id}`);
  }

  srvGuardar(data : modelEntradaRollos): Observable<any> {
   return this.http.post(this.rutaPlasticaribeAPI + '/EntradaRollo_Producto', data);
  }
}
