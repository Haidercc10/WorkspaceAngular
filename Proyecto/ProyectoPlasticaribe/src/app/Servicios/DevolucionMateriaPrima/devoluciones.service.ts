import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI, } from 'src/polyfills';
import { modelDevolucion } from '../../Modelo/modelDevolucion';

@Injectable({
  providedIn: 'root'
})
export class DevolucionesService {

  constructor(private http : HttpClient,) { }

  srvObtenerUltimaDevolucion = () => this.http.get<any>(rutaPlasticaribeAPI + `/Devolucion_MatPrima/ultimoId`);

  srvObtenerListaPorOT = (id : any) => this.http.get<any>(rutaPlasticaribeAPI + `/Devolucion_MatPrima/OT/${id}`);
  
  srvGuardar = (data : modelDevolucion): Observable<any> => this.http.post(rutaPlasticaribeAPI + '/Devolucion_MatPrima', data);
}
