import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelProduccionAreas } from 'src/app/Modelo/modelProduccionAreas';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})

export class ProduccionAreasService {

    readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

    constructor(private http : HttpClient) { }

    GetTodo = () : Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Produccion_Areas`);

    Get_ById = (id : number) : Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Produccion_Areas/${id}`);

    GetProduccionAreas_Mes = (anio : number) : Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Produccion_Areas/getProduccionAreas_Mes/${anio}`);

    Post = (data : modelProduccionAreas) => this.http.post(`${this.rutaPlasticaribeAPI}/Produccion_Areas`, data);

    Put = (id : number, data : modelProduccionAreas) => this.http.put(`${this.rutaPlasticaribeAPI}/Produccion_Areas/${id}`, data);

    PutMetaProduccionMes = (id : number, meta : number) => this.http.put(`${this.rutaPlasticaribeAPI}/Produccion_Areas/putMetaProduccionMes/${id}?meta=${meta}`, meta);

}
