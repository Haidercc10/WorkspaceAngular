import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CreacionPdfService, modelTagProduction } from 'src/app/Servicios/CreacionPDF/creacion-pdf.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { Produccion_ProcesosService } from 'src/app/Servicios/Produccion_Procesos/Produccion_Procesos.service';
import { UsuarioService } from 'src/app/Servicios/Usuarios/usuario.service';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-prueba-imagen-cat-insumo',
  templateUrl: './prueba-imagen-cat-insumo.component.html',
  styleUrls: ['./prueba-imagen-cat-insumo.component.css']
})

export class PruebaImagenCatInsumoComponent implements OnInit {

  load: boolean = false;
  storage_Id: number;
  ValidarRol: number;
  modoSeleccionado: boolean = false;
  sendProductionZeus: any[] = [];
  productionSearched : any;
  formProduction : FormGroup;
  drivers : any[] = [];

  constructor(private appComponent: AppComponent,
    private productionProcessSerivce : Produccion_ProcesosService,
    private msj : MensajesAplicacionService,
    private createPDFService : CreacionPdfService,
    private usuariosService : UsuarioService,
    private frmBuilder : FormBuilder,) {
    this.modoSeleccionado = this.appComponent.temaSeleccionado;
    this.formProduction = this.frmBuilder.group({
      production : [''],
      observation : [''],
      driver: [''],
      car : [''],
    });
  }

  ngOnInit() {
    this.getDrivers();
    setTimeout(() => document.getElementById('RolloBarsCode').focus(), 500);
  }
  
  clearFields(){
    this.sendProductionZeus = [];
    this.productionSearched = null;
  }

  getDrivers(){
    this.usuariosService.GetConsdutores().subscribe(data => this.drivers = data);
  }

  searchProductionByReel(){
    let production = parseInt(this.formProduction.value.production);
    this.formProduction.patchValue({production : null});
    document.getElementById('RolloBarsCode').focus();
    let productionSearched = this.sendProductionZeus.map(prod => prod.dataProduction.numero_Rollo);
    if (productionSearched.includes(production)) this.msj.mensajeAdvertencia(`El rollo ya ha sido registrado`);
    else this.productionProcessSerivce.GetInformationAboutProduction(production).subscribe(data => this.sendProductionZeus = data, () => {
      this.msj.mensajeAdvertencia(`No se obtuvo información del rollo ${production}`);
    });
  }

  updateProductionZeus(){
    this.sendProductionZeus.forEach(data => {
      let ot = data.dataProduction.ot;
      let item = data.dataProduction.prod_Id;
      let presentation = data.dataProduction.presentacion;
      let reel = data.dataProduction.numero_Rollo;
      let quantity = presentation != 'Kg' ? data.dataProduction.cantidad : data.dataProduction.peso_Neto;
      let price = data.dataProduction.precio;
      if (presentation == 'Unidad') presentation = 'UND';
      else if (presentation == 'Kilo') presentation = 'KLS';
      else if (presentation == 'Paquete') presentation = 'PAQ';

      this.productionProcessSerivce.sendProductionToZeus(ot, item, presentation, reel, quantity, price).subscribe(res => {
        
      }, error => this.msj.mensajeError(error));
    });
  }

  printTag(data : any){
    let proceso : string = data.process.proceso_Id;
    let dataTagProduction: modelTagProduction = {
      client: data.dataProduction.clientes.cli_Nombre,
      item: data.product.prod_Id,
      reference: data.product.prod_Nombre,
      width: ['EMP', 'SELLA', 'WIKE'].includes(proceso) ? data.product.prod_Ancho : data.dataExtrusion.extrusion_Ancho1,
      height: ['EMP', 'SELLA', 'WIKE'].includes(proceso) ? data.product.prod_Largo : data.dataExtrusion.extrusion_Ancho2,
      bellows: ['EMP', 'SELLA', 'WIKE'].includes(proceso) ? data.product.prod_Fuelle : data.dataExtrusion.extrusion_Ancho3,
      und: data.dataExtrusion.undMed_Id,
      cal: data.dataExtrusion.extrusion_Calibre,
      orderProduction: data.orderProduction,
      material: data.material.material_Nombre,
      quantity: ['SELLA', 'WIKE'].includes(proceso) ? data.dataProduction.cantidad : data.dataProduction.peso_Bruto,
      quantity2: data.dataProduction.peso_Neto,
      reel: data.dataProduction.numero_Rollo,
      presentationItem1: ['SELLA', 'WIKE'].includes(proceso) ? data.dataProduction.presentacion : 'Kg Bruto',
      presentationItem2: ['SELLA', 'WIKE'].includes(proceso) ? 'Kg' : 'Kg Neto',
      productionProcess: data.process.proceso_Nombre,
      showNameBussiness: data.motrarEmpresaEtiquetas,
    }
    this.createPDFService.createTagProduction(dataTagProduction);
  }

  removeProduction(data : any){
    let i = this.sendProductionZeus.findIndex(x => x.dataProduction.numero_Rollo == data.dataProduction.numero_Rollo);
    this.sendProductionZeus.splice(i, 1);
  }

}