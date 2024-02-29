import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { modelDtPreEntregaRollos } from '../../Modelo/modelDtPreEntregaRollo';

@Injectable({
  providedIn: 'root'
})
export class DtPreEntregaRollosService {

  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

  constructor(private http : HttpClient,) { }

  srvCrearPDF = (ot : number, proceso : string) => this.http.get<any>(this.rutaPlasticaribeAPI + `/DetallePreEntrega_RolloDespacho/crearpdf/${ot}/${proceso}`);

  srvCrearPDF2 = (ot : number, proceso : string) => this.http.get<any>(this.rutaPlasticaribeAPI + `/DetallePreEntrega_RolloDespacho/crearpdf2/${ot}/${proceso}`);

  srvCrearPDFUltimoId = (id : number) => this.http.get<any>(this.rutaPlasticaribeAPI + `/DetallePreEntrega_RolloDespacho/CrearPDFUltimoID/${id}`);

  GetRollos = (data : any []): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/DetallePreEntrega_RolloDespacho/getRollos', data);

  GetInformactionAboutPreIn_ById = (id: number): Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/DetallePreEntrega_RolloDespacho/getInformactionAboutPreIn_ById/${id}`);

  GetInformactionAboutPreInToSendDesp_ById = (id: number): Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/DetallePreEntrega_RolloDespacho/getInformactionAboutPreInToSendDesp_ById/${id}`);

  GetRollos_Ingresar(fechaInicial : any, fechaFinal : any, proceso : string, ruta : string){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetallePreEntrega_RolloDespacho/getRollos_Ingresar/${fechaInicial}/${fechaFinal}/${proceso}/${ruta}`);
  }

  srvGuardar = (data : modelDtPreEntregaRollos): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/DetallePreEntrega_RolloDespacho', data);

  GetPreInProduction = (date1 : any, date2 : any, url : string): Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/DetallePreEntrega_RolloDespacho/GetPreInProduction/${date1}/${date2}${url}`);
}
