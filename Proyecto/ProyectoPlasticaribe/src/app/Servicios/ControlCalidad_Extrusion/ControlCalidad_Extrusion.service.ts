import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelControlCalidad_Extrusion } from 'src/app/Modelo/modelControlCalidad';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})

export class ControlCalidad_ExtrusionService {

    readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

    constructor(private http: HttpClient) { }

    Get_Todo = () : Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/ControlCalidad_Extrusion`);

    Get_Id = (Id: number) : Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/ControlCalidad_Extrusion/${Id}`);

    GetRonda = (maquina : any) : Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/ControlCalidad_Extrusion/getRonda/${maquina}`);

    Get_TodoHoy = (fecha1 : any, fecha2 : any) : Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/ControlCalidad_Extrusion/getControlCalidad_ExtrusionHoy/${fecha1}/${fecha2}`);

    Post = (data: modelControlCalidad_Extrusion) : Observable<any> => this.http.post<any>(`${this.rutaPlasticaribeAPI}/ControlCalidad_Extrusion`, data);

    Put = (Id: number, data: modelControlCalidad_Extrusion) : Observable<any> => this.http.put<any>(`${this.rutaPlasticaribeAPI}/ControlCalidad_Extrusion/${Id}`, data);

}
