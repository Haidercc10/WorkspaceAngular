import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribe3, rutaPlasticaribeAPI } from 'src/polyfills';
import { modelMateriaPrima } from '../Modelo/modelMateriaPrima';
import { modelPedidomateriaprima } from '../Modelo/modelPedidomateriaprima';

@Injectable({
  providedIn: 'root'
})
export class MateriaPrimaService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribe3;

  //Encapsular httpclient en el constructor
    constructor(private http : HttpClient) { }

  //Metodo buscar lista de Materia Prima
    srvObtenerLista():Observable<any[]> {
        return this.http.get<any>(this.rutaPlasticaribeAPI + '/Materia_Prima')
    }

  //Metodo agregar Materia Prima
    srvAgregar(data:any) {
      return this.http.post(this.rutaPlasticaribeAPI + '/Materia_Prima', data)
    }

  //Metodo actualzar Materia Prima
    srvActualizar(id:number|String, data:any) {
      return this.http.put(this.rutaPlasticaribeAPI + `/Materia_Prima/${id}`, data);
    }

  //Metodo eliminar Materia Prima
    srvEliminar(id:number|String) {
      return this.http.delete(this.rutaPlasticaribeAPI + `/Materia_Prima/${id}`);
    }

    //Duardar Materia Prima
    srvGuardar(data : modelMateriaPrima): Observable<any> {
     return this.http.post(this.rutaPlasticaribeAPI + '/Materia_Prima', data);
   }

}
