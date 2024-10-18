import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelReposiciones } from 'src/app/Modelo/modelReposiciones';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn : 'root'
})

export class ReposicionesService {

    readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;  

    constructor(private http : HttpClient) { }
        
      getAll = ():Observable<any> => this.http.get<any>(this.rutaPlasticaribeAPI + `/Reposiciones`);
    
      getId = (id : any):Observable<any> => this.http.get<any>(this.rutaPlasticaribeAPI + `/Reposiciones/${id}`);
    
      GetIdRepositions = (id : any):Observable<any> => this.http.get<any>(this.rutaPlasticaribeAPI + `/Reposiciones/GetIdRepositions/${id}`);
    
      Post = (data : modelReposiciones): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/Reposiciones', data);
    
      Put = (id : any, data : modelReposiciones) => this.http.put(this.rutaPlasticaribeAPI + `/Reposiciones/${id}`, data);
    
      putRepositions = (id : any, data : any) => this.http.put(this.rutaPlasticaribeAPI + `/Reposiciones/putRepositions/${id}`, data);

}
