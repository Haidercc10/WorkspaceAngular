import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AsignacionMPxTintasService {

  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

  constructor(private http : HttpClient,) { }

  srvObtenerUltimaAsignacion = () => this.http.get<any>(this.rutaPlasticaribeAPI + `/Asignacion_MatPrimaXTinta/ultimoId`);

  srvGuardar = (data : any): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/Asignacion_MatPrimaXTinta', data);

  srvObtenerListaMatPrimas = ():Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + '/Asignacion_MatPrimaXTinta/CargarTintas_MatPrimas/');

  srvObtenerListaMatPrimasPorId = (ID : any):Observable<any[]> =>this.http.get<any>(this.rutaPlasticaribeAPI + `/Asignacion_MatPrimaXTinta/CargarMatPrimasXId/${ID}`);

}
