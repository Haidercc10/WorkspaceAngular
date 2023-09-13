import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { this.rutaPlasticaribeAPI, } from 'src/polyfills';
import { modelDtPreEntregaRollos } from '../../Modelo/modelDtPreEntregaRollo';

@Injectable({
  providedIn: 'root'
})
export class DtPreEntregaRollosService {

  constructor(private http : HttpClient,) { }

  srvCrearPDF = (ot : number, proceso : string) => this.http.get<any>(this.rutaPlasticaribeAPI + `/DetallePreEntrega_RolloDespacho/crearpdf/${ot}/${proceso}`);

  srvCrearPDF2 = (ot : number, proceso : string) => this.http.get<any>(this.rutaPlasticaribeAPI + `/DetallePreEntrega_RolloDespacho/crearpdf2/${ot}/${proceso}`);

  srvCrearPDFUltimoId = (id : number) => this.http.get<any>(this.rutaPlasticaribeAPI + `/DetallePreEntrega_RolloDespacho/CrearPDFUltimoID/${id}`);

  GetRollos = (data : any []): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/DetallePreEntrega_RolloDespacho/getRollos', data);

  GetRollos_Ingresar(fechaInicial : any, fechaFinal : any, proceso : string, ruta : string){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/DetallePreEntrega_RolloDespacho/getRollos_Ingresar/${fechaInicial}/${fechaFinal}/${proceso}/${ruta}`);
  }

  srvGuardar = (data : modelDtPreEntregaRollos): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/DetallePreEntrega_RolloDespacho', data);
}
