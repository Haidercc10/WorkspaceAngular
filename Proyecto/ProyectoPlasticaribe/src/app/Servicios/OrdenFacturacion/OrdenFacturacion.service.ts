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

    getId = (id : any) => this.http.get<any>(`${this.rutaPlasticaribeAPI}/OrdenFacturacion/${id}`);

    getLastOrder = () => this.http.get<any>(`${this.rutaPlasticaribeAPI}/OrdenFacturacion/getLastOrder`);

    getMovementsInvoices = (invoice : string) => this.http.get<any>(`${this.rutaPlasticaribeAPI}/OrdenFacturacion/getMovementsInvoices/${invoice}`);

    Post = (data : modelOrdenFacturacion) : Observable<any> => this.http.post(`${this.rutaPlasticaribeAPI}/OrdenFacturacion`, data);

    PutStatusOrder = (fact: number) => this.http.put(`${this.rutaPlasticaribeAPI}/OrdenFacturacion/putStatusOrder/${fact}`, fact);

    PutStatusOrderAnulled = (order: number) => this.http.put(`${this.rutaPlasticaribeAPI}/OrdenFacturacion/putStatusOrderAnulled/${order}`, order)

    PutFactOrder = (order: number, fact: string) => this.http.put(`${this.rutaPlasticaribeAPI}/OrdenFacturacion/putFactOrder/${order}/${fact}`, fact);
}
