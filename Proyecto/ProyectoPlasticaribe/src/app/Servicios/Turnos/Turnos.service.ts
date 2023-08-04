import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI } from 'src/polyfills';
import { modelTurnos } from '../../Modelo/modelTurnos';

@Injectable({
  providedIn: 'root'
})
export class TurnosService {

  constructor(private http : HttpClient,) { }

  srvObtenerLista = () => this.http.get<any>(rutaPlasticaribeAPI + '/Turnos');

  srvObtenerListaPorId = (dato : any) => this.http.get<any>(rutaPlasticaribeAPI + `/Turnos/${dato}`);

  srvActualizar = (id:number|string, data:any) => this.http.put(rutaPlasticaribeAPI + `/Turnos/${id}`, data);

  srvEliminar = (id:number|string) => this.http.delete(rutaPlasticaribeAPI + `/Turnos/${id}`);

  srvGuardar = (data : modelTurnos): Observable<any> => this.http.post(rutaPlasticaribeAPI + '/Turnos', data);
}
