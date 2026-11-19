import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { modelAsignacionMP } from '../../Modelo/modelAsignacionMP';
import { DatosPdfAsignacion } from '../../Modelo/modelFlujoMaterialProduccion';

@Injectable({
  providedIn: 'root'
})
export class AsignacionMPService {

  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

  constructor(private http : HttpClient,) { }

  srvObtenerLista = ():Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + '/Asignacion_MatPrima');

  srvObtenerListaPorId = (dato : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Asignacion_MatPrima/${dato}`);

  srvObtenerListaPorOt = (dato : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Asignacion_MatPrima/ot/${dato}`);

  srvGuardar = (data : modelAsignacionMP): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/Asignacion_MatPrima', data);

  /** Datos del PDF de una asignación: materias primas y tintas por subcategoría y, si viene de una solicitud, su saldo hasta esa asignación. */
  obtenerDatosPdf = (id : number) : Observable<DatosPdfAsignacion> =>
    this.http.get<DatosPdfAsignacion>(`${this.rutaPlasticaribeAPI}/Asignacion_MatPrima/${id}/pdf`);
}
