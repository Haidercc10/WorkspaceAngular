import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { modelProduccionProcesos } from 'src/app/Modelo/modelProduccionProcesos';
import { rollsToDelete } from 'src/app/Vistas/EliminarRollos_Produccion/EliminarRollos_Produccion.component';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

export class Produccion_ProcesosService {

  readonly rutaPlasticaribeAPI = environment.rutaPlasticaribeAPI;

  constructor(private http: HttpClient) { }

  GetTodo = (): Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Produccion_Procesos`);

  GetById = (id: any): Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Produccion_Procesos/${id}`);

  GetInformationAboutProduction = (production: number, process: string): Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Produccion_Procesos/getInformationAboutProduction/${production}/${process}`);

  GetInformationAboutProductionBagPro = (production: number): Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Produccion_Procesos/getInformationAboutProductionBagPro/${production}`);

  GetInformationAboutProductionToSend = (production: number, orderFact: number): Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Produccion_Procesos/getInformationAboutProductionToSend/${production}/${orderFact}`);

  GetInformationAboutProductionToUpdateZeus = (production: number, process: string): Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Produccion_Procesos/getInformationAboutProductionToUpdateZeus/${production}/${process}`);

  GetAvaibleProduction = (item: number): Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Produccion_Procesos/getAvaibleProduction/${item}`);

  //Inventario de rollos disponibles en despacho, en el area y rollos pre entregados.  
  getRollsAvailablesForItem = (item: number): Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Produccion_Procesos/getRollsAvailablesForItem/${item}`);

  getRollsInAreaForItem = (item: number, process : string): Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Produccion_Procesos/getRollsInAreaForItem/${item}/${process}`);

  getRollsPreDeliveredForItem = (item: number): Observable<any> => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Produccion_Procesos/getRollsPreDeliveredForItem/${item}`);

  GetInformationAboutProductionByOrderProduction_Process = (process: string, turn: string, start: any, end: any) => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Produccion_Procesos/getInformationAboutProductionByOrderProduction_Process/${process}/${turn}/${start}/${end}`);

  GetInfoProduction = (date1 : any, date2 : any, url? : string) => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Produccion_Procesos/getInfoProduction/${date1}/${date2}${url}`);

  sendProductionToZeus = (ot: string, item: string, presentation: string, reel: number, quantity: string, price: string) => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Produccion_Procesos/EnviarAjuste/${ot}/${item}/${presentation}/${reel}/${quantity}/${price}`);

  putChangeStateProduction = (production: any[]) => this.http.put<any>(`${this.rutaPlasticaribeAPI}/Produccion_Procesos/putCambiarEstadoRollo`, production);

  putStateForSend = (orderFac: number) => this.http.put<any>(`${this.rutaPlasticaribeAPI}/Produccion_Procesos/putEstadoPorDespachar/${orderFac}`, orderFac);

  putStateNotAvaible = (orderFac: number) => this.http.put<any>(`${this.rutaPlasticaribeAPI}/Produccion_Procesos/putEstadoNoDisponible/${orderFac}`, orderFac);

  putSendZeus = (production: number) => this.http.put<any>(`${this.rutaPlasticaribeAPI}/Produccion_Procesos/putEnvioZeus/${production}`, production);

  putAsociateRoll = (roll1: number, roll2 : number, item : number) => this.http.put<any>(`${this.rutaPlasticaribeAPI}/Produccion_Procesos/putAsociateRoll/${roll1}/${roll2}/${item}`, roll1);

  putStateAvaible = (orderFac: number) => this.http.put<any>(`${this.rutaPlasticaribeAPI}/Produccion_Procesos/putEstadoDisponible/${orderFac}`, orderFac);

  PutDelivered_NoAvaible = (pre: number) => this.http.put<any>(`${this.rutaPlasticaribeAPI}/Produccion_Procesos/putEstadoEntregado_NoIngresado/${pre}`, pre);

  PutDelivered_Avaible = (pre: number) => this.http.put<any>(`${this.rutaPlasticaribeAPI}/Produccion_Procesos/putEstadoEntregado_Ingresado/${pre}`, pre);

  Post = (body: modelProduccionProcesos): Observable<any> => this.http.post(`${this.rutaPlasticaribeAPI}/Produccion_Procesos`, body);

  Delete = (id: number|string): Observable<any> => this.http.delete(`${this.rutaPlasticaribeAPI}/Produccion_Procesos/${id}`);

  putReversionEnvioZeus = (rollos: any[]) => this.http.post(`${this.rutaPlasticaribeAPI}/Produccion_Procesos/putReversionEnvioZeus`, rollos);

  getInfoProductionAvailable = () => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Produccion_Procesos/getInfoProductionAvailable`);

  putStateDeletedRolls = (data : Array<rollsToDelete>) => this.http.put<any>(`${this.rutaPlasticaribeAPI}/Produccion_Procesos/putStateDeletedRolls`, data);

  getInfoItemsAvailablesInPallet = (item : number) => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Produccion_Procesos/getInfoItemsAvailablesInPallet/${item}`);

  getInfoItemsAvailablesOutPallet = (item : number) => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Produccion_Procesos/getInfoItemsAvailablesOutPallet/${item}`);

  getMovementsRolls = (rollBp : number, item : number, rollPl : number) => this.http.get<any>(`${this.rutaPlasticaribeAPI}/Produccion_Procesos/getMovementsRolls/${rollBp}/${item}/${rollPl}`);

  PostMassive = (data: Array<modelProduccionProcesos>): Observable<any> => this.http.post(`${this.rutaPlasticaribeAPI}/Produccion_Procesos/massiveInsertFromStoreRolls`, data);
}
