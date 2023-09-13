import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { modelEntradaRollos } from '../../Modelo/modelEntradaRollos';

@Injectable({
  providedIn: 'root'
})
export class EntradaRollosService {

  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

  constructor(private http : HttpClient,) { }

  srvObtenerUltimoId = () => this.http.get<any>(this.rutaPlasticaribeAPI + `/EntradaRollo_Producto/UltumoID`);

  srvGuardar = (data : modelEntradaRollos): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/EntradaRollo_Producto', data);
}
