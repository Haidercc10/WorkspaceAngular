import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { modelRodillo } from '../../Modelo/modelRodillo';

@Injectable({
  providedIn: 'root'
})
export class RodillosService {
  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;
  
  constructor(private http : HttpClient,) { }

  Post = (data : modelRodillo): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/Rodillos', data);

}
