import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { modelPreentregaRollos } from '../../Modelo/modelPreEntregaRollo';

@Injectable({
  providedIn: 'root'
})
export class PreEntregaRollosService {

  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

  constructor(private http : HttpClient,) { }

  srvGuardar = (data : modelPreentregaRollos): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/PreEntrega_RolloDespacho', data);

}
