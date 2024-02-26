import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { modelAreas } from '../../Modelo/modelAreas';

@Injectable({
  providedIn: 'root'
})

export class AreaService {

  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

  constructor(private http : HttpClient) {}

  srvObtenerLista = ():Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + '/Areas');

  srvObtenerListaPorId = (dato : any) : Observable<any> => this.http.get<any>(this.rutaPlasticaribeAPI + `/Areas/${dato}`);

  srvGuardar = (data : modelAreas): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/Areas', data);

  getNombre = (dato : any) : Observable<any> => this.http.get<any>(this.rutaPlasticaribeAPI + `/Areas/getNombreArea/${dato}`);

  likeGetNombreArea = (dato : any) : Observable<any> => this.http.get<any>(this.rutaPlasticaribeAPI + `/Areas/getNombreAreaXLike/${dato}`);
}
