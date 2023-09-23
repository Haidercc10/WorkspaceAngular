import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { modelDevolucionMP } from '../../Modelo/modelDevolucionMP';

@Injectable({
  providedIn: 'root'
})
export class DevolucionesMPService {

  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

  constructor(private http : HttpClient,) { }

  srvObtenerListaPorDevId = (id : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleDevolucion_MateriaPrima/devolucion/${id}`);

  srvObtenerConsultaMov2 = (ot : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleDevolucion_MateriaPrima/consultaMovimientos2/${ot}`);

  srvGuardar = (data : modelDevolucionMP): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/DetalleDevolucion_MateriaPrima', data);
}
