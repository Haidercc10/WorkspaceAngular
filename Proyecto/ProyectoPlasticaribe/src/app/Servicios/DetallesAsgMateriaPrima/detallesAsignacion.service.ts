import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { modelDetallesAsignacion } from '../../Modelo/modelDetallesAsignacion';

@Injectable({
  providedIn: 'root'
})
export class DetallesAsignacionService {

  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

  constructor(private http : HttpClient,) { }

  srvObtenerLista = ():Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + '/DetalleAsignacion_MateriaPrima');

  srvObtenerListaPorAsigId = (asignacion : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleAsignacion_MateriaPrima/asignacion/${asignacion}`);

  srvObtenerListaPorAsignacionesOT = (ot : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleAsignacion_MateriaPrima/AsignacionesTotales/${ot}`);

  getMateriasPrimasAsignadas = (ot : number) => this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleAsignacion_MateriaPrima/getMateriaPrimaAsignada/${ot}`);
    
  srvGuardar = (data : modelDetallesAsignacion): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/DetalleAsignacion_MateriaPrima', data);
  
  GetAsignacionesConSolicitudes = (idSolicitud : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleAsignacion_MateriaPrima/getAsignacionesConSolicitudes/${idSolicitud}`);
}
