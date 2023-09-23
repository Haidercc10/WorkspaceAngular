import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelInventario_Areas } from 'src/app/Modelo/modelInventario_Areas';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Inventario_AreasService {
readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

constructor(private http : HttpClient) { }

  GetTodo = () => this.http.get<any>(this.rutaPlasticaribeAPI + '/Inventario_Areas');

  GetPorId = (dato : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Inventario_Areas/${dato}`);

  Put = (id:number|string, data : modelInventario_Areas) => this.http.put(this.rutaPlasticaribeAPI + `/Inventario_Areas/${id}`, data);

  Delete = (id:number|string) => this.http.delete(this.rutaPlasticaribeAPI + `/Inventario_Areas/${id}`);

  Post = (data : modelInventario_Areas): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/Inventario_Areas', data);
}
