import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { modelDetallesAsignacionMPxTintas } from '../../Modelo/modelDetallesAsignacionMPxTintas';

@Injectable({
  providedIn: 'root'
})
export class DetallesAsignacionMPxTintasService {

  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

  constructor(private http : HttpClient,) { }

  GetTintasCreadasMes = (fecha1 : any, fecha2 : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleAsignacion_MatPrimaXTinta/getTintasCreadasMes/${fecha1}/${fecha2}`);

  GetMateriasPrimasCrearTintasMes = (fecha1 : any, fecha2 : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/DetalleAsignacion_MatPrimaXTinta/getMateriasPrimasCrearTintasMes/${fecha1}/${fecha2}`);

  srvGuardar = (data : modelDetallesAsignacionMPxTintas): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/DetalleAsignacion_MatPrimaXTinta', data);

}
