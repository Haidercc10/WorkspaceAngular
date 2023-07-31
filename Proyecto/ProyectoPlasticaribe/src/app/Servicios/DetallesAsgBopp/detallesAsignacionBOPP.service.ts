import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI, } from 'src/polyfills';
import { modelDetallesAsignacionBopp } from '../../Modelo/modelDetallesAsignacionBopp';

@Injectable( { providedIn: 'root' } )

export class DetalleAsignacion_BOPPService {

  constructor(private http : HttpClient,) { }

  srvObtenerListaPorOt = (id : any):Observable<any[]> => this.http.get<any>(rutaPlasticaribeAPI + `/DetalleAsignacion_BOPP/OT/${id}`);

  srvGuardar = (data: modelDetallesAsignacionBopp): Observable<any> => this.http.post(rutaPlasticaribeAPI + '/DetalleAsignacion_BOPP', data);

}
