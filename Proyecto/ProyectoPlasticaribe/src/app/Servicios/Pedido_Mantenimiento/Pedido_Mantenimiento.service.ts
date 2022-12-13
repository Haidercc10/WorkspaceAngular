import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelPedidoMantenimiento } from 'src/app/Modelo/modelPedidoMantenimiento';
import { rutaPlasticaribeAPI } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})

export class Pedido_MantenimientoService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  constructor(private http : HttpClient) { }

  GetTodo():Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/Pedido_Mantenimiento')
  }

  getUltimoIdPedido() {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Pedido_Mantenimiento/getUltimoIdPedido`);
  }

  Put(id:number|String, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/Pedido_Mantenimiento/${id}`, data);
  }

  Delete(id:number|String) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/Pedido_Mantenimiento/${id}`);
  }

  Insert(data : modelPedidoMantenimiento): Observable<any> {
    return this.http.post(this.rutaPlasticaribeAPI + '/Pedido_Mantenimiento', data);
  }

}
