import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelDevoluciones_Calidad } from 'src/app/Modelo/modelDevoluciones_Calidad';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DevolucionesCalidadService {

  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;
  
    constructor(private http : HttpClient,) { }
  
    getId = (id : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Devoluciones_Calidad/${id}`);
  
    getAll = () => this.http.get<any>(this.rutaPlasticaribeAPI + `/Devoluciones_Calidad`);
    
    Post = (data : modelDevoluciones_Calidad): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/Devoluciones_Calidad', data);

    Put = (data: Array<any>, id: number) => this.http.put(`${this.rutaPlasticaribeAPI}/Devoluciones_Calidad/${id}`, data);

    getTotalMoneyForRejectedType = (year : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Devoluciones_Calidad/getTotalMoneyForRejectedType/${year}`);

    getTotalMoneyForMonth = (year : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Devoluciones_Calidad/getTotalMoneyForMonth/${year}`);

    getTotalMoneyForArea = (year : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Devoluciones_Calidad/getTotalMoneyForArea/${year}`);

    getTotalMoneyForClient = (year : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Devoluciones_Calidad/getTotalMoneyForClient/${year}`);
}
