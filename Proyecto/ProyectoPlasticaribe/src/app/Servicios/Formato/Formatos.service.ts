import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI, } from 'src/polyfills';
import { modelFormato } from '../../Modelo/modelFormato';

@Injectable({
  providedIn: 'root'
})
export class FormatosService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient,) { }

  srvObtenerLista() {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/Formatos');
  }

  srvObtenerListaPorId(dato : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Formatos/${dato}`);
  }

  srvObtenerListaPorExtrusionNombres(formato : string, material : string, pigmento : string, tratado : string){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Formatos/consultaExtrusion/${formato}/${material}/${pigmento}/${tratado}`);
  }

  srvActualizar(id:number|string, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/Formatos/${id}`, data);
  }

  srvEliminar(id:number|string) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/Formatos/${id}`);
  }

  srvGuardar(data : modelFormato): Observable<any> {
   return this.http.post(this.rutaPlasticaribeAPI + '/Formatos', data);
  }

}
