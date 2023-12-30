import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelOrdenFacturacion } from 'src/app/Modelo/modelOrdenFacturacion';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})

export class OrdenFacturacionService {

    readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

    constructor(private http: HttpClient) { }

    Post = (data : modelOrdenFacturacion) : Observable<any> => this.http.post(`${this.rutaPlasticaribeAPI}/OrdenFacturacion`, data);

    PutStatusOrder = (fact: number) => this.http.put(`${this.rutaPlasticaribeAPI}/OrdenFacturacion/putStatusOrder/${fact}`, fact);

    PutFactOrder = (order: number, fact: string) => this.http.put(`${this.rutaPlasticaribeAPI}/OrdenFacturacion/putFactOrder/${order}/${fact}`, fact);
}
