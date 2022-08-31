import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribe3, rutaPlasticaribeAPI } from 'src/polyfills';
import { modelTintas } from '../Modelo/modelTintas';

@Injectable({
  providedIn: 'root'
})
export class TintasService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  constructor(private http : HttpClient) { }

  //Metodo buscar lista de Productos
  srvObtenerLista():Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/Tinta');
  }

  srvObtenerListaPorId(id : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Tinta/${id}`);
  }

  srvObtenerListaConsultaImpresion(tpImp : string, t1 : string, t2 : string, t3 : string, t4 : string, t5 : string, t6 : string, t7 : string, t8 : string){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Tinta/consultaImpresion/${tpImp}/${t1}/${t2}/${t3}/${t4}/${t5}/${t6}/${t7}/${t8}`);
  }

  //Metodo actualzar Productos
  srvActualizar(id:number|String, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/Tinta/${id}`, data);
  }

  //Metodo eliminar Productos
  srvEliminar(id:number|String) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/Tinta/${id}`);
  }

  //
  srvGuardar(data : modelTintas): Observable<any> {
    return this.http.post(this.rutaPlasticaribeAPI + '/Tinta', data)
  }

}
