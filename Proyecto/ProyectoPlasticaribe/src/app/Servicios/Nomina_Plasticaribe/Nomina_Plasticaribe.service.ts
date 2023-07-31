import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { rutaPlasticaribeAPI } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})
export class Nomina_PlasticaribeService {

  constructor(private http : HttpClient) { }

  Post = (data : any) => this.http.post(`${rutaPlasticaribeAPI}/Nomina_Plasticaribe`, data);
}
