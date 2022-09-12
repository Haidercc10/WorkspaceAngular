import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribe3, rutaPlasticaribeAPI } from 'src/polyfills';
import { modelDevolucion } from '../Modelo/modelDevolucion';

@Injectable({
  providedIn: 'root'
})
export class DevolucionesService {

  //Ruta del API
  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

//Encapsular httpclient en el constructor
  constructor(private http: HttpClient) { }

//Metodo buscar lista de
  srvObtenerLista() {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/Devolucion_MatPrima')
  }

  srvObtenerUltimaAsignacion(){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Devolucion_MatPrima/ultimoId`);
  }

  srvObtenerListaPorId(id : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Devolucion_MatPrima/${id}`);
  }

  srvObtenerListaPorfecha(id : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Devolucion_MatPrima/fecha/${id}`);
  }

  srvObtenerListaPofechas(fecha1 : any, fecha2 : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Devolucion_MatPrima/fechas?DevMatPri_Fecha1=${fecha1}&DevMatPri_Fecha2=${fecha2}`);
  }

  srvObtenerListaPorOT(id : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Devolucion_MatPrima/OT/${id}`);
  }
//Metodo agregar
  srvAgregar(data:any) {
    return this.http.post(this.rutaPlasticaribeAPI + '/Devolucion_MatPrima', data)
  }
//Metodo actualizar
  srvActualizar(id:number|String, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/Devolucion_MatPrima/${id}`, data);
  }
//Metodo eliminar
  srvEliminar(id:number|String) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/Devolucion_MatPrima/${id}`);
  }

  srvGuardar(data : modelDevolucion): Observable<any> {
   return this.http.post(this.rutaPlasticaribeAPI + '/Devolucion_MatPrima', data);
  }

}
