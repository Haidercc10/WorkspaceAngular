import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI, } from 'src/polyfills';
import { modelProveedor } from '../../Modelo/modelProveedor';

@Injectable({
  providedIn: 'root'
})
export class ProveedorService {

  constructor(private http : HttpClient,) { }

  srvObtenerLista = ():Observable<any[]> => this.http.get<any>(rutaPlasticaribeAPI + '/Proveedor');

  srvObtenerListaPorId = (id : any) => this.http.get<any>(rutaPlasticaribeAPI + `/Proveedor/${id}`);

  getProveedorLike = (nombre : any) => this.http.get<any>(rutaPlasticaribeAPI + `/Proveedor/getProveedorLike/${nombre}`);

  srvGuardar = (data : modelProveedor): Observable<any> => this.http.post(rutaPlasticaribeAPI + '/Proveedor', data);

}
