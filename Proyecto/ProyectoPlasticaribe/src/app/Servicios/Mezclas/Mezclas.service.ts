import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { this.rutaPlasticaribeAPI, } from 'src/polyfills';
import { modelMezclas } from '../../Modelo/modelMezclas';

@Injectable({
  providedIn: 'root'
})
export class MezclasService {

  constructor(private http : HttpClient,) { }
  
  srvObtenerLista = ():Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + '/Mezclas');

  getMezclaNombre = (nombre : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Mezclas/getMezclaNombre/${nombre}`);

  srvObtenerListaPorNombre = (nombre : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Mezclas/combinacionMezclas/${nombre}`);

  srvGuardar = (data : modelMezclas): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/Mezclas', data);

}
