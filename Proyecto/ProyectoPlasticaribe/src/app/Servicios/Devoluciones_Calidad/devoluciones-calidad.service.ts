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

    getTotalMoneyForRejectedType = (year : any, url? : string) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Devoluciones_Calidad/getTotalMoneyForRejectedType/${year}${url}`);

    getTotalMoneyForMonth = (year : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Devoluciones_Calidad/getTotalMoneyForMonth/${year}`);

    getTotalMoneyForArea = (year : any, url? : string) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Devoluciones_Calidad/getTotalMoneyForArea/${year}${url}`);

    getTotalMoneyForClient = (year : any, url? : string) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Devoluciones_Calidad/getTotalMoneyForClient/${year}${url}`);

    getDevolutionsForRejectedType = (year : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Devoluciones_Calidad/getDevolutionsForRejectedType/${year}`);

    getMovementsDvQuality = (date1 : any, date2 : any, url? : string) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Devoluciones_Calidad/getMovementsDvQuality/${date1}/${date2}${url}`);

}
