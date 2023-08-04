import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI, } from 'src/polyfills';
import { modelAsignacionBOPP } from '../../Modelo/modelAsignacionBOPP';

@Injectable( { providedIn: 'root' } )

export class AsignacionBOPPService {

  constructor(private http : HttpClient,) { }

  srvObtenerLista = ():Observable<any[]> => this.http.get<any>(rutaPlasticaribeAPI + '/Asignacion_BOPP');

  srvObtenerListaPorId = (id : any):Observable<any[]> => this.http.get<any>(rutaPlasticaribeAPI + `/Asignacion_BOPP/${id}`);

  srvObtenerListaUltimoId = ():Observable<any[]> => this.http.get<any>(rutaPlasticaribeAPI + `/Asignacion_BOPP/ultimoId`);

  srvGuardar = (data: modelAsignacionBOPP): Observable<any> => this.http.post(rutaPlasticaribeAPI + '/Asignacion_BOPP', data);

}
