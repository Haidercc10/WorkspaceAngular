import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rutaPlasticaribe3 } from 'src/polyfills';
import { modelTintasMateriasPrimas } from '../Modelo/modelTintasMateriasPrimas';

@Injectable({
  providedIn: 'root'
})
export class TintasMPService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribe3;

  constructor(private http : HttpClient) { }

  //Metodo buscar lista de Productos
  srvObtenerLista():Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/Tinta_MateriaPrima');
  }

  srvObtenerListaPorId(id : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Tinta_MateriaPrima/${id}`);
  }

  //Metodo agregar Productos
  srvAgregar(data : any) {
    return this.http.post(this.rutaPlasticaribeAPI + '/Tinta_MateriaPrima', data)
  }

  //Metodo actualzar Productos
  srvActualizar(id:number|String, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/Tinta_MateriaPrima/${id}`, data);
  }

  //Metodo eliminar Productos
  srvEliminar(id:number|String) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/Tinta_MateriaPrima/${id}`);
  }

  //
  srvGuardar(data : modelTintasMateriasPrimas): Observable<any> {
    return this.http.post(this.rutaPlasticaribeAPI + '/Tinta_MateriaPrima', data)
  }

}
