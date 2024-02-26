import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class NominaDetallada_PlasticaribeService {

    readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

    constructor(private http : HttpClient) { }

    getPayroll = (date1 : any, date2 : any, route : string) => this.http.get<any>(`${this.rutaPlasticaribeAPI}/NominaDetallada_Plasticaribe/getPayroll/${date1}/${date2}${route}`);
}
