import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI, } from 'src/polyfills';
import { modelClienteProductos } from '../../Modelo/modelClientesProductos';

@Injectable({
  providedIn: 'root'
})
export class ClientesProductosService {

  constructor(private http : HttpClient,) { }

  srvObtenerListaPorNombreCliente = (id : any) => this.http.get<any>(rutaPlasticaribeAPI + `/Cliente_Producto/IdCliente/${id}`);

  srvGuardar = (data : modelClienteProductos): Observable<any> => this.http.post(rutaPlasticaribeAPI + '/Cliente_Producto', data);

}
