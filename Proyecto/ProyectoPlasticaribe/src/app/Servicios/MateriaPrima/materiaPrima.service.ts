import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { Observable } from 'rxjs';
import { AppComponent} from 'src/app/app.component';
import { modelMateriaPrima } from '../../Modelo/modelMateriaPrima';
import { modelPedidomateriaprima } from '../../Modelo/modelPedidomateriaprima';
import { rutaPlasticaribeAPI,  } from 'src/polyfills';

@Injectable({
  providedIn: 'root'
})
export class MateriaPrimaService {

  readonly rutaPlasticaribeAPI = rutaPlasticaribeAPI;

  //Encapsular httpclient en el constructor
  constructor(private http : HttpClient,
    @Inject(SESSION_STORAGE) private storage: WebStorageService) {

    // if (this.storage.get('BD') == 1) this.rutaPlasticaribeAPI = rutaPlasticaribeAPI;
    // else if (this.storage.get('BD') == 2) this.rutaPlasticaribeAPI = ;
  }


  //Metodo buscar lista de Productos
  srvObtenerLista():Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/Materia_Prima');
  }

  //Metodo buscar lista de Productos
  getMpTintaBopp():Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/Materia_Prima/getMpTintaBopp');
  }

  //Metodo buscar lista de Productos
  getInfoMpTintaBopp(id : any) {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Materia_Prima/getInfoMpTintaBopp/${id}`);
  }

  srvObtenerListaPorId(id : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Materia_Prima/${id}`);
  }

  srvObtenerListaPorCategoria(id : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Materia_Prima/categoria/${id}`);
  }

  srvObtenerListaNumero1(fecha1 : any, fecha2 : any, id : any, categoria : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Materia_Prima/ConsultaInventario1/${fecha1}/${fecha2}/${id}/${categoria}`);
  }

  srvObtenerListaNumero2(fecha1 : any, id : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Materia_Prima/ConsultaInventario2/${fecha1}/${id}`);
  }

  srvObtenerListaNumero3(fecha1 : any, id : any, categoria : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Materia_Prima/ConsultaInventario3/${fecha1}/${id}/${categoria}`);
  }

  GetConsultaMateriaPrimaF(fecha1 : any, fecha2 : any, id : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Materia_Prima/GetConsultaMateriaPrimaFI/${fecha1}/${fecha2}/${id}`);
  }

  getMatPrimasConTintas():Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + '/Materia_Prima/getMatPrimasYTintas');
  }

  getMatPrimasConTintasxId(Id : any):Observable<any[]> {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Materia_Prima/getMatPrimasYTintasxId/${Id}`);
  }

  GetMateriaPrima_LikeNombre(nombre : string){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Materia_Prima/GetMateriaPrima_LikeNombre/${nombre}`);
  }

  GetMateriasPrimasUtilizadasHoy(fecha : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Materia_Prima/getMateriasPrimasUtilizadasHoy/${fecha}`);
  }

  GetMateriasPrimasUltilizadasMes(fecha1 : any, fecha2 : any){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Materia_Prima/getMateriasPrimasUltilizadasMes/${fecha1}/${fecha2}`);
  }

  GetInventarioMateriasPrimas(){
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Materia_Prima/getInventarioMateriasPrimas`);
  }

  //Metodo agregar Productos
  srvAgregar(data : any) {
    return this.http.post(this.rutaPlasticaribeAPI + '/Materia_Prima', data)
  }

  //Metodo actualzar Productos
  srvActualizar(id:number|String, data:any) {
    return this.http.put(this.rutaPlasticaribeAPI + `/Materia_Prima/${id}`, data);
  }

  //Metodo eliminar Productos
  srvEliminar(id:number|String) {
    return this.http.delete(this.rutaPlasticaribeAPI + `/Materia_Prima/${id}`);
  }

  //
  srvGuardar(data : modelMateriaPrima): Observable<any> {
    return this.http.post(this.rutaPlasticaribeAPI + '/Materia_Prima', data)
  }

  getMaximoIdMatPrima() {
    return this.http.get<any>(this.rutaPlasticaribeAPI + `/Materia_Prima/getMaximoIdMatPrima`);
  }

}
