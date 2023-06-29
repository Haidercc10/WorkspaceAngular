import { Component, OnInit, ViewChild } from '@angular/core';
import { i } from '@fullcalendar/core/internal-common';
import { ShepherdService } from 'angular-shepherd';
import moment from 'moment';
import pdfMake from 'pdfmake/build/pdfmake';
import { Table } from 'primeng/table';
import { ZeusContabilidadService } from 'src/app/Servicios/Zeus_Contabilidad/zeusContabilidad.service';
import { AppComponent } from 'src/app/app.component';
import { defaultStepOptions, stepsDashboardFacturacion as defaultSteps } from 'src/app/data';
import { logoParaPdf } from 'src/app/logoPlasticaribe_Base64';

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
                  private shepherdService: ShepherdService) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
  }

  ngOnInit() {
    this.lecturaStorage();
    this.tiempoExcedido();
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
  tiempoExcedido() {
    this.consultarCartera();
  }

  // Función que ejecutará las peticiones de la cartera
  consultarCartera(){
    this.cargando = true;
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
          this.zeusService.GetFacturasProveedores('220505').subscribe(datos => {
            for (let i = 0; i < datos.length; i++) {
              if (!['900458314','900362200'].includes(datos[i].id_Proveedor)) {
                let index = this.carteraAgrupadaProveedores.findIndex(item => item.Id_Proveedor == datos[i].id_Proveedor);
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
  calcularDiasRetraso(factura : any, proveedor : any, data : any = this.carteraAgrupadaProveedores){
    let index = data.findIndex(item => item.Id_Proveedor == proveedor);
    let info : any [] = data[index].Detalles.filter(item => item.factura == factura);
    let dias : number = 0;
    for (let i = 0; i < info.length; i++) {
      dias = moment().diff(moment(info[i].fecha_Vencimiento), 'days');
    }
    return dias < 0 ? dias - 1 : dias;
  }

  aplicarfiltro = ($event, campo : any, valorCampo : string) => this.dt_carteraAgrupada!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);

  // Funcion que va a crear un pdf
  crearPdf(data : any = this.carteraAgrupadaProveedores){
    let nombre : string = this.storage_Nombre;
    const titulo : string = `Estado Proveedores`;
    let total : number = 0;
    const pdfDefinicion : any = {
      info: { title: titulo },
      pageSize: { width: 630, height: 760 },
      watermark: { text: 'PLASTICARIBE SAS', color: 'red', opacity: 0.05, bold: true, italics: false },
      pageMargins : [25, 140, 25, 15],
      header: function(currentPage : any, pageCount : any) {
        return [
          {
            margin: [20, 8, 20, 0],
            columns: [
              { image : logoParaPdf, width : 150, height : 30, margin: [20, 25] },
              {
                width: 300,
                alignment: 'center',
                table: {
                  body: [
                    [{text: 'NIT. 800188732', bold: true, alignment: 'center', fontSize: 10}],
                    [{text: `Fecha de Análizis: ${moment().format('YYYY-MM-DD')}`, alignment: 'center', fontSize: 8}],
                    [{text: titulo, bold: true, alignment: 'center', fontSize: 10}],
                  ]
                },
                layout: 'noBorders',
                margin: [85, 20],
              },
              {
                width: '*',
                alignment: 'center',
                margin: [20, 20, 20, 0],
                table: {
                  body: [
                    [{text: `Pagina: `, alignment: 'left', fontSize: 8, bold: true}, { text: `${currentPage.toString() + ' de ' + pageCount}`, alignment: 'left', fontSize: 8, margin: [0, 0, 30, 0] }],
                    [{text: `Fecha: `, alignment: 'left', fontSize: 8, bold: true}, {text: moment().format('YYYY-MM-DD'), alignment: 'left', fontSize: 8, margin: [0, 0, 30, 0] }],
                    [{text: `Hora: `, alignment: 'left', fontSize: 8, bold: true}, {text: moment().format('H:mm:ss'), alignment: 'left', fontSize: 8, margin: [0, 0, 30, 0] }],
                    [{text: `Usuario: `, alignment: 'left', fontSize: 8, bold: true}, {text: nombre, alignment: 'left', fontSize: 8, margin: [0, 0, 30, 0] }],
                  ]
                },
                layout: 'noBorders',
              }
            ]
          },
          {
            margin: [20, 0],
            table: {
              headerRows: 1,
              widths: ['*'],
              body: [
                [
                  {
                    border: [false, true, false, false],
                    text: ''
                  },
                ],
              ]
            },
            layout: { defaultBorder: false, }
          },
          {
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
          }
        ];
      },
      content : []
    };
    for (let item of data) {
      total += item.Cartera;
      let proveedor = {
        margin: [0, 5, 0, 5],
        table: {
          widths: [100, 70, 70, 160, 30, 40, 40],
          body: [
            [ { text: `Proveedor:    ${item.Id_Proveedor}    ${item.Proveedor}`, bold: true, border: [false, false, false, false], colSpan: 7},'','','','','','' ],
          ]
        },
        layout: { defaultBorder: false, },
        fontSize: 9,
      }
      for (let itemDetalles of item.Detalles) {
        let info = [
          {text: `FA-${itemDetalles.factura}`, border: [true, true, false, true], bold: false, colSpan: 1},
          {text: `${itemDetalles.fecha_Factura}`, border: [false, true, false, true], bold: false, colSpan: 1},
          {text: `${itemDetalles.fecha_Vencimiento}`, border: [false, true, false, true], bold: false, colSpan: 1},
          {text: `${this.formatonumeros(itemDetalles.saldo_Actual)}`, border: [false, true, false, true], bold: false, colSpan: 1},
          {text: `0`, border: [false, true, false, true], bold: false, colSpan: 1},
          {text: `${this.formatonumeros(this.calcularDiasRetraso(itemDetalles.factura, item.Id_Proveedor, data))}`, border: [false, true, false, true], bold: false, colSpan: 1},
          {text: `${itemDetalles.cuenta}`, border: [false, true, true, true], bold: false, colSpan: 1}
        ];
        proveedor.table.body.push(info);
      }
      proveedor.table.body.push(
        [
          { text: `Total Proveedor:`, border: [false, false, false, false], bold: true, colSpan: 1},
          '',
          '',
          { text: `${this.formatonumeros(item.Cartera)}`, border: [false, false, false, false], bold: true, colSpan: 1},
          { text: `0`, border: [false, false, false, false], bold: true, colSpan: 1},
          '',
          '',
        ],
      );
      pdfDefinicion.content.push(proveedor);
    }
    let totalData = {
      margin: [0, 10],
      table: {
        widths: [100, 70, 70, 160, 30, 40, 40],
        body: [
          [
            { text: `Total General:`, border: [false, false, false, false], bold: true, colSpan: 1},
            '',
            '',
            { text: `${this.formatonumeros(total)}`, border: [false, false, false, false], bold: true, colSpan: 1},
            { text: `0`, border: [false, false, false, false], bold: true, colSpan: 1},
            '',
            '',
          ],
        ]
      },
      layout: { defaultBorder: false, },
      fontSize: 9,
    }
    pdfDefinicion.content.push(totalData);
    pdfMake.createPdf(pdfDefinicion).open();
  }
}
