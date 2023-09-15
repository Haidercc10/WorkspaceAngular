import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelProducto_MatPrima } from 'src/app/Modelo/modelProducto_MatPrima';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn : 'root'
})

export class Productos_MateriasPrimasService {

    readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

    constructor(private http : HttpClient) { }

    GetTodo = () : Observable<any []> => this.http.get<any []>(`${this.rutaPlasticaribeAPI}/Productos_MateriasPrimas`);

    GetRecetaProducto = (prod : number, presentacion : string) : Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Productos_MateriasPrimas/getRecetaProducto/${prod}/${presentacion}`);

    GetExistenciaReceta = (prod : number, presentacion : string, material : number) : Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Productos_MateriasPrimas/getExistenciaReceta/${prod}/${presentacion}/${material}`); 

    Post = (data : modelProducto_MatPrima) : Observable<any> => this.http.post<any>(`${this.rutaPlasticaribeAPI}/Productos_MateriasPrimas`, data);
    
    Put = (Id : number, data : modelProducto_MatPrima) : Observable<any> => this.http.put<any>(`${this.rutaPlasticaribeAPI}/Productos_MateriasPrimas/${Id}`, data);

    Delete = (id : number) : Observable<any> => this.http.delete<any>(`${this.rutaPlasticaribeAPI}/Productos_MateriasPrimas/${id}`);
}