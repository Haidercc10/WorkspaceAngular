import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TintasMPService {
  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;
  
  constructor(private http : HttpClient,) { }
  
  srvObtenerListaPorId = (id : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Tinta_MateriaPrima/${id}`);
    
  srvAgregar = (data : any) => this.http.post(this.rutaPlasticaribeAPI + '/Tinta_MateriaPrima', data);
}
