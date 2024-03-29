import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { modelBOPP } from '../../Modelo/modelBOPP';

@Injectable( { providedIn: 'root' } )

export class EntradaBOPPService {

  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

  constructor(private http : HttpClient,) { }

  srvObtenerLista = ():Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + '/BOPP');

  GetBoppConExistencias = ():Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + '/BOPP/GetBoppConExistencias');

  srvObtenerListaPorId = (id : any):Observable<any> => this.http.get<any>(this.rutaPlasticaribeAPI + `/BOPP/${id}`);

  srvObtenerListaPorSerial = (id : any):Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + `/BOPP/serial/${id}`);

  GetBoppStockInventario = ():Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + `/BOPP/getBoppStockInventario`);

  GetCantRollosIngresados_Mes = (fecha1 : any, fecha2 : any):Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + `/BOPP/getCantRollosIngresados_Mes/${fecha1}/${fecha2}`)

  GetCantRollosUtilizados_Mes = (fecha1 : any, fecha2 : any):Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + `/BOPP/getCantRollosUtilizados_Mes/${fecha1}/${fecha2}`)
  
  getBopp = ():Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + '/BOPP/getDescripcion');

  getMicras = ():Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + '/BOPP/getMicras');

  getPrecios = ():Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + '/BOPP/getPrecios');

  getAnchos = ():Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + '/BOPP/getAnchos');

  getSeriales = ():Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + '/BOPP/getSeriales');

  GetCategoriasBOPP = () => this.http.get<any>(this.rutaPlasticaribeAPI + '/BOPP/getCategoriasBOPP');

  srvActualizar = (id:any, data:any) => this.http.put(this.rutaPlasticaribeAPI + `/BOPP/${id}`, data);

  PutInventarioBiorientado = (id : number, cantidad : number) => this.http.put(this.rutaPlasticaribeAPI + `/BOPP/putInventarioBiorientado/${id}/${cantidad}`, cantidad);

  srvGuardar = (data: modelBOPP): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/BOPP', data);

  GetInventarioBoppsGenericos = ():Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + '/BOPP/getInventarioBoppsGenericos');

  GetInventarioBopps = (fecha1 : any, fecha2 : any, id : any):Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + `/BOPP/getInventarioBopps/${fecha1}/${fecha2}/${id}`);
}
