import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelPedidoMantenimiento } from 'src/app/Modelo/modelPedidoMantenimiento';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

export class Pedido_MantenimientoService {

  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

  constructor(private http : HttpClient) { }

  getUltimoIdPedido = () => this.http.get<any>(this.rutaPlasticaribeAPI + `/Pedido_Mantenimiento/getUltimoIdPedido`);

  Put = (id:number|String, data:any) => this.http.put(this.rutaPlasticaribeAPI + `/Pedido_Mantenimiento/${id}`, data);

  Delete = (id:number|String) => this.http.delete(this.rutaPlasticaribeAPI + `/Pedido_Mantenimiento/${id}`);

  Insert = (data : modelPedidoMantenimiento): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/Pedido_Mantenimiento', data);

}
