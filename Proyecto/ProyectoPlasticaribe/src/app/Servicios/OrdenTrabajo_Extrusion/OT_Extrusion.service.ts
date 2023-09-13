import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { this.rutaPlasticaribeAPI, } from 'src/polyfills';
import { modelOT_Extrusion } from '../../Modelo/modelOT_Extrusion';

@Injectable({
  providedIn: 'root'
})
export class OT_ExtrusionService {

  constructor(private http : HttpClient,) { }

  srvObtenerListaOrden_Trabajo = () => this.http.get<any>(this.rutaPlasticaribeAPI + '/OT_Extrusion');

  GetOT_Extrusion = (ot : number) => this.http.get<any>(this.rutaPlasticaribeAPI + `/OT_Extrusion/getOT_Extrusion/${ot}`);

  srvObtenerListaPorId = (dato : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/OT_Extrusion/${dato}`);
  
  srvActualizar = (id:number|string, data:any) => this.http.put(this.rutaPlasticaribeAPI + `/OT_Extrusion/${id}`, data);
  
  srvEliminar = (id:number|string) => this.http.delete(this.rutaPlasticaribeAPI + `/OT_Extrusion/${id}`);

  srvGuardar = (data : modelOT_Extrusion): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/OT_Extrusion', data);
}
