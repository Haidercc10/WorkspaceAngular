import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { this.rutaPlasticaribeAPI, } from 'src/polyfills';
import { modelRol } from '../../Modelo/modelRol';

@Injectable({
  providedIn: 'root'
})

export class RolesService {

  constructor(private http : HttpClient,) { }

  srvObtenerLista = ():Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + '/Rol_Usuario');

  srvObtenerListaPorId = (id : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Rol_Usuario/${id}`);

  getRolxNombre = (nombre : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Rol_Usuario/getNombreRol/${nombre}`);

  likeGetNombre = (nombre : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Rol_Usuario/getNombreRolxLike/${nombre}`);

  srvActualizar = (id:number|String, data:any) => this.http.put(this.rutaPlasticaribeAPI + `/Rol_Usuario/${id}`, data);

  srvGuardar = (data : modelRol): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/Rol_Usuario', data);

}
