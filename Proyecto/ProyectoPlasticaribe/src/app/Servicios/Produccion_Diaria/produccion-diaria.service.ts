import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProduccionDiariaService {

  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;
  
      constructor(private http : HttpClient) { }
  
      GetAll = () : Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Produccion_Diaria`);
  
      GetId = (id : number) : Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Produccion_Diaria/${id}`);
  
      getProductionDay = (date1 : any, date2 : any) : Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Produccion_Diaria/getProductionDay/${date1}/${date2}`);
  
      Post = (data : any) => this.http.post(`${this.rutaPlasticaribeAPI}/Produccion_Diaria`, data);
  
      Put = (id : number, data : any) => this.http.put(`${this.rutaPlasticaribeAPI}/Produccion_Diaria/${id}`, data);
  
      putGoalForMachine = (maq : number, process : any, date : any, goal : number) => this.http.put(`${this.rutaPlasticaribeAPI}/Produccion_Diaria/putGoalForMachine/${maq}/${process}/${date}/${goal}`, maq);
  
}
