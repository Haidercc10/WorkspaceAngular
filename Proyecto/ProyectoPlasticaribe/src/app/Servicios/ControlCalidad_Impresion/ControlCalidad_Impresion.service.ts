import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelControlCalidad_Impresion } from 'src/app/Modelo/modelControlCalidad';
import { rutaPlasticaribeAPI } from 'src/polyfills';

@Injectable({
    providedIn: 'root'
})

export class ControlCalidad_ImpresionService {
    
    constructor(private http: HttpClient) { }

    Get_Todo = () : Observable<any> => this.http.get<any>(`${rutaPlasticaribeAPI}/ControlCalidad_Impresion`);

    Get_Id = (Id: number) : Observable<any> => this.http.get<any>(`${rutaPlasticaribeAPI}/ControlCalidad_Impresion/${Id}`);

    GetRegistrosHoy = () : Observable<any> => this.http.get<any>(`${rutaPlasticaribeAPI}/ControlCalidad_Impresion/getRegistrosHoy`);

    GetUltRegistroItem = (item : number) : Observable<any> => this.http.get<any>(`${rutaPlasticaribeAPI}/ControlCalidad_Impresion/getUltRegistroItem/${item}`);

    Post = (data: modelControlCalidad_Impresion) : Observable<any> => this.http.post<any>(`${rutaPlasticaribeAPI}/ControlCalidad_Impresion`, data);

    Put = (Id: number, data: modelControlCalidad_Impresion) : Observable<any> => this.http.put<any>(`${rutaPlasticaribeAPI}/ControlCalidad_Impresion/${Id}`, data);
}