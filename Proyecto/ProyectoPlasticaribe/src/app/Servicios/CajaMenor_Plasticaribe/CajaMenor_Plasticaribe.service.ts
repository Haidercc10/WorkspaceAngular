import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelCajaMenor_Plasticaribe } from 'src/app/Modelo/CajaMenor_Plasticaribe';
import { rutaPlasticaribeAPI } from 'src/polyfills';

@Injectable({providedIn: 'root'})
export class CajaMenor_PlasticaribeService {

constructor(private http : HttpClient) { }

    Get_Todo = () : Observable<any> => this.http.get<any>(`${rutaPlasticaribeAPI}/CajaMenor_Plasticaribe`);

    Get_Id = (id : number) : Observable<any> => this.http.get<any>(`${rutaPlasticaribeAPI}/CajaMenor_Plasticaribe/${id}`);

    Post = (data : modelCajaMenor_Plasticaribe) : Observable<any> => this.http.post(`${rutaPlasticaribeAPI}/CajaMenor_Plasticaribe`, data);
}
