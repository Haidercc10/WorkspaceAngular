import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { modelRemision } from '../../Modelo/modelRemision';

@Injectable({
  providedIn: 'root'
})
export class RemisionService {
  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;
  
  constructor(private http : HttpClient,) { }

  UltimoIdRemision = ():Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + '/Remision/UltimoIdRemision');
  
  srvGuardar = (data : modelRemision): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/Remision', data);

}
