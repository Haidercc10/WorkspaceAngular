import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI } from 'src/polyfills';

@Injectable()
export class Nomina_PlasticaribeService {

constructor(private http : HttpClient) { }

    Post = (data : any) => this.http.post(`${rutaPlasticaribeAPI}/Nomina_Plasticaribe`, data);
    
    GetNominaMeses = (anio : number) : Observable<any> => this.http.get<any>(`${rutaPlasticaribeAPI}/Nomina_Plasticaribe/getNominaMeses/${anio}`);

    GetDetallesNomina = (anio : number, mes : number) : Observable<any> => this.http.get<any>(`${rutaPlasticaribeAPI}/Nomina_Plasticaribe/getDetallesNomina/${anio}/${mes}`);

}