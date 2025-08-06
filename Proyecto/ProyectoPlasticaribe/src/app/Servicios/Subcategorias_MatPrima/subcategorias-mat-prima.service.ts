import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SubcategoriasMatPrimaService {

  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;
    
    constructor(private http : HttpClient) { }
  
    GetId = (id : number) : Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Subcategorias_MatPrima/${id}`);
  
    GetAll = () : Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Subcategorias_MatPrima`);
  
    Post = (data : any) => this.http.post<any>(`${this.rutaPlasticaribeAPI}/Subcategorias_MatPrima`, data);
  
    Put = (id : number, data : any) => this.http.put(`${this.rutaPlasticaribeAPI}/Subcategorias_MatPrima/${id}`, data);
  
    Delete = (id : number) => this.http.delete(`${this.rutaPlasticaribeAPI}/Subcategorias_MatPrima/${id}`);

    getSubcategoriesForCategory = (id : number) : Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Subcategorias_MatPrima/getSubcategoriesForCategory/${id}`);
  
}
