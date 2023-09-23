import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { modelCategoria_Archivo } from '../../Modelo/modelCategoria_Archivo';

@Injectable({
  providedIn: 'root'
})
export class Categorias_ArchivosService {

  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

  constructor(private http : HttpClient,) { }

  srvObtenerLista = ():Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + '/Categorias_Archivos');

  srvObtenerListaPorId = (dato : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Categorias_Archivos/${dato}`);

  srvActualizar = (id:number|String, data:any) => this.http.put(this.rutaPlasticaribeAPI + `/Categorias_Archivos/${id}`, data);

  srvEliminar = (id:number|String) => this.http.delete(this.rutaPlasticaribeAPI + `/Categorias_Archivos/${id}`);

  srvGuardar = (data : modelCategoria_Archivo): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/Categorias_Archivos', data);
}
