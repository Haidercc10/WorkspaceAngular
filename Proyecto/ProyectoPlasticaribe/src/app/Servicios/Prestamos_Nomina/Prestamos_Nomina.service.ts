import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { loan } from 'src/app/Vistas/Prestamos_Nomina/Prestamos_Nomina.component';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn : 'root'
})
export class Prestamos_NominaService {

readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

constructor(private http : HttpClient) { }

    GetLoansForCardId = (cardId : any): Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Prestamos/getLoansForCardId/${cardId}`);

    Post = (data : loan): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/Prestamos', data);

}
