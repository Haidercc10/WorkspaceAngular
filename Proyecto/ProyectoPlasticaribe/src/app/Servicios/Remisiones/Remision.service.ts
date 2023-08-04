import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI, } from 'src/polyfills';
import { modelRemision } from '../../Modelo/modelRemision';

@Injectable({
  providedIn: 'root'
})
export class RemisionService {

  constructor(private http : HttpClient,) { }

  UltimoIdRemision = ():Observable<any[]> => this.http.get<any>(rutaPlasticaribeAPI + '/Remision/UltimoIdRemision');
  
  srvGuardar = (data : modelRemision): Observable<any> => this.http.post(rutaPlasticaribeAPI + '/Remision', data);

}
