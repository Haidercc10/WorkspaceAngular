import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { modelDt_OrdenFacturacion } from 'src/app/Modelo/modelDt_OrdenFacturacion';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})

export class Dt_OrdenFacturacionService {

    readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

    constructor(private http: HttpClient) { }

    GetInformacionOrderFact = (id: number) => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Detalles_OrdenFacturacion/getInformationOrderFact/${id}`);

    GetInformationOrderFactByFactForDevolution = (id: number) => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Detalles_OrdenFacturacion/getInformationOrderFactByFactForDevolution/${id}`);

    GetOrders = (startDate: any, endsDate, ruote: string) => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Detalles_OrdenFacturacion/getOrders/${startDate}/${endsDate}${ruote}`);

    Post = (data: modelDt_OrdenFacturacion) => this.http.post(`${this.rutaPlasticaribeAPI}/Detalles_OrdenFacturacion`, data);

}
