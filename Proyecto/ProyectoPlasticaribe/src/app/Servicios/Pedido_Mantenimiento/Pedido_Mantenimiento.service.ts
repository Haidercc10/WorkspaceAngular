import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelPedidoMantenimiento } from 'src/app/Modelo/modelPedidoMantenimiento';
import { rutaPlasticaribeAPI } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})

export class Pedido_MantenimientoService {

  constructor(private http : HttpClient) { }

  getUltimoIdPedido = () => this.http.get<any>(rutaPlasticaribeAPI + `/Pedido_Mantenimiento/getUltimoIdPedido`);

  Put = (id:number|String, data:any) => this.http.put(rutaPlasticaribeAPI + `/Pedido_Mantenimiento/${id}`, data);

  Delete = (id:number|String) => this.http.delete(rutaPlasticaribeAPI + `/Pedido_Mantenimiento/${id}`);

  Insert = (data : modelPedidoMantenimiento): Observable<any> => this.http.post(rutaPlasticaribeAPI + '/Pedido_Mantenimiento', data);

}
