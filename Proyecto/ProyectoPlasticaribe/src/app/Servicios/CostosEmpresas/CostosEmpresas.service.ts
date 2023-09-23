import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})

export class CostosEmpresasService {

    readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

    constructor(private http : HttpClient) { }

    GetCostosFacturacion = (anio : number, nomGasto : string) : Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Costos_Empresas_Anios/getCostosFacturacion/${anio}/${nomGasto}`);

    GetCosto = (costo : string, anio : number) : Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Costos_Empresas_Anios/getCosto/${costo}/${anio}`);
}