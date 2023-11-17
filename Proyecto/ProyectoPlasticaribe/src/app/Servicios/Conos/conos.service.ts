import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})

export class ConosService {

    readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;
    
    constructor(private http : HttpClient) { }

    GetConos = () => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Cono`)

}
