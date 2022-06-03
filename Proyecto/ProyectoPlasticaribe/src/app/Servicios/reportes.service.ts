import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelReportes } from '../Modelo/modelReportes';


@Injectable({
  providedIn: 'root'
})
export class ReportesService {

  //Ruta del API
  readonly rutaPlasticaribeAPI = "https://192.168.0.153:7137/api";

//Encapsular httpclient en el constructor
  constructor(private httpReportes : HttpClient) {


  }
//Metodo buscar lista de Reportes
  srvObtenerListaReportes():Observable<any[]> {
      return this.httpReportes.get<any>(this.rutaPlasticaribeAPI + '/Reportes')
  }
//Metodo agregar Reportes
  srvAgregarReportes(data:any) {
    return this.httpReportes.post(this.rutaPlasticaribeAPI + '/Reportes', data)
  }
//Metodo actualzar Reportes
  srvActualizarReportes(id:number|String, data:any) {
    return this.httpReportes.put(this.rutaPlasticaribeAPI + `/Reportes/${id}`, data);
  }
//Metodo eliminar Reportes
  srvEliminarReportes(id:number|String) {
    return this.httpReportes.delete(this.rutaPlasticaribeAPI + `/Reportes/${id}`);
  }
//Metodo Guardar Reportes
  srvGuardarReportes(Reportes : modelReportes): Observable<any> {
   return this.httpReportes.post(this.rutaPlasticaribeAPI + '/Reportes', Reportes)
 }

}
