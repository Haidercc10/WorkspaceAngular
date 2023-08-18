import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelCertificadosCalidad } from 'src/app/Modelo/modelCertificadosCalidad';
import { rutaPlasticaribeAPI } from 'src/polyfills';

@Injectable({
    providedIn : 'root'
})

export class Certificados_CalidadService {

constructor(private http : HttpClient) { }

    Get_Todo = () : Observable<any> => this.http.get<any>(`${rutaPlasticaribeAPI}/Certificados_Calidad`);

    Get_Id = (id : number) : Observable<any> => this.http.get<any>(`${rutaPlasticaribeAPI}/Certificados_Calidad/${id}`);

    Post = (data : modelCertificadosCalidad) : Observable<any> => this.http.post(`${rutaPlasticaribeAPI}/Certificados_Calidad`, data);

    GetCertificados = ( fecha1 : any, fecha2 : any, ruta : string = ``) : Observable<any> => this.http.get<any>(`${rutaPlasticaribeAPI}/Certificados_Calidad/GetCertificados/${fecha1}/${fecha2}${ruta}`);
}
