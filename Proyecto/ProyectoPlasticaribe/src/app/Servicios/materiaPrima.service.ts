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

  constructor(private http : HttpClient) { }

  //Metodo buscar lista de Productos
  srvObtenerLista():Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/Materia_Prima');
  }

  srvObtenerListaPorId(id : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Materia_Prima/${id}`);
  }

  srvObtenerListaPorCategoria(id : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Materia_Prima/categoria/${id}`);
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
