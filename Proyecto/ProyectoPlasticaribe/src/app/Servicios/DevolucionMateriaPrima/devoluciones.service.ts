import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { modelDevolucion } from '../../Modelo/modelDevolucion';

@Injectable({
  providedIn: 'root'
})
export class DevolucionesService {

  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

  constructor(private http : HttpClient,) { }

  srvObtenerUltimaDevolucion = () => this.http.get<any>(this.rutaPlasticaribeAPI + `/Devolucion_MatPrima/ultimoId`);

  srvObtenerListaPorOT = (id : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Devolucion_MatPrima/OT/${id}`);
  
  srvGuardar = (data : modelDevolucion): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/Devolucion_MatPrima', data);
}
