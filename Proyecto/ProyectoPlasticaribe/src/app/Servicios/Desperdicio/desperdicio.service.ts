import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelDesperdicio } from 'src/app/Modelo/modelDesperdicio';
import { rutaPlasticaribeAPI } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})
export class DesperdicioService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  constructor(private http : HttpClient) { }

  GetTodo():Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/Desperdicios');
  }

  getDesperdicio(fecha1: any, fecha2 : any, ruta : string = ``):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Desperdicios/getConsultaDesperdicio2/${fecha1}/${fecha2}/${ruta}`);
  }

  getDesperdicioxOT(OT : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Desperdicios/getConsultaDesperdicioxOT/${OT}`);
  }

  GetUltimoPedido(){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Desperdicios/getUltimoPedido`);
  }

  GetDesperdicioOt(ot : number){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Desperdicios/GetDesperdicioOt/${ot}`);
  }

  getMovimientosDesperdicios(fecha1 : any, fecha2 : any, ruta : string = ``){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Desperdicios/getMovDesperdicios/${fecha1}/${fecha2}/${ruta}`);
  }

  Put(id:number|String, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/Desperdicios/${id}`, data);
  }

  Delete(id:number|String) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/Desperdicios/${id}`);
  }

  Insert(data : modelDesperdicio): Observable<any> {
    return this.http.post(this.rutaPlasticaribeAPI + '/Desperdicios', data);
  }
}
