import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelDetalles_Reposiciones } from 'src/app/Modelo/modelDetalles_Reposiciones';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn : 'root'
})
export class Detalles_ReposicionesService {

    readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;  

    constructor(private http : HttpClient) { }
        
      getAll = ():Observable<any> => this.http.get<any>(this.rutaPlasticaribeAPI + `/Detalles_Reposiciones`);
    
      getId = (id : any):Observable<any> => this.http.get<any>(this.rutaPlasticaribeAPI + `/Detalles_Reposiciones/${id}`);
    
      getRepositionId = (id : any):Observable<any> => this.http.get<any>(this.rutaPlasticaribeAPI + `/Detalles_Reposiciones/getRepositionId/${id}`);

      getMovementsReposition = (date1 : any, date2 : any, url? : string):Observable<any> => this.http.get<any>(this.rutaPlasticaribeAPI + `/Detalles_Reposiciones/getMovementsReposition/${date1}/${date2}${url}`);

      Post = (data : modelDetalles_Reposiciones): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/Detalles_Reposiciones', data);
    
      Put = (id : any, data : any) => this.http.put(this.rutaPlasticaribeAPI + `/Detalles_Reposiciones/${id}`, data);

}
