import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})

export class Ingreso_PeletizadoService {

  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;  

  constructor(private http : HttpClient,) { }
  
  GetId = (id : any): Observable<any> => this.http.get<any>(this.rutaPlasticaribeAPI + `/Ingreso_Peletizado/${id}`);

  getEntryPeletizado = (date1 : any, date2 : any, hour : string) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Ingreso_Peletizado/getEntryPeletizado/${date1}/${date2}/${hour}`);

  getStockPele_Grouped = () => this.http.get<any>(this.rutaPlasticaribeAPI + `/Ingreso_Peletizado/getStockPele_Grouped`);

  getStockPele_Details = (matprima : number) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Ingreso_Peletizado/getStockPele_Details/${matprima}`);

  Post = (data : any): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/Ingreso_Peletizado', data);

}
