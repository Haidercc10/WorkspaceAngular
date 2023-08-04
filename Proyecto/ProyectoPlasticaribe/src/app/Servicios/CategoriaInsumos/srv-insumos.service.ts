import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelProveedor } from '../../Modelo/modelProveedor';
import { rutaPlasticaribeAPI } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})
export class SrvInsumosService {
  
  constructor(private http : HttpClient,) { }
  
  srvObtenerLista = ():Observable<any[]> => this.http.get<any>(rutaPlasticaribeAPI + '/Categoria_Insumo');

  srvObtenerListaPorId = (id : any) => this.http.get<any>(rutaPlasticaribeAPI + `/Categoria_Insumo/${id}`);

  srvAgregar = (data:any) => this.http.post(rutaPlasticaribeAPI + '/Categoria_Insumo', data);

  srvActualizar = (id:number|String, data:any) => this.http.put(rutaPlasticaribeAPI + `/Categoria_Insumo/${id}`, data);

  srvEliminar = (id:number|String) => this.http.delete(rutaPlasticaribeAPI + `/Categoria_Insumo/${id}`);

  srvGuardar = (data : modelProveedor): Observable<any> => this.http.post(rutaPlasticaribeAPI + '/Categoria_Insumo', data);
}
