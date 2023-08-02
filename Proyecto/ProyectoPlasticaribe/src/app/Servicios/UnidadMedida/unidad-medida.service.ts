import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI, } from 'src/polyfills';
import { modelUnidadMedida } from '../../Modelo/modelUnidadMedida';

@Injectable({
  providedIn: 'root'
})
export class UnidadMedidaService {

  constructor(private http : HttpClient,) { }

  srvObtenerLista = ():Observable<any[]> => this.http.get<any>(rutaPlasticaribeAPI + '/Unidad_Medida');

  srvAgregar = (data:any) => this.http.post(rutaPlasticaribeAPI + '/Unidad_Medida', data);

  srvActualizar = (id:number|String, data:any) => this.http.put(rutaPlasticaribeAPI + `/Unidad_Medida/${id}`, data);

  srvEliminar = (id:number|String) => this.http.delete(rutaPlasticaribeAPI + `/Unidad_Medida/${id}`);
}
