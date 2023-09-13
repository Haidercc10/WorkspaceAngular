import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelControlCalidad_Sellado } from 'src/app/Modelo/modelControlCalidad';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn : 'root'
})

export class ControlCalidad_SelladoService {

    readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

    constructor(private http: HttpClient) { }

    Get_Todo = () : Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/ControlCalidad_Sellado`);

    Get_Id = (Id: number) : Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/ControlCalidad_Sellado/${Id}`);

    GetControlCalidad_SelladoHoy = (fecha1 : any, fecha2 : any) : Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/ControlCalidad_Sellado/getControlCalidad_SelladoHoy/${fecha1}/${fecha2}`);

    GetRonda = (ot : number) : Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/ControlCalidad_Sellado/getRonda/${ot}`);

    Post = (data: modelControlCalidad_Sellado) : Observable<any> => this.http.post<any>(`${this.rutaPlasticaribeAPI}/ControlCalidad_Sellado`, data);

    Put = (Id: number, data: modelControlCalidad_Sellado) : Observable<any> => this.http.put<any>(`${this.rutaPlasticaribeAPI}/ControlCalidad_Sellado/${Id}`, data);

}
