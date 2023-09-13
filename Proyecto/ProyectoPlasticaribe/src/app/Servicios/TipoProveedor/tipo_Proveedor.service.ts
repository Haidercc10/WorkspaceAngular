import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { modelTipoProveedor } from '../../Modelo/modelTipoProveedor';

@Injectable({
  providedIn: 'root'
})
export class Tipo_ProveedorService {
  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;
  constructor(private http : HttpClient,) { }
 
  srvObtenerLista = ():Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + '/Tipo_Proveedor');
}
