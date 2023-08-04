import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI, } from 'src/polyfills';
import { modelDetallesAsignacion } from '../../Modelo/modelDetallesAsignacion';

@Injectable({
  providedIn: 'root'
})
export class DetallesAsignacionService {

  constructor(private http : HttpClient,) { }

  srvObtenerLista = ():Observable<any[]> => this.http.get<any>(rutaPlasticaribeAPI + '/DetalleAsignacion_MateriaPrima');

  srvObtenerListaPorAsigId = (asignacion : any) => this.http.get<any>(rutaPlasticaribeAPI + `/DetalleAsignacion_MateriaPrima/asignacion/${asignacion}`);

  srvObtenerListaPorAsignacionesOT = (ot : any) => this.http.get<any>(rutaPlasticaribeAPI + `/DetalleAsignacion_MateriaPrima/AsignacionesTotales/${ot}`);

  getMateriasPrimasAsignadas = (ot : number) => this.http.get<any>(rutaPlasticaribeAPI + `/DetalleAsignacion_MateriaPrima/getMateriaPrimaAsignada/${ot}`);
    
  srvGuardar = (data : modelDetallesAsignacion): Observable<any> => this.http.post(rutaPlasticaribeAPI + '/DetalleAsignacion_MateriaPrima', data);
  
  GetAsignacionesConSolicitudes = (idSolicitud : any) => this.http.get<any>(rutaPlasticaribeAPI + `/DetalleAsignacion_MateriaPrima/getAsignacionesConSolicitudes/${idSolicitud}`);
}
