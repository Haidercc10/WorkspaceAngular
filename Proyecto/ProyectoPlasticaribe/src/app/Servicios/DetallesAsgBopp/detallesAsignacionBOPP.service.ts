import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { modelDetallesAsignacionBopp } from '../../Modelo/modelDetallesAsignacionBopp';

@Injectable( { providedIn: 'root' } )

export class DetalleAsignacion_BOPPService {

  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

  constructor(private http : HttpClient,) { }

  srvObtenerListaPorOt = (id : any):Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleAsignacion_BOPP/OT/${id}`);

  srvGuardar = (data: modelDetallesAsignacionBopp): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/DetalleAsignacion_BOPP', data);

}
