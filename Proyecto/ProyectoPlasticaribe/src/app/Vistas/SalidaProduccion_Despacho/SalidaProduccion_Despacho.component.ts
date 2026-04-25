import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { modelAsigProductosFacturas } from 'src/app/Modelo/modelAsigProductosFacturas';
import { modelDtAsgProductoFactura } from 'src/app/Modelo/modelDtAsgProductoFactura';
import { CreacionPdfService } from 'src/app/Servicios/CreacionPDF/creacion-pdf.service';
import { DetallesAsignacionProductosFacturaService } from 'src/app/Servicios/DetallesFacturacionRollos/DetallesAsignacionProductosFactura.service';
import { Dt_OrdenFacturacionService } from 'src/app/Servicios/Dt_OrdenFacturacion/Dt_OrdenFacturacion.service';
import { AsignacionProductosFacturaService } from 'src/app/Servicios/FacturacionRollos/AsignacionProductosFactura.service';
import { InventarioZeusService } from 'src/app/Servicios/InventarioZeus/inventario-zeus.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { OrdenFacturacionService } from 'src/app/Servicios/OrdenFacturacion/OrdenFacturacion.service';
import { Produccion_ProcesosService } from 'src/app/Servicios/Produccion_Procesos/Produccion_Procesos.service';
import { UsuarioService } from 'src/app/Servicios/Usuarios/usuario.service';
import { AppComponent } from 'src/app/app.component';
import { Orden_FacturacionComponent } from '../Orden_Facturacion/Orden_Facturacion.component';
import { DevolucionesProductosService } from 'src/app/Servicios/DevolucionesRollosFacturados/DevolucionesProductos.service';
import { Detalles_PrecargueDespachoService } from 'src/app/Servicios/Detalles_PrecargueDespacho/Detalles_PrecargueDespacho.service';
import { Precargue_DespachoService } from 'src/app/Servicios/Precargue_Despacho/Precargue_Despacho.service';
import { modelDt_OrdenFacturacion } from 'src/app/Modelo/modelDt_OrdenFacturacion';
import { FacturacionProductosService } from 'src/app/Servicios/Facturacion_Productos/facturacion-productos.service';
import { MovimientosOrdenFacturacionComponent } from '../Movimientos-OrdenFacturacion/Movimientos-OrdenFacturacion.component';
import { Subject, take, takeUntil } from 'rxjs';

@Component({
  selector: 'app-SalidaProduccion_Despacho',
  templateUrl: './SalidaProduccion_Despacho.component.html',
  styleUrls: ['./SalidaProduccion_Despacho.component.css'], 
})

export class SalidaProduccion_DespachoComponent implements OnInit {

  load: boolean = false;
  storage_Id: number;
  ValidarRol: number;
  modoSeleccionado: boolean = false;
  sendProductionZeus: any[] = [];
  productionSearched: any;
  production: Array<production> = [];
  formProduction: FormGroup;
  drivers: any[] = [];
  modalProductionNotRead: boolean = false;
  remainingProduction: Array<production> = [];
  productionInPallet: Array<any> = [];
  productionOutPallet: Array<any> = [];
  count: number = 0;
  modalProductionOutPallet: boolean = false;
  soloRead: boolean = true;
  reposition: boolean = false;
  preload: boolean = false;
  preSendProductionZeus: any[] = [];
  rollsConsolidate: any = [];
  modalProductsNotRead: boolean = false;
  remainingProducts: any = [];
  verificationProducts: boolean = false;
  validations: number = 0;
  private destroy$ = new Subject<void>();
  private focusInterval: NodeJS.Timeout | null = null;

  constructor(private appComponent: AppComponent,
    private productionProcessSerivce: Produccion_ProcesosService,
    private msj: MensajesAplicacionService,
    private createPDFService: CreacionPdfService,
    private usuariosService: UsuarioService,
    private frmBuilder: FormBuilder,
    private asgProdFacturaService: AsignacionProductosFacturaService,
    private dtAsgProdFacturaService: DetallesAsignacionProductosFacturaService,
    private orderFactService: OrdenFacturacionService,
    private dtOrderFactService: Dt_OrdenFacturacionService,
    private zeusService: InventarioZeusService,
    private orden_FacturacionComponent: Orden_FacturacionComponent,
    private svDevolutions: DevolucionesProductosService,
    private svPreload: Precargue_DespachoService,
    private svFactProducts: FacturacionProductosService,
    private cmpMovOF: MovimientosOrdenFacturacionComponent,
  ) {
    this.modoSeleccionado = this.appComponent.temaSeleccionado;
    this.formProduction = this.frmBuilder.group({
      orderFact: ['', Validators.required],
      production: [''],
      client: ['', Validators.required],
      observation: [''],
      fact: ['', Validators.required],
      driver: ['', Validators.required],
      car: ['', Validators.required],
      saleOrder: [''],
      preload: [null],
      ofDirect: [false,]
    });
  }

  ngOnInit() {
    this.getDrivers();
    this.lecturaStorage();
    this.focusInput(false);
    // setTimeout(() => document.getElementById('RolloBarCode').focus(), 500);
  }

  //Función para leer el local storage y obtener el id del usuario y su rol.
  lecturaStorage() {
    this.storage_Id = this.appComponent.storage_Id;
    this.ValidarRol = this.appComponent.storage_Rol;
  }

  //Función para mantener el puntero del mouse en un campo especifico.
  ngOnDestroy(): void {
    //this.focusInput(true);
    this.focusInput2(true);
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Función para mantener el puntero del mouse en un campo especifico. 
  focusInput(destroy: boolean) {
    let time = setInterval(() => {
      let preInBarsCode = document.getElementById('RolloBarCode');
      if (!destroy && preInBarsCode) preInBarsCode.focus();
      else if (destroy) clearInterval(time);
    }, 30000);
  }

  //Función para mantener el puntero del mouse en un campo especifico, alternativa a la función focusInput.
  focusInput2(destroy: boolean) {
    if (destroy) {
      if (this.focusInterval) {
        clearInterval(this.focusInterval);
        this.focusInterval = null;
      }
      return;
    }

    this.focusInterval = setInterval(() => {
      const el = document.getElementById('RolloBarCode');
      el?.focus();
    }, 30000);
  }

  //Función para formatear números con separador de miles.
  formatonumeros = (number) => number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

  //Función para mostrar mensajes de error.
  errorMessage(message: string, error: HttpErrorResponse) {
    this.load = false;
    this.msj.mensajeError(message, `Error: ${error.statusText} | Status: ${error.status}`);
  }

  //Función para limpiar campos y variables.
  clearFields() {
    this.load = false;
    this.sendProductionZeus = [];
    this.productionSearched = null;
    this.formProduction.reset();
    document.getElementById('RolloBarCode')?.focus();
    this.count = 0;
    this.remainingProduction = [];
    this.rollsConsolidate = [];
    this.productionInPallet = [];
    this.productionOutPallet = [];
    this.reposition = false;
    this.preload = false;
    this.validations = 0;
    this.preSendProductionZeus = [];
  }

  //Función para obtener los conductores disponibles.
  getDrivers() {
    this.usuariosService.GetConsdutores().pipe(takeUntil(this.destroy$)).subscribe(data => this.drivers = data);
  }

  //Función para ver la OF desde el despacho
  viewOF() {
    let of: number = this.formProduction.value.orderFact;
    if (of) {
      this.load = true;
      let fact: string = this.formProduction.value.fact;
      let ofDirect: boolean = ![null, false, undefined].includes(this.formProduction.value.ofDirect) ? true : false;
      this.cmpMovOF.createPDF(of, fact, 'OF', ofDirect);
      setTimeout(() => { this.load = false; }, 1000);
    } else this.msj.mensajeAdvertencia('Debe colocar un número de orden válido!');
  }

  //Función para obtener la información del precargue por número de precargue.
  getInformationPreload() {
    this.load = true;
    let preload: number = this.formProduction.value.preload;

    this.svPreload.GetIdPrecargue_Despacho(preload).subscribe(data => {
      this.productionProcessSerivce.getOrderFactForPreload(data.oF_Id).subscribe(dataOF => {
        this.formProduction.patchValue({ 'orderFact': data.oF_Id, 'client': data.cli_Id });
        this.preSendProductionZeus = dataOF;
        this.load = false;
        this.preload = true;
        this.getInformationOrderFact(data.oF_Id, false);
      }, error => {
        this.msj.mensajeError(`Error`, `Error en la consulta de la orden de facturación asociada al precargue N° ${preload}`);
        this.clearFields();
      });
    }, error => {
      this.msj.mensajeError(`Error`, `Se encontraron errores en la consulta del precargue N° ${preload} | ${error.status} ${error.statusText}`);
      this.clearFields();
    });
  }

  //Función para obtener la información de la orden de facturación y validar su estado.
  getInformationForDispatch() {
    this.production = [];
    this.rollsConsolidate = [];
    this.remainingProducts = [];
    this.remainingProduction = [];
    this.sendProductionZeus = [];
    let orderFact: number = this.formProduction.value.orderFact;
    this.load = true;

    this.orderFactService.getId(orderFact).pipe(takeUntil(this.destroy$)).subscribe(data => {
      if (data.estado_Id == 19) {
        let ofDirect: boolean = ![null, false, undefined].includes(data.of_Directa) ? true : false;
        this.formProduction.patchValue({ 'ofDirect': ofDirect, 'client': data.cli_Id, });
        this.getInformationOrderFact(orderFact, ofDirect);
      } else if (data.estado_Id == 21) {
        this.msj.mensajeAdvertencia(`Advertencia`, `La orden N° ${orderFact} ya fue despachada!`);
        this.load = false;
      } else if (data.estado_Id == 3) {
        this.msj.mensajeAdvertencia(`Advertencia`, `La orden N° ${orderFact} fue anulada!`);
        this.load = false;
      } else {
        this.msj.mensajeAdvertencia(`Advertencia`, `La orden N° ${orderFact} no se encuentra disponible para despachar!`);
        this.load = false;
      }
    }, error => {
      this.msj.mensajeError('Error', `Error al consultar la OF N° ${orderFact} | ${error.status} ${error.statusText}`);
    });
  }

  //Función para obtener la información de la orden de facturación.
  getInformationOrderFact(of: number, ofDirect: boolean) {
    //let orderFact = this.formProduction.value.orderFact;
    this.reposition = false;
    //this.load = true;
    this.dtOrderFactService.GetInformacionOrderFactToSend(of, ofDirect).subscribe(data => {
      this.production = [];
      let saleOrders: Array<number> = [];
      data.forEach(dataProduction => {
        saleOrders.push(dataProduction.dtOrder.consecutivo_Pedido);

        //if(dataProduction.dtOrder.numero_Rollo != 0) {
        this.production.push({
          'saleOrder': dataProduction.dtOrder.consecutivo_Pedido,
          'item': dataProduction.producto.prod_Id,
          'reference': dataProduction.producto.prod_Nombre,
          'numberProduction': dataProduction.dtOrder.numero_Rollo,
          'quantity': dataProduction.dtOrder.cantidad,
          'presentation': dataProduction.dtOrder.presentacion,
          'ofDirect': ofDirect
        });
        //}
        this.load = false;
        if (saleOrders.length == data.length) {
          //setTimeout(() => this.load = false, 50);
          let saleOrder: string = `${data[0].dtOrder.consecutivo_Pedido}`;
          if (!saleOrder.startsWith('DV')) {
            this.zeusService.GetFactura(saleOrders[saleOrders.length - 1]).subscribe(factura => {
              this.orderFactService.PutFactOrder(of, factura.documento).subscribe(() => {
                this.formProduction.patchValue({ fact: factura.documento });
                this.msj.mensajeConfirmacion(`¡Orden de facturación consultada!`, `¡Continue ingresando los rollos que van a ser despachados!`);
                this.load = false;
                this.sendProductionZeus = this.preSendProductionZeus;
                this.consolidateItems();
                //Carga la info de la OF en la tabla. 
              }, error => {
                this.errorMessage(`¡No se pudo actualizar la factura de la orden #${of}!`, error);
                this.formProduction.patchValue({ 'orderFact': '', });
                this.preload = false;
              });
            }, error => {
              this.errorMessage(`¡No se encontró una factura asociada a los pedidos de la orden #${of}!`, error);
              this.formProduction.patchValue({ 'orderFact': '', });
              this.preload = false;
            });
          } else {
            this.reposition = true;
            this.formProduction.patchValue({ 'fact': dataProduction.order.factura, 'saleOrder': dataProduction.dtOrder.consecutivo_Pedido, });
            this.msj.mensajeConfirmacion(`Orden de reposición consultada`, `¡Ingrese los rollos que van a ser enviados por reposición!`);
            this.load = false;
          }
        }
      });
    }, error => this.errorMessage(`¡No se encontró información de la orden de facturación N° ${of}!`, error));
  }

  //Función para obtener la información del rollo/bulto a despachar.
  getInformationProduction(production: number) {
    let orderFact = this.formProduction.value.orderFact;

    //if(production) {
    if ([null, undefined, ''].includes(orderFact)) this.msj.mensajeAdvertencia(`Advertencia`, `¡Debe buscar la orden de facturación/reposición para ingresar los rollos/bultos a despachar!`, 12000000);
    //else if ([null, undefined, ''].includes(fact.toString().trim())) this.msj.mensajeAdvertencia(`Advertencia`, `No existen facturas/remisiones asociadas al pedido de la orden de facturación N° ${orderFact}`)
    else {
      //let production = parseInt(this.formProduction.value.production);
      let productionOrderSearched = this.production.map(x => x.numberProduction);
      console.log(production);
      this.disabledFieldRoll();
      if (!productionOrderSearched.includes(production)) {
        this.enabledFieldRoll();
        this.msj.mensajeError(`¡El rollo/bulto leido no pertenece a la orden de facturación buscada!`, ``, 12000000);
      } else {
        this.formProduction.patchValue({ production: null });
        document.getElementById('RolloBarCode')?.focus();
        let productionSearched = this.sendProductionZeus.map(prod => prod.pp.numeroRollo_BagPro);
        if (productionSearched.includes(production)) {
          this.msj.mensajeAdvertencia(`El rollo ya ha sido registrado`, ``, 12000000);
          this.enabledFieldRoll();
        } else {
          this.getDataProduction(production);
        }
      }
    }
    //} else {
    //  this.msj.mensajeAdvertencia(`Advertencia`, `Debe digitar un número de rollo/bulto válido`, 12000000);
    //}

  }

  //Función para consolidar los items a despachar y mostrar la cantidad total por item.
  disabledFieldRoll() {
    this.load = true;
    this.formProduction.get('production')?.disable();
  }

  //Función para habilitar el campo de producción después de leer el rollo/bulto.
  enabledFieldRoll() {
    this.load = false;
    this.formProduction.get('production')?.enable();
    document.getElementById('RolloBarCode')?.focus();
  }

  //Función para evitar que escriban el numero del bulto en el campo rollo leído
  quitBarCode() {
    setTimeout(() => {
      if (![1, 10, 97].includes(this.ValidarRol)) {
        this.formProduction.patchValue({ production: '' });
        if ([null, undefined, ''].includes(this.formProduction.value.fact)) this.formProduction.patchValue({ production: '' });
      }
    }, 50);
  }

  // Función para cargar rollos de OFs directas u ordenes normales.
  getProductionToDispatch() {
    let ofDirect: boolean = this.formProduction.value.ofDirect;
    let production: number = parseInt(this.formProduction.value.production);
    this.clearFieldProduction();
    if (production) {
      if (ofDirect) {
        let productionSearched = this.sendProductionZeus.map(prod => prod.pp.numeroRollo_BagPro);
        if (productionSearched.includes(production)) {
          this.msj.mensajeAdvertencia(`Advertencia`, `El rollo/bulto N° ${production} ya se encuentra en la tabla`, 3000);
          this.clearFieldProduction();
        } else
          if (production) {
            this.getProductionOfDirect(production);
          } else this.msj.mensajeAdvertencia('Advertencia', `No hay rollo leído para consultar!`);
      } else this.getInformationProduction(production);
    } //else this.msj.mensajeAdvertencia('Advertencia', `Debe digitar un consecutivo de rollo/bulto válido`);
  }

  // Función para cargar bultos disponibles de OF directas al despacho. 
  getProductionOfDirect(production: number) {
    let orderFact = this.formProduction.value.orderFact;
    this.disabledFieldRoll();
    this.productionProcessSerivce.getProductsOFDirect(production, orderFact).subscribe(data => {
      let productionFound: number = data[0].pp.numeroRollo_BagPro;
      if (productionFound == production) {
        //this.bagproService.GetOrdenDeTrabajo(data[0].pp.ot, '').subscribe(res => {
        this.sendProductionZeus.push(data[0]);
        let i: number = this.sendProductionZeus.findIndex(x => x.pp.numero_Rollo == data[0].pp.numero_Rollo);
        this.sendProductionZeus[i].dataExtrusion = {
          'numero_RolloBagPro': production,
          //'precioProducto': data[0].pp.presentacion != 'Kg' ? res[0].valorUnidad : res[0].valorKg,
          //'extrusion_Ancho1': res[0].ancho1_Extrusion,
          //'extrusion_Ancho2': res[0].ancho2_Extrusion,
          //'extrusion_Ancho3': res[0].ancho3_Extrusion,
          //'undMed_Id': res[0].und_Extrusion,
          //'extrusion_Calibre': res[0].calibre_Extrusion,  
          //'material': res[0].material,
          'ofDirect': true,
        };
        this.sendProductionZeus[i].position = this.sendProductionZeus.length;
        this.sendProductionZeus.sort((a, b) => Number(b.position) - Number(a.position));
        this.validateItemsToDispatch(data);
        //}, error => {
        //  this.clearFieldProduction();
        //  console.log(error);
        //});
      } else this.clearFieldProduction();
    }, error => {
      this.errorMessage(`No se encontró información del rollo/bulto ${production} de la OF N° ${orderFact}!`, error);
      this.clearFieldProduction();
    });
  }

  //Validar items a despachar
  validateItemsToDispatch(data: any) {
    let qtyToDispatchForItem: number = this.production.filter(x => x.item == data[0].producto.prod_Id).reduce((a, b) => a += b.quantity, 0);
    let qtyDispatched: number = this.sendProductionZeus.filter(x => x.producto.prod_Id == data[0].producto.prod_Id).reduce((a, b) => a += b.pp.cantidad, 0);

    if (qtyDispatched <= qtyToDispatchForItem) {
      this.consolidateItems();
      this.clearFieldProduction();
    } else {
      let ref: any = `${data[0].producto.prod_Id} - ${data[0].producto.prod_Nombre}`;
      this.msj.mensajeAdvertencia('Advertencia', `La cantidad a despachar de "${ref}" no puede ser mayor a la cantidad facturada (${qtyToDispatchForItem.toLocaleString()})!`, 3000);
      this.sendProductionZeus.shift();
      this.consolidateItems();
      this.clearFieldProduction();
    }
  }

  //Función para limpiar el campo rollo leído.
  clearFieldProduction() {
    this.formProduction.patchValue({ production: null });
    this.formProduction.get('production')?.enable();
    document.getElementById('RolloBarCode')?.focus();
    this.load = false;
  }

  getDataProduction(production: number) {
    if (production) {
      let orderFact = this.formProduction.value.orderFact;
      this.productionProcessSerivce.GetInformationAboutProductionToSend(production, orderFact).subscribe(data => {
        //this.bagproService.GetOrdenDeTrabajo(data[0].pp.ot, '').subscribe(res => {
        this.sendProductionZeus.push(data[0]);
        let i: number = this.sendProductionZeus.findIndex(x => x.pp.numero_Rollo == data[0].pp.numero_Rollo);
        this.sendProductionZeus[i].dataExtrusion = {
          numero_RolloBagPro: production,
          //precioProducto: data[0].pp.presentacion != 'Kg' ? res[0].valorUnidad : res[0].valorKg,
          //extrusion_Ancho1: res[0].ancho1_Extrusion,
          //extrusion_Ancho2: res[0].ancho2_Extrusion,
          //extrusion_Ancho3: res[0].ancho3_Extrusion,
          //undMed_Id: res[0].und_Extrusion,
          //extrusion_Calibre: res[0].calibre_Extrusion,
          //material: res[0].material,
        };
        this.sendProductionZeus[i].position = this.sendProductionZeus.length;
        this.sendProductionZeus.sort((a, b) => Number(b.position) - Number(a.position));
        this.consolidateItems();
        this.enabledFieldRoll();
        //}, error => {
        //  this.enabledFieldRoll();
        //});
      }, error => {
        this.errorMessage(`¡No se encontró información del Rollo/Bulto/Paquete consultado #${orderFact}!`, error);
        this.enabledFieldRoll();
      });
    } else {
      this.msj.mensajeAdvertencia(`Advertencia`, `Digite un rollo/bulto válido para continuar`);
      this.enabledFieldRoll();
    }
  }

  //Validar los datos a guardar 
  validateDataToSave() {
    if (this.sendProductionZeus.length > 0) {
      let ofDirect: boolean = this.formProduction.value.ofDirect
      this.remainingProduction = [];
      this.remainingProducts = [];

      if (ofDirect) this.validateOfDirects();
      else {
        let productionSearched = this.sendProductionZeus.map(x => x.pp.numeroRollo_BagPro);
        this.production.forEach(prod => {
          if (!productionSearched.includes(prod.numberProduction)) this.remainingProduction.push(prod);
        });
      }
      // Validar cantidades facturadas vs despachadas
      let errores: string[] = [];

      this.production.forEach(prod => {
        // Buscar todos los rollos despachados del mismo producto (por ejemplo por código o id)
        let despachado = this.sendProductionZeus
          .filter(x => x.pp.prod_Id == prod.item)
          .reduce((sum, item) => sum + (item.pp.cantidad || item.pp.peso_Neto), 0);

        console.log(despachado, prod.quantity);

        if (despachado.toFixed(2) < prod.quantity) {
          errores.push(`El item ${prod.item} tiene ${despachado} de ${prod.quantity}`);
        }
      });

      if (errores.length > 0) {
        if (ofDirect) this.modalProductsNotRead = true;
        else this.modalProductionNotRead = true;
        return; // Detiene el flujo
      }

      // Si todo está bien, continuar
      this.validateDataDispatch();
    } else this.msj.mensajeAdvertencia(`No hay rollos/bultos seleccionados para despachar!`);
  }

  ///
  validateOfDirects() {
    let itemToDispatch: any = this.rollsConsolidate.map(x => x.item);

    this.production.forEach(x => {
      if (!itemToDispatch.includes(x.item)) {
        this.remainingProducts.push(x);
      } else {
        this.rollsConsolidate.forEach(z => {
          if (z.item == x.item) {
            if (z.quantity.toFixed(2) < x.quantity.toFixed(2)) this.remainingProducts.push(x);
            else {
              console.log('Entré acá');
            }
          }
        });
      }
    });
  }

  //Validación de data a despachar.
  validateDataDispatch() {
    if (this.formProduction.value.driver) {
      if (!['', null, undefined].includes(this.formProduction.value.car)) {
        if (this.formProduction.value.car.length == 6) {
          if (this.remainingProduction.length == 0) {
            if (this.remainingProducts.length == 0) this.saveAsgFact();
            else this.modalProductsNotRead = true;
          } else this.modalProductionNotRead = true;
        } else this.msj.mensajeAdvertencia(`¡La placa del carro debe tener 6 digitos!`);
      } else this.msj.mensajeAdvertencia(`¡Debe llenar el campo 'Placa Carro'!`);
    } else this.msj.mensajeAdvertencia(`¡Debe elegir un Conductor!`);
  }

  //Guardar datos de la orden de facturación en la asignación de productos a facturas.
  saveAsgFact() {
    let orderFact = this.formProduction.value.orderFact;
    let fact: any = this.formProduction.value.fact;
    let ofDirect: any = this.formProduction.value.ofDirect;
    let cli = this.formProduction.value.client;
    this.load = true;

    let data: modelAsigProductosFacturas = {
      'FacturaVta_Id': fact,
      'NotaCredito_Id': `Orden de Facturación #${orderFact}`,
      'Usua_Id': this.storage_Id,
      'AsigProdFV_Fecha': moment().format('YYYY-MM-DD'),
      'AsigProdFV_Hora': moment().format('HH:mm:ss'),
      'AsigProdFV_Observacion': !this.formProduction.value.observation ? '' : (this.formProduction.value.observation).toUpperCase(),
      'Cli_Id': cli,
      'Usua_Conductor': this.formProduction.value.driver,
      'AsigProdFV_PlacaCamion': (this.formProduction.value.car).toUpperCase(),
      'AsigProdFV_FechaEnvio': moment().format('YYYY-MM-DD'),
      'AsigProdFV_HoraEnvio': moment().format('HH:mm:ss')
    }
    this.asgProdFacturaService.srvGuardar(data).subscribe(res => {
      ofDirect ? this.saveProductionInOf(orderFact, fact, ofDirect) : null;
      this.saveProduction(res.asigProdFV_Id);
    }, error => this.errorMessage(`¡Ocurrió un error al insertar los datos de la factura!`, error));
  }

  // Guardar datos de los rollos/bultos a despachar en los detalles de asignación de productos a facturas.
  saveProduction(AsigProdFV_Id: number) {
    let count: number = 0;
    this.sendProductionZeus.forEach(prod => {
      let data: modelDtAsgProductoFactura = {
        AsigProdFV_Id: AsigProdFV_Id,
        Prod_Id: prod.producto.prod_Id,
        DtAsigProdFV_Cantidad: prod.pp.presentacion == 'Kg' ? prod.pp.peso_Neto : prod.pp.cantidad,
        UndMed_Id: prod.pp.presentacion,
        Rollo_Id: prod.pp.numero_Rollo,
        Prod_CantidadUnidades: prod.pp.presentacion == 'Kg' ? prod.pp.peso_Neto : prod.pp.cantidad,
      }
      this.dtAsgProdFacturaService.srvGuardar(data).subscribe(() => {
        count++;
        if (count == this.sendProductionZeus.length) this.finishSaveData();
      }, error => this.errorMessage(`¡Ocurrió un error al amarrar los rollos a la factura!`, error));
    });
  }

  //Guardar producción de OF directas en los detalles de la orden de facturación.
  saveProductionInOf(of: number, fact: string, ofDirect: boolean) {
    //let count : number = 0;
    this.sendProductionZeus.filter(x => x.inOfDirect == false).forEach(x => {
      let dtOrderFact: modelDt_OrdenFacturacion = {
        'Id_OrdenFacturacion': of,
        'Numero_Rollo': x.dataExtrusion.numero_RolloBagPro,
        'Prod_Id': x.producto.prod_Id,
        'Cantidad': x.pp.presentacion == 'Kg' ? x.pp.peso_Neto : x.pp.cantidad,
        'Presentacion': x.pp.presentacion,
        'Consecutivo_Pedido': (x.salesOrder).toString(),
        'Estado_Id': 20
      }
      this.dtOrderFactService.Post(dtOrderFact).subscribe(() => {
        //count++;
        //if (count == this.sendProductionZeus.length) {
        //  this.putStateReels();
        //} 
      }, error => this.msj.mensajeError(`¡Ocurrió un error al crear los detalles de la orden de facturación!`, `Error: ${error.error.title} | Status: ${error.status}`));
    });
  }

  //Colocar en estado enviado la orden de facturación 
  finishSaveData() {
    let orderFact = this.formProduction.value.orderFact;
    this.orderFactService.PutStatusOrder(orderFact).subscribe(() => this.putStateReels(), error => {
      this.msj.mensajeError(`¡No se actualizó el estado de la orden de facturación ${orderFact}!`, `Error: ${error.error.title} | Status: ${error.status}`);
      this.load = false;
    });
  }

  //Función para colocar en estado NO DISPONIBLE los bultos despachados. 
  putStateReels() {
    let orderFact = this.formProduction.value.orderFact;
    let ofDirect = this.formProduction.value.ofDirect;
    let preload = this.formProduction.value.preload;

    this.productionProcessSerivce.putStateNotAvaible(orderFact).subscribe(() => {
      this.msj.mensajeConfirmacion(`¡Orden despachada correctamente!`);
      let fact = this.formProduction.value.fact;
      if (this.reposition) this.updateDevolution();
      if (this.preload) this.updatePreload(preload, orderFact);
      //this.cmpOrderFactPallets.createPDF(orderFact, fact);
      if (ofDirect) {
        this.updateOFDirectConsolidate(orderFact, fact);
      } else {
        this.clearFields();
        setTimeout(() => {
          this.orden_FacturacionComponent.createPDF(orderFact, fact);
        }, 200);
      }
    }, error => this.msj.mensajeError(`¡Ocurrió un error al actualizar el estado de los rollo seleccionados!`, `Error: ${error.error.title} | Status: ${error.status}`));
  }

  ///Función para actualizar el estado de la orden de facturación directa.
  updateOFDirectConsolidate(of: number, fact: string) {
    this.svFactProducts.PutOfDirectDispatched(of, this.rollsConsolidate).subscribe(data => {
      this.clearFields();
      setTimeout(() => {
        this.orden_FacturacionComponent.createPDFFactDirect(of, fact);
      }, 200);
    }, error => {
      this.msj.mensajeError('Error', `Error al momento de actualizar los productos `);
      this.load = false;
    });
  }

  //Actualizar estado de devolución a CERRADA
  updateDevolution() {
    let dev: any = this.formProduction.value.saleOrder;
    let date: any = moment().format('YYYY-MM-DD');
    let hour: any = moment().format('HH:mm:ss');

    dev = dev.split('-')[0].replace('DV', '');
    console.log(dev);

    this.svDevolutions.PutStatusDevolution(dev, 18, date, hour, this.storage_Id, true, false,).subscribe(data => {
    }, error => { this.msj.mensajeError(`Error`, `No fue posible actualizar el estado de la devolución`); });
  }

  //Actualizar estado del/los precargues por OF. 
  updatePreload(preload: number, of: number) {
    let info: any = [{ 'of': of, 'user': this.storage_Id, 'observation': '', 'status': 5 }];
    this.svPreload.putPreloadForOrderFact(of, info).subscribe(data => { }, e => {
      this.msj.mensajeError(`Error`, `No fue posible actualizar el estado del precargue N° ${preload} | ${e.status} ${e.statusText}`);
    });
  }

  //Función para verificar el despacho de los rollos/bultos seleccionados y mostrar los que faltan por despachar.
  verifyDispatch() {
    this.validations += 1;
    let ofDirect: boolean = this.formProduction.value.ofDirect;
    this.remainingProduction = [];

    if (ofDirect) {
      this.verificationProducts = true;
    } else {
      let productionSearched = this.sendProductionZeus.map(x => x.pp.numeroRollo_BagPro);
      this.production.forEach(prod => {
        if (!productionSearched.includes(prod.numberProduction)) this.remainingProduction.push(prod);
      });
      this.modalProductionNotRead = true;
    }
  }

  //Función para eliminar un rollo/bulto de la tabla antes de despachar.
  removeProduction(data: any) {
    let i: number = this.sendProductionZeus.findIndex(x => x.pp.numero_Rollo == data.pp.numero_Rollo);
    this.sendProductionZeus.splice(i, 1);
    this.consolidateItems();
  }

  //Función para consolidar los items a despachar y mostrar la cantidad total por item.
  totalQuantity(): number {
    let total: number = 0;
    total = this.sendProductionZeus.reduce((acc, prod) => acc += ![undefined, null, ''].includes(prod.pp) ? (prod.pp.presentacion == 'Kg' ? prod.pp.peso_Neto : prod.pp.cantidad) : 0, 0)
    return total;
  }

  //Función para consolidar los items a despachar y mostrar el peso total.
  totalWeight(): number {
    let total: number = 0;
    total = this.sendProductionZeus.reduce((acc, prod) => acc += ![undefined, null, ''].includes(prod.pp) ? (prod.pp.peso_Neto) : 0, 0);
    return total;
  }

  //Función para consolidar los items a despachar y mostrar la cantidad total por item.
  createPDF() {
    let numFact = this.formProduction.value.fact;
    let title = `Despacho de Mercancia Factura #${numFact}`;
    let content = [
      this.informationAboutFact(),
      this.datosProveedorPDF(),
      this.informacionProduction(),
      this.table(this.dataProductionInPDF(), ['Rollo', 'OT', 'Item', 'Referencia', 'Cantidad', 'Presentación']),
      this.totalQuantities(),
    ];
    this.createPDFService.formatoPDF(title, content);
    this.clearFields();
  }

  //Formato del PDF de despacho de mercancía.
  informationAboutFact() {
    return {
      text: `Información Factura`,
      alignment: 'center',
      fontSize: 10,
      bold: true
    };
  }

  //Formato del PDF de despacho de mercancía.
  datosProveedorPDF() {
    let fact = this.formProduction.value.fact;
    let driver = this.drivers.find(x => x.id == this.formProduction.value.driver);
    let cli = this.sendProductionZeus[0].clientes.cli_Id;
    let nameCli = this.sendProductionZeus[0].clientes.cli_Nombre;
    let idCar = this.formProduction.value.car;
    return {
      margin: 5,
      table: {
        widths: ['50%', '50%'],
        body: [
          [
            { text: `Factura: ${fact}`, border: [true, true, false, true] },
            { text: ``, border: [false, true, true, true] },
          ],
          [
            { text: `Documento: ${cli}`, border: [true, true, false, true] },
            { text: `Cliente: ${nameCli}`, border: [true, true, true, true] },
          ],
          [
            { text: `Conductor: ${driver.nombre}`, border: [true, true, false, true] },
            { text: `Placa: ${idCar}`, border: [true, true, true, true] },
          ],
          [
            this.observacionPDF(),
            {},
          ]
        ]
      },
      fontSize: 9,
    }
  }

  //Formato del PDF de despacho de mercancía.
  observacionPDF() {
    return {
      colSpan: 2,
      margin: [0, 10],
      border: [false, false, false, false],
      table: {
        widths: ['*'],
        body: [
          [{ border: [true, true, true, false], text: `Observación: `, style: 'subtitulo', bold: true }],
          [{ border: [true, false, true, true], text: this.formProduction.value.observation == null ? '' : this.formProduction.value.observation }]
        ]
      },
      fontSize: 9,
    }
  }

  //Formato del PDF de despacho de mercancía.
  informacionProduction() {
    return {
      text: `Información detallada de los rollos `,
      alignment: 'center',
      style: 'header',
      fontSize: 10,
      bold: true
    }
  }

  //Formato del PDF de despacho de mercancía.
  dataProductionInPDF() {
    let data: any = [];
    this.sendProductionZeus.forEach(prod => {
      let proceso: string = prod.proceso.proceso_Id;
      data.push({
        "Rollo": prod.pp.numeroRollo_BagPro,
        'OT': prod.pp.ot,
        'Item': prod.producto.prod_Id,
        'Referencia': prod.producto.prod_Nombre,
        'Cantidad': ['SELLA', 'WIKE'].includes(proceso) ? this.formatonumeros((prod.pp.cantidad).toFixed(2)) : this.formatonumeros((prod.pp.peso_Neto).toFixed(2)),
        'Presentación': prod.pp.presentacion,
      })
    });
    return data;
  }

  //Formato del PDF de despacho de mercancía.
  table(data, columns) {
    return {
      margin: [0, 10],
      table: {
        headerRows: 1,
        widths: ['10%', '10%', '10%', '50%', '10%', '10%'],
        body: this.buildTableBody(data, columns),
      },
      fontSize: 8,
      layout: {
        fillColor: function (rowIndex) {
          return (rowIndex == 0) ? '#CCCCCC' : null;
        }
      }
    };
  }

  //Función para construir la tabla del PDF de despacho de mercancía.
  buildTableBody(data, columns) {
    var body: any = [];
    body.push(columns);
    data.forEach(function (row) {
      var dataRow: any = [];
      columns.forEach(function (column) {
        dataRow.push(row[column].toString());
      });
      body.push(dataRow);
    });
    return body;
  }

  //Formato del PDF de despacho de mercancía.
  totalQuantities() {
    return {
      colSpan: 2,
      margin: [0, 10],
      table: {
        widths: ['*', '*'],
        body: [
          [
            { border: [true, true, true, true], text: `Cantidad Total: ${this.formatonumeros((this.totalQuantity()).toFixed(2))} ${this.sendProductionZeus[0].pp.presentacion}`, alignment: 'center', bold: true },
            { border: [true, true, true, true], text: `Kilos Totales: ${this.formatonumeros(this.totalWeight().toFixed(2))} Kg`, alignment: 'center', bold: true }
          ],
        ]
      },
      fontSize: 9,
    }
  }

  //PRUEBAS OF POR PALLET
  //Función para obtener la info de la OF.
  getInformationOrderFact2() {
    let orderFact = this.formProduction.value.orderFact;
    this.dtOrderFactService.GetInformacionOrderFactToSend(orderFact, false).subscribe(data => {
      this.load = true;
      this.production = [];
      let saleOrders: Array<number> = [];
      data.forEach(dataProduction => {
        this.formProduction.patchValue({
          'fact': dataProduction.order.factura,
          'client': dataProduction.clientes.cli_Id
        });
        saleOrders.push(dataProduction.dtOrder.consecutivo_Pedido);
        this.production.push({
          'saleOrder': dataProduction.dtOrder.consecutivo_Pedido,
          'item': dataProduction.producto.prod_Id,
          'reference': dataProduction.producto.prod_Nombre,
          'numberProduction': dataProduction.dtOrder.numero_Rollo,
          'quantity': dataProduction.dtOrder.cantidad,
          'presentation': dataProduction.dtOrder.presentacion,
          'pallet': ![0, null, undefined, ''].includes(dataProduction.dtOrder.pallet_Id) ? `ENTRLL#${dataProduction.pallet}-ITEM#${dataProduction.producto.prod_Id}` : null,
        });
        if (saleOrders.length == data.length) {
          setTimeout(() => this.load = false, 50);
          /*this.zeusService.GetFactura(saleOrders[saleOrders.length - 1]).subscribe(factura => {
            this.orderFactService.PutFactOrder(orderFact, factura.documento).subscribe(() => {
              this.formProduction.patchValue({ fact: factura.documento });
              this.msj.mensajeConfirmacion(`¡Orden de facturación consultada!`, `¡Continue ingresando los rollos que van a ser despachados!`);
            }, error => this.errorMessage(`¡No se pudo actualizar la factura de la orden #${orderFact}!`, error));
          }, error => this.errorMessage(`¡No se encontró una factura asociada a los pedidos de la orden #${orderFact}!`, error));*/
          console.log(this.production)

        }
      });
    }, error => this.errorMessage(`¡No se encontró información de la orden de facturación #${orderFact}!`, error));
  }

  //Función para obtener la info de la producción por rollo/bulto.
  getInformationProduction2() {
    this.load = true;
    let orderFact = this.formProduction.value.orderFact;
    if ([null, undefined, ''].includes(orderFact.toString().trim())) this.warningMsj(`Debe buscar la orden de facturación para ingresar los rollos/bultos a despachar`, ``, 12000000);
    else {
      let production = this.formProduction.value.production;
      let productionOrderSearched = this.production.map(x => x.numberProduction);
      if (production.startsWith('ENTRLL')) this.loadForPallets(production, productionOrderSearched, orderFact);
      else this.loadForRolls(production, productionOrderSearched, orderFact);
    }
  }

  //Función para cargar la producción de los rollos/bultos por pallet.
  loadForPallets(production: any, productionOrderSearched: any, of: any) {
    this.count = 0
    let pallet = this.production.filter(x => x.pallet == production);
    let codePallet: string = production.split('-')[0].replace('ENTRLL#', '');
    let item: string = production.split('-')[1].replace('ITEM#', '');
    this.productionInPallet = [];
    this.productionOutPallet = [];
    this.count = pallet.length;

    if (pallet.length > 0) {
      pallet.forEach(x => {
        if (!productionOrderSearched.includes(x.numberProduction)) this.warningMsj(`¡Hay rollos del pallet N° ${codePallet} que no pertenecen a la orden N° ${of}!`, ``);
        else if (x.numberProduction !== undefined) this.verifyLoadInfoProduction(x.numberProduction, `Pallet N° ${codePallet}`, codePallet, x);
      });
    } else {
      this.warningMsj(`El pallet ${codePallet} del item ${item} no pertenece a la orden N° ${of}`, ``);
      this.clearFocusBarCode();
    }
  }

  //Función para cargar la producción de los rollos/bultos sin pallet.
  loadForRolls(production: any, productionOrderSearched: any, of: number) {
    production = parseInt(production);
    this.productionInPallet = [];
    this.productionOutPallet = [];
    this.count = 1;

    if (!productionOrderSearched.includes(production)) this.warningMsj(`El rollo/bulto N° ${production} no pertenece a la orden ${of}`, ``);
    else {
      let infoProduction = this.production.find(x => x.numberProduction == production);
      let palletFind: any[] = this.production.filter(x => x.pallet == infoProduction!.pallet && ![0, null, undefined, ''].includes(x.pallet));

      if (palletFind.length > 0) {
        if (palletFind.some(x => x.numberProduction == production)) {
          let idPallet = palletFind.find(x => x.numberProduction == production)!.pallet.split('-')[0].replace('ENTRLL#', '');
          this.warningMsj(`El rollo/bulto N° ${production} pertenece al pallet N° ${idPallet}`, ``);
        } else this.verifyLoadInfoProduction(production, `Rollo/Bulto N° ${production}`, ``);
      } else this.verifyLoadInfoProduction(production, `Rollo/Bulto N° ${production}`, ``)
    }
  }

  //Función para verificar la información de la producción del rollo/bulto leído.
  verifyLoadInfoProduction(production: number, description: string, codePallet: any, info?: any) {
    this.clearFocusBarCode();
    let productionSearched = this.sendProductionZeus.map(prod => prod.pp.numeroRollo_BagPro);
    if (productionSearched.includes(production)) this.warningMsj(`El rollo/bulto N° ${production} ya ha sido registrado`, ``);
    else this.getDataProduction2(production, description, codePallet, info);
  }

  //Función para limpiar el campo de lectura de rollo/bulto y colocar el foco en el mismo.
  clearFocusBarCode() {
    this.formProduction.patchValue({ 'production': null });
    document.getElementById('RolloBarCode')?.focus();
  }

  //Función para obtener la información de la producción del rollo/bulto leído y cargarla en la tabla para despachar.
  getDataProduction2(production: number, barcodeRead: any, idPallet: any, info: any) {
    let orderFact = this.formProduction.value.orderFact;
    this.productionProcessSerivce.GetInformationAboutProductionToSend(production, orderFact).subscribe(data => {
      data.forEach(prod => this.productionInPallet.push(prod));

      console.log(this.count, this.productionInPallet.length)
      if (this.count == this.productionInPallet.length) {

        this.productionInPallet.forEach(prod => {
          this.sendProductionZeus.push(prod);
          let i: number = this.sendProductionZeus.findIndex(x => x.pp.numero_Rollo == prod.pp.numero_Rollo);
          let roll: number = this.sendProductionZeus.find(x => x.pp.numeroRollo_BagPro == prod.pp.numeroRollo_BagPro).pp.numeroRollo_BagPro;
          this.sendProductionZeus[i].pallet = idPallet;
          this.sendProductionZeus[i].numero_RolloBagPro = roll;
          this.sendProductionZeus[i].position = this.sendProductionZeus.length;
          this.sendProductionZeus.sort((a, b) => Number(b.position) - Number(a.position));
        });
        this.msj.mensajeConfirmacion(`${barcodeRead} leído exitosamente!`, ``);
        this.load = false;
      }
    }, error => {
      this.productionOutPallet.push(info);
      this.modalProductionOutPallet = true;
      this.load = false;
    });
  }

  //Función para mostrar mensajes de error.
  confirmMsj(msjHeader: string, msjBody: string) {
    this.load = false;
    this.msj.mensajeConfirmacion(msjHeader, msjBody);
  }

  //Función para mostrar mensajes de error.
  warningMsj(msjHeader: string, msjBody: string, time?: number) {
    this.load = false;
    this.msj.mensajeAdvertencia(msjHeader, msjBody, time);
  }

  ///Cargar items consolidados a despachar.
  consolidateItems() {
    this.rollsConsolidate = this.sendProductionZeus.reduce((a, b) => {
      let find = a.find(x => x.item == b.producto.prod_Id);
      if (!find) {
        let info: any = {
          'item': b.producto.prod_Id,
          'reference': b.producto.prod_Nombre,
          'quantity': b.pp.presentacion == 'Kg' ? b.pp.peso_Neto : b.pp.cantidad,
          'presentation': b.pp.presentacion,
          'countProduction': 1,
          'grossWeight': b.pp.peso_Bruto,
          'unit': 'Kg',
        }
        a.push(info);
      } else {
        a[a.map(x => x.item).indexOf(b.producto.prod_Id)].quantity += b.pp.presentacion == 'Kg' ? b.pp.peso_Neto : b.pp.cantidad;
        a[a.map(x => x.item).indexOf(b.producto.prod_Id)].grossWeight += b.pp.peso_Bruto;
        a[a.map(x => x.item).indexOf(b.producto.prod_Id)].countProduction += 1;
      }
      return a;
    }, []);
  }

  /// Cantidad de rollos de un item
  qtyRollsItem = (data: any) => this.sendProductionZeus.filter(x => x.producto.prod_Id == data.producto.prod_Id).length;

  /// Cantidad total de un item
  qtyTotalItem = (data: any) => this.sendProductionZeus.filter(x => x.producto.prod_Id == data.producto.prod_Id).reduce((a, b) => a += b.presentacion == 'Kg' ? b.pp.peso_Neto : b.pp.cantidad, 0);

  /// Peso total de un item
  weightTotalItem = (data: any) => this.sendProductionZeus.filter(x => x.producto.prod_Id == data.producto.prod_Id).reduce((a, b) => a += b.pp.peso_Bruto, 0);

  /// Cantidad total consolidada a despachar 
  totalConsolidateQuantity(): number {
    let total: number = 0;
    total = this.rollsConsolidate.reduce((a, b) => a += b.quantity, 0);
    return total;
  }

  /// Cantidad total consolidada en peso bruto
  totalGrossWeight(): number {
    let total: number = 0;
    total = this.rollsConsolidate.reduce((a, b) => a += b.grossWeight, 0);
    return total;
  }

  /// Cantidad total consolidada en peso bruto
  totalProduction(): number {
    let total: number = 0;
    total = this.rollsConsolidate.reduce((a, b) => a += b.countProduction, 0);
    return total;
  }

  ///Cantidad despachada de un item 
  totalDispatchItem(data: any) {
    let total: number = 0;
    total = this.rollsConsolidate.filter(x => x.item == data.item).reduce((a, b) => a += b.quantity, 0);
    return total;
  }

  /// Diferencia entre la cantidad facturada vs despachada
  diffDispatchVsFact(data: any) {
    let total: number = 0;
    let fact: number = this.production.filter(x => x.item == data.item).reduce((a, b) => a += b.quantity, 0);
    let dispatch: number = this.rollsConsolidate.filter(x => x.item == data.item).reduce((a, b) => a += b.quantity, 0);
    total = (fact - dispatch);
    return total
  }
}

interface production {
  saleOrder: number;
  item: number;
  reference: string;
  numberProduction?: number;
  quantity: number;
  cuontProduction?: number;
  presentation: string;
  pallet?: any;
  ofDirect?: boolean;
}

//Función que consolida la información si existen rollos en pallets.
/*consolidateInformation(){
  let production : any = this.production.reduce((a, b) => {
    if(!a.map(x => x.pallet).includes(b.pallet)) a = [...a, b];
    else a.find(x => x.pallet == b.pallet).quantity += b.quantity; 
    return a;
  }, []);
  console.log(production);
  return production;
}*/