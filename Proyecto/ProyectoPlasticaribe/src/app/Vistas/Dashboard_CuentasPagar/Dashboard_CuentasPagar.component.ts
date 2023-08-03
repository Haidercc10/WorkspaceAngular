import { Component, OnInit, ViewChild } from '@angular/core';
import { ShepherdService } from 'angular-shepherd';
import moment from 'moment';
import pdfMake from 'pdfmake/build/pdfmake';
import { Table } from 'primeng/table';
import { InventarioZeusService } from 'src/app/Servicios/InventarioZeus/inventario-zeus.service';
import { Facturas_Invergoal_InversuezService } from 'src/app/Servicios/Facturas_Invergoal_Inversuez/Facturas_Invergoal_Inversuez.service';
import { ZeusContabilidadService } from 'src/app/Servicios/Zeus_Contabilidad/zeusContabilidad.service';
import { AppComponent } from 'src/app/app.component';
import { defaultStepOptions, stepsDashboardCuentasPagar as defaultSteps } from 'src/app/data';
import { logoParaPdf } from 'src/app/logoPlasticaribe_Base64';
import DataLabelsPlugin from 'chartjs-plugin-datalabels';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { PaginaPrincipalComponent } from '../PaginaPrincipal/PaginaPrincipal.component';

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

  /** Grafica */
  comprasData: any; //Variable que almacenará la informacion a graficar de la deuda de cada mes
  comprasOptions: any; //Variable que almacenará los estilos que tendrá la grafica de la deuda de cada mes
  comprasPlugins = [ DataLabelsPlugin ];

  comprasDataGoal: any; //Variable que almacenará la informacion a graficar de la deuda de cada mes
  comprasOptionsGoal: any; //Variable que almacenará los estilos que tendrá la grafica de la deuda de cada mes
  comprasPluginsGoal = [ DataLabelsPlugin ];

  comprasDataSuez: any; //Variable que almacenará la informacion a graficar de la deuda de cada mes
  comprasOptionsSuez: any; //Variable que almacenará los estilos que tendrá la grafica de la deuda de cada mes
  comprasPluginsSuez = [ DataLabelsPlugin ];

  /** Valores de deudas por mes */
  totalDeuda1 : number = 0; //Variable que almacenará la deuda en el mes de enero
  totalDeuda2 : number = 0; //Variable que almacenará la deuda en el mes de febrero
  totalDeuda3 : number = 0; //Varibal que almacenará la deuda en el mes de marzo
  totalDeuda4 : number = 0; //Variable que almcenará la deuda en el mes de abril
  totalDeuda5 : number = 0; //Variable que almcenará la deuda en el mes de mayo
  totalDeuda6 : number = 0; //Variable que almcenará la deuda en el mes de junio
  totalDeuda7 : number = 0; //Variable que almcenará la deuda en el mes de julio
  totalDeuda8 : number = 0; //Variable que almcenará la deuda en el mes de agosto
  totalDeuda9 : number = 0; //Variable que almcenará la deuda en el mes de septiembre
  totalDeuda10 : number = 0; //Variable que almcenará la deuda en el mes de octubre
  totalDeuda11 : number = 0; //Variable que almcenará la deuda en el mes de noviembre
  totalDeuda12 : number = 0; //Variable que almcenará la deuda en el mes de diciembre
  totalDeudaGoal1 : number = 0; //Variable que almacenará la deuda en el mes de enero
  totalDeudaGoal2 : number = 0; //Variable que almacenará la deuda en el mes de febrero
  totalDeudaGoal3 : number = 0; //Varibal que almacenará la deuda en el mes de marzo
  totalDeudaGoal4 : number = 0; //Variable que almcenará la deuda en el mes de abril
  totalDeudaGoal5 : number = 0; //Variable que almcenará la deuda en el mes de mayo
  totalDeudaGoal6 : number = 0; //Variable que almcenará la deuda en el mes de junio
  totalDeudaGoal7 : number = 0; //Variable que almcenará la deuda en el mes de julio
  totalDeudaGoal8 : number = 0; //Variable que almcenará la deuda en el mes de agosto
  totalDeudaGoal9 : number = 0; //Variable que almcenará la deuda en el mes de septiembre
  totalDeudaGoal10 : number = 0; //Variable que almcenará la deuda en el mes de octubre
  totalDeudaGoal11 : number = 0; //Variable que almcenará la deuda en el mes de noviembre
  totalDeudaGoal12 : number = 0; //Variable que almcenará la deuda en el mes de diciembre
  totalDeudaSuez1 : number = 0; //Variable que almacenará la deuda en el mes de enero
  totalDeudaSuez2 : number = 0; //Variable que almacenará la deuda en el mes de febrero
  totalDeudaSuez3 : number = 0; //Varibal que almacenará la deuda en el mes de marzo
  totalDeudaSuez4 : number = 0; //Variable que almcenará la deuda en el mes de abril
  totalDeudaSuez5 : number = 0; //Variable que almcenará la deuda en el mes de mayo
  totalDeudaSuez6 : number = 0; //Variable que almcenará la deuda en el mes de junio
  totalDeudaSuez7 : number = 0; //Variable que almcenará la deuda en el mes de julio
  totalDeudaSuez8 : number = 0; //Variable que almcenará la deuda en el mes de agosto
  totalDeudaSuez9 : number = 0; //Variable que almcenará la deuda en el mes de septiembre
  totalDeudaSuez10 : number = 0; //Variable que almcenará la deuda en el mes de octubre
  totalDeudaSuez11 : number = 0; //Variable que almcenará la deuda en el mes de noviembre
  totalDeudaSuez12 : number = 0; //Variable que almcenará la deuda en el mes de diciembre

  totalCompradoAnio : number = 0; /** Variable que mostrará el valor total comprado en todo el anio. */
  compradoAnio : any[] = [];
  compradoAnioGoal : any[] = [];
  compradoAnioSuez : any[] = [];

  anios : any [] = [2019]; //Variable que almacenará los años desde el 2019 hasta el año actual
  anioSeleccionado : any = moment().year(); /** Año seleccionado en el combobox. */

  deudaMayor : number = 0;
  deudaMayorGoal : number = 0;
  deudaMayorSuez : number = 0;

  multiAxisData: any;
  multiAxisOptions: any;
  multiAxisPlugins = [ DataLabelsPlugin ];

  constructor(private AppComponent : AppComponent,
                private zeusService : ZeusContabilidadService,
                  private shepherdService: ShepherdService,
                    private servicioInventarioZeus : InventarioZeusService,
                      private msj : MensajesAplicacionService,
                        private facturasInverService : Facturas_Invergoal_InversuezService,
                          private paginaPrincial : PaginaPrincipalComponent,) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
  }

  ngOnInit() {
    this.lecturaStorage();
    this.tiempoExcedido();
    this.llenarArrayAnos();
    this.graficarDatos();
    this.comprasMesxMesPlasticaribe();
    this.graficarDatosGoal();
    this.comprasMesxMesInvergoal('900362200');
    this.graficarDatosSuez();
    this.comprasMesxMesInversuez('900458314');
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
          this.costoPorPagar(1);
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

  // Funcion que va a sumar el costo total a pagar
  costoPorPagar(data : any){
    let info : any;
    if (data == 1) info = this.carteraAgrupadaProveedores;
    else if (data == 2) info = this.carteraInvergoal;
    else if (data == 3) info = this.carteraInversuez;
    let total : number = 0;
    for (const item of info) {
      total += item.Cartera;
    }
    this.totalCartera = total;
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

  // Funcion que va a llenar el array de años
  llenarArrayAnos(){
    for (let i = 0; i < this.anios.length; i++) {
      let num_Mayor : number = Math.max(...this.anios);
      if (num_Mayor == moment().year()) break;
      this.anios.push(num_Mayor + 1);
    }
  }

  /** Función para cargar el valor total de las compras por mes de plasticaribe. */
  comprasTotalesPlasticaribe() {
    this.totalCompradoAnio = 0;
    for (let i = 0; i < 12; i++) {
      let mes : string = `${i + 1}`;
      this.servicioInventarioZeus.GetComprasMes(this.anioSeleccionado, mes).subscribe(datos_compras => this.totalCompradoAnio += datos_compras);
    }
  }

  /** Compras mes por mes. */
  comprasMesxMesPlasticaribe(){
    let index : number = this.compradoAnio.findIndex(item => item.anio == this.anioSeleccionado);
    if (index == -1) {
      this.cargando = true;
      for (let i = 0; i < 12; i++) {
        let mes : string = `${i + 1}`;
        this.servicioInventarioZeus.GetComprasMes(this.anioSeleccionado, mes).subscribe(datos_compras => {
          if (i == 0) this.totalDeuda1 = datos_compras;
          if (i == 1) this.totalDeuda2 = datos_compras;
          if (i == 2) this.totalDeuda3 = datos_compras;
          if (i == 3) this.totalDeuda4 = datos_compras;
          if (i == 4) this.totalDeuda5 = datos_compras;
          if (i == 5) this.totalDeuda6 = datos_compras;
          if (i == 6) this.totalDeuda7 = datos_compras;
          if (i == 7) this.totalDeuda8 = datos_compras;
          if (i == 8) this.totalDeuda9 = datos_compras;
          if (i == 9) this.totalDeuda10 = datos_compras;
          if (i == 10) this.totalDeuda11 = datos_compras;
          if (i == 11) this.totalDeuda12 = datos_compras;
          let info : any = { anio: this.anioSeleccionado, costo : datos_compras };
          let index2 : number = this.compradoAnio.findIndex(item => item.anio == this.anioSeleccionado);
          if (index2 != -1) this.compradoAnio[index2].costo += datos_compras;
          else this.compradoAnio.push(info);
        });
      }
      setTimeout(() => this.llenarGraficaCompras(), 2000);
    } else this.msj.mensajeAdvertencia(`¡El año seleccionado ya ha sido graficado!`, ``);
  }

  comprasMesxMesInvergoal(nit : string){
    let index : number = this.compradoAnioGoal.findIndex(item => item.anio == this.anioSeleccionado);
    if (index == -1) {
      this.cargando = true;
      for (let i = 0; i < 12; i++) {
        let mes : string = `${i + 1}`;
        this.servicioInventarioZeus.GetComprasMesInverGoal_InverSuez(this.anioSeleccionado, mes, nit).subscribe(datos_compras => {
          if (i == 0) this.totalDeudaGoal1 = datos_compras;
          if (i == 1) this.totalDeudaGoal2 = datos_compras;
          if (i == 2) this.totalDeudaGoal3 = datos_compras;
          if (i == 3) this.totalDeudaGoal4 = datos_compras;
          if (i == 4) this.totalDeudaGoal5 = datos_compras;
          if (i == 5) this.totalDeudaGoal6 = datos_compras;
          if (i == 6) this.totalDeudaGoal7 = datos_compras;
          if (i == 7) this.totalDeudaGoal8 = datos_compras;
          if (i == 8) this.totalDeudaGoal9 = datos_compras;
          if (i == 9) this.totalDeudaGoal10 = datos_compras;
          if (i == 10) this.totalDeudaGoal11 = datos_compras;
          if (i == 11) this.totalDeudaGoal12 = datos_compras;
          let info : any = { anio: this.anioSeleccionado, costo : datos_compras };
          let index2 : number = this.compradoAnioGoal.findIndex(item => item.anio == this.anioSeleccionado);
          if (index2 != -1) this.compradoAnioGoal[index2].costo += datos_compras;
          else this.compradoAnioGoal.push(info);
        });
      }
      setTimeout(() => this.llenarGraficaComprasGoal(), 2000);
    } else this.msj.mensajeAdvertencia(`¡El año seleccionado ya ha sido graficado!`, ``);
  }

  comprasMesxMesInversuez(nit : string){
    let index : number = this.compradoAnioSuez.findIndex(item => item.anio == this.anioSeleccionado);
    if (index == -1) {
      this.cargando = true;
      for (let i = 0; i < 12; i++) {
        let mes : string = `${i + 1}`;
        this.servicioInventarioZeus.GetComprasMesInverGoal_InverSuez(this.anioSeleccionado, mes, nit).subscribe(datos_compras => {
          if (i == 0) this.totalDeudaSuez1 = datos_compras;
          if (i == 1) this.totalDeudaSuez2 = datos_compras;
          if (i == 2) this.totalDeudaSuez3 = datos_compras;
          if (i == 3) this.totalDeudaSuez4 = datos_compras;
          if (i == 4) this.totalDeudaSuez5 = datos_compras;
          if (i == 5) this.totalDeudaSuez6 = datos_compras;
          if (i == 6) this.totalDeudaSuez7 = datos_compras;
          if (i == 7) this.totalDeudaSuez8 = datos_compras;
          if (i == 8) this.totalDeudaSuez9 = datos_compras;
          if (i == 9) this.totalDeudaSuez10 = datos_compras;
          if (i == 10) this.totalDeudaSuez11 = datos_compras;
          if (i == 11) this.totalDeudaSuez12 = datos_compras;
          let info : any = { anio: this.anioSeleccionado, costo : datos_compras };
          let index2 : number = this.compradoAnioSuez.findIndex(item => item.anio == this.anioSeleccionado);
          if (index2 != -1) this.compradoAnioSuez[index2].costo += datos_compras;
          else this.compradoAnioSuez.push(info);
        });
      }
      setTimeout(() => this.llenarGraficaComprasSuez(), 2000);
    } else this.msj.mensajeAdvertencia(`¡El año seleccionado ya ha sido graficado!`, ``);
  }

  /** Graficar datos */
  graficarDatos(){
    this.compradoAnio = [];
    this.comprasData = {
      labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
      datasets: []
    };

    this.comprasOptions = {
      stacked: false,
      plugins: {
        legend: { labels: { color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'], usePointStyle: true, font: { size: 20 } } },
        tooltip: { titleFont: { size: 50, }, usePointStyle: true, bodyFont: { size: 30 } }
      },
      scales: {
        x: {
          ticks: {
            color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'],
            font: { size: 15 },
            callback: function(value) {
              if (this.getLabelForValue(value).length > 4) return `${this.getLabelForValue(value).substring(0, 4)}...`;
              else return this.getLabelForValue(value);
            }
          },
          grid: { color: '#ebedef' }
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          ticks: {  color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'], font: { size: 13 } },
          grid: { color: '#ebedef' },
          min : 0,
          suggestedMax: this.deudaMayor,
        },
      },
      datalabels: { anchor: 'end', align: 'end' }
    };
  }

  graficarDatosGoal(){
    this.compradoAnioGoal = [];
    this.comprasDataGoal = {
      labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
      datasets: []
    };

    this.comprasOptionsGoal = {
      stacked: false,
      plugins: {
        legend: { labels: { color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'], usePointStyle: true, font: { size: 20 } } },
        tooltip: { titleFont: { size: 50, }, usePointStyle: true, bodyFont: { size: 30 } }
      },
      scales: {
        x: {
          ticks: {
            color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'],
            font: { size: 15 },
            callback: function(value) {
              if (this.getLabelForValue(value).length > 4) return `${this.getLabelForValue(value).substring(0, 4)}...`;
              else return this.getLabelForValue(value);
            }
          },
          grid: { color: '#ebedef' }
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          ticks: {  color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'], font: { size: 13 } },
          grid: { color: '#ebedef' },
          min : 0,
        },
      },
      datalabels: { anchor: 'end', align: 'end' }
    };
  }

  graficarDatosSuez(){
    this.compradoAnioSuez = [];
    this.comprasDataSuez = {
      labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
      datasets: []
    };

    this.comprasOptionsSuez = {
      stacked: false,
      plugins: {
        legend: { labels: { color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'], usePointStyle: true, font: { size: 20 } } },
        tooltip: { titleFont: { size: 50, }, usePointStyle: true, bodyFont: { size: 30 } }
      },
      scales: {
        x: {
          ticks: {
            color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'],
            font: { size: 15 },
            callback: function(value) {
              if (this.getLabelForValue(value).length > 4) return `${this.getLabelForValue(value).substring(0, 4)}...`;
              else return this.getLabelForValue(value);
            }
          },
          grid: { color: '#ebedef' }
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          ticks: {  color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'], font: { size: 13 } },
          grid: { color: '#ebedef' },
          min : 0
        },
      },
      datalabels: { anchor: 'end', align: 'end' }
    };
  }

  /** Llenar gráficas */
  llenarGraficaCompras(){
    let color : string = "#"+((1<<24)*Math.random()|0).toString(16);
    let info : any = {
      label: `Año ${this.anioSeleccionado}`,
      data: [this.totalDeuda1, this.totalDeuda2, this.totalDeuda3, this.totalDeuda4, this.totalDeuda5, this.totalDeuda6, this.totalDeuda7, this.totalDeuda8, this.totalDeuda9, this.totalDeuda10, this.totalDeuda11, this.totalDeuda12],
      yAxisID: 'y',
      borderColor: color.substring(0, 4),
      backgroundColor: color.substring(0, 4) + "2",
      pointStyle: 'rectRot',
      pointRadius: 10,
      pointHoverRadius: 15,
      fill : true,
      tension: 0.3,
    };
    this.comprasData.datasets.push(info);
    this.deudaMayor = Math.max(...info.data) + 1;
    this.comprasOptions.scales.y.suggestedMax = this.deudaMayor;
  }

  llenarGraficaComprasGoal(){
    let color : string = "#"+((1<<24)*Math.random()|0).toString(16);
    let info : any = {
      label: `Año ${this.anioSeleccionado}`,
      data: [this.totalDeudaGoal1, this.totalDeudaGoal2, this.totalDeudaGoal3, this.totalDeudaGoal4, this.totalDeudaGoal5, this.totalDeudaGoal6, this.totalDeudaGoal7, this.totalDeudaGoal8, this.totalDeudaGoal9, this.totalDeudaGoal10, this.totalDeudaGoal11, this.totalDeudaGoal12],
      yAxisID: 'y',
      borderColor: color.substring(0, 4),
      backgroundColor: color.substring(0, 4) + "2",
      pointStyle: 'rectRot',
      pointRadius: 10,
      pointHoverRadius: 15,
      fill : true,
      tension: 0.3,
    };
    this.comprasDataGoal.datasets.push(info);
  }

  llenarGraficaComprasSuez(){
    let color : string = "#"+((1<<24)*Math.random()|0).toString(16);
    let info : any = {
      label: `Año ${this.anioSeleccionado}`,
      data: [this.totalDeudaSuez1, this.totalDeudaSuez2, this.totalDeudaSuez3, this.totalDeudaSuez4, this.totalDeudaSuez5, this.totalDeudaSuez6, this.totalDeudaSuez7, this.totalDeudaSuez8, this.totalDeudaSuez9, this.totalDeudaSuez10, this.totalDeudaSuez11, this.totalDeudaSuez12],
      yAxisID: 'y',
      borderColor: color.substring(0, 4),
      backgroundColor: color.substring(0, 4) + "2",
      pointStyle: 'rectRot',
      pointRadius: 10,
      pointHoverRadius: 15,
      fill : true,
      tension: 0.3,
    };
    this.comprasDataSuez.datasets.push(info);
    this.cargando = false;
  }

  comprasxAnio() {
    this.comprasMesxMesPlasticaribe();
    this.comprasMesxMesInvergoal('900362200');
    this.comprasMesxMesInversuez('900458314');
  }

  graficar(){
    this.graficarDatos();
    this.graficarDatosGoal();
    this.graficarDatosSuez();
  }

  // funcion que va a consultar las facturas de invergoal e inversuez
  consultarFacturas(){
    this.carteraInvergoal = [];
    this.carteraInversuez = [];
    this.facturasInverService.GetProveedoresFacturas_Pagar().subscribe((data : any) => {
      this.cargando = true;
      let numProveedores : number = 0;
      data.forEach((factura : any) => {
        const info : any = {
          Id_Proveedor : factura.nit_Proveedor,
          Proveedor : factura.prov_Nombre,
          Cartera : factura.valorTotal,
          Cuenta : factura.cuenta,
          Detalles : [],
          Id_Empresa : factura.nit_Empresa,
        }
        if (factura.nit_Empresa == 900362200) this.carteraInvergoal.push(info);
        else if (factura.nit_Empresa == 900458314) this.carteraInversuez.push(info);
        numProveedores += 1;
        if (numProveedores == data.length) this.facturasProveedores();
      });
    });
  }

  // Funcion que va a llenar cada uno de las facturas de cada proveedor
  facturasProveedores(){
    let registros : number = 0;
    this.facturasInverService.GetFacturas_Pagar().subscribe((datos : any) => {
      datos.forEach((facturas : any) => {
        const infoFacturas : any = {
          factura : facturas.factura,
          fecha_Factura : facturas.fecha_Factura.replace('T00:00:00', ''),
          fecha_Vencimiento : facturas.fecha_Vencimiento.replace('T00:00:00', ''),
          saldo_Actual : facturas.saldo_Actual,
          mora : facturas.mora,
          cuenta : facturas.cuenta,
        }
        if (facturas.empresa == 900362200) this.carteraInvergoal[this.carteraInvergoal.findIndex(x => x.Id_Empresa == facturas.empresa)].Detalles.push(infoFacturas);
        else if (facturas.empresa == 900458314) this.carteraInversuez[this.carteraInversuez.findIndex(x => x.Id_Empresa == facturas.empresa)].Detalles.push(infoFacturas);
        registros += 1;
        if (registros == datos.length) this.cargando = false;
      });
    });
  }
}
