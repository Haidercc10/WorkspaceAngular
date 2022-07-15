import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribeAPI } from 'src/polyfills';
import { modelProveedor } from '../Modelo/modelProveedor';

@Injectable({
  providedIn: 'root'
})
export class SrvInsumosService {

  constructor(private http : HttpClient) { }

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Metodo buscar lista de proveedor
srvObtenerLista():Observable<any[]> {
  return this.http.get<any>(this.rutaPlasticaribeAPI + '/Categoria_Insumo')
}

srvObtenerListaPorId(id : any){
  return this.http.get<any>(this.rutaPlasticaribeAPI + `/Categoria_Insumo/${id}`);
}

//Metodo agregar proveedor
srvAgregar(data:any) {
  return this.http.post(this.rutaPlasticaribeAPI + '/Categoria_Insumo', data)
}

//Metodo actualzar proveedor
srvActualizar(id:number|String, data:any) {
  return this.http.put(this.rutaPlasticaribeAPI + `/Categoria_Insumo/${id}`, data);
}

//Metodo eliminar proveedor
srvEliminar(id:number|String) {
  return this.http.delete(this.rutaPlasticaribeAPI + `/Categoria_Insumo/${id}`);
}

//Metodo Guardar proveedor con un modelo
srvGuardar(data : modelProveedor): Observable<any> {
 return this.http.post(this.rutaPlasticaribeAPI + '/Categoria_Insumo', data);
}
}
