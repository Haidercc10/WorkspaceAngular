import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})

export class DepartamentosMunicipiosColombiaService {

    constructor(private http : HttpClient) { }

    getDepartamentos = () : Observable<any> => this.http.get<any>(`https://www.datos.gov.co/resource/8xzg-cn6x.json`);

}
