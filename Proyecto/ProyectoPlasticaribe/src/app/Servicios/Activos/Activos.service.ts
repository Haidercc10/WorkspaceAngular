import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelActivos } from 'src/app/Modelo/modelActivos';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

export class ActivosService {

  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;
  readonly ruta2 = "https://api.currencyapi.com/v3/latest?apikey=cur_live_qote9FFugoTdhF6GVEYXGzTISkYbPTxtAYxLmima"

  constructor(private http : HttpClient) { }

  GetTodo():Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/Activos')
  }

  GetId(id : number) {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Activos/${id}`);
  }

  GetActivoNombre(datos : string) {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Activos/getActivoNombre/${datos}`);
  }

  GetActivoSerial(datos : string) {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Activos/getInfoActivoSerial/${datos}`);
  }

  GetInfoActivos(activo : number){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Activos/getInfoActivos/${activo}`);
  }

  GetMovimiento(fecha1 : any, fecha2 : any, ruta : string) {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Activos/getMovimiento/${fecha1}/${fecha2}/${ruta}`);
  }

  Put(id:number|String, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/Activos/${id}`, data);
  }

  Delete(id:number|String) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/Activos/${id}`);
  }

  Insert(data : modelActivos): Observable<any> {
    return this.http.post(this.rutaPlasticaribeAPI + '/Activos', data);
  }

  Conversion = (): Observable<any> => this.http.get(this.ruta2);
  
}
