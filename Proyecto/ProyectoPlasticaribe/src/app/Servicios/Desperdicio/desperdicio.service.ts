import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelDesperdicio } from 'src/app/Modelo/modelDesperdicio';
import { rutaPlasticaribeAPI } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})
export class DesperdicioService {

  constructor(private http : HttpClient) { }

  GetTodo = ():Observable<any[]> => this.http.get<any>(rutaPlasticaribeAPI + '/Desperdicios');

  getDesperdicio = (fecha1: any, fecha2 : any, ruta : string = ``):Observable<any[]> => this.http.get<any>(rutaPlasticaribeAPI + `/Desperdicios/getConsultaDesperdicio2/${fecha1}/${fecha2}/${ruta}`);

  getDesperdicioxOT = (OT : any):Observable<any[]> => this.http.get<any>(rutaPlasticaribeAPI + `/Desperdicios/getConsultaDesperdicioxOT/${OT}`);

  GetUltimoPedido = () => this.http.get<any>(rutaPlasticaribeAPI + `/Desperdicios/getUltimoPedido`);

  GetDesperdicioOt = (ot : number) => this.http.get<any>(rutaPlasticaribeAPI + `/Desperdicios/GetDesperdicioOt/${ot}`);

  getMovimientosDesperdicios = (fecha1 : any, fecha2 : any, ruta : string = ``) => this.http.get<any>(rutaPlasticaribeAPI + `/Desperdicios/getMovDesperdicios/${fecha1}/${fecha2}/${ruta}`);
  
  Put = (id:number|String, data:any) => this.http.put(rutaPlasticaribeAPI + `/Desperdicios/${id}`, data);

  Delete = (id:number|String) => this.http.delete(rutaPlasticaribeAPI + `/Desperdicios/${id}`);

  Insert = (data : modelDesperdicio): Observable<any> => this.http.post(rutaPlasticaribeAPI + '/Desperdicios', data);
}
