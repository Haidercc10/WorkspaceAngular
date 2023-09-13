import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { this.rutaPlasticaribeAPI, } from 'src/polyfills';
import { modelEntradaRollos } from '../../Modelo/modelEntradaRollos';

@Injectable({
  providedIn: 'root'
})
export class EntradaRollosService {

  constructor(private http : HttpClient,) { }

  srvObtenerUltimoId = () => this.http.get<any>(this.rutaPlasticaribeAPI + `/EntradaRollo_Producto/UltumoID`);

  srvGuardar = (data : modelEntradaRollos): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/EntradaRollo_Producto', data);
}
