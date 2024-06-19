import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { dataDesp } from '../Movimientos-IngresosDespacho/Movimientos-IngresosDespacho.component';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { BodegasDespachoService } from 'src/app/Servicios/BodegasDespacho/BodegasDespacho.service';
import { CreacionPdfService } from 'src/app/Servicios/CreacionPDF/creacion-pdf.service';
import { DetallesDevolucionesProductosService } from 'src/app/Servicios/DetallesDevolucionRollosFacturados/DetallesDevolucionesProductos.service';
import { DetallesEntradaRollosService } from 'src/app/Servicios/DetallesEntradasRollosDespacho/DetallesEntradaRollos.service';
import { FallasTecnicasService } from 'src/app/Servicios/FallasTecnicas/FallasTecnicas.service';
import { EntradaRollosService } from 'src/app/Servicios/IngresoRollosDespacho/EntradaRollos.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { Produccion_ProcesosService } from 'src/app/Servicios/Produccion_Procesos/Produccion_Procesos.service';
import { SedeClienteService } from 'src/app/Servicios/SedeCliente/sede-cliente.service';
import { AppComponent } from 'src/app/app.component';
import { Gestion_DevolucionesOFComponent } from '../Gestion_DevolucionesOF/Gestion_DevolucionesOF.component';
import { HttpErrorResponse } from '@angular/common/http';
import moment from 'moment';
import { modelProduccionProcesos } from 'src/app/Modelo/modelProduccionProcesos';

@Component({
  selector: 'app-Reingreso_Produccion',
  templateUrl: './Reingreso_Produccion.component.html',
  styleUrls: ['./Reingreso_Produccion.component.css']
})
export class Reingreso_ProduccionComponent implements OnInit {
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
  form !: FormGroup;
  fails : any = [];
  rolls : any = [];
  selectedRolls : any = [];
  metaKey : boolean = true;

  constructor(
    private appComponent: AppComponent,
    private productionProcessSerivce: Produccion_ProcesosService,
    private msj: MensajesAplicacionService,
    private bagproService: BagproService,
    private entraceService: EntradaRollosService, 
    private dtEntracesService: DetallesEntradaRollosService,
    private storehouseService: BodegasDespachoService,
    private frmBuilder : FormBuilder, 
    private svFails : FallasTecnicasService,  
    private svDetailsDevolutions : DetallesDevolucionesProductosService,
  ) { 
    this.modoSeleccionado = this.appComponent.temaSeleccionado;
    this.validateForm();
  }

  ngOnInit() {
    this.lecturaStorage();
    this.getFails();
    this.getStorehouse();
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage() {
    this.storage_Id = this.appComponent.storage_Id;
    this.ValidarRol = this.appComponent.storage_Rol;
    this.storage_Name = this.appComponent.storage_Nombre;
  }

  //Validar formulario de devoluciones.
  validateForm(){
    this.form = this.frmBuilder.group({
      dev : [null, Validators.required],
      fact : [null, Validators.required],
      idClient: [null, Validators.required],
      client: [null, Validators.required],
      reason: [null, Validators.required],
      creditNote : [false, Validators.required],
      adjustment : [false, Validators.required],
    });
  }

  //Función para obtener las fallas técnicas.
  getFails = () =>  this.svFails.srvObtenerLista().subscribe(datos => { this.fails = datos.filter((item) => [13,14,15].includes(item.tipoFalla_Id)) });

  //Buscar bultos/rollos en devoluciones. 
  searchDevolutions(){
    let dev : any = this.form.value.dev;
    this.clearFieldsDevolutions();

    if (![null, undefined, ''].includes(dev)) {
      this.svDetailsDevolutions.GetInformationDevById(dev).subscribe(data => {
        if(![18].includes(data[0].dev.estado_Id)) {
          this.load = true;
          if(data.filter(x => [45].includes(x.estado_Produccion)).length > 0) {
            data.filter(x => [45].includes(x.estado_Produccion)).forEach(x => {
              this.rolls.push({  
                'item': x.prod.prod_Id,
                'reference': x.prod.prod_Nombre,
                'ot': x.ot,
                'numberProduction': x.dtDev.numero_Rollo,
                'quantity': x.dtDev.cantidad,
                'presentation': x.dtDev.presentacion, 
                'statusName': x.estadoOF,
              });
              this.changeInformationDev(x);
              this.load = false;
            });
          } this.msjs(`Advertencia`, `No hay rollos/bultos para asociar en la devolución N° ${dev}`, true);
        } else this.msjs(`Advertencia`, `La devolución N° ${dev} se encuentra cerrada!`, true); 
      }, error => {
        this.msjs(`Error`, error.status == 404 ? `No se encontró información de la devolución N° ${dev} | \n\n ${error.status} ${error.statusText}` : `Ocurrió un error al consultar la devolución N° ${dev} | \n\n ${error.status} ${error.statusText}`, true);
      }); 
    } else this.msjs(`Advertencia`, 'Número de devolución no valido!', true); 
  }

  //Función para cargar la información de la factura.
  changeInformationDev(data: any) {
    this.form.patchValue({ 
      'dev' :  data.dev.devProdFact_Id,
      'fact' : data.dev.facturaVta_Id,
      'idClient': data.cliente.cli_Id, 
      'client': data.cliente.cli_Nombre, 
      'reason' : data.dtDev.falla_Id, 
      'creditNote' : data.dev.devProdFact_NotaCredito,
      'adjustment' : data.dev.devProdFact_NotaCredito ? false : true,
    });
  }

  //Limpiar campos de devolución
  clearFieldsDevolutions(){
    this.form.reset();
    this.rolls = [];
    this.selectedRolls = [];
    this.load = false;
  }

  //Función para mostrar los diferentes tipos de msjs.
  msjs(msj1 : string, msj2 : string, clear : boolean){
    clear == true ? this.clearFieldsDevolutions() : this.load = false;
    switch (msj1) {
      case 'Confirmación' :
        return this.msj.mensajeConfirmacion(msj1, msj2);
      case 'Advertencia' :
        return this.msj.mensajeAdvertencia(msj1, msj2);
      case 'Error' :
        return this.msj.mensajeError(msj1, msj2);  
      default :
        return this.msj.mensajeAdvertencia(msj1, msj2); 
    }
  }

  //Cantidad total en reempaque
  totalQty = () => this.rolls.reduce((accum, item) => accum + item.quantity, 0);

  ngOnDestroy(): void {
    this.focusInput(true);
  }

  focusInput(destroy: boolean) {
    let time = setInterval(() => {
      let preInBarsCode = document.getElementById('RolloBarsCode');
      if (!destroy && preInBarsCode) preInBarsCode.focus();
      else if (destroy) clearInterval(time);
    }, 1000);
  }

  //Función que obtiene la información de las bodegas 
  getStorehouse = () => this.storehouseService.GetBodegas().subscribe(data => this.storehouse = data);

  //Función que obtiene las ubicaciones de las bodegas
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

  //Función que obtiene las sub ubicaciones de las bodegas
  getSubUbicationByStorehouse() {
    let dataUbication: any = this.ubicationsStorehouse.find(x => x.nombreCompleto == this.ubicationSelected);
    this.storehouseService.GetSubUbicacionesPorUbicacion(this.storehouseSelected, dataUbication.idUbicacion, dataUbication.nombreUbicacion).subscribe(data => {
      this.subUbicationsStorehouse = data;
      this.subUbicationSelected = null;
      this.cubes = [];
      this.cubeSelected = null;
    });
  }

  //Función que obtiene los cubos de las bodegas
  getCubesBySubUbication() {
    let dataUbication: any = this.ubicationsStorehouse.find(x => x.nombreCompleto == this.ubicationSelected);
    this.storehouseService.GetCubosPorSubUbicacion(this.storehouseSelected, dataUbication.idUbicacion, dataUbication.nombreUbicacion, this.subUbicationSelected).subscribe(data => {
      this.cubes = data;
      if (data.length == 0) this.cubeSelected = '';
    });
  }

  //Función que limpia los campos
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

  //Función que valida que las ubicaciones esten diligenciadas.
  validateUbicationSelected() {
    if (this.storehouseSelected && this.ubicationSelected && this.subUbicationSelected && this.cubeSelected != null) this.searchProductionByReel();
    else this.msj.mensajeAdvertencia(`¡Debe llenar los campo para validar la ubicación que tendrá el rollo/bulto!`);
  }

  //Función para buscar la información del bulto.
  searchProductionByReel() {
    let production = parseInt(this.productionSearched);
    this.productionSearched = null;
    let searchInTable: string = this.searchIn == null ? 'TODO' : !this.searchIn ? 'SELLA' : 'EXT';
    let productionSearched = this.sendProductionZeus.map(prod => prod.pp).map(x => x.numeroRollo_BagPro);
    let adjustmentZeus : boolean = this.form.value.adjustment;
    if (productionSearched.includes(production)) this.msj.mensajeAdvertencia(`El rollo ya ha sido registrado`);
    else {
      this.productionProcessSerivce.GetInformationAboutProductionToUpdateZeus(production, searchInTable).subscribe(data => {
        if (data[0].proceso.proceso_Id != 'WIKE') {
          this.bagproService.GetOrdenDeTrabajo(data[0].pp.ot).subscribe(res => {
            if(data[0].pp.ot == this.selectedRolls.ot) {
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
              adjustmentZeus ? this.updateProductionZeus(this.sendProductionZeus[this.sendProductionZeus[i].position - 1]) : this.saveDataEntrace(this.sendProductionZeus[this.sendProductionZeus[i].position - 1]);
              //adjustmentZeus ? console.log(1) : console.log(2);
              this.sendProductionZeus.sort((a,b) => Number(b.position) - Number(a.position));  
            } else this.msjs(`Advertencia`, `No es posible asociar el rollo/bulto N° ${production} al ${this.selectedRolls.numberProduction}, porque las OT no coinciden!`, false)
          }, error => { this.msj.mensajeError(`Error`, `No fue posible consultar la OT N° ${data[0].pp.ot} en BagPro | ${error.status} ${error.statusText}`) });
        } else this.msj.mensajeError(`Advertencia`, `No es posible ingresar rollos/bultos del proceso de 'WIKETIADO'!`);
      }, () => this.warningNotFound(production));
    }
  }

  //Función para enviar ajuste a zeus.
  updateProductionZeus(data: any) {
    let ot: string = data.pp.ot;
    let item: string = data.producto.prod_Id;
    let presentation: string = this.validatePresentation(data.pp.presentacion);
    let reel: number = data.pp.numero_Rollo;
    let quantity: number = presentation != 'KLS' ? data.pp.cantidad : data.pp.peso_Neto;
    let price: number = data.dataExtrusion.precioProducto;
    this.productionProcessSerivce.sendProductionToZeus(ot, item, presentation, data.pp.numeroRollo_BagPro, quantity.toString(), price.toString()).subscribe(() => {
      this.saveDataEntrace(data);
    }, error => {
      let i: number = this.sendProductionZeus.findIndex(x => x.pp.numero_Rollo == reel);
      this.sendProductionZeus.splice(i, 1);
      this.errorMessageWhenTryUpdateReel(`¡Error al actualizar el inventario del rollo ${reel}!`, error);
    });
  }

  //Función para validar la presentación
  validatePresentation(presentation: 'Und' | 'Kg' | 'Paquete'): 'UND' | 'KLS' | 'PAQ' {
    let presentations: any = {
      'Und': 'UND',
      'Kg': 'KLS',
      'Paquete': 'PAQ',
    }
    return presentations[presentation];
  }

  //Mensaje de confirmación de cuando los rollos se suben correctamente
  messageConfirmationUpdateStore() {
    this.msj.mensajeConfirmacion('¡Los rollos se subieron al inventario de manera satisfactoria!');
    this.load = false;
  }

  //Error al intentar actualizar 
  errorMessageWhenTryUpdateReel(message: string, error: HttpErrorResponse) {
    this.load = false;
    this.msj.mensajeError(message, `Error: ${error.statusText} | Status: ${error.status}`, 1200000);
  }

  //Mensaje de no encontrado.
  warningNotFound(production: number){
    this.msj.mensajeAdvertencia(`No se encontró un Rollo/Bulto con el número ${production}`, '', 1200000);
    this.load = false;
  }

  //Función para colocar la ubicación al bulto en despacho.
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

  //Función para guardar el encabezado del ingreso a despacho
  saveDataEntrace(data: any) {
    let info: any = {
      EntRolloProd_Fecha: moment().format('YYYY-MM-DD'),
      EntRolloProd_Observacion: this.setUbication(),
      Usua_Id: this.storage_Id,
      EntRolloProd_Hora: moment().format('H:mm:ss'),
    }
    this.entraceService.srvGuardar(info).subscribe(res => this.saveDataDetalleEntrance(res.entRolloProd_Id, data), () => {
      this.load = false;
      let i: number = this.sendProductionZeus.findIndex(x => x.pp.numero_Rollo == data.pp.numero_Rollo);
      this.sendProductionZeus.splice(i, 1);
      this.msj.mensajeError(`¡Ha ocurrido un error al crear el ingreso!`, '', 1200000);
    });
  }

  //Función para guardar los detalles del ingreso a despacho
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
    this.dtEntracesService.srvGuardar(info).subscribe(() => this.asociateRolls(data.pp.numeroRollo_BagPro), () => {
      this.load = false;
      let i: number = this.sendProductionZeus.findIndex(x => x.pp.numero_Rollo == data.pp.numero_Rollo);
      this.sendProductionZeus.splice(i, 1);
      this.msj.mensajeError('¡Rollos No Ingresados!', `¡No se pudo ingresar la información de cada rollo ingresado!`, 1200000);
    });
  }

  //Función para asociar los rollos que se reempacan al numero de etiqueta nuevo.
  asociateRolls(roll : any){
    this.productionProcessSerivce.putAsociateRoll(this.selectedRolls.numberProduction, roll, this.selectedRolls.item).subscribe(data => {
      let index : number = this.rolls.findIndex(x => x.numberProduction == this.selectedRolls.numberProduction);
      this.rolls.splice(index, 1);
      if(this.rolls.length == 0) this.msjs(`Confirmación`, `Los rollos reempacados se asociaron de manera satisfactoria!`, true);
      else this.msjs(`Confirmación`, `Rollos/bultos asociados exitosamente`, false);
    }, error => {

    });
  }

  //Función para remover el bulto de la tabla.
  removeProduction(data: any) {
    let i: number = this.sendProductionZeus.findIndex(x => x.pp.numero_Rollo == data.pp.numero_Rollo);
    this.sendProductionZeus.splice(i, 1);
  }
}
