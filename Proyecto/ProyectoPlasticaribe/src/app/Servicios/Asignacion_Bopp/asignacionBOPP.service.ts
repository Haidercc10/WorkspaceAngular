import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { modelAsignacionBOPP } from '../../Modelo/modelAsignacionBOPP';

@Injectable( { providedIn: 'root' } )

export class AsignacionBOPPService {

  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

  constructor(private http : HttpClient,) { }

  srvObtenerLista = ():Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + '/Asignacion_BOPP');

  srvObtenerListaPorId = (id : any):Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + `/Asignacion_BOPP/${id}`);

  srvObtenerListaUltimoId = ():Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + `/Asignacion_BOPP/ultimoId`);

  srvGuardar = (data: modelAsignacionBOPP): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/Asignacion_BOPP', data);

}
