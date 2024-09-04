import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelSolicitudRollos } from 'src/app/Modelo/modelSolicitudRollos';
import { environment } from 'src/environments/environment';

@Injectable()
export class Maquilas_InternasService {

    readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

    constructor(private http : HttpClient) { }
    
        GetTodo = () : Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Maquilas_Internas`);
    
        Get_Id = (id : any) : Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Maquilas_Internas/${id}`);
    
        Post = (data : any) : Observable<any> => this.http.post(`${this.rutaPlasticaribeAPI}/Maquilas_Internas`, data);
    
        Put = (id : any, data : any) : Observable<any> => this.http.put(`${this.rutaPlasticaribeAPI}/Maquilas_Internas/${id}`, data);
    
        Delete = (id : any) => this.http.delete(`${this.rutaPlasticaribeAPI}/Maquilas_Internas/${id}`);
}


