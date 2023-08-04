import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI, } from 'src/polyfills';
import { modelCategoriaMP } from '../../Modelo/modelCategoriaMP';

@Injectable({
  providedIn: 'root'
})
export class CategoriaMateriaPrimaService {

  constructor(private http : HttpClient,) { }

  srvObtenerLista = ():Observable<any[]> => this.http.get<any>(rutaPlasticaribeAPI + '/Categoria_MatPrima');

  srvObtenerListaPorId = (dato : any) => this.http.get<any>(rutaPlasticaribeAPI + `/Categoria_MatPrima/${dato}`);

  srvAgregar = (data : modelCategoriaMP): Observable<any> => this.http.post(rutaPlasticaribeAPI + '/Categoria_MatPrima', data);

}
