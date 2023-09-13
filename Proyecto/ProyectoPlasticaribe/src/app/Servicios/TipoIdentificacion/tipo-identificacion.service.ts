import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TipoIdentificacionService {
  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;
  
  constructor(private http : HttpClient,) { }
  
  srvObtenerLista = () : Observable<any> => this.http.get<any>(this.rutaPlasticaribeAPI + '/TipoIdentificacions');
}
