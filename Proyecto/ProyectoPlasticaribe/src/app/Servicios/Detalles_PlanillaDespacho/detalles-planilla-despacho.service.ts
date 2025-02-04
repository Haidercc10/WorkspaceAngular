import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelDetalles_PlanillaDespacho } from 'src/app/Modelo/modelDetalles_PlanillaDespacho';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DetallesPlanillaDespachoService {

  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;
  
  constructor(private http : HttpClient) { }

    getId = (id : number) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Detalles_PlanillaDespacho/${id}`);

    getAll = () => this.http.get<any>(this.rutaPlasticaribeAPI + `/Detalles_PlanillaDespacho`);

    getSpreadSheetforId = (id : number) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Detalles_PlanillaDespacho/getSpreadSheetforId/${id}`);
  
    Post = (data : modelDetalles_PlanillaDespacho): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/Detalles_PlanillaDespacho', data);

    Put = (code : number, newSpreadSheet : number, data : any) => this.http.put(this.rutaPlasticaribeAPI + `/Detalles_PlanillaDespacho/putSpreadSheetForFact/${code}/${newSpreadSheet}`, data);

    Delete = (id : number) => this.http.delete(this.rutaPlasticaribeAPI + `/Detalles_PlanillaDespacho/${id}`);
}
