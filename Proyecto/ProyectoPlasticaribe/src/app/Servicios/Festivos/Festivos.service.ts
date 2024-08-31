import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class FestivosService {

  urlApi = 'https://api.generadordni.es/v2/holidays/holidays?year=2024&country=CO';
  
  //urlApi = 'https://holidayapi.com/countries/co/2024';

  constructor(private http : HttpClient,) { }

  getFestivos(){
    return this.http.get<any>(this.urlApi);
  }

}
