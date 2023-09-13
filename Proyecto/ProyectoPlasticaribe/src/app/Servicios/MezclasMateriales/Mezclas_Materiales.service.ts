import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { this.rutaPlasticaribeAPI, } from 'src/polyfills';
import { modelMezMaterial } from '../../Modelo/modelMezMaterial';

@Injectable({
  providedIn: 'root'
})
export class Mezclas_MaterialesService {

  constructor(private http : HttpClient,) { }
  
  srvObtenerLista = ():Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + '/Mezcla_Material');

  getMezclasMateriales = (nombre : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Mezcla_Material/Nombres_Materiales/${nombre}`);

  srvGuardar = (data : modelMezMaterial): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/Mezcla_Material', data);

}
