import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI, } from 'src/polyfills';
import { modelCliente } from '../../Modelo/modelCliente';

@Injectable({
  providedIn: 'root'
})

export class ClientesService {

  constructor(private http : HttpClient,) { }

  srvObtenerLista = ():Observable<any[]> => this.http.get<any>(rutaPlasticaribeAPI + '/Clientes');

  srvObtenerListaPorId = (id : any) => this.http.get<any>(rutaPlasticaribeAPI + `/Clientes/${id}`);

  srvObtenerListaPorEstado = (id : any) => this.http.get<any>(rutaPlasticaribeAPI + `/Clientes/estadoId/${id}`);

  srvObtenerListaPorNombreCliente = (nombre : any) => this.http.get<any>(rutaPlasticaribeAPI + `/Clientes/nombreCliente/${nombre}`);

  GetClientesVendedores = (vendedor : number, nombre : string) : Observable<any> => this.http.get<any>(`${rutaPlasticaribeAPI}/Clientes/getClientesVendedores_LikeNombre/${vendedor}/${nombre}`);

  srvActualizar = (id:number|String, data:any) => this.http.put(rutaPlasticaribeAPI + `/Clientes/${id}`, data);

  PutEstadoCliente = (id:number|String, estado:any) => this.http.put(rutaPlasticaribeAPI + `/Clientes/putEstadoCliente/${id}`, estado);

  srvEliminar = (id:number|String) => this.http.delete(rutaPlasticaribeAPI + `/Clientes/${id}`);

  srvGuardar = (data : modelCliente): Observable<any> => this.http.post(rutaPlasticaribeAPI + '/Clientes', data);

  LikeGetCliente = (dato : string): Observable<any> => this.http.get<any>(rutaPlasticaribeAPI + `/Clientes/LikeGetClientes/${dato}`);
}
