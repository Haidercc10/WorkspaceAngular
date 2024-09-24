import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn : 'root'
})

export class Servicios_ProduccionService {

    readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

constructor(private http : HttpClient) { }

    GetTodo = () : Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Servicios_Produccion`);

    Get_Id = (id : any) : Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Servicios_Produccion/${id}`);

    Post = (data : any) : Observable<any> => this.http.post(`${this.rutaPlasticaribeAPI}/Servicios_Produccion`, data);

    Put = (id : any, data : any) : Observable<any> => this.http.put(`${this.rutaPlasticaribeAPI}/Servicios_Produccion/${id}`, data);

    Delete = (id : any) => this.http.delete(`${this.rutaPlasticaribeAPI}/Servicios_Produccion/${id}`);
}