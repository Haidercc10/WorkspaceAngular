import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI, } from 'src/polyfills';
import { modelBOPP } from '../../Modelo/modelBOPP';

@Injectable( { providedIn: 'root' } )

export class EntradaBOPPService {

  constructor(private http : HttpClient,) { }

  srvObtenerLista = ():Observable<any[]> => this.http.get<any>(rutaPlasticaribeAPI + '/BOPP');

  GetBoppConExistencias = ():Observable<any[]> => this.http.get<any>(rutaPlasticaribeAPI + '/BOPP/GetBoppConExistencias');

  srvObtenerListaPorId = (id : any):Observable<any> => this.http.get<any>(rutaPlasticaribeAPI + `/BOPP/${id}`);

  srvObtenerListaPorSerial = (id : any):Observable<any[]> => this.http.get<any>(rutaPlasticaribeAPI + `/BOPP/serial/${id}`);

  GetBoppStockInventario = ():Observable<any[]> => this.http.get<any>(rutaPlasticaribeAPI + `/BOPP/getBoppStockInventario`);

  GetCantRollosIngresados_Mes = (fecha1 : any, fecha2 : any):Observable<any[]> => this.http.get<any>(rutaPlasticaribeAPI + `/BOPP/getCantRollosIngresados_Mes/${fecha1}/${fecha2}`)

  GetCantRollosUtilizados_Mes = (fecha1 : any, fecha2 : any):Observable<any[]> => this.http.get<any>(rutaPlasticaribeAPI + `/BOPP/getCantRollosUtilizados_Mes/${fecha1}/${fecha2}`)
  
  getBopp = ():Observable<any[]> => this.http.get<any>(rutaPlasticaribeAPI + '/BOPP/getDescripcion');

  getMicras = ():Observable<any[]> => this.http.get<any>(rutaPlasticaribeAPI + '/BOPP/getMicras');

  getPrecios = ():Observable<any[]> => this.http.get<any>(rutaPlasticaribeAPI + '/BOPP/getPrecios');

  getAnchos = ():Observable<any[]> => this.http.get<any>(rutaPlasticaribeAPI + '/BOPP/getAnchos');

  getSeriales = ():Observable<any[]> => this.http.get<any>(rutaPlasticaribeAPI + '/BOPP/getSeriales');

  GetCategoriasBOPP = () => this.http.get<any>(rutaPlasticaribeAPI + '/BOPP/getCategoriasBOPP');

  srvActualizar = (id:any, data:any) => this.http.put(rutaPlasticaribeAPI + `/BOPP/${id}`, data);

  srvGuardar = (data: modelBOPP): Observable<any> => this.http.post(rutaPlasticaribeAPI + '/BOPP', data);

  GetInventarioBoppsGenericos = ():Observable<any[]> => this.http.get<any>(rutaPlasticaribeAPI + '/BOPP/getInventarioBoppsGenericos');

  GetInventarioBopps = (fecha1 : any, fecha2 : any, id : any):Observable<any[]> => this.http.get<any>(rutaPlasticaribeAPI + `/BOPP/getInventarioBopps/${fecha1}/${fecha2}/${id}`);
}
