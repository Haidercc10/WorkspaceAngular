import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { rutaPlasticaribeAPI, } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})
export class TintasMPService {

  constructor(private http : HttpClient,) { }
  
  srvObtenerListaPorId = (id : any) => this.http.get<any>(rutaPlasticaribeAPI + `/Tinta_MateriaPrima/${id}`);
    
  srvAgregar = (data : any) => this.http.post(rutaPlasticaribeAPI + '/Tinta_MateriaPrima', data);
}
