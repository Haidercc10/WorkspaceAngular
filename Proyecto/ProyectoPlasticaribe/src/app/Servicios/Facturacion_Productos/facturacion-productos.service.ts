import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { modelFacturacion_Productos } from 'src/app/Modelo/Facturacion_Productos';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FacturacionProductosService {

  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;
  
    constructor(private http : HttpClient,) { }
  
    get = () => this.http.get<any>(this.rutaPlasticaribeAPI + '/Facturacion_Productos');

    getInfoOfDirect = (of : number) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Facturacion_Productos/getInfoOfDirect/${of }`);
  
    Post = (data: modelFacturacion_Productos) => this.http.post(`${this.rutaPlasticaribeAPI}/Facturacion_Productos`, data);
  
    Put = (id : number, data: modelFacturacion_Productos) => this.http.put(`${this.rutaPlasticaribeAPI}/Facturacion_Productos/${id}`, data);

    PutOfDirectDispatched = (of : number, data: any) => this.http.put(`${this.rutaPlasticaribeAPI}/Facturacion_Productos/PutOfDirectDispatched/${of}`, data);
}
