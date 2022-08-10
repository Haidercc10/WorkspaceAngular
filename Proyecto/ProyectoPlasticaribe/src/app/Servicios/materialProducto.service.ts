import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { rutaPlasticaribeAPI } from 'src/polyfills';
import { modelMaterial } from '../Modelo/modelMaterial';

@Injectable({
  providedIn: 'root'
})
export class MaterialProductoService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  constructor(private http : HttpClient) { }

  //Metodo buscar lista de Materiales
  srvObtenerLista():Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/Material_MatPrima');
  }

  srvObtenerListaPorId(id : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Material_MatPrima/${id}`);
  }

  srvObtenerListaPorNombreMaterial(nombre : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Material_MatPrima/nombreMaterial/${nombre}`);
  }


  //Metodo agregar Materiales
  srvAgregar(data:any) {
    return this.http.post(this.rutaPlasticaribeAPI + '/Material_MatPrima', data)
  }

  //Metodo actualzar Materiales
  srvActualizar(id:number|String, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/Material_MatPrima/${id}`, data);
  }

  //Metodo eliminar Materiales
  srvEliminar(id:number|String) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/Material_MatPrima/${id}`);
  }

  //
  srvGuardar(data : modelMaterial): Observable<any> {
    return this.http.post(this.rutaPlasticaribeAPI + '/Material_MatPrima', data)
  }

}
