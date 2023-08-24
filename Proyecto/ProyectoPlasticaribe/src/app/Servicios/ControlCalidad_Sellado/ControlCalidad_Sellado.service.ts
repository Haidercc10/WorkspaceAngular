import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelControlCalidad_Sellado } from 'src/app/Modelo/modelControlCalidad';
import { rutaPlasticaribeAPI } from 'src/polyfills';

@Injectable({
    providedIn: 'root'
})
export class ControlCalidad_SelladoService {

    constructor(private http: HttpClient) { }

    Get_Todo = () : Observable<any> => this.http.get<any>(`${rutaPlasticaribeAPI}/ControlCalidad_Sellado`);

    Get_Id = (Id: number) : Observable<any> => this.http.get<any>(`${rutaPlasticaribeAPI}/ControlCalidad_Sellado/${Id}`);

    GetControlCalidad_SelladoHoy = () : Observable<any> => this.http.get<any>(`${rutaPlasticaribeAPI}/ControlCalidad_Sellado/getControlCalidad_SelladoHoy`);

    GetRonda = (ot : number) : Observable<any> => this.http.get<any>(`${rutaPlasticaribeAPI}/ControlCalidad_Sellado/getRonda/${ot}`);

    Post = (data: modelControlCalidad_Sellado) : Observable<any> => this.http.post<any>(`${rutaPlasticaribeAPI}/ControlCalidad_Sellado`, data);

    Put = (Id: number, data: modelControlCalidad_Sellado) : Observable<any> => this.http.put<any>(`${rutaPlasticaribeAPI}/ControlCalidad_Sellado/${Id}`, data);

}
