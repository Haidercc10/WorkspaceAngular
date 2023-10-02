import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { modelCliente } from '../../Modelo/modelCliente';

@Injectable({
  providedIn: 'root'
})

export class ClientesService {

  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

  constructor(private http : HttpClient,) { }

  srvObtenerLista = ():Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + '/Clientes');

  srvObtenerListaPorId = (id : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Clientes/${id}`);

  srvObtenerListaPorEstado = (id : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Clientes/estadoId/${id}`);

  srvObtenerListaPorNombreCliente = (nombre : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Clientes/nombreCliente/${nombre}`);

  GetClientesVendedores = (vendedor : number, nombre : string) : Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Clientes/getClientesVendedores_LikeNombre/${vendedor}/${nombre}`);

  srvActualizar = (id:number|String, data:any) => this.http.put(this.rutaPlasticaribeAPI + `/Clientes/${id}`, data);

  PutEstadoCliente = (id:number|String, estado:any) => this.http.put(this.rutaPlasticaribeAPI + `/Clientes/putEstadoCliente/${id}?estado=${estado}`, estado);

  srvEliminar = (id:number|String) => this.http.delete(this.rutaPlasticaribeAPI + `/Clientes/${id}`);

  srvGuardar = (data : modelCliente): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/Clientes', data);

  LikeGetCliente = (dato : string): Observable<any> => this.http.get<any>(this.rutaPlasticaribeAPI + `/Clientes/LikeGetClientes/${dato}`);
}
