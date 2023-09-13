import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { modelAsignacionRollos_Extrusion } from '../../Modelo/modelAsignacionRollos_Extrusion';

@Injectable({
  providedIn: 'root'
})
export class AsignacionRollos_ExtrusionService {

  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

  constructor(private http : HttpClient,) { }

  srvObtenerLista = () => this.http.get<any>(this.rutaPlasticaribeAPI + '/AsignacionRollos_Extrusion');
    
  srvObtenerListaPorId = (dato : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/AsignacionRollos_Extrusion/${dato}`);

  obtenerUltimoId = () => this.http.get<any>(this.rutaPlasticaribeAPI + `/AsignacionRollos_Extrusion/getObtenerUltimoID`);

  srvActualizar = (id:number|string, data:any) =>this.http.put(this.rutaPlasticaribeAPI + `/AsignacionRollos_Extrusion/${id}`, data);

  srvEliminar = (id:number|string) => this.http.delete(this.rutaPlasticaribeAPI + `/AsignacionRollos_Extrusion/${id}`);

  srvGuardar = (data : modelAsignacionRollos_Extrusion) : Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/AsignacionRollos_Extrusion', data);

}
