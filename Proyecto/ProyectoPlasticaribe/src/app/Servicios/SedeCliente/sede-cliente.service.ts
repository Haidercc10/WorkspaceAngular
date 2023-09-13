import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { this.rutaPlasticaribeAPI, } from 'src/polyfills';
import { modelSedesClientes } from '../../Modelo/modelSedesClientes';

@Injectable({
  providedIn: 'root'
})
export class SedeClienteService {

  constructor(private http : HttpClient,) { }

  srvObtenerLista = ():Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + '/SedesClientes');

  srvObtenerListaPorId = (id : number) => this.http.get<any>(this.rutaPlasticaribeAPI + `/SedesClientes/${id}`);

  srvObtenerListaPorCliente = (id : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/SedesClientes/cliente/${id}`);

  srvObtenerListaPorNombreCliente = (nombre : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/SedesClientes/clienteNombre/${nombre}`);

  srvObtenerListaPorClienteSede = (cliente : any, ciudad : any, direccion : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/SedesClientes/clienteSede/${cliente}/${ciudad}/${direccion}`);

  GetSedesCliente = (cliente : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/SedesClientes/getSedesCliente/${cliente}`);

  GetDireccionesCliente = (cliente : number, ciudad : string) => this.http.get<any>(this.rutaPlasticaribeAPI + `/SedesClientes/getDireccionesCliente/${cliente}/${ciudad}`);

  GetSedeCliente = (cod : string, ciudad : string, direccion : string) : any => this.http.get<any>(this.rutaPlasticaribeAPI + `/SedesClientes/getSedeCliente/${cod}/${ciudad}/${direccion}`);

  srvGuardar = (data : modelSedesClientes): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/SedesClientes', data);
}
