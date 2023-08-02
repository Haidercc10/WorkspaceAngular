import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI, } from 'src/polyfills';
import { modelUsuario } from '../../Modelo/modelUsuario';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  constructor(private http : HttpClient,) { }

  srvObtenerListaUsuario = () => this.http.get<any>(rutaPlasticaribeAPI + '/Usuarios')

  GetLoginUsuario = (usuario : number, contrasena : string, empresa : number) => this.http.get<any>(rutaPlasticaribeAPI + `/Usuarios/getLoginUsuario/${usuario}/${contrasena}/${empresa}`);
  
  srvObtenerListaPorId = (id : any) => this.http.get<any>(rutaPlasticaribeAPI + `/Usuarios/${id}`);

  srvObtenerListaPorNombreUsuario = (nombre : any) => this.http.get<any>(rutaPlasticaribeAPI + `/Usuarios/nombreUsuario/${nombre}`);

  srvObtenerListaPorIdConductor = (id : any) => this.http.get<any>(rutaPlasticaribeAPI + `/Usuarios/UsuarioConductor/${id}`);

  GetConsdutores = () => this.http.get<any>(rutaPlasticaribeAPI + `/Usuarios/getConductores`);

  GetVendedores = () => this.http.get<any>(`${rutaPlasticaribeAPI}/Usuarios/getVendedores`);

  srvActualizarUsuario = (id:number|String, data:any) => this.http.put(rutaPlasticaribeAPI + `/Usuarios/${id}`, data);
  
  srvEliminarUsuario = (id:number|String) => this.http.delete(rutaPlasticaribeAPI + `/Usuarios/${id}`);

  srvGuardarUsuario = (data : modelUsuario): Observable<any> => this.http.post(rutaPlasticaribeAPI + '/Usuarios', data);

  getUsuariosxId = (id : any) => this.http.get<any>(rutaPlasticaribeAPI + `/Usuarios/UsuariosxId/${id}`);

  getUsuarios = () => this.http.get<any>(rutaPlasticaribeAPI + `/Usuarios/UsuariosSinParametros`);

  getIpCliente = () : Observable<any> => this.http.get<any>('http://api.ipify.org/');
}
