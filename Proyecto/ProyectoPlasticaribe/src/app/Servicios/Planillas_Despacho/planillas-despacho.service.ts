import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelPlanillas_Despacho } from 'src/app/Modelo/modelPlanillas_Despacho';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PlanillasDespachoService {

  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;
    
    constructor(private http : HttpClient) { }
    
      getAll = () => this.http.get<any>(this.rutaPlasticaribeAPI + `/Planillas_Despacho`);
    
      Post = (data : modelPlanillas_Despacho): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/Planillas_Despacho', data);

      Put = (id : number, data:any) => this.http.put(this.rutaPlasticaribeAPI + `/Planillas_Despacho/${id}`, data);
}
