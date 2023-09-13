import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { this.rutaPlasticaribeAPI, } from 'src/polyfills';
import { modelTipoProducto } from '../../Modelo/modelTipoProducto';

@Injectable({
  providedIn: 'root'
})
export class TipoProductoService {

  constructor(private http : HttpClient,) { }

  srvObtenerLista = ():Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + '/Tipo_Producto');

  srvObtenerListaPorNombreTipoProducto = (nombre : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Tipo_Producto/nombreTipoProducto/${nombre}`);
}
