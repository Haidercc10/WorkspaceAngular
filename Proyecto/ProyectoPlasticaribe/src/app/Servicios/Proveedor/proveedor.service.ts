import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { modelProveedor } from '../../Modelo/modelProveedor';

@Injectable({
  providedIn: 'root'
})
export class ProveedorService {

  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

  constructor(private http : HttpClient,) { }

  srvObtenerLista = ():Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + '/Proveedor');

  srvObtenerListaPorId = (id : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Proveedor/${id}`);

  getProveedorLike = (nombre : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Proveedor/getProveedorLike/${nombre}`);

  srvGuardar = (data : modelProveedor): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/Proveedor', data);

}
