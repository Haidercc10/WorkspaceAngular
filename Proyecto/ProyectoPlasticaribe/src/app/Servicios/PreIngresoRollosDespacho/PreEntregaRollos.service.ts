import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI, } from 'src/polyfills';
import { modelPreentregaRollos } from '../../Modelo/modelPreEntregaRollo';

@Injectable({
  providedIn: 'root'
})
export class PreEntregaRollosService {

  constructor(private http : HttpClient,) { }

  srvGuardar = (data : modelPreentregaRollos): Observable<any> => this.http.post(rutaPlasticaribeAPI + '/PreEntrega_RolloDespacho', data);

}
