import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

export class IncapacidadesService {

  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

  constructor(private http : HttpClient) { }

  Post = (data: Disability) => this.http.post(`${this.rutaPlasticaribeAPI}/Incapacidades`, data);

  GetDisablityByWorker = (worker: number, start: any, end: any): Observable<any> => this.http.get(`${this.rutaPlasticaribeAPI}/Incapacidades/getDisablityByWorker/${worker}/${start}/${end}`);

}

interface Disability {

}
