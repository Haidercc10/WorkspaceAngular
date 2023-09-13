import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { this.rutaPlasticaribeAPI, } from 'src/polyfills';
import { modelTipoProveedor } from '../../Modelo/modelTipoProveedor';

@Injectable({
  providedIn: 'root'
})
export class Tipo_ProveedorService {

  constructor(private http : HttpClient,) { }

  srvObtenerLista = ():Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + '/Tipo_Proveedor');
}
