import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { modelDtAsgRollos_Extrusion } from '../../Modelo/modelDtAsgRollos_Extrusion';

@Injectable({
  providedIn: 'root'
})
export class DetallesAsgRollos_ExtrusionService {

  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

  constructor(private http : HttpClient) {}

  crearPdf = (id : number) => this.http.get<any>(this.rutaPlasticaribeAPI + `/DetallesAsgRollos_Extrusion/getCrearPDFUltimoId/${id}`);

  getconsultaRollosFechas = (fechaInicial : any, fechaFinal : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/DetallesAsgRollos_Extrusion/getconsultaRollosFechas/${fechaInicial}/${fechaFinal}`);

  getconsultaRollosOT = (ot : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/DetallesAsgRollos_Extrusion/getconsultaRollosOT/${ot}`);

  srvGuardar = (data : modelDtAsgRollos_Extrusion): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/DetallesAsgRollos_Extrusion', data);
}
