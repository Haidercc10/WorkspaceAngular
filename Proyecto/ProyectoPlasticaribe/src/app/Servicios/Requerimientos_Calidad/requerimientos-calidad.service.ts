import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelRequerimientos_Calidad } from 'src/app/Modelo/modelRequerimientos_Calidad';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RequerimientosCalidadService {

  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;
    
      constructor(private http : HttpClient,) { }
    
      getId = (id : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Requerimientos_Calidad${id}`);
    
      getAll = () => this.http.get<any>(this.rutaPlasticaribeAPI + `/Requerimientos_Calidad`);
      
      Post = (data : modelRequerimientos_Calidad): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/Requerimientos_Calidad', data);
  
      Put = (data: Array<any>, id: number) => this.http.put(`${this.rutaPlasticaribeAPI}/Requerimientos_Calidad/${id}`, data);
}
