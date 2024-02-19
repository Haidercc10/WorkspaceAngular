import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import moment from 'moment';
import { modelProduccionProcesos } from 'src/app/Modelo/modelProduccionProcesos';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { BodegasDespachoService } from 'src/app/Servicios/BodegasDespacho/BodegasDespacho.service';
import { CreacionPdfService, modelTagProduction } from 'src/app/Servicios/CreacionPDF/creacion-pdf.service';
import { DetallesEntradaRollosService } from 'src/app/Servicios/DetallesEntradasRollosDespacho/DetallesEntradaRollos.service';
import { EntradaRollosService } from 'src/app/Servicios/IngresoRollosDespacho/EntradaRollos.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { Produccion_ProcesosService } from 'src/app/Servicios/Produccion_Procesos/Produccion_Procesos.service';
import { SedeClienteService } from 'src/app/Servicios/SedeCliente/sede-cliente.service';
import { AppComponent } from 'src/app/app.component';
import { dataDesp } from '../Movimientos-IngresosDespacho/Movimientos-IngresosDespacho.component';

@Component({
  selector: 'app-IngresoProduccion_Despacho',
  templateUrl: './IngresoProduccion_Despacho.component.html',
  styleUrls: ['./IngresoProduccion_Despacho.component.css']
})

export class IngresoProduccion_DespachoComponent implements OnInit {

  load: boolean = false;
  storage_Id: number;
  storage_Name: number;
  ValidarRol: number;
  modoSeleccionado: boolean = false;
  sendProductionZeus: any[] = [];
  productionSearched: any;
  storehouse: Array<any> = [];
  storehouseSelected: any;
  ubicationsStorehouse: Array<any> = [];
  ubicationSelected: any;
  subUbicationsStorehouse: Array<any> = [];
  subUbicationSelected: any;
  cubes: Array<any> = [];
  cubeSelected: any;
  dataSearched: Array<dataDesp> = [];
  searchIn: any = null;

  constructor(private appComponent: AppComponent,
    private productionProcessSerivce: Produccion_ProcesosService,
    private msj: MensajesAplicacionService,
    private createPDFService: CreacionPdfService,
    private bagproService: BagproService,
    private entraceService: EntradaRollosService,
    private dtEntracesService: DetallesEntradaRollosService,
    private storehouseService: BodegasDespachoService,
    private clients: SedeClienteService,) {
    this.modoSeleccionado = this.appComponent.temaSeleccionado;
  }

  ngOnInit() {
    this.lecturaStorage();
    this.focusInput(true, false);
    this.getStorehouse();
  }

  ngOnDestroy(): void {
    this.focusInput(false, true);
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage() {
    this.storage_Id = this.appComponent.storage_Id;
    this.ValidarRol = this.appComponent.storage_Rol;
    this.storage_Name = this.appComponent.storage_Nombre;
  }

  focusInput(start: boolean, finish: boolean) {
    let time = setInterval(() => {
      if (start && !finish) document.getElementById('RolloBarsCode').focus();
      else if (!start && finish) clearInterval(time);
    }, 1000);
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

  validateUbicationSelected() {
    if (this.storehouseSelected && this.ubicationSelected && this.subUbicationSelected && this.cubeSelected != null) this.searchProductionByReel();
    else this.msj.mensajeAdvertencia(`¡Debe llenar los campo para validar la ubicación que tendrá el rollo/bulto!`);
  }

  searchProductionByReel() {
    let production = parseInt(this.productionSearched);
    this.productionSearched = null;
    let searchInTable: string = this.searchIn == null ? 'TODO' : !this.searchIn ? 'SELLA' : 'EXT';
    let productionSearched = this.sendProductionZeus.map(prod => prod.pp).map(x => x.numeroRollo_BagPro);
    if (productionSearched.includes(production)) this.msj.mensajeAdvertencia(`El rollo ya ha sido registrado`);
    else {
      this.productionProcessSerivce.GetInformationAboutProductionToUpdateZeus(production, searchInTable).subscribe(data => {
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
          this.sendProductionZeus[i].position = this.sendProductionZeus.length;
          this.updateProductionZeus(this.sendProductionZeus[this.sendProductionZeus[i].position - 1]);
          this.sendProductionZeus.sort((a,b) => Number(b.position) - Number(a.position));
        });
      }, () => this.lookingForDataInBagpro(production));
    }
  }

  lookingForDataInBagpro(production: number) {
    let searchInTable: string = this.searchIn == null ? 'TODO' : !this.searchIn ? 'SELLADO' : 'EXTRUSION';
    this.bagproService.GetProductionByNumber(production, searchInTable).subscribe(prod => {
      if (prod.length > 0) {
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
            let process: 'EXT' | 'IMP' | 'ROT' | 'LAM' | 'DBLD' | 'CORTE' | 'EMP' | 'SELLA' | 'WIKE' = this.validateProcess((this.sendProductionZeus[i].proceso.proceso_Nombre).toUpperCase());
            this.sendProductionZeus[i].position = this.sendProductionZeus.length;
            this.saveInProductionProcess(this.sendProductionZeus[i].pp.numero_Rollo, process, i);
            this.sendProductionZeus.sort((a,b) => Number(b.position) - Number(a.position));
          });
        });
      } else this.warningNotFound(production);
    }, () => this.warningNotFound(production));
  }

  updateProductionZeus(data: any) {
    let ot: string = data.pp.ot;
    let item: string = data.producto.prod_Id;
    let presentation: string = this.validatePresentation(data.pp.presentacion);
    let reel: number = data.pp.numero_Rollo;
    let quantity: number = presentation != 'KLS' ? data.pp.cantidad : data.pp.peso_Neto;
    let price: number = data.dataExtrusion.precioProducto;
    this.productionProcessSerivce.sendProductionToZeus(ot, item, presentation, data.pp.numeroRollo_BagPro, quantity.toString(), price.toString()).subscribe(() => {
      this.saveDataEntrace(data);
    }, error => this.errorMessageWhenTryUpdateReel(`¡Error al actualizar el inventario del rollo ${reel}!`, error));
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
    return processMapping[process];
  }

  validatePresentation(presentation: 'Und' | 'Kg' | 'Paquete'): 'UND' | 'KLS' | 'PAQ' {
    let presentations: any = {
      'Und': 'UND',
      'Kg': 'KLS',
      'Paquete': 'PAQ',
    }
    return presentations[presentation];
  }

  updateProductionSendZeus(reel: number) {
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
      Pesado_Entre: sellado ? data.dataFromExtrusion.divBulto == null ? 1 : data.dataFromExtrusion.divBulto : 1,
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
      Envio_Zeus: false,
      Datos_Etiqueta: sellado ? data.dataFromExtrusion.fechaCambio : '',
      Fecha: sellado ? data.dataFromExtrusion.fechaEntrada : data.dataFromExtrusion.fecha,
      Hora: data.dataFromExtrusion.hora,
      Creador_Id: 123456789,
      NumeroRollo_BagPro: data.dataFromExtrusion.item,
    }
    return datos; 
  }

  saveInProductionProcess(numberProduction: number, process: 'EXT' | 'IMP' | 'ROT' | 'LAM' | 'DBLD' | 'CORTE' | 'EMP' | 'SELLA' | 'WIKE', i: number){
    this.productionProcessSerivce.Post(this.createProduction(numberProduction, process)).subscribe(data => {
      this.sendProductionZeus[i].pp.numero_Rollo = data.numero_Rollo;
      this.updateProductionZeus(this.sendProductionZeus[this.sendProductionZeus[i].position - 1]);
    }, error => {
      let errorMessage: string = `¡No fue posible crear el registro del Rollo/Bulto #${numberProduction} proveniente de 'BagPro'!`;
      this.errorMessageWhenTryUpdateReel(errorMessage, error);
    });
  }

  messageConfirmationUpdateStore() {
    this.msj.mensajeConfirmacion('¡Los rollos se subieron al inventario de manera satisfactoria!');
    this.load = false;
  }

  errorMessageWhenTryUpdateReel(message: string, error: HttpErrorResponse) {
    this.load = false;
    this.msj.mensajeError(message, `Error: ${error.statusText} | Status: ${error.status}`);
  }

  warningNotFound(production: number){
    this.msj.mensajeAdvertencia(`No se encontró un Rollo/Bulto con el número ${production}`);
    this.load = false;
  }

  setUbication(): string {
    // let subUbicationSelected = this.subUbicationsStorehouse.find(x => x.idSubUbicacion == this.subUbicationSelected);
    // let cube: string = this.cubeSelected == '' ? `` : `- ${this.cubeSelected}`
    // let ubication: string = `BODEGA ${this.storehouseSelected} - ${this.ubicationSelected} - ${subUbicationSelected.nombreSubUbicacion} ${subUbicationSelected.idSubUbicacion} ${cube}`;

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
    }
    this.entraceService.srvGuardar(info).subscribe(res => this.saveDataDetalleEntrance(res.entRolloProd_Id, data), () => {
      this.load = false;
      this.msj.mensajeError(`¡Ha ocurrido un error al crear el ingreso!`);
    });
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
    this.dtEntracesService.srvGuardar(info).subscribe(() => this.messageConfirmationUpdateStore(), () => {
      this.load = false;
      this.msj.mensajeError('¡Rollos No Ingresados!', `¡No se pudo ingresar la información de cada rollo ingresado!`);
    });
  }

  printTag(data: any) {
    let proceso: string = data.proceso.proceso_Id;
    let dataTagProduction: modelTagProduction = {
      client: data.clientes.cli_Nombre,
      item: data.producto.prod_Id,
      reference: data.producto.prod_Nombre,
      width: ['EMP', 'SELLA', 'WIKE'].includes(proceso) ? data.producto.prod_Ancho : data.dataExtrusion.extrusion_Ancho1,
      height: ['EMP', 'SELLA', 'WIKE'].includes(proceso) ? data.producto.prod_Largo : data.dataExtrusion.extrusion_Ancho2,
      bellows: ['EMP', 'SELLA', 'WIKE'].includes(proceso) ? data.producto.prod_Fuelle : data.dataExtrusion.extrusion_Ancho3,
      und: data.dataExtrusion.undMed_Id,
      cal: data.dataExtrusion.extrusion_Calibre,
      orderProduction: data.pp.ot,
      material: data.dataExtrusion.material,
      quantity: ['SELLA', 'WIKE'].includes(proceso) ? data.pp.cantidad : data.pp.peso_Bruto,
      quantity2: data.pp.peso_Neto,
      reel: data.pp.numero_Rollo,
      presentationItem1: ['SELLA', 'WIKE'].includes(proceso) ? data.pp.presentacion : 'Kg Bruto',
      presentationItem2: ['SELLA', 'WIKE'].includes(proceso) ? 'Kg' : 'Kg Neto',
      productionProcess: data.proceso.proceso_Nombre,
      showNameBussiness: data.motrarEmpresaEtiquetas,
    }
    this.createPDFService.createTagProduction(dataTagProduction);
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
          hour: (data.pp.hora).length == 7 ? `0${data.pp.hora}` : data.pp.hora,
          user: (this.storage_Name).toString().toUpperCase(),
          process: (data.proceso.proceso_Nombre).toString().toUpperCase(),
          ubication: (this.setUbication()).toString().toUpperCase(),
        });

        this.dataSearched.sort((a, b) => a.hour.localeCompare(b.hour));
        this.dataSearched.sort((a, b) => a.date.localeCompare(b.date));
      }
      if (count == this.sendProductionZeus.length) this.createPDF();
    });
  }

  createPDF() {
    this.load = true;
    let title: string = `Ingresos a Bodega de Despacho`;
    let content: any[] = this.contentPDF();
    this.createPDFService.formatoPDF(title, content);
    setTimeout(() => this.load = false, 3000);
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

  contentPDF(): Array<any> {
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
        margin: [0, 5],
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
      { border: [true, true, false, true], text: countOperator, fillColor: '#ccc', bold: true },
      { border: [false, true, false, true], text: `${dataOperator[0].item}`, fillColor: '#ccc', bold: true, alignment: 'right' },
      { border: [false, true, false, true], text: `${dataOperator[0].reference}`, fillColor: '#ccc', bold: true },
      { border: [false, true, false, true], text: this.formatNumbers((totalQuantity).toFixed(2)), fillColor: '#ccc', bold: true, alignment: 'right' },
      { border: [false, true, true, true], text: `${dataOperator[0].presentation}`, fillColor: '#ccc', bold: true, alignment: 'right' },
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
      { border: [true, true, true, true], text: countOrder, fillColor: '#ddd', bold: true },
      { border: [true, true, true, true], text: `OT: ${productionByOrder[0].orderProduction}`, fillColor: '#ddd', bold: true },
      { border: [true, true, true, true], text: `Cantidad: ${this.formatNumbers((totalQuantity).toFixed(2))}`, fillColor: '#ddd', bold: true, alignment: 'right' },
      { border: [true, true, true, true], text: `Presentación: ${productionByOrder[0].presentation}`, fillColor: '#ddd', bold: true, alignment: 'right' },
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
}