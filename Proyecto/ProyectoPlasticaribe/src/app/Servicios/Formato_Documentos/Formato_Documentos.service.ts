import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI } from 'src/polyfills';

@Injectable()
export class Formato_DocumentosService {

    constructor(private http : HttpClient) { }

    GetTodo = () : Observable<any> => this.http.get<any>(`${rutaPlasticaribeAPI}/Formato_Documentos`);

    Get_Id = (id : number) => this.http.get<any>(`${rutaPlasticaribeAPI}/Formato_Documentos/${id}`);

    GetUltFormadoDoc = (nombre : string) : Observable<any> => this.http.get<any>(`${rutaPlasticaribeAPI}/Formato_Documentos/UltimoFormadoDoc/${nombre}`);

}
