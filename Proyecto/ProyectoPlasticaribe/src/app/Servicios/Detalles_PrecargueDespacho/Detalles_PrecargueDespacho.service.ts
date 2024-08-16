import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelDetalles_PrecargueDespacho } from 'src/app/Modelo/modelDetalles_PrecargueDespacho';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn : 'root'
})
export class Detalles_PrecargueDespachoService {

    readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;  

    constructor(private http : HttpClient) { }
        
      getAll = ():Observable<any> => this.http.get<any>(this.rutaPlasticaribeAPI + `/Detalles_PrecargueDespacho`);
    
      getId = (id : any):Observable<any> => this.http.get<any>(this.rutaPlasticaribeAPI + `/Detalles_PrecargueDespacho/${id}`);
    
      getPreloadId = (id : any):Observable<any> => this.http.get<any>(this.rutaPlasticaribeAPI + `/Detalles_PrecargueDespacho/getPreloadId/${id}`);

      Post = (data : modelDetalles_PrecargueDespacho): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/Detalles_PrecargueDespacho', data);
    
      Put = (id : any, data : any) => this.http.put(this.rutaPlasticaribeAPI + `/Detalles_PrecargueDespacho/${id}`, data);

}
