import { Component, OnInit } from '@angular/core';
import moment from 'moment';
import { start } from 'repl';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { CreacionPdfService, modelTagProduction } from 'src/app/Servicios/CreacionPDF/creacion-pdf.service';
import { DetallesEntradaRollosService } from 'src/app/Servicios/DetallesEntradasRollosDespacho/DetallesEntradaRollos.service';
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

  constructor(private appComponent: AppComponent,
    private productionProcessSerivce: Produccion_ProcesosService,
    private msj: MensajesAplicacionService,
    private createPDFService: CreacionPdfService,
    private bagproService: BagproService,
    private entraceService : EntradaRollosService,
    private dtEntracesService : DetallesEntradaRollosService,) {
    this.modoSeleccionado = this.appComponent.temaSeleccionado;
  }

  ngOnInit() {
    this.focusInput(true, false);
  }

  ngOnDestroy(): void {
    this.focusInput(false, true);
  }

  focusInput(start: boolean, finish: boolean) {
    let time = setInterval(() => {
      if (start && !finish) document.getElementById('RolloBarsCode').focus();
      else if (!start && finish) clearInterval(time);
    }, 500);
  }

  clearFields() {
    this.sendProductionZeus = [];
    this.productionSearched = null;
  }

  searchProductionByReel() {
    let production = parseInt(this.productionSearched);
    this.productionSearched = null;
    let productionSearched = this.sendProductionZeus.map(prod => prod.dataProduction.numero_Rollo);
    if (productionSearched.includes(production)) this.msj.mensajeAdvertencia(`El rollo ya ha sido registrado`);
    else {
      this.productionProcessSerivce.GetInformationAboutProductionToUpdateZeus(production).subscribe(data => {
        this.bagproService.GetOrdenDeTrabajo(data[0].pp.ot).subscribe(res => {
          this.sendProductionZeus.push(data[0]);
          let i: number = this.sendProductionZeus.findIndex(x => x.pp.numero_Rollo == data[0].pp.numero_Rollo);
          this.sendProductionZeus[i].dataExtrusion = {
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
  }

  updateProductionZeus(data: any) {
    let ot = data.pp.ot;
    let item = data.producto.prod_Id;
    let presentation = data.pp.presentacion;
    let reel = data.pp.numero_Rollo;
    let quantity = presentation != 'Kg' ? data.pp.cantidad : data.pp.peso_Neto;
    let price = data.pp.precio;
    if (presentation == 'Und') presentation = 'UND';
    else if (presentation == 'Kg') presentation = 'KLS';
    else if (presentation == 'Paquete') presentation = 'PAQ';
    this.saveDataEntrace(data);
    this.productionProcessSerivce.sendProductionToZeus(ot.toString(), item.toString(), presentation.toString(), parseInt(reel), parseFloat(quantity), parseFloat(price)).subscribe(() => {
      this.msj.mensajeConfirmacion('¡Los rollos se subieron al inventario de manera satisfactoria!');
    }, error => this.msj.mensajeError(error));
  }

  saveDataEntrace(data: any){
    let info : any = {
      EntRolloProd_Fecha : moment().format('YYYY-MM-DD'),
      EntRolloProd_Observacion : '',
      Usua_Id : this.storage_Id,
      EntRolloProd_Hora : moment().format('H:mm:ss'),
    }
    this.entraceService.srvGuardar(info).subscribe(res => this.saveDataDetalleEntrance(res.entRolloProd_Id, data), error => {
      this.load = false;
      this.msj.mensajeError(`¡Ha ocurrido un error al crear el ingreso!`);
    });
  }

  saveDataDetalleEntrance(id: number, data: any){
    let info : any = {
      EntRolloProd_Id : id,
      Rollo_Id : data.pp.numero_Rollo,
      DtEntRolloProd_Cantidad : data.pp.presentacion != 'Kg' ? data.pp.cantidad : data.pp.peso_Neto,
      UndMed_Rollo : data.pp.presentacion,
      Estado_Id : 19,
      DtEntRolloProd_OT : data.pp.ot,
      Prod_Id : data.producto.prod_Id,
      UndMed_Prod : data.pp.presentacion,
      Prod_CantPaquetesRestantes : 0,
      Prod_CantBolsasPaquete : 0,
      Prod_CantBolsasBulto : 0,
      Prod_CantBolsasRestates : 0,
      Prod_CantBolsasFacturadas : 0,
      Proceso_Id : data.proceso.proceso_Id,
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
    let i: number = this.sendProductionZeus.findIndex(x => x.pp.numero_Rollo == data[0].pp.numero_Rollo);
    this.sendProductionZeus.splice(i, 1);
  }
}