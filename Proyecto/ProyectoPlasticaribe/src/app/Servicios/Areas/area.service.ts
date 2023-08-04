import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI, } from 'src/polyfills';
import { modelAreas } from '../../Modelo/modelAreas';

@Injectable({
  providedIn: 'root'
})

export class AreaService {

  constructor(private http : HttpClient) {}

  srvObtenerLista = ():Observable<any[]> => this.http.get<any>(rutaPlasticaribeAPI + '/Areas');

  srvObtenerListaPorId = (dato : any) : Observable<any> => this.http.get<any>(rutaPlasticaribeAPI + `/Areas/${dato}`);

  srvGuardar = (data : modelAreas): Observable<any> => this.http.post(rutaPlasticaribeAPI + '/Areas', data);

  getNombre = (dato : any) : Observable<any> => this.http.get<any>(rutaPlasticaribeAPI + `/Areas/getNombreArea/${dato}`);

  likeGetNombreArea = (dato : any) : Observable<any> => this.http.get<any>(rutaPlasticaribeAPI + `/Areas/getNombreAreaXLike/${dato}`);
}

