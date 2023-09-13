import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { this.rutaPlasticaribeAPI, } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})
export class TintasMPService {

  constructor(private http : HttpClient,) { }
  
  srvObtenerListaPorId = (id : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Tinta_MateriaPrima/${id}`);
    
  srvAgregar = (data : any) => this.http.post(this.rutaPlasticaribeAPI + '/Tinta_MateriaPrima', data);
}
