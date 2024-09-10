import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelMaquilas_Internas } from 'src/app/Modelo/modelMaquilas_Internas';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class Maquilas_InternasService {

    readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

    constructor(private http : HttpClient) { }
    
        GetTodo = () : Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Maquilas_Internas`);
    
        Get_Id = (id : any) : Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Maquilas_Internas/${id}`);

        getLastCodeMaquila = () : Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Maquilas_Internas/getLastCodeMaquila`);

        getInternalsMaquilasForCode = (code : any) : Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Maquilas_Internas/getInternalsMaquilasForCode/${code}`);
    
        getMovMaquilas = (date1 : any, date2 : any, url? : string) : Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Maquilas_Internas/getMovMaquilas/${date1}/${date2}${url}`);
    
        Post = (data : modelMaquilas_Internas) : Observable<any> => this.http.post(`${this.rutaPlasticaribeAPI}/Maquilas_Internas`, data);
    
        Put = (id : any, data : any) : Observable<any> => this.http.put(`${this.rutaPlasticaribeAPI}/Maquilas_Internas/${id}`, data);
    
        Delete = (id : any) => this.http.delete(`${this.rutaPlasticaribeAPI}/Maquilas_Internas/${id}`);
}


