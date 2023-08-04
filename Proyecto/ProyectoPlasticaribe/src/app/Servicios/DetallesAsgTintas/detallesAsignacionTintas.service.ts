import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI, } from 'src/polyfills';
import { modelDetallesAsignacionTintas } from '../../Modelo/modelDetallesAsignacionTintas';

@Injectable({
  providedIn: 'root'
})
export class DetallesAsignacionTintasService {

  constructor(private http : HttpClient,) { }

  srvGuardar = (data : modelDetallesAsignacionTintas): Observable<any> => this.http.post(rutaPlasticaribeAPI + '/DetalleAsignacion_Tinta', data);
}
