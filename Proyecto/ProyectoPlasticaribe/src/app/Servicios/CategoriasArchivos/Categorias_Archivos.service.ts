import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI, } from 'src/polyfills';
import { modelCategoria_Archivo } from '../../Modelo/modelCategoria_Archivo';

@Injectable({
  providedIn: 'root'
})
export class Categorias_ArchivosService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient,) { }

  //Metodo buscar lista de
  srvObtenerLista():Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/Categorias_Archivos')
  }

  srvObtenerListaPorId(dato : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Categorias_Archivos/${dato}`);
  }

  //
  srvActualizar(id:number|String, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/Categorias_Archivos/${id}`, data);
  }

  //
  srvEliminar(id:number|String) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/Categorias_Archivos/${id}`);
  }

  //
  srvGuardar(data : modelCategoria_Archivo): Observable<any> {
  return this.http.post(this.rutaPlasticaribeAPI + '/Categorias_Archivos', data);
  }



}
