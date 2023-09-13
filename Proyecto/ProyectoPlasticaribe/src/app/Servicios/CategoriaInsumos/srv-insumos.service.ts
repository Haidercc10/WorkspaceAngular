import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelProveedor } from '../../Modelo/modelProveedor';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SrvInsumosService {

  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;
  
  constructor(private http : HttpClient,) { }
  
  srvObtenerLista = ():Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + '/Categoria_Insumo');

  srvObtenerListaPorId = (id : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Categoria_Insumo/${id}`);

  srvAgregar = (data:any) => this.http.post(this.rutaPlasticaribeAPI + '/Categoria_Insumo', data);

  srvActualizar = (id:number|String, data:any) => this.http.put(this.rutaPlasticaribeAPI + `/Categoria_Insumo/${id}`, data);

  srvEliminar = (id:number|String) => this.http.delete(this.rutaPlasticaribeAPI + `/Categoria_Insumo/${id}`);

  srvGuardar = (data : modelProveedor): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/Categoria_Insumo', data);
}
