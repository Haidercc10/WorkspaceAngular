import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelTipoSalidas_CajaMenor } from 'src/app/Modelo/TipoSalidas_CajaMenor';
import { environment } from 'src/environments/environment';

@Injectable({providedIn: 'root'})
export class TipoSalidas_CajaMenorService {

constructor(private http : HttpClient) { }

    Get_Todo = () : Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/TipoSalidas_CajaMenor`);

    Get_Id = (id : number) : Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/TipoSalidas_CajaMenor/${id}`);

    Post = (data : modelTipoSalidas_CajaMenor) : Observable<any> => this.http.post(`${this.rutaPlasticaribeAPI}/TipoSalidas_CajaMenor`, data);


}
