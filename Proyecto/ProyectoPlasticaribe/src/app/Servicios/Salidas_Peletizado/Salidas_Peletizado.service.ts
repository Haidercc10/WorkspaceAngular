import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class Salidas_PeletizadoService {

    readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

    constructor(private http : HttpClient) { }

    GetId = (id : any): Observable<any> => this.http.get<any>(this.rutaPlasticaribeAPI + `/Salidas_Peletizado/getOutputsPeletizado/${id}`);
   
    Post = (data : any): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/Salidas_Peletizado', data);

    Put = (id : any, data : any) : Observable<any> => this.http.put(`${this.rutaPlasticaribeAPI}/Salidas_Peletizado/${id}`, data);

    putStatusOutput = (id : any, user : any, data? : any[]) : Observable<any> => this.http.put(`${this.rutaPlasticaribeAPI}/putStatusOutput/Salidas_Peletizado/${id}/${user}`, data);
}
