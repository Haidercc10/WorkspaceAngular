import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TipoProductoService {
  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;
  constructor(private http : HttpClient,) { }

  srvObtenerLista = ():Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + '/Tipo_Producto');

  srvObtenerListaPorNombreTipoProducto = (nombre : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Tipo_Producto/nombreTipoProducto/${nombre}`);
}
