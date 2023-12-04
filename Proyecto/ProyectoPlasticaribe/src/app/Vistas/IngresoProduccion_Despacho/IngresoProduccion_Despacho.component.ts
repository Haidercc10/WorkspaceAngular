import { Component, OnInit } from '@angular/core';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { CreacionPdfService, modelTagProduction } from 'src/app/Servicios/CreacionPDF/creacion-pdf.service';
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
  productionSearched : any;

  constructor(private appComponent: AppComponent,
    private productionProcessSerivce : Produccion_ProcesosService,
    private msj : MensajesAplicacionService,
    private createPDFService : CreacionPdfService,
    private bagproService : BagproService,) {
    this.modoSeleccionado = this.appComponent.temaSeleccionado;
  }

  ngOnInit() {
    this.focusInput(true, false);
  }

  ngOnDestroy(): void {
    this.focusInput(false, true);
  }

  focusInput(start : boolean, finish : boolean){
    let time = setInterval(() => {
      if (start && !finish) document.getElementById('RolloBarsCode').focus();
      else if (!start && finish) clearInterval(time);
    }, 500);
  }

  clearFields(){
    this.sendProductionZeus = [];
    this.productionSearched = null;
  }

  searchProductionByReel(){
    let production = parseInt(this.productionSearched);
    this.productionSearched = null;
    let productionSearched = this.sendProductionZeus.map(prod => prod.dataProduction.numero_Rollo);
    if (productionSearched.includes(production)) this.msj.mensajeAdvertencia(`El rollo ya ha sido registrado`);
    else {
      this.productionProcessSerivce.GetInformationAboutProductionToUpdateZeus(production).subscribe(data => {
        this.bagproService.GetOrdenDeTrabajo(data[0].pp.ot).subscribe(res => {
          this.sendProductionZeus.push(data[0]);
          let i : number = this.sendProductionZeus.findIndex(x => x.pp.numero_Rollo == data[0].pp.numero_Rollo);
          this.sendProductionZeus[i].dataExtrusion = {
            extrusion_Ancho1: res[0].ancho1_Extrusion,
            extrusion_Ancho2: res[0].ancho2_Extrusion,
            extrusion_Ancho3: res[0].ancho3_Extrusion,
            undMed_Id : res[0].und_Extrusion,
            extrusion_Calibre : res[0].calibre_Extrusion,
            material : res[0].material,
          }
        });
      });
    }
  }

  updateProductionZeus(){
    let count : number = 0;
    this.sendProductionZeus.forEach(data => {
      let ot = data.pp.ot;
      let item = data.producto.prod_Id;
      let presentation = data.pp.presentacion;
      let reel = data.pp.numero_Rollo;
      let quantity = presentation != 'Kg' ? data.pp.cantidad : data.pp.peso_Neto;
      let price = data.pp.precio;
      if (presentation == 'Unidad') presentation = 'UND';
      else if (presentation == 'Kilo') presentation = 'KLS';
      else if (presentation == 'Paquete') presentation = 'PAQ';
      this.productionProcessSerivce.sendProductionToZeus(ot, item, presentation, reel, quantity, price).subscribe(res => {
        count++;
        if (count == this.sendProductionZeus.length) this.msj.mensajeConfirmacion('¡Los rollos se subieron al inventario de manera satisfactoria!');
      }, error => this.msj.mensajeError(error));
    });
  }

  printTag(data : any){
    let proceso : string = data.proceso.proceso_Id;
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

  removeProduction(data : any){
    let i : number = this.sendProductionZeus.findIndex(x => x.pp.numero_Rollo == data[0].pp.numero_Rollo);
    this.sendProductionZeus.splice(i, 1);
  }
}