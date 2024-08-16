import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Asignacion_RollosOT } from 'src/app/Modelo/Asignacion_RollosOT';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class Asignacion_RollosOTService {

    readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;
    
    constructor(private http : HttpClient) { }

    getAll = (): Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + '/Asignacion_RollosOT');
    getId = (id : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Asignacion_RollosOT/${id}`);
    Post = (data : Asignacion_RollosOT) : Observable<any> => this.http.post(this.rutaPlasticaribeAPI + `/Asignacion_RollosOT`, data);
    Put = (id : number, data : Asignacion_RollosOT): Observable<any> => this.http.put(this.rutaPlasticaribeAPI + `/Asignacion_RollosOT/${id}`, data);
}
