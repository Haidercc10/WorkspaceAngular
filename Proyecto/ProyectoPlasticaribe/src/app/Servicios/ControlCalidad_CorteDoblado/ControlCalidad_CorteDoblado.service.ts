import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelControlCalidad_CorteDoblado } from 'src/app/Modelo/modelControlCalidad';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})

export class ControlCalidad_CorteDobladoService {

constructor(private http: HttpClient) { }

    Get_Todo = () : Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/ControlCalidad_CorteDoblado`);

    Get_Id = (Id: number) : Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/ControlCalidad_CorteDoblado/${Id}`);

    GetRegistros = (inicio : any, fin : any) : Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/ControlCalidad_CorteDoblado/getRegistros/${inicio}/${fin}`);

    GetUltRegistroItem = (item : number) : Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/ControlCalidad_CorteDoblado/getUltRegistroItem/${item}`);

    Post = (data: modelControlCalidad_CorteDoblado) : Observable<any> => this.http.post<any>(`${this.rutaPlasticaribeAPI}/ControlCalidad_CorteDoblado`, data);

    Put = (Id: number, data: modelControlCalidad_CorteDoblado) : Observable<any> => this.http.put<any>(`${this.rutaPlasticaribeAPI}/ControlCalidad_CorteDoblado/${Id}`, data);
}
