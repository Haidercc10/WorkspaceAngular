import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI } from 'src/polyfills';
import { modelCategoriaMP } from '../Modelo/modelCategoriaMP';

@Injectable({
  providedIn: 'root'
})
export class CategoriaMateriaPrimaService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
    constructor(private http : HttpClient) { }

  //Metodo buscar lista de categoria de materia prima
    srvObtenerLista():Observable<any[]> {
        return this.http.get<any>(this.rutaPlasticaribeAPI + '/Categoria_MatPrima')
    }

    srvObtenerListaPorId(dato : any){
      return this.http.get<any>(this.rutaPlasticaribeAPI + `/Categoria_MatPrima/${dato}`);
    }

  //Metodo agregar categoria de materia prima
    srvAgregar(data:any) {
      return this.http.post(this.rutaPlasticaribeAPI + '/Categoria_MatPrima', data)
    }

  //Metodo actualzar categoria de materia prima
    srvActualizar(id:number|String, data:any) {
      return this.http.put(this.rutaPlasticaribeAPI + `/Categoria_MatPrima/${id}`, data);
    }

  //Metodo eliminar categoria de materia prima
    srvEliminar(id:number|String) {
      return this.http.delete(this.rutaPlasticaribeAPI + `/Categoria_MatPrima/${id}`);
    }

    //Duardar categoria de materia prima
    srvGuardar(data : modelCategoriaMP): Observable<any> {
     return this.http.post(this.rutaPlasticaribeAPI + '/Categoria_MatPrima', data);
   }

}
