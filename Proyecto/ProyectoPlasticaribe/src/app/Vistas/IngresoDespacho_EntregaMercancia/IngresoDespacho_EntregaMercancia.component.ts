import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import moment from 'moment';
import { BodegasDespachoService } from 'src/app/Servicios/BodegasDespacho/BodegasDespacho.service';
import { DetallesEntradaRollosService } from 'src/app/Servicios/DetallesEntradasRollosDespacho/DetallesEntradaRollos.service';
import { DtPreEntregaRollosService } from 'src/app/Servicios/DetallesPreIngresoRollosDespacho/DtPreEntregaRollos.service';
import { EntradaRollosService } from 'src/app/Servicios/IngresoRollosDespacho/EntradaRollos.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { Produccion_ProcesosService } from 'src/app/Servicios/Produccion_Procesos/Produccion_Procesos.service';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-IngresoDespacho_EntregaMercancia',
  templateUrl: './IngresoDespacho_EntregaMercancia.component.html',
  styleUrls: ['./IngresoDespacho_EntregaMercancia.component.css']
})

export class IngresoDespacho_EntregaMercanciaComponent implements OnInit, OnDestroy {

  load: boolean = false;
  storage_Id: number;
  storage_Name: number;
  validateRole: number;
  selectedMode: boolean = false;
  dataSearched: Array<any> = [];
  barCode: string = ``;
  storehouse: Array<any> = [];
  storehouseSelected: any;
  ubicationsStorehouse: Array<any> = [];
  ubicationSelected: any;
  subUbicationsStorehouse: Array<any> = [];
  subUbicationSelected: any;
  cubes: Array<any> = [];
  cubeSelected: any;

  constructor(private appComponent: AppComponent,
    private produccionProcessService: Produccion_ProcesosService,
    private detailsPreInService: DtPreEntregaRollosService,
    private storehouseService: BodegasDespachoService,
    private entraceService: EntradaRollosService,
    private dtEntracesService: DetallesEntradaRollosService,
    private msg: MensajesAplicacionService,) { }

  ngOnInit() {
    this.readStorage();
    this.getStorehouse();
    this.focusInput(false);
  }

  ngOnDestroy(): void {
    this.focusInput(true);
  }

  readStorage() {
    this.selectedMode = this.appComponent.temaSeleccionado;
    this.storage_Id = this.appComponent.storage_Id;
    this.storage_Name = this.appComponent.storage_Nombre;
    this.validateRole = this.appComponent.ValidarRol;
  }

  focusInput(destroy: boolean) {
    let time = setInterval(() => {
      let preInBarsCode = document.getElementById('preInBarsCode');
      if (!destroy && preInBarsCode) preInBarsCode.focus();
      else if (destroy) clearInterval(time);
    }, 1000);
  }

  errorMessage(message: string, error: HttpErrorResponse) {
    this.load = false;
    this.msg.mensajeError(message, `Error: ${error.statusText} | Status: ${error.status}`);
  }

  clearFields() {
    this.barCode = null;
    this.dataSearched = [];
    this.ubicationsStorehouse = [];
    this.ubicationSelected = null;
    this.subUbicationsStorehouse = [];
    this.subUbicationSelected = null;
    this.cubes = [];
    this.cubeSelected = null;
  }

  getStorehouse = () => this.storehouseService.GetBodegas().subscribe(data => this.storehouse = data);

  getUbicationByStorehouse() {
    this.storehouseService.GetUbicacionesPorBodegas(this.storehouseSelected).subscribe(data => {
      this.ubicationsStorehouse = data;
      this.ubicationSelected = null;
      this.subUbicationsStorehouse = [];
      this.subUbicationSelected = null;
      this.cubes = [];
      this.cubeSelected = null;
    });
  }

  getSubUbicationByStorehouse() {
    let dataUbication: any = this.ubicationsStorehouse.find(x => x.nombreCompleto == this.ubicationSelected);
    this.storehouseService.GetSubUbicacionesPorUbicacion(this.storehouseSelected, dataUbication.idUbicacion, dataUbication.nombreUbicacion).subscribe(data => {
      this.subUbicationsStorehouse = data;
      this.subUbicationSelected = null;
      this.cubes = [];
      this.cubeSelected = null;
    });
  }

  getCubesBySubUbication() {
    let dataUbication: any = this.ubicationsStorehouse.find(x => x.nombreCompleto == this.ubicationSelected);
    this.storehouseService.GetCubosPorSubUbicacion(this.storehouseSelected, dataUbication.idUbicacion, dataUbication.nombreUbicacion, this.subUbicationSelected).subscribe(data => {
      this.cubes = data;
      if (data.length == 0) this.cubeSelected = '';
    });
  }

  validateUbicationSelected() {
    if (this.storehouseSelected && this.ubicationSelected && this.subUbicationSelected && this.cubeSelected != null) this.getInformactionAboutPreIn_ById();
    else {
      this.msg.mensajeAdvertencia(`¡Debe llenar los campo para validar la ubicación que tendrá el rollo/bulto!`);
      this.barCode = null;
    }
  }

  getInformactionAboutPreIn_ById() {
    this.load = true;
    let preIn: number = parseInt(this.barCode.split('-')[0].replace(`ENTRLL#`, ''));
    let item: number = parseInt(this.barCode.split('-')[1].replace(`ITEM#`, ''));
    this.barCode = preIn.toString();
    this.detailsPreInService.GetInformactionAboutPreInToSendDesp_ById(preIn, item).subscribe(data => this.updateProductionZeus(data), (error: HttpErrorResponse) => {
      let message: string = error.status == 404 ? `¡No se encontró la información del la Pre Entrega!` : `¡Ocurrió un error al buscar la información de la Pre Entrega!`;
      this.errorMessage(message, error);
      this.barCode = null;
    });
  }

  updateProductionZeus(data: Array<any>) {
    let consolidateData: Array<any> = this.getConsolidateProduction(data);
    let count: number = 0;
    consolidateData.forEach(prod => {
      let preIn: number = parseInt(this.barCode.replace('ENTRLL #', ''));
      let details: string = `ENTRADA DE ROLLOS N° ${preIn} DE LA OT ${prod.details.orderProduction} DESDE PLASTICARIBE`;
      let item: string = prod.details.item;
      let presentation: string = this.validatePresentation(prod.details.presentation);
      let quantity: number = this.calculateTotalQuantityByItem(prod.details.item, data);
      let price: number = prod.details.price;
      this.produccionProcessService.sendProductionToZeus(details, item, presentation, 0, quantity.toString(), price.toString()).subscribe(() => {
        count++;
        if (count == consolidateData.length) this.saveDataEntrace(data);
      }, error => {
        if (error.status == 1) this.errorMessage(error.message, error);
        this.errorMessage(`¡Error al actualizar el inventario del ${item} en zeus!`, error);
      });
    });
  }

  getConsolidateProduction(data: Array<any>): Array<any> {
    return data.reduce((a, b) => {
      if (!a.map(x => x.details.orderProduction).includes(b.details.orderProduction)) a = [...a, b];
      return a;
    }, []);
  }

  calculateTotalQuantityByItem(item: number, data: Array<any>): number {
    return data.reduce((a, b) => a += b.details.item == item ? b.details.quantity : 0, 0);
  }

  setUbication(): string {
    let ubicationSelected = this.ubicationsStorehouse.find(x => x.nombreCompleto == this.ubicationSelected);
    let subUbicationSelected = this.subUbicationsStorehouse.find(x => x.idSubUbicacion == this.subUbicationSelected);
    let ubicationName: string, subUbicationName: string;
    let cube: string = this.cubeSelected == '' ? `` : `_${this.cubeSelected.replace('CUBO', '').replace('P.', '')}`
    if (ubicationSelected.nombreUbicacion == 'ESTANTE') ubicationName = 'EST';
    else if (ubicationSelected.nombreUbicacion == 'PLATAFORMA DINAMICA') ubicationName = 'PD';
    else if (ubicationSelected.nombreUbicacion == 'PASILLO JAULAS') ubicationName = 'PS';
    else if (ubicationSelected.nombreUbicacion == 'PASILLO') ubicationName = 'PS';
    if (subUbicationSelected.nombreSubUbicacion == 'PALO') subUbicationName = 'PL';
    else if (subUbicationSelected.nombreSubUbicacion == 'ESTIBA') subUbicationName = 'ESTB';
    return `B${this.storehouseSelected}_${ubicationName}${ubicationSelected.idUbicacion}_${subUbicationName}${subUbicationSelected.idSubUbicacion}${cube}`;
  }

  saveDataEntrace(data: any) {
    let info: any = {
      EntRolloProd_Fecha: moment().format('YYYY-MM-DD'),
      EntRolloProd_Observacion: this.setUbication(),
      Usua_Id: this.storage_Id,
      EntRolloProd_Hora: moment().format('H:mm:ss'),
      Pallet_Id : data[0].pre.pre_Id
    }
    this.entraceService.srvGuardar(info).subscribe(res => this.saveDetailsEntrance(res.entRolloProd_Id, data), (error: HttpErrorResponse) => this.errorMessage(`¡Ocurrió un error al guardar la ubicación de los rollos/bultos!`, error));
  }

  saveDetailsEntrance(id: number, dataPreIn: Array<any>) {
    let count: number = 0;
    dataPreIn.forEach(data => {
      let info: any = {
        EntRolloProd_Id: id,
        Rollo_Id: data.details.productionPlasticaribe,
        DtEntRolloProd_Cantidad: data.details.quantity,
        UndMed_Rollo: data.details.presentation,
        Estado_Id: 19,
        DtEntRolloProd_OT: data.details.orderProduction,
        Prod_Id: data.details.item,
        UndMed_Prod: data.details.presentation,
        Prod_CantPaquetesRestantes: 0,
        Prod_CantBolsasPaquete: 0,
        Prod_CantBolsasBulto: 0,
        Prod_CantBolsasRestates: 0,
        Prod_CantBolsasFacturadas: 0,
        Proceso_Id: data.details.process,
        Pallet_Id: data.pre.pre_Id
      }
      this.dtEntracesService.srvGuardar(info).subscribe(() => {
        count++;
        this.dataSearched.push(data);
        if (count == dataPreIn.length) this.PutDelivered_Avaible(id);
      }, (error: HttpErrorResponse) => this.errorMessage(`¡No se pudo ingresar la información de cada rollo ingresado!`, error));
    });
  }

  PutDelivered_Avaible(idEntrace: number) {
    this.produccionProcessService.PutDelivered_Avaible(idEntrace).subscribe(() => {
      this.barCode = null;
      this.load = false;
      this.msg.mensajeConfirmacion(`¡Registro Exitoso!`, `¡Se ingresaron exitosamente todos los rollos/bultos!`);
    }, (error: HttpErrorResponse) => this.errorMessage(`¡Ocurrió un error al actualizar el estado de los rollos/bultos!`, error));
  }

  validatePresentation(presentation: 'Und' | 'Kg' | 'Paquete'): 'UND' | 'KLS' | 'PAQ' {
    let presentations: any = {
      'Und': 'UND',
      'Kg': 'KLS',
      'Paquete': 'PAQ',
    }
    return presentations[presentation];
  }

}
