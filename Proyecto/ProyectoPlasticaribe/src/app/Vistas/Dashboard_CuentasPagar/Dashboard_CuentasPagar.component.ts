import { Component, OnInit, ViewChild } from '@angular/core';
import { ShepherdService } from 'angular-shepherd';
import moment from 'moment';
import pdfMake from 'pdfmake/build/pdfmake';
import { Table } from 'primeng/table';
import { Facturas_Invergoal_InversuezService } from 'src/app/Servicios/Facturas_Invergoal_Inversuez/Facturas_Invergoal_Inversuez.service';
import { ZeusContabilidadService } from 'src/app/Servicios/Zeus_Contabilidad/zeusContabilidad.service';
import { AppComponent } from 'src/app/app.component';
import { defaultStepOptions, stepsDashboardCuentasPagar as defaultSteps } from 'src/app/data';
import { logoParaPdf } from 'src/app/logoPlasticaribe_Base64';
import { PaginaPrincipalComponent } from '../PaginaPrincipal/PaginaPrincipal.component';
import { CreacionPdfService } from 'src/app/Servicios/CreacionPDF/creacion-pdf.service';

@Component({
  selector: 'app-Dashboard_CuentasPagar',
  templateUrl: './Dashboard_CuentasPagar.component.html',
  styleUrls: ['./Dashboard_CuentasPagar.component.css']
})

export class Dashboard_CuentasPagarComponent implements OnInit {

  cargando : boolean = false; //Variable para validar que salga o no la imagen de carga
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  today : any = moment().format('YYYY-MM-DD'); //Variable que va a almacenar la fecha del dia de hoy
  primerDiaMes : any = moment().startOf('month').format('YYYY-MM-DD'); //Variable que va a almacenar el primer dia del mes
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro
  carteraAgrupadaProveedores : any [] = []; //Variable que almacenará la información de la cartera agrupada por los proveedores
  carteraInvergoal : any [] = []; //Variable que almacenará la información de la cartera de INVERGOAL
  carteraInversuez : any [] = []; //Variable que almacenará la información de la cartera de INVERSUEZ
  totalCartera : number = 0; //Variable que almacenará el valor total de la cartera
  @ViewChild('dt_carteraAgrupada') dt_carteraAgrupada: Table | undefined;

  constructor(private AppComponent : AppComponent,
                private zeusService : ZeusContabilidadService,
                  private shepherdService: ShepherdService,
                    private paginaPrincial : PaginaPrincipalComponent,
                      private creacionPDFService : CreacionPdfService,) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
  }

  ngOnInit() {
    this.lecturaStorage();
    this.tiempoExcedido();
    setInterval(() => this.modoSeleccionado = this.AppComponent.temaSeleccionado, 1000);
  }

  // Funcion que iniciará el tutorial
  tutorial(){
    this.shepherdService.defaultStepOptions = defaultStepOptions;
    this.shepherdService.modal = true;
    this.shepherdService.confirmCancel = false;
    this.shepherdService.addSteps(defaultSteps);
    this.shepherdService.start();
  }

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number : any) => number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  //Funcion que va a encargarse de cargar la información de las cards y llama a la funcion de que contará en cunato tiempo se recargará la información
  tiempoExcedido = () => (this.paginaPrincial.cuentasPagar) ? this.consultarCartera() : undefined;

  // Función que ejecutará las peticiones de la cartera
  consultarCartera(){
    this.carteraAgrupadaProveedores = [];
    this.carteraInvergoal = [];
    this.carteraInversuez = [];
    this.zeusService.GetCostosProveedores('220505').subscribe(data => {
      let numDatos : number = 0;
      for (let i = 0; i < data.length; i++) {
        let info : any = {
          Id_Proveedor : data[i].idprove,
          Proveedor : data[i].razoncial,
          Cartera : data[i].sdaccta,
          Cuenta : data[i].codicta,
          Periodo : data[i].anomescta,
          Detalles : [],
        }
        if (!['900458314','900362200'].includes(data[i].idprove)) this.carteraAgrupadaProveedores.push(info);
        else if (data[i].idprove == '900362200') this.carteraInvergoal.push(info);
        else if (data[i].idprove == '900458314') this.carteraInversuez.push(info);
        numDatos += 1;
        if (numDatos == data.length) {
          this.costoPorPagar(1);
          this.zeusService.GetFacturasProveedores('220505').subscribe(datos => {
            for (let i = 0; i < datos.length; i++) {
              if (!['900458314','900362200'].includes(datos[i].id_Proveedor)) {
                let index = this.carteraAgrupadaProveedores.findIndex(item => item.Id_Proveedor == datos[i].id_Proveedor && item.Cuenta == datos[i].cuenta);
                this.carteraAgrupadaProveedores[index].Detalles.push(datos[i]);
                this.cargando = false;
              } else if (datos[i].id_Proveedor == '900362200') {
                let index = this.carteraInvergoal.findIndex(item => item.Id_Proveedor == datos[i].id_Proveedor);
                this.carteraInvergoal[index].Detalles.push(datos[i]);
                this.cargando = false;
              } else if (datos[i].id_Proveedor == '900458314') {
                let index = this.carteraInversuez.findIndex(item => item.Id_Proveedor == datos[i].id_Proveedor);
                this.carteraInversuez[index].Detalles.push(datos[i]);
                this.cargando = false;
              }
            }
          });
        };
      }
    });
    this.zeusService.GetCostosTotalProveedores('220505').subscribe(data => this.totalCartera = data);
  }

  // Funcion que va a tomar a calcular los dias de retraso de la factura
  calcularDiasRetraso(factura : any, proveedor : any, cuenta : any, data : any = this.carteraAgrupadaProveedores){
    let index = data.findIndex(item => item.Id_Proveedor == proveedor && item.Cuenta == cuenta);
    let info : any [] = data[index].Detalles.filter(item => item.factura == factura);
    let dias : number = 0;
    for (let i = 0; i < info.length; i++) {
      dias = moment().diff(moment(info[i].fecha_Vencimiento), 'days');
    }
    return dias < 0 ? dias - 1 : dias;
  }

  // Funcion que va a sumar el costo total a pagar
  costoPorPagar(data : any){
    let info : any;
    if (data == 1) info = this.carteraAgrupadaProveedores;
    else if (data == 2) info = this.carteraInvergoal;
    else if (data == 3) info = this.carteraInversuez;
    let total : number = info.reduce((acc, item) => acc + item.Cartera, 0);
    this.totalCartera = total;
  }

  aplicarfiltro = ($event, campo : any, valorCampo : string) => this.dt_carteraAgrupada!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);

  // Funcion que va a crear un pdf
  crearPdf(data : any = this.carteraAgrupadaProveedores){
    const titulo : string = `Estado Proveedores`;
    let headerAdicional : any = this.headerAdicionarPDF();
    let content : any = this.contentPDF(data);
    this.creacionPDFService.formatoPDF(titulo, content, headerAdicional);
    setTimeout(() => this.cargando = false, 3000);
  }

  headerAdicionarPDF() : {} {
    return {
      margin: [20, 10, 20, 0],
      table: {
        headerRows: 1,
        widths: [110, 70, 80, 140, 40, 30, 50],
        body: [
          [
            { text: 'Factura', fillColor: '#bbb', fontSize: 10 },
            { text: 'Fecha', fillColor: '#bbb', fontSize: 10 },
            { text: 'Vence', fillColor: '#bbb', fontSize: 10 },
            { text: 'Valor', fillColor: '#bbb', fontSize: 10 },
            { text: 'Mora', fillColor: '#bbb', fontSize: 10 },
            { text: 'Días', fillColor: '#bbb', fontSize: 10 },
            { text: 'Cuenta', fillColor: '#bbb', fontSize: 10 },
          ],
        ]
      },
      layout: { defaultBorder: false, }
    };
  }

  contentPDF(data : any []) {
    let datos : any [] = [];
    data.forEach(item => datos.push(this.informacionProveedoresPDF(item, data)));
    datos.push(this.costoTotalPDF(data));
    return datos;
  }

  informacionProveedoresPDF(data : any, datosTotales : any){
    let bodyTable : any = [
      [{text: `Proveedor:    ${data.Id_Proveedor}    ${data.Proveedor}`, bold: true, border: [true, true, true, true], colSpan: 7, fillColor: '#bbb'}, '','','','','','']
    ];
    data.Detalles.forEach(fac => bodyTable.push(this.facturasProveedorPDf(fac, data.Id_Proveedor, data.Cuenta, datosTotales)));
    bodyTable.push(this.totalProveedorPDF(data));
    return {
      margin: [0, 5, 0, 5],
      table: {
        widths: ['20%', '15%', '15%', '25%', '5%', '10%', '10%'],
        body: bodyTable
      },
      layout: { defaultBorder: false, },
      fontSize: 9,
    }
  }

  facturasProveedorPDf(data : any, proveedor, cuenta, datos){
    return [
      {text: `FA-${data.factura}`, border: [true, true, false, true], bold: false, colSpan: 1},
      {text: `${data.fecha_Factura}`, border: [false, true, false, true], bold: false, colSpan: 1},
      {text: `${data.fecha_Vencimiento}`, border: [false, true, false, true], bold: false, colSpan: 1},
      {text: `${this.formatonumeros(data.saldo_Actual)}`, border: [false, true, false, true], bold: false, colSpan: 1},
      {text: `0`, border: [false, true, false, true], bold: false, colSpan: 1},
      {text: `${this.formatonumeros(this.calcularDiasRetraso(data.factura, proveedor, cuenta, datos))}`, border: [false, true, false, true], bold: false, colSpan: 1},
      {text: `${data.cuenta}`, border: [false, true, true, true], bold: false, colSpan: 1}
    ]
  }

  totalProveedorPDF(data : any){
    return [
      { text: `Total Proveedor:`, border: [false, false, false, false], bold: true, colSpan: 1},
      '',
      '',
      { text: `${this.formatonumeros(data.Cartera)}`, border: [false, false, false, false], bold: true, colSpan: 1},
      { text: `0`, border: [false, false, false, false], bold: true, colSpan: 1},
      '',
      '',
    ];
  }

  costoTotalPDF(data : any){
    let total = data.reduce((a,b) => a + b.Cartera, 0);
    return {
      margin: [0, 10],
      table: {
        widths: ['50%', '23%', '27%'],
        body: [
          [
            { text: `Total General:`, border: [true, true, false, true], bold: true, colSpan: 1},
            { text: `${this.formatonumeros(total)}`, border: [false, true, false, true], bold: true, colSpan: 1},
            { text: `0`, border: [false, true, true, true], bold: true, colSpan: 1},
          ],
        ]
      },
      layout: { defaultBorder: false, },
      fontSize: 9,
    }
  }
}