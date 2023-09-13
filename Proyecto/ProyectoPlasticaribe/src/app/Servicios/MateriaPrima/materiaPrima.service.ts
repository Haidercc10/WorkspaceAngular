import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { modelMateriaPrima } from '../../Modelo/modelMateriaPrima';

@Injectable({
  providedIn: 'root'
})
export class MateriaPrimaService {

  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

  constructor(private http : HttpClient,) { }

  srvObtenerLista = ():Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + '/Materia_Prima');

  getMpTintaBopp = ():Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + '/Materia_Prima/getMpTintaBopp');

  getInfoMpTintaBopp = (id : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Materia_Prima/getInfoMpTintaBopp/${id}`);

  GetInfo_MPTintasBOPP = ():Observable<any[]> => this.http.get<any>(this.rutaPlasticaribeAPI + '/Materia_Prima/GetInfo_MPTintasBOPP');

  getInfo_MpTintaBopp_Id = (id : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Materia_Prima/getInfo_MpTintasBopp_Id/${id}`);

  srvObtenerListaPorId = (id : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Materia_Prima/${id}`);

  GetMateriasPrimasUtilizadasHoy = (fecha : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Materia_Prima/getMateriasPrimasUtilizadasHoy/${fecha}`);

  GetMateriasPrimasUltilizadasMes = (fecha1 : any, fecha2 : any) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Materia_Prima/getMateriasPrimasUltilizadasMes/${fecha1}/${fecha2}`);

  GetInventarioMateriasPrimas = () => this.http.get<any>(this.rutaPlasticaribeAPI + `/Materia_Prima/getInventarioMateriasPrimas`);

  GetInventario = (fechaInicial : any, fechaFinal : any, id : number) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Materia_Prima/getInventario/${fechaInicial}/${fechaFinal}/${id}`);

  GetCategoriasMateriaPrima = () => this.http.get<any>(this.rutaPlasticaribeAPI + `/Materia_Prima/getCategoriasMateriaPrima`);

  GetMoviemientos = (fechaInicial : any, fechaFinal : any, ruta : string) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Materia_Prima/getMovimientos/${fechaInicial}/${fechaFinal}/${ruta}`);

  GetInfoMovimientoAsignaciones = (codigo : string, tipoMov : string) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Materia_Prima/getInfoMovimientoAsignaciones/${codigo}/${tipoMov}`);

  GetInfoMovimientosDevoluciones = (codigo : string) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Materia_Prima/getInfoMovimientosDevoluciones/${codigo}`);

  GetInfoMovimientoCreacionTinta = (codigo : string) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Materia_Prima/getInfoMovimientoCreacionTinta/${codigo}`);

  GetInfoMovimientosEntradas = (codigo : string, tipoMov : string) => this.http.get<any>(this.rutaPlasticaribeAPI + `/Materia_Prima/getInfoMovimientosEntradas/${codigo}/${tipoMov}`);

  srvAgregar = (data : any) => this.http.post(this.rutaPlasticaribeAPI + '/Materia_Prima', data);

  srvActualizar = (id:number|String, data:any) => this.http.put(this.rutaPlasticaribeAPI + `/Materia_Prima/${id}`, data);

  srvGuardar = (data : modelMateriaPrima): Observable<any> => this.http.post(this.rutaPlasticaribeAPI + '/Materia_Prima', data);
}
