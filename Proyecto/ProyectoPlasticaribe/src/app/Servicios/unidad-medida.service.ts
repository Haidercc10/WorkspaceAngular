import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelUnidadMedida } from '../Modelo/modelUnidadMedida';

@Injectable({
  providedIn: 'root'
})
export class UnidadMedidaService {

  readonly rutaPlasticaribeAPI = "http://192.168.0.153:9085/api";

  constructor(private http : HttpClient) { }

  //Metodo buscar lista de Productos
  srvObtenerLista():Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/Unidad_Medida')
  }

  //Metodo agregar Productos
  srvAgregar(data:any) {
    return this.http.post(this.rutaPlasticaribeAPI + '/Unidad_Medida', data)
  }

  //Metodo actualzar Productos
  srvActualizar(id:number|String, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/Unidad_Medida/${id}`, data);
  }

  //Metodo eliminar Productos
  srvEliminar(id:number|String) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/Unidad_Medida/${id}`);
  }

  //
  srvGuardar(data : modelUnidadMedida): Observable<any> {
    return this.http.post(this.rutaPlasticaribeAPI + '/Unidad_Medida', data)
  }
}
