import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { modelClienteProductos } from '../../Modelo/modelClientesProductos';

@Injectable({
  providedIn: 'root'
})
export class ClientesProductosService {

  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

  constructor(private http : HttpClient,) { }

  srvObtenerListaPorNombreCliente = (id : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Cliente_Producto/IdCliente/${id}`);

  srvGuardar = (data : modelClienteProductos): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/Cliente_Producto', data);

}
