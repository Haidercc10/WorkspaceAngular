import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn : 'root'
})
export class Ubicaciones_BodegaRollosService {

    readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

    constructor(private http : HttpClient,) { }

    getUbications = () => this.http.get<any>(this.rutaPlasticaribeAPI + '/Ubicaciones_BodegaRollos');

    getCode = (code : number) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Ubicaciones_BodegaRollos/${code}`);
  
    putUbication = (code : number, data:any) => this.http.put(this.rutaPlasticaribeAPI + `/Ubicaciones_BodegaRollos/${code}`, data);

    deleteUbications = (id:number|String) => this.http.delete(this.rutaPlasticaribeAPI + `/Ubicaciones_BodegaRollos/${id}`);

    postUbicatios = (data : any): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/Ubicaciones_BodegaRollos', data);
}
