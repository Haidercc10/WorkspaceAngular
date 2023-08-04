import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI } from 'src/polyfills';
import { modelAsignacionRollos_Extrusion } from '../../Modelo/modelAsignacionRollos_Extrusion';

@Injectable({
  providedIn: 'root'
})
export class AsignacionRollos_ExtrusionService {

  constructor(private http : HttpClient,) { }

  srvObtenerLista = () => this.http.get<any>(rutaPlasticaribeAPI + '/AsignacionRollos_Extrusion');
    
  srvObtenerListaPorId = (dato : any) => this.http.get<any>(rutaPlasticaribeAPI + `/AsignacionRollos_Extrusion/${dato}`);

  obtenerUltimoId = () => this.http.get<any>(rutaPlasticaribeAPI + `/AsignacionRollos_Extrusion/getObtenerUltimoID`);

  srvActualizar = (id:number|string, data:any) =>this.http.put(rutaPlasticaribeAPI + `/AsignacionRollos_Extrusion/${id}`, data);

  srvEliminar = (id:number|string) => this.http.delete(rutaPlasticaribeAPI + `/AsignacionRollos_Extrusion/${id}`);

  srvGuardar = (data : modelAsignacionRollos_Extrusion) : Observable<any> => this.http.post(rutaPlasticaribeAPI + '/AsignacionRollos_Extrusion', data);

}
