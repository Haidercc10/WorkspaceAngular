import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { this.rutaPlasticaribeAPI, } from 'src/polyfills';
import { modelTintas } from '../../Modelo/modelTintas';

@Injectable({
  providedIn: 'root'
})
export class TintasService {

  constructor(private http : HttpClient,) { }

  srvObtenerLista = ():Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + '/Tinta');

  srvObtenerListaPorId = (id : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Tinta/${id}`);

  srvObtenerListaXColores = ():Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + '/Tinta/TintasColores');

  GetCategoriasTintas = () => this.http.get<any>(this.rutaPlasticaribeAPI + '/Tinta/getCategoriasTintas');

  srvObtenerListaConsultaImpresion(t1 : string, t2 : string, t3 : string, t4 : string, t5 : string, t6 : string, t7 : string, t8 : string){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Tinta/consultaImpresion/${t1}/${t2}/${t3}/${t4}/${t5}/${t6}/${t7}/${t8}`);
  }

  srvActualizar = (id:number|String, data:any) => this.http.put(this.rutaPlasticaribeAPI + `/Tinta/${id}`, data);

  srvGuardar = (data : modelTintas): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/Tinta', data);
}
