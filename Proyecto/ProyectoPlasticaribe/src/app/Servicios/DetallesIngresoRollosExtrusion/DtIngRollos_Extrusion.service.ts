import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI } from 'src/polyfills';
import { modelDtIngRollo_Extrusion } from '../../Modelo/modelDtIngRollo_Extrusion';

@Injectable({
  providedIn: 'root'
})
export class DtIngRollos_ExtrusionService {

  constructor(private http : HttpClient,) { }

  srvObtenerListaRollosDisponible = () => this.http.get<any>(rutaPlasticaribeAPI + '/DetallesIngRollos_Extrusion/getTodosRollosDisponibles');

  consultarRollo = (rollo : number) => this.http.get<any>(rutaPlasticaribeAPI + `/DetallesIngRollos_Extrusion/consultaRollo/${rollo}`);

  crearPdf = (id : number) => this.http.get<any>(rutaPlasticaribeAPI + `/DetallesIngRollos_Extrusion/getCrearPDFUltimoId/${id}`);

  getRollosDisponibles = (hoy : any) => this.http.get<any>(rutaPlasticaribeAPI + `/DetallesIngRollos_Extrusion/getRollosDisponibles/${hoy}`);

  getRollosDisponiblesOT = (ot : any) => this.http.get<any>(rutaPlasticaribeAPI + `/DetallesIngRollos_Extrusion/getRollosDisponiblesOT/${ot}`);

  getTodosRollosDisponiblesAgrupados = () => this.http.get<any>(rutaPlasticaribeAPI + `/DetallesIngRollos_Extrusion/getTodosRollosDisponiblesAgrupados`);

  getRollosDisponiblesRollo = (rollo : any) => this.http.get<any>(rutaPlasticaribeAPI + `/DetallesIngRollos_Extrusion/getRollosDisponiblesRollo/${rollo}`);

  getRollosDisponiblesFechas = (fechaInicial : any, fechaFinal : any) => this.http.get<any>(rutaPlasticaribeAPI + `/DetallesIngRollos_Extrusion/getRollosDisponiblesFechas/${fechaInicial}/${fechaFinal}`);

  getconsultaRollosFechas = (fechaInicial : any, fechaFinal : any) => this.http.get<any>(rutaPlasticaribeAPI + `/DetallesIngRollos_Extrusion/getconsultaRollosFechas/${fechaInicial}/${fechaFinal}`);

  getconsultaRollosOT = (ot : any) => this.http.get<any>(rutaPlasticaribeAPI + `/DetallesIngRollos_Extrusion/getconsultaRollosOT/${ot}`);

  getCrearPdfEntrada = (id : any) => this.http.get<any>(rutaPlasticaribeAPI + `/DetallesIngRollos_Extrusion/getCrearPdfEntrada/${id}`);

  GetRollos = (data : any []): Observable<any> => this.http.post(rutaPlasticaribeAPI + `/DetallesIngRollos_Extrusion/getRollos`, data);

  srvActualizar = (id: any, data:any) => this.http.put(rutaPlasticaribeAPI + `/DetallesIngRollos_Extrusion/${id}`, data);

  EliminarRollExtrusion = (id : any) => this.http.delete(rutaPlasticaribeAPI + `/DetallesIngRollos_Extrusion/EliminarRolloIngresados/${id}`);

  srvGuardar = (data : modelDtIngRollo_Extrusion): Observable<any> => this.http.post(rutaPlasticaribeAPI + '/DetallesIngRollos_Extrusion', data);

}
