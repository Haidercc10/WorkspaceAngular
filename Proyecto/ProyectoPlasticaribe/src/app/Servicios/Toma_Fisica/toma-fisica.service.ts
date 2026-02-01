import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { modelToma_Fisica } from 'src/app/Modelo/modelToma_Fisica';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TomaFisicaService {

  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

  constructor(private http : HttpClient) { }

  Post = (data : modelToma_Fisica) =>  this.http.post<any>(this.rutaPlasticaribeAPI + `/Toma_Fisica`, data);

  getTomasFisicas = () => this.http.get<any>(this.rutaPlasticaribeAPI + `/Toma_Fisica/getTomasFisicas`);
}
