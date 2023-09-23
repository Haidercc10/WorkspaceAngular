import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { modelCategoriaMP } from '../../Modelo/modelCategoriaMP';

@Injectable({
  providedIn: 'root'
})
export class CategoriaMateriaPrimaService {

  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

  constructor(private http : HttpClient,) { }

  srvObtenerLista = ():Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + '/Categoria_MatPrima');

  srvObtenerListaPorId = (dato : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Categoria_MatPrima/${dato}`);

  srvAgregar = (data : modelCategoriaMP): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/Categoria_MatPrima', data);

}
