import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI, } from 'src/polyfills';
import { modelDevolucionMP } from '../../Modelo/modelDevolucionMP';

@Injectable({
  providedIn: 'root'
})
export class DevolucionesMPService {

  constructor(private http : HttpClient,) { }

  srvObtenerListaPorDevId = (id : any) => this.http.get<any>(rutaPlasticaribeAPI + `/DetalleDevolucion_MateriaPrima/devolucion/${id}`);

  srvObtenerConsultaMov2 = (ot : any) => this.http.get<any>(rutaPlasticaribeAPI + `/DetalleDevolucion_MateriaPrima/consultaMovimientos2/${ot}`);

  srvGuardar = (data : modelDevolucionMP): Observable<any> => this.http.post(rutaPlasticaribeAPI + '/DetalleDevolucion_MateriaPrima', data);
}
