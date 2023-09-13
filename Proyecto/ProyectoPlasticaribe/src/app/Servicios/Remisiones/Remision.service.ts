import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { this.rutaPlasticaribeAPI, } from 'src/polyfills';
import { modelRemision } from '../../Modelo/modelRemision';

@Injectable({
  providedIn: 'root'
})
export class RemisionService {

  constructor(private http : HttpClient,) { }

  UltimoIdRemision = ():Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + '/Remision/UltimoIdRemision');
  
  srvGuardar = (data : modelRemision): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/Remision', data);

}
