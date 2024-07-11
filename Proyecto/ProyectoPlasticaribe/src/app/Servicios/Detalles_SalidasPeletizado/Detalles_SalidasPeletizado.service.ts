import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class Detalles_SalidasPeletizadoService {

    readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

    constructor(private http : HttpClient) { }

    GetId = (id : any): Observable<any> => this.http.get<any>(this.rutaPlasticaribeAPI + `/Detalles_SalidasPeletizado/${id}`);
   
    Post = (data : any): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/Detalles_SalidasPeletizado', data);

    Put = (id : any, data : any) : Observable<any> => this.http.put(`${this.rutaPlasticaribeAPI}/Detalles_SalidasPeletizado/${id}`, data);
}
