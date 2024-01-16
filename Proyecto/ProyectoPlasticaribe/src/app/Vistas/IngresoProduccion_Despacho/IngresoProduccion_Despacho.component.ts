import { Component, OnInit } from '@angular/core';
import moment from 'moment';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { BodegasDespachoService } from 'src/app/Servicios/BodegasDespacho/BodegasDespacho.service';
import { CreacionPdfService, modelTagProduction } from 'src/app/Servicios/CreacionPDF/creacion-pdf.service';
import { DetallesEntradaRollosService } from 'src/app/Servicios/DetallesEntradasRollosDespacho/DetallesEntradaRollos.service';
import { ExistenciasProductosService } from 'src/app/Servicios/ExistenciasProductos/existencias-productos.service';
import { EntradaRollosService } from 'src/app/Servicios/IngresoRollosDespacho/EntradaRollos.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { Produccion_ProcesosService } from 'src/app/Servicios/Produccion_Procesos/Produccion_Procesos.service';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-IngresoProduccion_Despacho',
  templateUrl: './IngresoProduccion_Despacho.component.html',
  styleUrls: ['./IngresoProduccion_Despacho.component.css']
})

export class IngresoProduccion_DespachoComponent implements OnInit {

  load: boolean = false;
  storage_Id: number;
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

  constructor(private appComponent: AppComponent,
    private productionProcessSerivce: Produccion_ProcesosService,
    private msj: MensajesAplicacionService,
    private createPDFService: CreacionPdfService,
    private bagproService: BagproService,
    private entraceService: EntradaRollosService,
    private dtEntracesService: DetallesEntradaRollosService,
    private existenciasProductosService: ExistenciasProductosService,
    private storehouseService: BodegasDespachoService,) {
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

  getCubesBySubUbication(){
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
    if (this.storehouseSelected && this.ubicationSelected && this.subUbicationSelected && this.cubeSelected) this.searchProductionByReel();
    else this.msj.mensajeAdvertencia(`¡Debe llenar los campo para validar la ubicación que tendrá el rollo/bulto!`);
  }

  searchProductionByReel() {
    let production = parseInt(this.productionSearched);
    this.productionSearched = null;
    let productionSearched = this.sendProductionZeus.map(prod => prod.dataExtrusion).map(x => x.numero_RolloBagPro);
    if (productionSearched.includes(production)) this.msj.mensajeAdvertencia(`El rollo ya ha sido registrado`);
    else {
      this.bagproService.GetProductionByNumber(production).subscribe(prod => {
        if (prod.length > 0){
          if (!(prod[0].observaciones).toString().startsWith('Rollo #')) this.searchProductionByReelBagPro(prod[0]);
          else {
            let numProduction = prod[0].observaciones.replace('Rollo #', '');
            numProduction = numProduction.replace(' en PBDD.dbo.Produccion_Procesos', '');
            this.productionProcessSerivce.GetInformationAboutProductionToUpdateZeus(numProduction).subscribe(data => {
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
                this.updateProductionZeus(this.sendProductionZeus[i]);
              });
            });
          }
        } else this.msj.mensajeAdvertencia(`¡El rollo no existe o ya fue ingresado!`);
      });
    }
  }

  searchProductionByReelBagPro(prod){
    if (prod.length > 0){
      this.bagproService.GetOrdenDeTrabajo(prod[0].ot).subscribe(data => {
        data.forEach(res => {
          this.sendProductionZeus.push({
            pp: {
              ot: prod[0].ot,
              numero_Rollo: prod[0].item,
              presentacion: res.presentacion == 'Kilo' ? 'Kg' : res.presentacion == 'Unidad' ? 'Und' : 'Paquete',
              cantidad: ['SELLADO', 'Wiketiado'].includes(prod[0].nomStatus) ? prod[0].qty : prod[0].extnetokg,
              peso_Bruto: ['SELLADO', 'Wiketiado'].includes(prod[0].nomStatus) ? prod[0].peso : prod[0].extBruto,
              peso_Neto: ['SELLADO', 'Wiketiado'].includes(prod[0].nomStatus) ? prod[0].peso : prod[0].extnetokg,
              maquina: prod[0].maquina,
              fecha: ['SELLADO', 'Wiketiado'].includes(prod[0].nomStatus) ? prod[0].fechaEntrada.replace('T00:00:00','') : prod[0].fecha.replace('T00:00:00',''),
              hora: prod[0].hora,
            },
            producto: {
              prod_Id: res.id_Producto,
              prod_Nombre: res.producto,
              prod_Ancho: ['EMPAQUE'].includes(prod[0].nomStatus) ? prod[0].extancho : res.selladoCorte_Etiqueta_Ancho,
              prod_Largo: ['EMPAQUE'].includes(prod[0].nomStatus) ? prod[0].extlargo : res.selladoCorte_Etiqueta_Largo,
              prod_Fuelle: ['EMPAQUE'].includes(prod[0].nomStatus) ? prod[0].extfuelle : res.selladoCorte_Etiqueta_Fuelle,
            },
            clientes: {
              cli_Nombre: res.cliente,
            },
            dataExtrusion: {
              numero_RolloBagPro: prod[0].item,
              extrusion_Ancho1: res.ancho1_Extrusion,
              extrusion_Ancho2: res.ancho2_Extrusion,
              extrusion_Ancho3: res.ancho3_Extrusion,
              undMed_Id: res.und_Extrusion,
              extrusion_Calibre: res.calibre_Extrusion,
              material: prod[0].material,
              precioProducto: res.presentacion == 'Kilo' ? res.valorKg : res.valorUnidad,
            },
            proceso: {
              proceso_Id: prod[0].nomStatus == 'SELLADO' ? 'SELLA' : prod[0].nomStatus == 'Wiketiado' ? 'WIKE' : 'EMP',
              proceso_Nombre: prod[0].nomStatus,
            },
            turno: {
              turno_Nombre: ['SELLADO', 'Wiketiado'].includes(prod[0].nomStatus) ? prod[0].turnos : prod[0].turno,
            },
          });
          let i: number = this.sendProductionZeus.findIndex(x => x.pp.numero_Rollo == prod[0].item);
          this.updateProductionZeusByBagPro(this.sendProductionZeus[i]);
        });
      });
    }
  }

  updateProductionZeus(data: any) {
    let ot: string = data.pp.ot;
    let item: string = data.producto.prod_Id;
    let presentation: string = data.pp.presentacion;
    let reel: number = data.pp.numero_Rollo;
    let quantity: number = presentation != 'Kg' ? data.pp.cantidad : data.pp.peso_Neto;
    let price: number = data.dataExtrusion.precioProducto;
    if (presentation == 'Und') presentation = 'UND';
    else if (presentation == 'Kg') presentation = 'KLS';
    else if (presentation == 'Paquete') presentation = 'PAQ';
    this.saveDataEntrace(data);
    this.productionProcessSerivce.sendProductionToZeus(ot, item, presentation, reel, quantity.toString(), price.toString()).subscribe(() => {
      this.productionProcessSerivce.putSendZeus(reel).subscribe(() => {
        this.msj.mensajeConfirmacion('¡Los rollos se subieron al inventario de manera satisfactoria!');
        // this.existenciasProductosService.PutExistencia(parseInt(item), presentation, quantity, price).subscribe(() => {
        // });
      }, () => this.msj.mensajeError(`¡Error al cambiar el estado del rollo!`));
    }, () => this.msj.mensajeError(`¡Error al actualizar el inventario del rollo!`));
  }

  updateProductionZeusByBagPro(data: any){
    let process: string = data.proceso.proceso_Nombre;
    let ot: string = data.pp.ot;
    let item: string = data.producto.prod_Id;
    let presentation: string = data.pp.presentacion;
    let reel: number = data.pp.numero_Rollo;
    let quantity: number = presentation != 'Kg' ? data.pp.cantidad : data.pp.peso_Neto;
    let price: number = data.dataExtrusion.precioProducto;
    if (presentation == 'Und') presentation = 'UND';
    else if (presentation == 'Kg') presentation = 'KLS';
    else if (presentation == 'Paquete') presentation = 'PAQ';
    this.saveDataEntrace(data);
    this.productionProcessSerivce.sendProductionToZeus(ot, item, presentation, reel, quantity.toString(), price.toString()).subscribe(() => {
      if (['SELLADO', 'Wiketiado'].includes(process)) {
        this.bagproService.EnvioZeusProcSellado(reel).subscribe(() => {
          this.msj.mensajeConfirmacion('¡Los rollos se subieron al inventario de manera satisfactoria!');
        }, () => this.msj.mensajeError(`¡Error al cambiar el estado del rollo!`));
      } else {
        this.bagproService.EnvioZeusProcExtrusion(reel).subscribe(() => {
          this.msj.mensajeConfirmacion('¡Los rollos se subieron al inventario de manera satisfactoria!');
        }, () => this.msj.mensajeError(`¡Error al cambiar el estado del rollo!`));
      }
      // this.existenciasProductosService.PutExistencia(parseInt(item), presentation, quantity, price).subscribe(() => {
        
      // }, () => this.msj.mensajeError(`¡Error al actualizar las existencias de Plasticaribe!`));
    }, () => this.msj.mensajeError(`¡Error al actualizar el inventario del rollo!`));
  }

  saveDataEntrace(data: any) {
    // let subUbicationSelected = this.subUbicationsStorehouse.find(x => x.idSubUbicacion == this.subUbicationSelected);
    // let cube: string = this.cubeSelected == '' ? `` : `- ${this.cubeSelected}`
    // let ubication: string = `BODEGA ${this.storehouseSelected} - ${this.ubicationSelected} - ${subUbicationSelected.nombreSubUbicacion} ${subUbicationSelected.idSubUbicacion} ${cube}`;
    let ubicationSelected = this.ubicationsStorehouse.find(x => x.nombreCompleto == this.ubicationSelected);
    let subUbicationSelected = this.subUbicationsStorehouse.find(x => x.idSubUbicacion == this.subUbicationSelected);
    let ubicationName: string, subUbicationName: string;
    let cube: string = this.cubeSelected == '' ? `` : `- ${this.cubeSelected.replace('CUBO','C')}`
    if (ubicationSelected.nombreUbicacion == 'ESTANTE') ubicationName = 'EST';
    else if (ubicationSelected.nombreUbicacion == 'PLATAFORMA DINAMICA') ubicationName = 'PLTD';
    else if (ubicationSelected.nombreUbicacion == 'PASILLO JAULAS') ubicationName = 'PSJ';
    else if (ubicationSelected.nombreUbicacion == 'PASILLO') ubicationName = 'PS';
    if (subUbicationSelected.nombreSubUbicacion == 'PALO') subUbicationName = 'PL';
    else if (subUbicationSelected.nombreSubUbicacion == 'ESTIBA') subUbicationName = 'ESTB';
    let ubication: string = `BODEGA ${this.storehouseSelected} - ${ubicationName} ${ubicationSelected.idUbicacion} - ${subUbicationName} ${subUbicationSelected.idSubUbicacion} ${cube}`;
    let info: any = {
      EntRolloProd_Fecha: moment().format('YYYY-MM-DD'),
      EntRolloProd_Observacion: ubication,
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
    this.dtEntracesService.srvGuardar(info).subscribe(null, () => {
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
}