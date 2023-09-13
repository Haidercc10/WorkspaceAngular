import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { modelIngRollo_Extrusion } from '../../Modelo/modelIngRollo_Extrusion';

@Injectable({
  providedIn: 'root'
})
export class IngRollos_ExtrusuionService {

  constructor(private http : HttpClient,) { }

  srvGuardar = (data : modelIngRollo_Extrusion): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/IngresoRollos_Extrusion', data);
}
