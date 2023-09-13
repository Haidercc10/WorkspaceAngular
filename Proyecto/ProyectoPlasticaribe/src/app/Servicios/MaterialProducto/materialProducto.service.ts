import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from 'src/environments/environment';
import { modelMaterial } from '../../Modelo/modelMaterial';

@Injectable({
  providedIn: 'root'
})
export class MaterialProductoService {

  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

  constructor(private http : HttpClient,) { }

  srvObtenerLista = ():Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + '/Material_MatPrima');

  srvObtenerListaPorId = (id : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Material_MatPrima/${id}`);

  srvObtenerListaPorNombreMaterial = (nombre : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Material_MatPrima/nombreMaterial/${nombre}`);

  srvAgregar = (data:any) => this.http.post(this.rutaPlasticaribeAPI + '/Material_MatPrima', data);

  srvActualizar = (id:number|String, data:any) => this.http.put(this.rutaPlasticaribeAPI + `/Material_MatPrima/${id}`, data);

  srvEliminar = (id:number|String) => this.http.delete(this.rutaPlasticaribeAPI + `/Material_MatPrima/${id}`);

  srvGuardar = (data : modelMaterial): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/Material_MatPrima', data);
}
