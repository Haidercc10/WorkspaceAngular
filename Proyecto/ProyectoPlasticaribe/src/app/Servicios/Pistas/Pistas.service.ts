import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI, } from 'src/polyfills';
import { modelPistas } from '../../Modelo/modelPistas';

@Injectable({
  providedIn: 'root'
})
export class PistasService {

  constructor(private http : HttpClient,) { }

  srvObtenerLista = () => this.http.get<any>(rutaPlasticaribeAPI + '/Pistas');

  srvObtenerListaPorId = (dato : any) => this.http.get<any>(rutaPlasticaribeAPI + `/Pistas/${dato}`);

  srvActualizar = (id:number|string, data:any) => this.http.put(rutaPlasticaribeAPI + `/Pistas/${id}`, data);

  srvEliminar = (id:number|string) => this.http.delete(rutaPlasticaribeAPI + `/Pistas/${id}`);

  srvGuardar = (data : modelPistas): Observable<any> => this.http.post(rutaPlasticaribeAPI + '/Pistas', data);
}
