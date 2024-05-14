import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelDt_OrdenFacturacion } from 'src/app/Modelo/modelDt_OrdenFacturacion';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})

export class Dt_OrdenFacturacionService {

    readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

    constructor(private http: HttpClient) { }

    GetInformacionOrderFact = (id: number) => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Detalles_OrdenFacturacion/getInformationOrderFact/${id}`);

    GetInformacionOrderFactToSend = (id: number) => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Detalles_OrdenFacturacion/getInformationOrderFactToSend/${id}`);

    GetInformationOrderFactByFactForDevolution = (id: number) => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Detalles_OrdenFacturacion/getInformationOrderFactByFactForDevolution/${id}`);

    GetOrders = (startDate: any, endsDate, ruote: string) => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Detalles_OrdenFacturacion/getOrders/${startDate}/${endsDate}${ruote}`);

    GetSendOrders = (startDate: any, endsDate, ruote: string) => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Detalles_OrdenFacturacion/getSendOrders/${startDate}/${endsDate}${ruote}`);

    GetNotAvaibleProduction = () => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Detalles_OrdenFacturacion/getNotAvaibleProduction`);

    Post = (data: modelDt_OrdenFacturacion) => this.http.post(`${this.rutaPlasticaribeAPI}/Detalles_OrdenFacturacion`, data);

    PutStatusProduction = (data: Array<number>, order: number) => this.http.post(`${this.rutaPlasticaribeAPI}/Detalles_OrdenFacturacion/putStatusProduction/${order}`, data);

    getProductionSentMonthConsolidate = (year: number) => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Detalles_OrdenFacturacion/getProductionSentMonthConsolidate/${year}`);

    getProductionSentMonthDetailed = (year: number) => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Detalles_OrdenFacturacion/getProductionSentMonthDetailed/${year}`);

    deleteDetailOF = (id : any) => this.http.delete(this.rutaPlasticaribeAPI + `/Detalles_OrdenFacturacion/${id}`);
}
