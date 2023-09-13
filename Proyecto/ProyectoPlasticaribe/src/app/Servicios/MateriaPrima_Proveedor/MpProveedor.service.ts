import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { modelMpProveedor } from '../../Modelo/modelMpProveedor';

@Injectable({
  providedIn: 'root'
})
export class MpProveedorService {

  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

  constructor(private http : HttpClient,) { }
  
  srvObtenerLista = ():Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + '/Proveedor_MateriaPrima');
  
  srvAgregar = (data:any) => this.http.post(this.rutaPlasticaribeAPI + '/Proveedor_MateriaPrima', data);
  
  srvActualizar = (id:number|String, data:any) => this.http.put(this.rutaPlasticaribeAPI + `/Proveedor_MateriaPrima/${id}`, data);
  
  srvEliminar = (id:number|String) => this.http.delete(this.rutaPlasticaribeAPI + `/Proveedor_MateriaPrima/${id}`);

  srvGuardar = (data : modelMpProveedor): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/Proveedor_MateriaPrima', data);

}
