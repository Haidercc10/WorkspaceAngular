import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MaquinasService {

  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;
  
  constructor(private http : HttpClient,) { }

  getAllMachines = ():Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + '/Maquinas');

  getId = (id : any):Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + `/Maquinas/${id}`);

  PostMachine = (data : any): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/Maquinas', data);
}
