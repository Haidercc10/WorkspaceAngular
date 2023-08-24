import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelControlCalidad_CorteDoblado } from 'src/app/Modelo/modelControlCalidad';
import { rutaPlasticaribeAPI } from 'src/polyfills';

@Injectable({
    providedIn: 'root'
})

export class ControlCalidad_CorteDobladoService {

constructor(private http: HttpClient) { }

    Get_Todo = () : Observable<any> => this.http.get<any>(`${rutaPlasticaribeAPI}/ControlCalidad_CorteDoblado`);

    Get_Id = (Id: number) : Observable<any> => this.http.get<any>(`${rutaPlasticaribeAPI}/ControlCalidad_CorteDoblado/${Id}`);

    GetRegistrosHoy = () : Observable<any> => this.http.get<any>(`${rutaPlasticaribeAPI}/ControlCalidad_CorteDoblado/getRegistrosHoy`);

    GetUltRegistroItem = (item : number) : Observable<any> => this.http.get<any>(`${rutaPlasticaribeAPI}/ControlCalidad_CorteDoblado/getUltRegistroItem/${item}`);

    Post = (data: modelControlCalidad_CorteDoblado) : Observable<any> => this.http.post<any>(`${rutaPlasticaribeAPI}/ControlCalidad_CorteDoblado`, data);

    Put = (Id: number, data: modelControlCalidad_CorteDoblado) : Observable<any> => this.http.put<any>(`${rutaPlasticaribeAPI}/ControlCalidad_CorteDoblado/${Id}`, data);
}
