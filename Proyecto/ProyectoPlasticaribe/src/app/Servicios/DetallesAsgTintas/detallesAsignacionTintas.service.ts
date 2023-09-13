import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { modelDetallesAsignacionTintas } from '../../Modelo/modelDetallesAsignacionTintas';

@Injectable({
  providedIn: 'root'
})
export class DetallesAsignacionTintasService {

  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

  constructor(private http : HttpClient,) { }

  srvGuardar = (data : modelDetallesAsignacionTintas): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/DetalleAsignacion_Tinta', data);
}
