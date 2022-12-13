import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelDtPedidoMantenimiento } from 'src/app/Modelo/modelDtPedidoMantenimiento';
import { rutaPlasticaribeAPI } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})

export class DetallePedido_MantenimientoService {

    readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

    constructor(private http : HttpClient) { }

    GetTodo():Observable<any[]> {
        return this.http.get<any>(this.rutaPlasticaribeAPI + '/DetallePedido_Mantenimiento')
    }

    Put(id:number|String, data:any) {
      return this.http.put(this.rutaPlasticaribeAPI + `/DetallePedido_Mantenimiento/${id}`, data);
    }

    Delete(id:number|String) {
      return this.http.delete(this.rutaPlasticaribeAPI + `/DetallePedido_Mantenimiento/${id}`);
    }

    Insert(data : modelDtPedidoMantenimiento): Observable<any> {
      return this.http.post(this.rutaPlasticaribeAPI + '/DetallePedido_Mantenimiento', data);
    }

}
