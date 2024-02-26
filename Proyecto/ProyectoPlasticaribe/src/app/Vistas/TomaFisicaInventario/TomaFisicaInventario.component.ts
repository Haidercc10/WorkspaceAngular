import { HttpErrorResponse } from '@angular/common/http';
import { Component, Injectable, OnInit, ViewChild } from '@angular/core';
import moment from 'moment';
import { MessageService } from 'primeng/api';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { BodegasDespachoService } from 'src/app/Servicios/BodegasDespacho/BodegasDespacho.service';
import { CreacionPdfService } from 'src/app/Servicios/CreacionPDF/creacion-pdf.service';
import { DetallesEntradaRollosService } from 'src/app/Servicios/DetallesEntradasRollosDespacho/DetallesEntradaRollos.service';
import { EntradaRollosService } from 'src/app/Servicios/IngresoRollosDespacho/EntradaRollos.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { Produccion_ProcesosService } from 'src/app/Servicios/Produccion_Procesos/Produccion_Procesos.service';
import { AppComponent } from 'src/app/app.component';
import { dataDesp } from '../Movimientos-IngresosDespacho/Movimientos-IngresosDespacho.component';
import { modelProduccionProcesos } from 'src/app/Modelo/modelProduccionProcesos';
import { SedeClienteService } from 'src/app/Servicios/SedeCliente/sede-cliente.service';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-TomaFisicaInventario',
  templateUrl: './TomaFisicaInventario.component.html',
  styleUrls: ['./TomaFisicaInventario.component.css']
})

export class TomaFisicaInventarioComponent implements OnInit {

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
  @ViewChild('dtDetailed') dtDetailed: Table | undefined;

  constructor(private appComponent: AppComponent,
    private msj: MensajesAplicacionService,
    private productionProcessSerivce: Produccion_ProcesosService,
    private bagproService: BagproService,
    private createPDFService: CreacionPdfService,
    private entraceService: EntradaRollosService,
    private dtEntracesService: DetallesEntradaRollosService,
    private storehouseService: BodegasDespachoService,
    private messageService: MessageService,
    private clients: SedeClienteService,) {
    this.selectedMode = this.appComponent.temaSeleccionado;
  }

  ngOnInit(): void {
    this.readStorage();
    this.getStorehouse();
    this.focusInput(true, false);
  }

  ngOnDestroy(): void {
    this.focusInput(false, true);
  }

  focusInput(start: boolean, finish: boolean) {
    let time = setInterval(() => {
      if (start && !finish) document.getElementById('ReelBarsCode').focus();
      else if (!start && finish) clearInterval(time);
    }, 1000);
  }

  readStorage() {
    this.storage_Id = this.appComponent.storage_Id;
    this.storage_Name = this.appComponent.storage_Nombre;
    this.validateRole = this.appComponent.storage_Rol;
  }

  clearFields() {
    this.sendProductionZeus = [];
    this.productionSearched = null;
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

  validateUbicationSelected() {
    if (this.storehouseSelected && this.ubicationSelected && this.subUbicationSelected && this.cubeSelected != null) this.getInformationProduction();
    else this.msj.mensajeAdvertencia(`¡Debe llenar los campo para validar la ubicación que tendrá el rollo/bulto!`);
  }

  getInformationProduction() {
    let production = parseInt(this.productionSearched);
    this.productionSearched = null;
    let searchInTable: string = this.searchIn == null ? 'TODO' : !this.searchIn ? 'SELLA' : 'EXT';
    let productionSearched = this.sendProductionZeus.map(prod => prod.pp).map(x => x.numeroRollo_BagPro);
    if (productionSearched.includes(production)) this.msj.mensajeAdvertencia(`El rollo ya ha sido registrado`);
    else {
      this.productionProcessSerivce.GetInformationAboutProduction(production, searchInTable).subscribe(data => {
        if (data[0].proceso.proceso_Id == 'SELLA') {
          this.bagproService.GetOrdenDeTrabajo(data[0].pp.ot).subscribe(res => {
            this.sendProductionZeus.push(data[0]);
            let i: number = this.sendProductionZeus.findIndex(x => x.pp.numero_Rollo == data[0].pp.numero_Rollo);
            this.sendProductionZeus[i].dataExtrusion = {
              numero_RolloBagPro: production,
              precioProducto: data[0].pp.presentacion != 'Kg' ? res[0].valorUnidad : res[0].valorKg,
              extrusion_Ancho1: res[0].ancho1_Extrusion,
              extrusion_Ancho2: res[0].ancho2_Extrusion,
              extrusion_Ancho3: res[0].ancho3_Extrusion,
              undMed_Id: res[0].und_Extrusion,
              extrusion_Calibre: res[0].calibre_Extrusion,
              material: res[0].material,
            }
            this.sendProductionZeus[i].position = this.sendProductionZeus.length + 1;
            this.sendProductionZeus.sort((a,b) => Number(b.position) - Number(a.position));
          });
        } else this.msj.mensajeAdvertencia(`¡No puede Ingresar Rollos/Bultos provenientes del procesos 'WIKETIADO'!`);
      }, () => this.lookingForDataInBagpro(production));
    }
  }

  lookingForDataInBagpro(production: number) {
    let searchInTable: string = this.searchIn == null ? 'TODO' : !this.searchIn ? 'SELLADO' : 'EXTRUSION';
    this.bagproService.GetProductionByNumber(production, searchInTable).subscribe(prod => {
      if (prod.length > 0) {
        if (prod[0].nomStatus == 'SELLADO') {
          this.bagproService.GetOrdenDeTrabajo(prod[0].ot).subscribe(data => {
            this.clients.GetSedeClientexNitBagPro(data[0].nitCliente).subscribe(cli => {
              this.sendProductionZeus.push({
                pp: {
                  ot: parseInt(prod[0].ot),
                  numero_Rollo: prod[0].item,
                  numeroRollo_BagPro: prod[0].item,
                  presentacion: data[0].presentacion == 'Kilo' ? 'Kg' : data[0].presentacion == 'Unidad' ? 'Und' : 'Paquete',
                  cantidad: ['SELLADO', 'Wiketiado'].includes(prod[0].nomStatus) ? prod[0].qty : data[0].presentacion == 'Kilo' ? 0 : 1,
                  peso_Bruto: ['SELLADO', 'Wiketiado'].includes(prod[0].nomStatus) ? prod[0].peso : prod[0].extBruto,
                  peso_Neto: ['SELLADO', 'Wiketiado'].includes(prod[0].nomStatus) ? prod[0].peso : prod[0].extnetokg,
                  maquina: parseInt(prod[0].maquina),
                  fecha: ['SELLADO', 'Wiketiado'].includes(prod[0].nomStatus) ? prod[0].fechaEntrada.replace('T00:00:00', '') : prod[0].fecha.replace('T00:00:00', ''),
                  hora: prod[0].hora,
                  envio_Zeus: parseInt(prod[0].envioZeus),
                },
                producto: {
                  prod_Id: data[0].id_Producto,
                  prod_Nombre: data[0].producto,
                  prod_Ancho: ['EMPAQUE'].includes(prod[0].nomStatus) ? prod[0].extancho : data[0].selladoCorte_Etiqueta_Ancho,
                  prod_Largo: ['EMPAQUE'].includes(prod[0].nomStatus) ? prod[0].extlargo : data[0].selladoCorte_Etiqueta_Largo,
                  prod_Fuelle: ['EMPAQUE'].includes(prod[0].nomStatus) ? prod[0].extfuelle : data[0].selladoCorte_Etiqueta_Fuelle,
                },
                clientes: {
                  cli_Id: cli.length > 0 ? cli[0].id_Cliente : 1,
                  cli_Nombre: data[0].cliente,
                },
                dataExtrusion: {
                  numero_RolloBagPro: prod[0].item,
                  extrusion_Ancho1: data[0].ancho1_Extrusion,
                  extrusion_Ancho2: data[0].ancho2_Extrusion,
                  extrusion_Ancho3: data[0].ancho3_Extrusion,
                  undMed_Id: data[0].und_Extrusion,
                  extrusion_Calibre: data[0].calibre_Extrusion,
                  material: ['SELLADO','Wiketiado'].includes(prod[0].nomStatus) ? prod[0].estado : prod[0].material,
                  precioProducto: data[0].presentacion == 'Kilo' ? data[0].valorKg : data[0].valorUnidad,
                },
                proceso: {
                  proceso_Id: prod[0].nomStatus == 'SELLADO' ? 'SELLA' : prod[0].nomStatus == 'Wiketiado' ? 'WIKE' : 'EMP',
                  proceso_Nombre: prod[0].nomStatus,
                },
                turno: {
                  turno_Nombre: ['SELLADO', 'Wiketiado'].includes(prod[0].nomStatus) ? prod[0].turnos : prod[0].turno,
                },
                dataFromExtrusion: prod[0],
              });
              let i: number = this.sendProductionZeus.findIndex(x => x.pp.numero_Rollo == prod[0].item);
              this.sendProductionZeus[i].position = this.sendProductionZeus.length;
              // this.updateProductionZeus(this.sendProductionZeus[this.sendProductionZeus[i].position - 1]);
              this.sendProductionZeus.sort((a,b) => Number(b.position) - Number(a.position));
            });
          });
        } else this.msj.mensajeAdvertencia(`¡No puede Ingresar Rollos/Bultos provenientes del procesos 'WIKETIADO'!`);
      } else this.msj.mensajeAdvertencia(`No se encontró un Rollo/Bulto con el número ${production}`);
    }, () => this.msj.mensajeAdvertencia(`No se encontró un Rollo/Bulto con el número ${production}`));
  }

  confirmSendData() {
    let count: number = 0;
    let totalCount: number = this.sendProductionZeus.length;
    count = this.sendProductionZeus.reduce((a, b) => a += b.pp.envio_Zeus == 0 ? 1 : 0, 0);
    this.messageService.add({
      severity: 'warn',
      key: 'SaveData',
      summary: 'Confirmación',
      detail: `¡Se enviarán ${count} de los ${totalCount} Rollos/Bultos leidos! ¿Desea continuar?`,
      sticky: true
    });
  }

  onReject = () => this.messageService.clear('SaveData');

  sendDataToZeus() {
    this.onReject();
    let count: number = 0;
    let sendProductionEnvioZeus: Array<any> = this.sendProductionZeus.filter(x => x.pp.envio_Zeus == 0);
    if (sendProductionEnvioZeus.length > 0) {
      this.load = true;
      sendProductionEnvioZeus.forEach(data => {
        let process: 'EXT' | 'IMP' | 'ROT' | 'LAM' | 'DBLD' | 'CORTE' | 'EMP' | 'SELLA' | 'WIKE' = this.validateProcess((data.proceso.proceso_Nombre).toUpperCase());
        let ot: string = data.pp.ot;
        let item: string = data.producto.prod_Id;
        let presentation: string = this.validatePresentation(data.pp.presentacion);
        let reel: number = data.pp.numero_Rollo;
        let quantity: number = presentation != 'KLS' ? data.pp.cantidad : data.pp.peso_Neto;
        let price: number = data.dataExtrusion.precioProducto;
        setTimeout(() => {
          this.productionProcessSerivce.sendProductionToZeus(ot, item, presentation, reel, quantity.toString(), price.toString()).subscribe(() => {
            this.saveDataEntrace(data);
            if (data.pp.numero_Rollo == data.pp.numeroRollo_BagPro) this.saveInProductionProcess(reel, process);
            else this.updateProductionZeus(reel);
            count++;
            if (count == sendProductionEnvioZeus.length) this.messageConfirmationUpdateStore();
          }, error => this.errorMessageWhenTryUpdateReel(`¡Error al actualizar el inventario del rollo ${reel}!`, error));
        }, 500);
      });
    }
  }

  validateProcess(process: string): 'EXT' | 'IMP' | 'ROT' | 'LAM' | 'DBLD' | 'CORTE' | 'EMP' | 'SELLA' | 'WIKE' {
    const processMapping = {
      'EXTRUSION': 'EXT',
      'IMPRESION': 'IMP',
      'ROTOGRABADO': 'ROT',
      'LAMINADO': 'LAM',
      'DOBLADO': 'DBLD',
      'CORTE': 'CORTE',
      'EMPAQUE': 'EMP',
      'SELLADO': 'SELLA',
      'WIKETIADO': 'WIKE',
    };
    return processMapping[process] || process;
  }

  validatePresentation(presentation: string): 'UND' | 'KLS' | 'PAQ' {
    let presentations: any = {
      'Und': 'UND',
      'Kg': 'KLS',
      'Paquete': 'PAQ',
    }
    return presentations[presentation];
  }

  updateProductionZeus(reel: number) {
    let errorMessage: string = `¡Error al actualizar el inventario del rollo ${reel}!`;
    this.productionProcessSerivce.putSendZeus(reel).subscribe(null, error => this.errorMessageWhenTryUpdateReel(errorMessage, error));
  }

  createProduction(numberProduction: number, process: 'EXT' | 'IMP' | 'ROT' | 'LAM' | 'DBLD' | 'CORTE' | 'EMP' | 'SELLA' | 'WIKE') : modelProduccionProcesos {
    let data: any = this.sendProductionZeus.filter(x => x.pp.numero_Rollo == numberProduction && x.proceso.proceso_Id == process)[0];
    let sellado: boolean = ['SELLA', 'WIKE'].includes(process);
    let datos: modelProduccionProcesos = {
      OT: data.pp.ot,
      Numero_Rollo: 0,
      Prod_Id: data.producto.prod_Id,
      Cli_Id: data.clientes.cli_Id,
      Operario1_Id: sellado ? 1523 : 1522,
      Operario2_Id: 0,
      Operario3_Id: 0,
      Operario4_Id: 0,
      Pesado_Entre: sellado ? data.dataFromExtrusion.divBulto : 1,
      Maquina: data.pp.maquina,
      Cono_Id: sellado ? 'N/A' : data.dataFromExtrusion.extCono2,
      Ancho_Cono: sellado ? 0 : data.dataFromExtrusion.extConoC,
      Tara_Cono: sellado ? 0 : data.dataFromExtrusion.extTara,
      Peso_Bruto: sellado ? data.dataFromExtrusion.peso : data.dataFromExtrusion.extBruto,
      Peso_Neto: sellado ? data.dataFromExtrusion.peso : data.dataFromExtrusion.extnetokg,
      Cantidad: sellado ? data.dataFromExtrusion.qty : data.pp.presentacion == 'Kg' ? 0 : 1,
      Peso_Teorico: sellado ? data.dataFromExtrusion.pesot : 0,
      Desviacion: sellado ? data.dataFromExtrusion.desv : 0,
      Precio: 0,
      Presentacion: data.pp.presentacion,
      Proceso_Id: process,
      Turno_Id: sellado ? data.dataFromExtrusion.turnos : data.dataFromExtrusion.turno ,
      Envio_Zeus: true,
      Datos_Etiqueta: sellado ? data.dataFromExtrusion.fechaCambio : '',
      Fecha: sellado ? data.dataFromExtrusion.fechaEntrada : data.dataFromExtrusion.fecha,
      Hora: data.dataFromExtrusion.hora,
      Creador_Id: 123456789,
      NumeroRollo_BagPro: data.dataFromExtrusion.item,
    }
    return datos;
  }

  saveInProductionProcess(numberProduction: number, process: 'EXT' | 'IMP' | 'ROT' | 'LAM' | 'DBLD' | 'CORTE' | 'EMP' | 'SELLA' | 'WIKE'){
    this.productionProcessSerivce.Post(this.createProduction(numberProduction, process)).subscribe(null, error => {
      let errorMessage: string = `¡No fue posible crear el registro del Rollo/Bulto #${numberProduction} proveniente de 'BagPro'!`;
      this.errorMessageWhenTryUpdateReel(errorMessage, error);
    });
  }

  messageConfirmationUpdateStore() {
    this.msj.mensajeConfirmacion('¡Los rollos se subieron al inventario de manera satisfactoria!');
    this.load = false;
    this.fillDataProductionIncome();
    this.clearFields();
  }

  errorMessageWhenTryUpdateReel(message: string, error: HttpErrorResponse) {
    this.load = false;
    this.msj.mensajeError(message, `Error: ${error.statusText} | Status: ${error.status}`);
  }

  saveDataEntrace(data: any) {
    let info: any = {
      EntRolloProd_Fecha: moment().format('YYYY-MM-DD'),
      EntRolloProd_Observacion: this.setUbication(),
      Usua_Id: this.storage_Id,
      EntRolloProd_Hora: moment().format('H:mm:ss'),
    }
    this.entraceService.srvGuardar(info).subscribe(res => this.saveDataDetalleEntrance(res.entRolloProd_Id, data), error => this.errorMessageWhenTryUpdateReel(`¡Ha ocurrido un error al crear el ingreso!`, error));
  }

  saveDataDetalleEntrance(id: number, data: any) {
    let info: any = {
      EntRolloProd_Id: id,
      Rollo_Id: data.pp.numero_Rollo,
      DtEntRolloProd_Cantidad: data.pp.presentacion != 'Kg' ? data.pp.cantidad : data.pp.peso_Neto,
      UndMed_Rollo: data.pp.presentacion,
      Estado_Id: 19,
      DtEntRolloProd_OT: data.pp.ot,
      Prod_Id: data.producto.prod_Id,
      UndMed_Prod: data.pp.presentacion,
      Prod_CantPaquetesRestantes: 0,
      Prod_CantBolsasPaquete: 0,
      Prod_CantBolsasBulto: 0,
      Prod_CantBolsasRestates: 0,
      Prod_CantBolsasFacturadas: 0,
      Proceso_Id: data.proceso.proceso_Id,
    }
    this.dtEntracesService.srvGuardar(info).subscribe(null, error => this.errorMessageWhenTryUpdateReel(`¡No se pudo ingresar la información de cada rollo ingresado!`, error));
  }

  removeProduction(data: any) {
    let i: number = this.sendProductionZeus.findIndex(x => x.pp.numero_Rollo == data.pp.numero_Rollo);
    this.sendProductionZeus.splice(i, 1);
  }

  formatNumbers = (number) => number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

  fillDataProductionIncome() {
    let count: number = 0;
    this.sendProductionZeus.forEach(data => {
      count++;
      if (!this.dataSearched.map(x => x.production).includes(data.dataExtrusion.numero_RolloBagPro)) {
        this.dataSearched.push({
          orderProduction: data.pp.ot,
          item: data.producto.prod_Id,
          reference: data.producto.prod_Nombre,
          production: data.dataExtrusion.numero_RolloBagPro,
          quantity: data.pp.presentacion != 'Kg' ? data.pp.cantidad : data.pp.peso_Bruto,
          presentation: data.pp.presentacion,
          date: (data.pp.fecha).replace('T00:00:00', ''),
          hour: (data.pp.hora).length <= 7 ? `0${data.pp.hora}` : data.pp.hora,
          user: (this.storage_Name).toString().toUpperCase(),
          process: (data.proceso.proceso_Nombre).toString().toUpperCase(),
          ubication: (this.setUbication()).toString().toUpperCase(),
          productionPL : data.dataExtrusion.numero_Rollo,
          stateRollPP : '',
          price : 0,
        });
        this.dataSearched.sort((a, b) => a.hour.localeCompare(b.hour));
        this.dataSearched.sort((a, b) => a.date.localeCompare(b.date));
      }
      if (count == this.sendProductionZeus.length) this.createPDF();
    });
  }

  createPDF() {
    this.load = true;
    let title: string = `Ingresos a despacho`;
    let aditionalHeader: Array<any> = this.aditionalHeader();
    let content: any[] = this.contentPDF2();
    this.createPDFService.formatoPDF(title, content, aditionalHeader);
    setTimeout(() => this.load = false, 3000);
  }

  aditionalHeader(): Array<any> {
    return [
      [
        {
          margin: [35, 0],
          fontSize: 10,
          table: {
            widths: ['100%'],
            body: [
              [{ text: `Producción Ingresada a Despacho`, alignment: 'center', bold: true, fillColor: '#ccc', border: [true, true, true, true] }]
            ]
          }
        }
      ]
    ];
  }

  consolidatedInformation(data: Array<dataDesp>): Array<any> {
    let consolidatedInformation: Array<any> = [];
    let count: number = 0;
    data.forEach(prod => {
      if (!consolidatedInformation.map(x => x.Item).includes(prod.item)) {
        let cuontProduction: number = data.filter(x => x.item == prod.item).length;
        let totalQuantity: number = 0;
        data.filter(x => x.item == prod.item).forEach(x => totalQuantity += x.quantity);
        count++;
        consolidatedInformation.push({
          "#": { text: this.formatNumbers(count), alignment: 'right', fontSize: 8 },
          "Item": prod.item,
          "Referencia": prod.reference,
          "Cant. Rollos": { text: this.formatNumbers((cuontProduction)), alignment: 'right', fontSize: 8 },
          "Cantidad": { text: this.formatNumbers((totalQuantity).toFixed(2)), alignment: 'right', fontSize: 8 },
          "Presentación": prod.presentation
        });
      }
    });
    return consolidatedInformation;
  }

  contentPDF2(): Array<any> {
    let content: Array<any> = [];
    let consolidatedInformation: Array<any> = this.consolidatedInformation(this.dataSearched);
    content.push(this.fillDataProductsPDF(consolidatedInformation));
    return content;
  }

  fillDataProductsPDF(consolidatedInformation: any) {
    let data: Array<any> = [];
    let count: number = 0;
    consolidatedInformation.forEach(prod => {
      count++;
      data.push({
        margin: [-2, 5],
        fontSize: 8,
        table: {
          headerRows: 1,
          widths: ['10%', '10%', '50%', '20%', '10%'],
          body: this.fillDataOrdersByItemPDF(prod.Item, count),
        },
      });
    });
    return data;
  }

  fillDataOrdersByItemPDF(item: any, countItem: number) {
    let ordersByItem: Array<any> = this.dataSearched.filter(x => x.item == item);
    let count: number = 0;
    let includedOrders: Array<number> = [];
    let data: Array<any> = [this.informationItemPDF(item, countItem)];
    ordersByItem.forEach(prod => {
      if (!includedOrders.includes(prod.orderProduction)) {
        count++;
        includedOrders.push(prod.orderProduction);
        data.push([
          {
            margin: [0, 5],
            colSpan: 5,
            fontSize: 8,
            table: {
              headerRows: 1,
              widths: ['25%', '25%', '25%', '25%'],
              body: this.fillDataProductionyOrderPDF(prod.orderProduction, count),
            },
            layout: { defaultBorder: false, },
          }, {}, {}, {}, {}
        ]);
      }
    });
    return data;
  }

  informationItemPDF(item: any, countOperator: number) {
    let totalQuantity: number = 0;
    this.dataSearched.filter(y => y.item == item).forEach(y => totalQuantity += y.quantity);
    let dataOperator: Array<any> = this.dataSearched.filter(x => x.item == item);
    return [
      { border: [true, true, true, true], text: countOperator, fillColor: '#ddd', bold: true },
      { border: [true, true, true, true], text: `${dataOperator[0].item}`, fillColor: '#ddd', bold: true, alignment: 'right' },
      { border: [true, true, true, true], text: `${dataOperator[0].reference}`, fillColor: '#ddd', bold: true },
      { border: [true, true, true, true], text: this.formatNumbers((totalQuantity).toFixed(2)), fillColor: '#ddd', bold: true, alignment: 'right' },
      { border: [true, true, true, true], text: `${dataOperator[0].presentation}`, fillColor: '#ddd', bold: true, alignment: 'right' },
    ];
  }

  fillDataProductionyOrderPDF(order: number, countOrder: number) {
    let widths: Array<string> = ['5%', '10%', '10%', '10%', '15%', '20%', '30%'];
    let data: Array<any> = [this.informationOrderPDF(order, countOrder)];
    data.push([
      {
        margin: [0, 5],
        colSpan: 4,
        table: {
          widths: widths,
          headerRows: 1,
          dontBreakRow: true,
          body: this.informationProductionPDF(order),
        },
        layout: { defaultBorder: false, },
        fontSize: 7,
      }, {}, {}, {}
    ]);
    return data;
  }

  informationOrderPDF(order: any, countOrder: number) {
    let totalQuantity: number = 0;
    this.dataSearched.filter(y => y.orderProduction == order).forEach(y => totalQuantity += y.quantity);
    let productionByOrder: Array<any> = this.dataSearched.filter(x => x.orderProduction == order);
    return [
      { border: [true, true, true, true], text: countOrder, fillColor: '#eee', bold: true },
      { border: [true, true, true, true], text: `OT: ${productionByOrder[0].orderProduction}`, fillColor: '#eee', bold: true },
      { border: [true, true, true, true], text: `Cantidad: ${this.formatNumbers((totalQuantity).toFixed(2))}`, fillColor: '#eee', bold: true, alignment: 'right' },
      { border: [true, true, true, true], text: `Presentación: ${productionByOrder[0].presentation}`, fillColor: '#eee', bold: true, alignment: 'right' },
    ];
  }

  informationProductionPDF(order: any) {
    let productionByOrder: Array<any> = this.dataSearched.filter(x => x.orderProduction == order);
    let data: Array<any> = [this.titlesDetailsProductionPDF()];
    let count: number = 0;
    productionByOrder.forEach(x => {
      count++;
      data.push([
        { border: [false, false, false, false], fontSize: 7, alignment: 'right', text: this.formatNumbers((count)) },
        { border: [false, false, false, false], fontSize: 7, alignment: 'right', text: x.production },
        { border: [false, false, false, false], fontSize: 7, alignment: 'right', text: this.formatNumbers((x.quantity).toFixed(2)) },
        { border: [false, false, false, false], fontSize: 7, alignment: 'center', text: x.presentation },
        { border: [false, false, false, false], fontSize: 7, alignment: 'center', text: x.process },
        { border: [false, false, false, false], fontSize: 7, alignment: 'center', text: `${x.date} - ${x.hour}` },
        { border: [false, false, false, false], fontSize: 7, alignment: 'center', text: x.ubication },
      ]);
    });
    return data;
  }

  titlesDetailsProductionPDF() {
    return [
      { border: [true, true, true, true], alignment: 'center', text: `#`, fillColor: '#eee', bold: true },
      { border: [true, true, true, true], alignment: 'center', text: `Rollo`, fillColor: '#eee', bold: true },
      { border: [true, true, true, true], alignment: 'center', text: `Cantidad`, fillColor: '#eee', bold: true },
      { border: [true, true, true, true], alignment: 'center', text: `Presentación`, fillColor: '#eee', bold: true },
      { border: [true, true, true, true], alignment: 'center', text: `Proceso`, fillColor: '#eee', bold: true },
      { border: [true, true, true, true], alignment: 'center', text: `Fecha`, fillColor: '#eee', bold: true },
      { border: [true, true, true, true], alignment: 'center', text: `Ubicación`, fillColor: '#eee', bold: true },
    ]
  }

  //Función para filtrar la tabla de rollos a eliminar.
  applyFilter = ($event, campo : any, valorCampo : string) => this.dtDetailed!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);
}
