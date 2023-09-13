import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { this.rutaPlasticaribeAPI, } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})
export class UnidadMedidaService {

  constructor(private http : HttpClient,) { }

  srvObtenerLista = ():Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + '/Unidad_Medida');

  srvAgregar = (data:any) => this.http.post(this.rutaPlasticaribeAPI + '/Unidad_Medida', data);

  srvActualizar = (id:number|String, data:any) => this.http.put(this.rutaPlasticaribeAPI + `/Unidad_Medida/${id}`, data);

  srvEliminar = (id:number|String) => this.http.delete(this.rutaPlasticaribeAPI + `/Unidad_Medida/${id}`);
}
