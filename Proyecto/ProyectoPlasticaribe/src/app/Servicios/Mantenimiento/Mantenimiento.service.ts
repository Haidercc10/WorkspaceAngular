import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelMantenimiento } from 'src/app/Modelo/modelMantenimiento';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MantenimientoService {

  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

  constructor(private http : HttpClient) { }

  GetUltimoId = ():Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + '/Mantenimiento/ObtenerUltimoId');

  GetPedidoAceptado = (id : any):Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + `/Mantenimiento/getPedidoMtto/${id}`);

  GetMantenimientoxId = (id : any):Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + `/Mantenimiento/getMttos/${id}`);

  Put = (id:number|String, data:any) => this.http.put(this.rutaPlasticaribeAPI + `/Mantenimiento/${id}`, data);
 
  Insert = (data : modelMantenimiento): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/Mantenimiento', data);

  GetPedido_Mantenimiento = (fecha1 : any, fecha2 : any, ruta : string = ``) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Mantenimiento/getPedido_Mantenimiento/${fecha1}/${fecha2}/${ruta}`);
}
