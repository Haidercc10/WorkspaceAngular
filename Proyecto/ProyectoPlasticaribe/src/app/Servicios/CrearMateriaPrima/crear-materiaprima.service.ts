import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI, } from 'src/polyfills';
import { modelMateriaPrima } from '../../Modelo/modelMateriaPrima';

@Injectable({
  providedIn: 'root'
})
export class CrearMateriaprimaService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient,) { }

  /** Metodo para obtener la lista de materias primas */
  srvObtenerLista():Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/Materia_Prima');
  }

  /** Metodo para obtener la lista de materias primas por Id.*/
  srvObtenerListaPorId(id : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Materia_Prima/${id}`);
  }

  //Metodo agregar Productos
  srvAgregar(data : any) {
    return this.http.post(this.rutaPlasticaribeAPI + '/Materia_Prima', data)
  }

  //Metodo actualzar Productos
  srvActualizar(id:number|String, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/Materia_Prima/${id}`, data);
  }

  //Metodo eliminar Productos
  srvEliminar(id:number|String) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/Materia_Prima/${id}`);
  }

  //
  srvGuardar(data : modelMateriaPrima): Observable<any> {
    return this.http.post(this.rutaPlasticaribeAPI + '/Materia_Prima', data)
  }

}
