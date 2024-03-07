import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ShepherdService } from 'angular-shepherd';
import moment from 'moment';
import { Table } from 'primeng/table';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { UsuarioService } from 'src/app/Servicios/Usuarios/usuario.service';
import { ZeusContabilidadService } from 'src/app/Servicios/Zeus_Contabilidad/zeusContabilidad.service';
import { AppComponent } from 'src/app/app.component';
import { defaultStepOptions, stepsDashboardRecaudos as defaultSteps } from 'src/app/data';
import { PaginaPrincipalComponent } from '../PaginaPrincipal/PaginaPrincipal.component';
import { CreacionPdfService } from 'src/app/Servicios/CreacionPDF/creacion-pdf.service';
import { ReportesConsolidadosComponent } from '../Reportes-Consolidados/Reportes-Consolidados.component';

@Component({
  selector: 'app-DashBoard-Recaudos',
  templateUrl: './DashBoard-Recaudos.component.html',
  styleUrls: ['./DashBoard-Recaudos.component.css']
})

export class DashBoardRecaudosComponent implements OnInit {

  @ViewChild('dt1') dt1: Table | undefined;
  @ViewChild('dt2') dt2: Table | undefined;
  cargando : boolean = false; //Variable para validar que salga o no la imagen de carga  
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  today : any = moment().format('YYYY-MM-DD'); //Variable que va a almacenar la fecha del dia de hoy
  primerDiaMes : any = moment().startOf('month').format('YYYY-MM-DD'); //Variable que va a almacenar el primer dia del mes
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro
  carteraAgrupadaClientes : any [] = []; //Variable que almacenará la información de la cartera agrupada por los clientes
  carteraAgrupadaVendedores : any [] = []; //Variable que almacenará la información de la cartera agrupada por vendedores
  cartera : any [] = []; //Variable que almacenará la información de la cartera, información detalla de cada una de las facturas en cartera
  //totalCartera : number = 0; //Variable que almacenará el valor total de la cartera
  vendedores : any [] = []; //Variable que almacenará la información de los vendedores
  clientes : any [] = []; //Variable que almacenará la información de los clientes
  FormFiltros : FormGroup;

  constructor(private AppComponent : AppComponent,
                private zeusService : ZeusContabilidadService,
                  private shepherdService: ShepherdService,
                    private paginaPrincial : PaginaPrincipalComponent,
                      private reportesConsolidadosComponent : ReportesConsolidadosComponent,
                        private frmBuilder : FormBuilder,
                          private vendedorService : UsuarioService,
                            private msj : MensajesAplicacionService,
                              private creacionPDFService : CreacionPdfService,) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;

    this.FormFiltros = this.frmBuilder.group({
      Cliente : [null],
      Vendedor : [null],
      CarteraOriginal: [false]
    });
  }

  ngOnInit() {
    this.lecturaStorage();
    this.obtenerVendedor();
    this.obtenerClientes();
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

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  aplicarfiltro = ($event, data : any, campo : any) => data!.filter(($event.target as HTMLInputElement).value, campo, 'contains');

  //Funcion que va a encargarse de cargar la información de las cards y llama a la funcion de que contará en cunato tiempo se recargará la información
  tiempoExcedido() {
    if (this.paginaPrincial.recaudos || this.reportesConsolidadosComponent.cartera){
      this.consultarCartera();
    }
  }

  // Funcion que consultará los clientes
  obtenerClientes = () => this.zeusService.GetClientes().subscribe(data => this.clientes = data);

  // Funcion que consultará los vendedores
  obtenerVendedor = () => this.vendedorService.GetVendedores().subscribe(data => this.vendedores = data.map(x => x.usua_Nombre));

  // Función que ejecutará las peticiones de la cartera
  consultarCartera(){
    this.cargando = true;
    let ruta : string = "";
    let cliente : string = this.FormFiltros.value.Cliente;
    let vendedor : string = this.FormFiltros.value.Vendedor;
    let carteraOriginal: boolean = this.FormFiltros.value.CarteraOriginal;

    this.carteraAgrupadaClientes = [];
    this.carteraAgrupadaVendedores = [];
    this.cartera = [];

    if (vendedor != null) ruta += `vendedor=${vendedor}`;
    if (cliente != null) ruta.length > 0 ? ruta += `&cliente=${cliente}` : ruta += `cliente=${cliente}`;
    if (ruta.length > 0) ruta = `?${ruta}`;

    this.zeusService.GetCarteraAgrupadaClientes(ruta).subscribe(data => this.carteraAgrupadaClientes = data);
    this.zeusService.GetCarteraAgrupadaVendedores(ruta).subscribe(data => this.carteraAgrupadaVendedores = data);
    this.zeusService.GetCarteraTotal(ruta).subscribe(data => {
      this.cartera = data.filter(x => x.saldo_Cartera > 0);
      if (carteraOriginal) this.cartera = this.cartera.filter(x => x.cantidad_Dias < 1000);
    });
    setTimeout(() => this.cargando = false, 5000);
  }
  
  totalCartera = () => this.cartera.filter(x => x.saldo_Cartera > 0).reduce((acc, item) => acc + item.saldo_Cartera, 0);

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number : any) => number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g,'$1,');

  generarPDF(){
    this.cargando = true;
    if (this.cartera.length > 0) {
      let informacionPDF = this.seleccionarInformacionPDf();
      let titulo : string = "Cartera Plasticaribe";
      let content : any [] = this.contenidoPDF(informacionPDF);
      this.creacionPDFService.formatoPDF(titulo, content);
      setTimeout(() => this.cargando = false, 3000);
    }
  }

  contenidoPDF(informacionPDF){
    let data : any [] = [];
    let vendedores : any [] = this.obtenerVendedoresCartera(informacionPDF);
    for (let i = 0; i < vendedores.length; i++) {
      data.push([
        {
          margin: [5, -10, 5, 5],
          text: `${vendedores[i].id} - ${vendedores[i].nombre}`,
          bold: true,
          fontSize: 11,
          alignment: 'left'
        },
        this.clientesVendedorPdf(vendedores[i].id, informacionPDF),
      ]);
    }
    data.push(this.totalCarteraPdf(informacionPDF));
    return data;
  }

  clientesVendedorPdf(vendedor : string, informacionPDF){
    let clientes : any [] = informacionPDF.filter(x => x.id_Vendedor == vendedor);
    clientes.sort((a,b) => a.nombre_CLiente.localeCompare(b.nombre_CLiente));
    let clientesIncluidos : any [] = [];
    let data : any [] = [];
    for (let i = 0; i < clientes.length; i++) {
      if (!clientesIncluidos.includes(clientes[i].id_Cliente)) {
        clientesIncluidos.push(clientes[i].id_Cliente);
        data.push({
          margin: [5, 0, 5, 5],
          table: {
            headerRows: 1,
            widths: ['10%', '35%', '12%', '20%', '11%', '12%'],
            body: this.facturasClientes(clientes[i], informacionPDF)
          }
        });
      }
    }
    return data;
  }

  facturasClientes(cliente, informacionPDF){
    let facturas : any [] = informacionPDF.filter(x => x.id_Cliente == cliente.id_Cliente);
    facturas.sort((a,b) => a.id_Fecha.localeCompare(b.id_Fecha));
    let data : any [] = [];
    data.push(this.informacionClientePDF(cliente));
    data.push([
      {
        // margin: [3, 3, 3, 0],
        colSpan: 6,
        border: [true, false, true, true],
        table: {
          fontSize: 7,
          headerRows: 1,
          dontBreakRows: true,
          widths : ['11%', '11%', '11%', '5%', '12%', '12%', '12%', '14%', '12%',],
          body: this.datosFacturasPdf(facturas)
        }
      },
      {},
      {},
      {},
      {},
      {}, 
    ]);
    data.push(this.totalClientePdf(facturas));
    return data;
  }

  informacionClientePDF(cliente) {
    return [
      { border: [true, true, false, true], text: `${cliente.id_Cliente}`, fillColor: '#ccc', bold: true, fontSize: 8, alignment: 'left' },
      { border: [false, true, false, true], text: `${cliente.nombre_CLiente}`, fillColor: '#ccc', bold: true, fontSize: 8, alignment: 'left' },
      { border: [false, true, false, true], text: `${cliente.ciudad_Cliente}`, fillColor: '#ccc', bold: true, fontSize: 8, alignment: 'center' },
      { border: [false, true, false, true], text: `${cliente.direccion_Cliente}`, fillColor: '#ccc', bold: true, fontSize: 8, alignment: 'center' },
      { border: [false, true, false, true], text: `${cliente.telefono_Cliente}`, fillColor: '#ccc', bold: true, fontSize: 8, alignment: 'center' },
      { border: [false, true, true, true], text: `Plazo: ${cliente.plazo_De_Pago} Días`, fillColor: '#ccc', bold: true, fontSize: 8, alignment: 'right' },
    ]
  }

  datosFacturasPdf(facturas){
    let data : any [] = [];
    data.push(this.titulosFacturasPdf());
    for (let i = 0; i < facturas.length; i++) {
      data.push([
        { border: [false, false, false, false], fontSize: 7, alignment: 'center', text: `${facturas[i].num_Factura}` },
        { border: [false, false, false, false], fontSize: 7, alignment: 'center', text: `${facturas[i].id_Fecha}` },
        { border: [false, false, false, false], fontSize: 7, alignment: 'center', text: `${facturas[i].fecha_Vencimiento}` },
        { border: [false, false, false, false], fontSize: 7, alignment: 'center', text: `${facturas[i].cantidad_Dias}` },
        { border: [false, false, false, false], fontSize: 7, alignment: 'right', text: `${this.formatonumeros((facturas[i].saldoPlazo1)) == -1 ? '' : this.formatonumeros((facturas[i].saldoPlazo1).toFixed(2)) }` },
        { border: [false, false, false, false], fontSize: 7, alignment: 'right', text: `${this.formatonumeros((facturas[i].saldoPlazo2)) == -1 ? '' : this.formatonumeros((facturas[i].saldoPlazo2).toFixed(2)) }` },
        { border: [false, false, false, false], fontSize: 7, alignment: 'right', text: `${this.formatonumeros((facturas[i].saldoPlazo3)) == -1 ? '' : this.formatonumeros((facturas[i].saldoPlazo3).toFixed(2)) }` },
        { border: [false, false, false, false], fontSize: 7, alignment: 'right', text: `${this.formatonumeros((facturas[i].saldoPlazo4)) == -1 ? '' : this.formatonumeros((facturas[i].saldoPlazo4).toFixed(2)) }` },
        { border: [false, false, false, false], fontSize: 7, alignment: 'right', text: `${this.formatonumeros((facturas[i].saldoPlazo5)) == -1 ? '' : this.formatonumeros((facturas[i].saldoPlazo5).toFixed(2)) }` },
      ]);
    }

    data.push([
      { border: [false, false, false, false], fontSize: 7, alignment: 'center', text: `` },
      { border: [false, false, false, false], fontSize: 7, alignment: 'center', text: `` },
      { border: [false, false, false, false], fontSize: 7, alignment: 'center', text: `` },
      { border: [false, false, false, false], fontSize: 7, alignment: 'center', text: `` },
      { border: [false, false, false, facturas.reduce((a,b) => a += b.saldoPlazo1, 0) > 0], bold: true, fontSize: 8, alignment: 'right', text: `${facturas.reduce((a,b) => a += b.saldoPlazo1, 0) <= 0 ? '' : this.formatonumeros((facturas.reduce((a,b) => a += b.saldoPlazo1, 0)).toFixed(2)) }` },
      { border: [false, false, false, facturas.reduce((a,b) => a += b.saldoPlazo2, 0) > 0], bold: true, fontSize: 8, alignment: 'right', text: `${facturas.reduce((a,b) => a += b.saldoPlazo2, 0) <= 0 ? '' : this.formatonumeros((facturas.reduce((a,b) => a += b.saldoPlazo2, 0)).toFixed(2)) }` },
      { border: [false, false, false, facturas.reduce((a,b) => a += b.saldoPlazo3, 0) > 0], bold: true, fontSize: 8, alignment: 'right', text: `${facturas.reduce((a,b) => a += b.saldoPlazo3, 0) <= 0 ? '' : this.formatonumeros((facturas.reduce((a,b) => a += b.saldoPlazo3, 0)).toFixed(2)) }` },
      { border: [false, false, false, facturas.reduce((a,b) => a += b.saldoPlazo4, 0) > 0], bold: true, fontSize: 8, alignment: 'right', text: `${facturas.reduce((a,b) => a += b.saldoPlazo4, 0) <= 0 ? '' : this.formatonumeros((facturas.reduce((a,b) => a += b.saldoPlazo4, 0)).toFixed(2)) }` },
      { border: [false, false, false, facturas.reduce((a,b) => a += b.saldoPlazo5, 0) > 0], bold: true, fontSize: 8, alignment: 'right', text: `${facturas.reduce((a,b) => a += b.saldoPlazo5, 0) <= 0 ? '' : this.formatonumeros((facturas.reduce((a,b) => a += b.saldoPlazo5, 0)).toFixed(2)) }` },
    ]);
    return data;
  }

  titulosFacturasPdf(){
    return [
      { border: [false, false, false, false], text: `Factura`, fillColor: '#ccc', bold: true, alignment: 'center', fontSize: 8 },
      { border: [false, false, false, false], text: `Fecha`, fillColor: '#ccc', bold: true, alignment: 'center', fontSize: 8 },
      { border: [false, false, false, false], text: `F. Vence`, fillColor: '#ccc', bold: true, alignment: 'center', fontSize: 8 },
      { border: [false, false, false, false], text: `Días`, fillColor: '#ccc', bold: true, alignment: 'center', fontSize: 8 },
      { border: [false, false, false, false], text: `1-30 Dias`, fillColor: '#ccc', bold: true, alignment: 'center', fontSize: 8 },
      { border: [false, false, false, false], text: `31-60 Dias`, fillColor: '#ccc', bold: true, alignment: 'center', fontSize: 8 },
      { border: [false, false, false, false], text: `61-90 Dias`, fillColor: '#ccc', bold: true, alignment: 'center', fontSize: 8 },
      { border: [false, false, false, false], text: `91-120 Dias`, fillColor: '#ccc', bold: true, alignment: 'center', fontSize: 8 },
      { border: [false, false, false, false], text: `+120 Dias`, fillColor: '#ccc', bold: true, alignment: 'center', fontSize: 8 },
    ];
  }

  totalClientePdf(facturas){
    let total = facturas.reduce((a,b) => a + b.saldo_Cartera, 0)
    return [
      {
        margin: [5, 5, 5, 0],
        colSpan: 6,
        alignment: 'right',
        fontSize: 10,
        bold: true,
        border: [false, true, false, false],
        text: `Total Cliente: $ ${this.formatonumeros((total).toFixed(2))}`,
      },
      {},
      {},
      {},
      {},

    ]
  }

  totalCarteraPdf(informacionPDF){
    let totalCartera = informacionPDF.reduce((a,b) => a + b.saldo_Cartera, 0);
    return [
      {
        margin: [20, 5],
        table: {
          widths : [518],
          body: [
            [
              {
                margin: 10,
                border: [true, true, true, true],
                alignment: 'right',
                fontSize: 11,
                bold: true,
                text: `Total Cartera: $ ${this.formatonumeros((totalCartera).toFixed(2))}`
              }
            ]
          ],
        }
      },
    ]
  }

  obtenerVendedoresCartera(informacionPDF){
    let vendedores : any [] = [];
    informacionPDF.forEach(factura => {
      if (!vendedores.map(x => x.nombre).includes(factura.nombre_Vendedor)) {
        vendedores.push({
          id : factura.id_Vendedor,
          nombre : factura.nombre_Vendedor
        });
      }
    });
    vendedores.sort((a,b) => a.id - b.id);
    return vendedores;
  }

  seleccionarInformacionPDf() : any [] {
    let informacion : any [] = this.cartera;
    let carteraOriginal: boolean = this.FormFiltros.value.CarteraOriginal;
    if (carteraOriginal) informacion = this.cartera.filter(x => x.cantidad_Dias < 1000);
    if (this.FormFiltros.value.Vendedor) informacion = informacion.filter(x => x.nombre_Vendedor == this.FormFiltros.value.Vendedor);
    if (this.FormFiltros.value.Cliente) informacion = informacion.filter(x => x.nombre_CLiente == this.FormFiltros.value.Cliente);
    return informacion;
  }
}