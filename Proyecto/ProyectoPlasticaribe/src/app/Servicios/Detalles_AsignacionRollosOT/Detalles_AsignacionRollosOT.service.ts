import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Detalles_AsignacionRollosOT } from 'src/app/Modelo/Detalles_AsignacionRollosOT';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class Detalles_AsignacionRollosOTService {

    readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;
        
    constructor(private http : HttpClient) { }

    getAll = (): Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + '/Detalles_AsignacionRollosOT');
    getId = (id : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Detalles_AsignacionRollosOT/${id}`);
    Post = (data : Detalles_AsignacionRollosOT) : Observable<any> => this.http.post(this.rutaPlasticaribeAPI + `/Detalles_AsignacionRollosOT`, data);
    Put = (id : number, data : Detalles_AsignacionRollosOT): Observable<any> => this.http.put(this.rutaPlasticaribeAPI + `/Detalles_AsignacionRollosOT/${id}`, data);
}
