import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelConceptos_Automaticos } from 'src/app/Modelo/modelConceptos_Automaticos';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn : 'root'
})
export class Conceptos_AutomaticosService {
    
readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

constructor(private http : HttpClient) { }

  getAllConcepts = () => this.http.get<any>(this.rutaPlasticaribeAPI + `/Conceptos_Automaticos`);

  postConcepts = (data : modelConceptos_Automaticos): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/Conceptos_Automaticos', data);
}
