import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { this.rutaPlasticaribeAPI, } from 'src/polyfills';
import { modelClienteProductos } from '../../Modelo/modelClientesProductos';

@Injectable({
  providedIn: 'root'
})
export class ClientesProductosService {

  constructor(private http : HttpClient,) { }

  srvObtenerListaPorNombreCliente = (id : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Cliente_Producto/IdCliente/${id}`);

  srvGuardar = (data : modelClienteProductos): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/Cliente_Producto', data);

}
