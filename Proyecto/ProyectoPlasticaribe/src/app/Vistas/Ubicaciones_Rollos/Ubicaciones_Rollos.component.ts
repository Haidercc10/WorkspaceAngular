import { Component, OnInit, ViewChild } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { BodegasDespachoService } from 'src/app/Servicios/BodegasDespacho/BodegasDespacho.service';
import { DetallesEntradaRollosService } from 'src/app/Servicios/DetallesEntradasRollosDespacho/DetallesEntradaRollos.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { Produccion_ProcesosService } from 'src/app/Servicios/Produccion_Procesos/Produccion_Procesos.service';
import { AppComponent } from 'src/app/app.component';
import { dataDesp, MovimientosIngresosDespachoComponent } from '../Movimientos-IngresosDespacho/Movimientos-IngresosDespacho.component';
import { InventarioZeusService } from 'src/app/Servicios/InventarioZeus/inventario-zeus.service';
import { SedeClienteService } from 'src/app/Servicios/SedeCliente/sede-cliente.service';

@Component({
  selector: 'app-Ubicaciones_Rollos',
  templateUrl: './Ubicaciones_Rollos.component.html',
  styleUrls: ['./Ubicaciones_Rollos.component.css']
})

export class Ubicaciones_RollosComponent implements OnInit {
  load: boolean = false;
  selectedMode: boolean = false;
  storage_Id: number;
  storage_Name: number;
  validateRole: number;
  storehouse: Array<any> = [];
  storehouseSelected: any;
  ubicationsStorehouse: Array<any> = [];
  ubicationSelected: any;
  subUbicationsStorehouse: Array<any> = [];
  subUbicationSelected: any;
  cubes: Array<any> = [];
  cubeSelected: any;
  productionSearched: any;
  sendProductionZeus: any[] = [];
  dataSearched: Array<dataDesp> = [];
  searchIn: any = null;
  groupedInfo: any = [];
  @ViewChild('dtDetailed') dtDetailed: Table | undefined;
  traslate: boolean = false;
  descriptionButton: string = '';
  message: string = '';
  action: string = '';
  msgTooltip: string = '';

  constructor(private appComponent: AppComponent,
    private msj: MensajesAplicacionService,
    private productionProcessSerivce: Produccion_ProcesosService,
    private bagproService: BagproService,
    private dtEntracesService: DetallesEntradaRollosService,
    private storehouseService: BodegasDespachoService,
    private messageService: MessageService,
    private compMovInDespacho : MovimientosIngresosDespachoComponent,
    private svInvZeus : InventarioZeusService) {
    this.selectedMode = this.appComponent.temaSeleccionado;
  }

  ngOnInit() {
    this.readStorage();
    this.getStorehouse();
  }

  //Leer storage del navegador.
  readStorage() {
    this.storage_Id = this.appComponent.storage_Id;
    this.storage_Name = this.appComponent.storage_Nombre;
    this.validateRole = this.appComponent.storage_Rol;
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

  //Función para preguntar que acción se está realizando. Solo cambiar ubicación
  questionAction = () => this.traslate ? this.extractRollsDespacho() : this.validateUbicationSelected();

  //.Función para validar que se llenen correctamente las ubicaciones
  validateUbicationSelected() {
    if (this.storehouseSelected && this.ubicationSelected && this.subUbicationSelected && this.cubeSelected != null) this.viewConfirmMessage('reubication');
    else this.msj.mensajeAdvertencia(`¡Debe llenar los campo para validar la ubicación que tendrá el rollo/bulto!`);
  }

  //.Función para colocar una ubicación a los rollos seleccionados
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

  //.Limpiar campos
  clearFields() {
    this.sendProductionZeus = [];
    this.productionSearched = null;
    this.ubicationsStorehouse = [];
    this.ubicationSelected = null;
    this.subUbicationsStorehouse = [];
    this.subUbicationSelected = null;
    this.cubes = [];
    this.cubeSelected = null;
    this.groupedInfo = [];
  }

  //Remover rollos de la tabla.
  removeProduction(data: any) {
    let i: number = this.sendProductionZeus.findIndex(x => x.pp.numero_Rollo == data.pp.numero_Rollo);
    this.sendProductionZeus.splice(i, 1);
    this.consolidateInformation();
  }

  //Función que cargará los rollos a los que se desea actualizar la ubication en la tabla del modal.
  loadRolls() {
    this.sendProductionZeus = [];
    this.compMovInDespacho.dataSelected.forEach(x => {
      this.sendProductionZeus.push(
        {
          pp:
          {
            'numeroRollo_BagPro': x.production,
            'ot': x.orderProduction,
            'cantidad': x.quantity,
            'peso_Bruto': x.quantity,
            'presentacion': x.presentation,
            'fecha': x.date,
            'hora': x.hour,
            'numero_Rollo': x.productionPL,
            'precio': x.price,
          },
          producto: {
            'prod_Id': x.item,
            'prod_Nombre': x.reference,
          },
          proceso: {
            'proceso_Nombre': x.process
          }
        })
    });
    this.consolidateInformation();
  }

  //Función que se encargará de consolidar la información de los rollos que serán reubicados.
  consolidateInformation() {
    this.groupedInfo = this.sendProductionZeus.reduce((a, b) => {
      if (!a.map(x => x.producto.prod_Id).includes(b.producto.prod_Id)) a = [...a, b];
      return a;
    }, [])
  }

  //Función que se encargará de enviar los rollos y la nueva ubicación de los mismos al api para que se actualicen desde allí.
  changeUbication() {
    let aError: boolean = false;
    this.onReject();
    this.load = true;
    let rolls: any[] = this.sendProductionZeus.map(x => x.pp.numero_Rollo);
    console.log(rolls);
    
    this.dtEntracesService.PutChangeUbicationRoll(rolls, this.setUbication()).subscribe(() => { aError = false; }, () => {
      aError = true;
      this.msj.mensajeError(`Error`, `No fue posible actualizar la ubicación de rollo(s)!`);
    });
    setTimeout(() => {
      this.load = false;
      this.confirmationMessage(aError);
    }, 1000);
  }

  //Mensaje de confirmación de la actualización de la ubicación de los rollos.
  confirmationMessage(aError: boolean) {
    if (!aError) {
      this.msj.mensajeConfirmacion('OK!', 'Se actualizó con éxito la ubicación de rollo(s)!');
      this.clearFields();
      this.compMovInDespacho.modal = false;
      this.compMovInDespacho.searchaDataProductionIncome();
    } else this.msj.mensajeError('Error', 'Fallo al actualizar la ubicación de rollo(s)!');
  }

  //.Función que enviará el ajuste de existencias negativo a Zeus .
  sendNegativeAdjustmentZeus() {
    if (this.groupedInfo.length > 1) this.msj.mensajeAdvertencia('Solo se puede enviar un ajuste a Zeus por rollo!');
    else {
      this.onReject();
      this.load = true
      this.groupedInfo.forEach(x => {
        let unit : string = x.pp.presentacion == 'Kg' ? 'KLS' : x.pp.presentacion == 'Und' ? 'UND' : 'PAQ';
        let detailAdjustment : string = `Ajuste desde App Plasticaribe para la OT N° ${x.pp.ot}, Item ${x.producto.prod_Id} con cantidad de ${(-(this.totalQuantityByItem(x.producto.prod_Id)))} ${unit}`;
        this.svInvZeus.getExistenciasProductos(x.producto.prod_Id, unit).subscribe(data => {
          if(data[0].existencias < 1 || data.length == 0) this.extractRollsDespacho(false);
          else {
            this.productionProcessSerivce.sendProductionToZeus(detailAdjustment, x.producto.prod_Id, unit, 0, (-(this.totalQuantityByItem(x.producto.prod_Id))).toString(), x.pp.precio.toString()).subscribe(data => { 
              this.extractRollsDespacho(true); 
            }, error => {this.msj.mensajeError('Error', 'No fue posible enviar el ajuste a Zeus!'); });
          }
        }, error => { this.msj.mensajeError(`Ocurrió un error al consultar el item ${x.producto.prod_Id}`, `Error: ${error}`);  });
      });
    }
  }

  //Sacar rollos de despacho.
  extractRollsDespacho(zeus : boolean = false){
    let rollsPL : any[] = this.sendProductionZeus.map(x => x.pp.numero_Rollo);
    let errorMsj : string = 'No fue posible revertir el Envio Zeus de los rollos en Plasticaribe!';

    this.productionProcessSerivce.putReversionEnvioZeus(rollsPL).subscribe(data => { this.changeStateEntry(rollsPL, zeus); }, error => { this.msj.mensajeError('Error', errorMsj); });
  }

  //.Función que actualizará el envio zeus de los rollos en procextrusion
  updateRollsBagproEmpaque(rolls: any) {
    this.bagproService.putReversionEnvioZeus_ProcExtrusion(rolls).subscribe(null, () => this.msj.mensajeError('Error', 'No fue posible revertir el Envio Zeus de los rollos de Empaque en BagPro!'));
  }

  //.Función que actualizará el envio zeus de los rollos en procsellado
  updateRollsBagproSellado(rolls: any) {
    this.bagproService.putReversionEnvioZeus_ProcSellado(rolls).subscribe(null, () => this.msj.mensajeError('Error', 'No fue posible revertir el Envio Zeus de los rollos de Sellado en BagPro!'));
  }

  //.Función que colocará como devuelto el estado del rollo
  changeStateEntry(rolls : any, zeus : boolean){
    this.dtEntracesService.putStateReturnedRoll(rolls).subscribe(data => {
      this.load = false;
      this.confirmTraslateDespacho(zeus);
    }, error => { this.msj.mensajeError('Error', 'No fue posible actualizar el estado del rollo en la entrada a despacho!') })
  }

  //.Función que enviará un mensaje de confirmación luego de que se saquen los rollos de despacho. 
  confirmTraslateDespacho(zeus : boolean){
    zeus ? this.msj.mensajeConfirmacion('OK!', 'Los rollos fueron sacados de despacho exitosamente con ajuste en zeus!') : this.msj.mensajeConfirmacion('OK!', 'Los rollos fueron sacados de despacho exitosamente!');
    setTimeout(() => { 
      this.compMovInDespacho.modal = false;
      this.compMovInDespacho.searchaDataProductionIncome();
      this.clearFields();
    }, 500);
  }

  //Cantidad total consolidada por ot
  totalQuantityByItem = (item: number): number => this.sendProductionZeus.filter(x => x.producto.prod_Id == item).reduce((a, b) => a + b.pp.cantidad, 0);

  //Cantidad de rollos consolidada por ot
  totalRollsByItem = (item: number): number => this.sendProductionZeus.filter(x => x.producto.prod_Id == item).length;

  //Cantidad total consolidada de los rollos a eliminar.
  totalQuantityConsolidated = (): number => this.sendProductionZeus.reduce((a, b) => a + b.pp.cantidad, 0);

  //Total de rollos a eliminar
  totalRollsConsolidated = (): number => this.sendProductionZeus.length;

  //.Mostrar mensaje de confirmación
  viewConfirmMessage(data: string) {
    this.message = '';
    this.msgTooltip = '';
    this.action = data;
    if (data == 'traslate') {
      this.message = `Está seguro que desea sacar los rollos de despacho?`
      this.msgTooltip = `Los rollos/bultos serán devueltos al área donde fueron producidos.`
    } else {
      this.message = `Está seguro que desea reubicar los rollos seleccionados?`;
      this.msgTooltip = `Los rollos serán reubicados a ${this.setUbication()}.`
    }
    setTimeout(() => {
      this.messageService.add({ severity: 'warn', key: this.action, summary: 'Elección', detail: this.message, sticky: true });
    }, 200);
  }

  //.Función para quitar mensaje confirmación.
  onReject = () => this.messageService.clear(this.action);

  //Función para filtrar la tabla de rollos a eliminar.
  applyFilter = ($event, campo: any, valorCampo: string) => this.dtDetailed!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);

}
