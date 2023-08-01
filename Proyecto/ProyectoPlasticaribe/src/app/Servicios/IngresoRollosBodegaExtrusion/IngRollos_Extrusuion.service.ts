import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI } from 'src/polyfills';
import { modelIngRollo_Extrusion } from '../../Modelo/modelIngRollo_Extrusion';

@Injectable({
  providedIn: 'root'
})
export class IngRollos_ExtrusuionService {

  constructor(private http : HttpClient,) { }

  srvGuardar = (data : modelIngRollo_Extrusion): Observable<any> => this.http.post(rutaPlasticaribeAPI + '/IngresoRollos_Extrusion', data);
}
