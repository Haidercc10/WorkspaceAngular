import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelControlCalidad_Extrusion } from 'src/app/Modelo/modelControlCalidad';
import { rutaPlasticaribeAPI } from 'src/polyfills';

@Injectable({
    providedIn: 'root'
})

export class ControlCalidad_ExtrusionService {

    constructor(private http: HttpClient) { }

    Get_Todo = () : Observable<any> => this.http.get<any>(`${rutaPlasticaribeAPI}/ControlCalidad_Extrusion`);

    Get_Id = (Id: number) : Observable<any> => this.http.get<any>(`${rutaPlasticaribeAPI}/ControlCalidad_Extrusion/${Id}`);

    GetOtControlCalidad_Extrusion = (OT: number) : Observable<any> => this.http.get<any>(`${rutaPlasticaribeAPI}/ControlCalidad_Extrusion/getOtControlCalidad_Extrusion/${OT}`);

    Get_TodoHoy = () : Observable<any> => this.http.get<any>(`${rutaPlasticaribeAPI}/ControlCalidad_Extrusion/getControlCalidad_ExtrusionHoy`);

    Post = (data: modelControlCalidad_Extrusion) : Observable<any> => this.http.post<any>(`${rutaPlasticaribeAPI}/ControlCalidad_Extrusion`, data);

    Put = (Id: number, data: modelControlCalidad_Extrusion) : Observable<any> => this.http.put<any>(`${rutaPlasticaribeAPI}/ControlCalidad_Extrusion/${Id}`, data);

}
