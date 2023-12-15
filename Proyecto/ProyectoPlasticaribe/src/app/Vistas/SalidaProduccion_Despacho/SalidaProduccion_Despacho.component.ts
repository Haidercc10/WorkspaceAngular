import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import moment from 'moment';
import { modelAsigProductosFacturas } from 'src/app/Modelo/modelAsigProductosFacturas';
import { modelDtAsgProductoFactura } from 'src/app/Modelo/modelDtAsgProductoFactura';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { CreacionPdfService, modelTagProduction } from 'src/app/Servicios/CreacionPDF/creacion-pdf.service';
import { DetallesAsignacionProductosFacturaService } from 'src/app/Servicios/DetallesFacturacionRollos/DetallesAsignacionProductosFactura.service';
import { AsignacionProductosFacturaService } from 'src/app/Servicios/FacturacionRollos/AsignacionProductosFactura.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { Produccion_ProcesosService } from 'src/app/Servicios/Produccion_Procesos/Produccion_Procesos.service';
import { UsuarioService } from 'src/app/Servicios/Usuarios/usuario.service';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-SalidaProduccion_Despacho',
  templateUrl: './SalidaProduccion_Despacho.component.html',
  styleUrls: ['./SalidaProduccion_Despacho.component.css']
})
export class SalidaProduccion_DespachoComponent implements OnInit {

  load: boolean = false;
  storage_Id: number;
  ValidarRol: number;
  modoSeleccionado: boolean = false;
  sendProductionZeus: any[] = [];
  productionSearched: any;
  formProduction: FormGroup;
  drivers: any[] = [];

  constructor(private appComponent: AppComponent,
    private productionProcessSerivce: Produccion_ProcesosService,
    private msj: MensajesAplicacionService,
    private createPDFService: CreacionPdfService,
    private usuariosService: UsuarioService,
    private frmBuilder: FormBuilder,
    private asgProdFacturaService: AsignacionProductosFacturaService,
    private dtAsgProdFacturaService: DetallesAsignacionProductosFacturaService,
    private bagproService: BagproService,) {
    this.modoSeleccionado = this.appComponent.temaSeleccionado;
    this.formProduction = this.frmBuilder.group({
      production: [''],
      client: ['', Validators.required],
      observation: [''],
      fact: ['', Validators.required],
      driver: ['', Validators.required],
      car: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.getDrivers();
    this.lecturaStorage();
    setTimeout(() => document.getElementById('RolloBarCode').focus(), 500);
  }

  lecturaStorage() {
    this.storage_Id = this.appComponent.storage_Id;
    this.ValidarRol = this.appComponent.storage_Rol;
  }

  formatonumeros = (number) => number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

  clearFields() {
    this.sendProductionZeus = [];
    this.productionSearched = null;
    this.formProduction.reset();
    this.load = false;
    document.getElementById('RolloBarCode').focus();
  }

  getDrivers() {
    this.usuariosService.GetConsdutores().subscribe(data => this.drivers = data);
  }

  searchProductionByReel() {
    let production = parseInt(this.formProduction.value.production);
    this.formProduction.patchValue({ production: null });
    document.getElementById('RolloBarCode').focus();
    let productionSearched = this.sendProductionZeus.map(prod => prod.dataProduction.numero_Rollo);
    if (productionSearched.includes(production)) this.msj.mensajeAdvertencia(`El rollo ya ha sido registrado`);
    else this.productionProcessSerivce.GetInformationAboutProduction(production).subscribe(data => {
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
        this.formProduction.patchValue({ client: data[0].clientes.cli_Id });
      });
    }, () => {
      this.msj.mensajeAdvertencia(`No se obtuvo información del rollo ${production}`);
    });
  }

  saveAsgFact() {
    this.load = true;
    let cli = this.formProduction.value.client;
    let data: modelAsigProductosFacturas = {
      FacturaVta_Id: this.formProduction.value.fact,
      NotaCredito_Id: '',
      Usua_Id: this.storage_Id,
      AsigProdFV_Fecha: moment().format('YYYY-MM-DD'),
      AsigProdFV_Hora: moment().format('HH:mm:ss'),
      AsigProdFV_Observacion: this.formProduction.value.observation,
      Cli_Id: cli,
      Usua_Conductor: this.formProduction.value.driver,
      AsigProdFV_PlacaCamion: this.formProduction.value.car,
      AsigProdFV_FechaEnvio: moment().format('YYYY-MM-DD'),
      AsigProdFV_HoraEnvio: moment().format('HH:mm:ss')
    }
    this.asgProdFacturaService.srvGuardar(data).subscribe(res => {
      this.saveProduction(res.asigProdFV_Id);
    }, () => {
      this.msj.mensajeError(`¡Ocurrió un error al insertar los datos de la factura!`);
      this.load = false;
    });
  }

  saveProduction(AsigProdFV_Id: number) {
    let count: number = 0;
    this.sendProductionZeus.forEach(prod => {
      let data: modelDtAsgProductoFactura = {
        AsigProdFV_Id: AsigProdFV_Id,
        Prod_Id: prod.producto.prod_Id,
        DtAsigProdFV_Cantidad: prod.pp.presentacion == 'Kg' ? prod.pp.peso_Neto : prod.pp.cantidad,
        UndMed_Id: prod.pp.presentacion,
        Rollo_Id: prod.pp.numero_Rollo,
        Prod_CantidadUnidades: prod.pp.cantidad,
      }
      this.dtAsgProdFacturaService.srvGuardar(data).subscribe(() => {
        this.productionProcessSerivce.putChangeStateProduction(prod.pp.numero_Rollo).subscribe(() => {
            count++;
            if (count == this.sendProductionZeus.length) {
              this.msj.mensajeConfirmacion(`¡Se ingresaron todos los rollos!`);
              this.createPDF();
            }
        });
      }, () => {
        this.msj.mensajeError(`¡Ocurrió un error al amarrar los rollos a la factura!`);
        this.load = false;
      });
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

  totalQuantity(): number {
    let total: number = 0;
    total = this.sendProductionZeus.reduce((acc, prod) => acc + (prod.pp.presentacion == 'Kg' ? prod.pp.peso_Neto : prod.pp.cantidad), 0);
    return total;
  }

  totalWeight(): number {
    let total: number = 0;
    total = this.sendProductionZeus.reduce((acc, prod) => acc + (prod.pp.peso_Neto), 0);
    return total;
  }

  createPDF() {
    let numFact = this.formProduction.value.fact;
    let title = `Despacho de Mercancia Factura #${numFact}`;
    let content = [
      this.informationAboutFact(),
      this.datosProveedorPDF(),
      this.informacionProduction(),
      this.table(this.dataProductionInPDF(), ['Rollo', 'Item', 'Referencia', 'Cantidad', 'Presentación']),
      this.totalQuantities(),
    ];
    this.createPDFService.formatoPDF(title, content);
    this.clearFields();
  }

  informationAboutFact() {
    return {
      text: `Información Factura`,
      alignment: 'center',
      fontSize: 10,
      bold: true
    };
  }

  datosProveedorPDF() {
    let fact = this.formProduction.value.fact;
    let driver = this.drivers.find(x => x.id == this.formProduction.value.driver);
    let cli = this.formProduction.value.client;
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

  informacionProduction() {
    return {
      text: `Información detallada de los rollos `,
      alignment: 'center',
      style: 'header',
      fontSize: 10,
      bold: true
    }
  }

  dataProductionInPDF() {
    let data: any = [];
    this.sendProductionZeus.forEach(prod => {
      let proceso: string = prod.proceso.proceso_Id;
      data.push({
        "Rollo": prod.pp.numero_Rollo,
        'Item': prod.producto.prod_Id,
        'Referencia': prod.producto.prod_Nombre,
        'Cantidad': ['SELLA', 'WIKE'].includes(proceso) ? this.formatonumeros((prod.pp.cantidad).toFixed(2)) : this.formatonumeros((prod.pp.peso_Neto).toFixed(2)),
        'Presentación': prod.pp.presentacion
      })
    });
    return data;
  }

  table(data, columns) {
    return {
      margin: [0, 10],
      table: {
        headerRows: 1,
        widths: ['10%', '10%', '50%', '20%', '10%'],
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

  buildTableBody(data, columns) {
    var body = [];
    body.push(columns);
    data.forEach(function (row) {
      var dataRow = [];
      columns.forEach(function (column) {
        dataRow.push(row[column].toString());
      });
      body.push(dataRow);
    });
    return body;
  }

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

}
