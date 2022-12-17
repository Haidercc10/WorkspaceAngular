import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI } from 'src/polyfills';

@Injectable({
    providedIn: 'root'
  })

export class SrvPedido_MttoService {

constructor(private http : HttpClient) { }

readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

getPedidoMtto(id : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Pedido_Mantenimiento/getDatosCompletos/${id}`);
  }



}
