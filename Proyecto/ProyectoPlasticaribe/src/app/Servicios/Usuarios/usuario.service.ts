import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { modelUsuario } from '../../Modelo/modelUsuario';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

  constructor(private http : HttpClient,) { }

  srvObtenerListaUsuario = () => this.http.get<any>(this.rutaPlasticaribeAPI + '/Usuarios');

  srvObtenerListaPorId = (id : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Usuarios/${id}`);

  srvObtenerListaPorNombreUsuario = (nombre : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Usuarios/nombreUsuario/${nombre}`);

  srvObtenerListaPorIdConductor = (id : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Usuarios/UsuarioConductor/${id}`);

  GetConsdutores = () => this.http.get<any>(this.rutaPlasticaribeAPI + `/Usuarios/getConductores`);

  getUsuariosxId = (id : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Usuarios/UsuariosxId/${id}`);

  getUsuarios = () => this.http.get<any>(this.rutaPlasticaribeAPI + `/Usuarios/UsuariosSinParametros`);

  GetVendedores = () => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Usuarios/getVendedores`);

  GetWorkers = (start: any, end: any, areas: string) => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Usuarios/getTrabajadores/${start}/${end}/${areas}`);

  srvActualizarUsuario = (id:number|String, data:any) => this.http.put(this.rutaPlasticaribeAPI + `/Usuarios/${id}`, data);

  srvEliminarUsuario = (id:number|String) => this.http.delete(this.rutaPlasticaribeAPI + `/Usuarios/${id}`);

  srvGuardarUsuario = (data : modelUsuario): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/Usuarios', data);

  GetOperariosProduccion = () => this.http.get<any>(this.rutaPlasticaribeAPI + `/Usuarios/getOperariosProduccion`);

  getEmployees = (data : string) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Usuarios/getEmployees/${data}`);
}
