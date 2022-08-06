import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribe3, rutaPlasticaribeAPI } from 'src/polyfills';
import { modelRemisionMP } from '../Modelo/modelRemisionMP';

@Injectable({
  providedIn: 'root'
})
export class RemisionesMPService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient) { }

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
