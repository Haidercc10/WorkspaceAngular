import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import DataLabelsPlugin from 'chartjs-plugin-datalabels';
import moment from 'moment';
import { CookieService } from 'ngx-cookie-service';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { EstadosProcesos_OTService } from 'src/app/Servicios/EstadosProcesosOT/EstadosProcesos_OT.service';
import { InventarioZeusService } from 'src/app/Servicios/InventarioZeus/inventario-zeus.service';
import { Reporte_Procesos_OTComponent } from '../Reporte_Procesos_OT/Reporte_Procesos_OT.component';

@Component({
  selector: 'app-DashBoard_Facturacion',
  templateUrl: './DashBoard_Facturacion.component.html',
  styleUrls: ['./DashBoard_Facturacion.component.css']
})
export class DashBoard_FacturacionComponent implements OnInit {

  @ViewChild(Reporte_Procesos_OTComponent) modalEstadosProcesos_OT : Reporte_Procesos_OTComponent;

  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  today : any = moment().format('YYYY-MM-DD'); //Variable que va a almacenar la fecha del dia de hoy
  primerDiaMes : any = moment().startOf('month').format('YYYY-MM-DD'); //Variable que va a almacenar el primer dia del mes

  anos : any [] = [2019]; //Variable que almacenará los años desde el 2019 hasta el año actual
  anoSeleccionado : number = moment().year(); //Variable que almacenará la información del año actual en princio y luego podrá cambiar a un año seleccionado

  /* GRAFICA DE FACTURACION */
  facturasData: any; //Variable que almacenará la informacion a graficar de lo facturado cada mes
  facturasOptions: any; //Variable que almacenará los estilos que tendrá la grafica de lo facturado cada mes
  facturacionPlugins = [ DataLabelsPlugin ];
  totalFacturadoDia : number = 0; //Variable que almacenará la cantidad total de lo que se ha facturado en el día
  totalFacuturadoMes : number = 0; //Variable que almacenará la cantidad total de lo que se ha facturado en el mes
  totalIvaVentaMes : number = 0; //Variable que almacenará el iva de ventas del mes
  totalIvaCompraMes : number = 0; //Varible que almacenará el iva de compra del mes
  totalFacturado1 : number = 0; //Variable que almacenará lo facturado en el mes de enero
  totalFacturado2 : number = 0; //Variable que almacenará lo facturado en el mes de febrero
  totalFacturado3 : number = 0; //Varibal que almacenará lo facturado en el mes de marzo
  totalFacturado4 : number = 0; //Variable que almcenará lo facturado en el mes de abril
  totalFacturado5 : number = 0; //Variable que almcenará lo facturado en el mes de mayo
  totalFacturado6 : number = 0; //Variable que almcenará lo facturado en el mes de junio
  totalFacturado7 : number = 0; //Variable que almcenará lo facturado en el mes de julio
  totalFacturado8 : number = 0; //Variable que almcenará lo facturado en el mes de agosto
  totalFacturado9 : number = 0; //Variable que almcenará lo facturado en el mes de septiembre
  totalFacturado10 : number = 0; //Variable que almcenará lo facturado en el mes de octubre
  totalFacturado11 : number = 0; //Variable que almcenará lo facturado en el mes de noviembre
  totalFacturado12 : number = 0; //Variable que almcenará lo facturado en el mes de diciembre

  estadosOrdenes : any [] = [];
  totalOrdenesMes : number = 0; //Variable que va a almacenar la cantidad de ordenes que se ahn hecho en el ultimo mes
  costoTotalOrdenesMes : number = 0; //Variable que va a almacenar la costo total de las ordenes de trabajo del último mes
  catidadOTAbiertas : number = 0; //Variable que va a almacenar la cantidad de ordenes de trabajo que estan abiertas y no han inciado y no tienen asignaciones de materia prima
  cantidadOTAsignadas : number = 0; //Variable que va a almacenar la cantidad de ordenes de trabajo que tienen asignaciones de materia prima hechas pero que aun no se ha iniciado su produccion
  cantidadOTIniciada : number = 0; //Variable que va a almacenar la cantidad de ordenes de trabajo a las que ya se les inició su producción
  cantidadOTTerminada : number = 0; //variable que va a almacenar la cantidad de ordenes de trabajo que se terminaron
  cantidadOtAnulada : number = 0; //Variable que va a almcenar la cantidad de ordenes de trabajo que se han anulado
  cantidadOTCerrada : number = 0; //Variable que va a almacenar la cantidad de ordenes de trabajo cerradas
  clientesOrdenesMes : any [] = []; //Variable que va a almacenar los clientes a los que se les ha hecho ordenes y la cantidad de ordenes hechas a cada uno
  productosOrdenesMes : any [] = []; //Variable que va a almacenar los productos a los que se les ha hecho ordenes de trabajo y la cantidad de ordenes hechas de cada uno
  vendedorOrdenesMes : any [] = []; //Variable que almacenará los vendedores que han tenido ordenes de trabajo y la cantidad de cada uno
  procesosOrdenesMes : any [] = []; //Variable que va a almcencar la cantidad de que se ha hecho en cada proceso de produccion
  modalEstadosOrdenes : boolean = false; //Variable que mostrará el modal de los etsados de las ordenes o no
  nombreModalEstados : string = ''; //Variable que tendrá el nombre del estado seleccionado
  materialesOrdenesMes : any [] = []; //Variable que almacenará la informacion de los materiales en ordenes de trabajo

  mostrarGrafica : boolean = false; //Variable que mostrará o no la información graficada
  nombreGrafica : string = 'Grafica'; //Variable que almacenará el nombre de la grafica
  multiAxisData: any;
  multiAxisOptions: any;
  multiAxisPlugins = [ DataLabelsPlugin ];

  constructor(@Inject(SESSION_STORAGE) private storage: WebStorageService,
                private zeusService : InventarioZeusService,
                  private bagProService : BagproService,
                    private ordenTrabajoService : EstadosProcesos_OTService,
                      private cookieService: CookieService,) { }

  ngOnInit() {
    this.tiempoExcedido();
    this.llenarArrayAnos();
    this.llenarEstadosOrdenes();
  }

  //Funcion que se va a encargar de contar cuando pasen 1 minuto, al pasar este tiempo se cargarán nueva mente las consultas de algunas de las cards
  recargar = () => setTimeout(() => { this.tiempoExcedido(); }, 60000);

  //Funcion que va a encargarse de cargar la información de las cards y llama a la funcion de que contará en cunato tiempo se recargará la información
  tiempoExcedido() {
    this.facturacion();
    this.recargar();
  }

  // Funcion que va a llenar el array de años
  llenarArrayAnos(){
    for (let i = 0; i < this.anos.length; i++) {
      let num_Mayor : number = Math.max(...this.anos);
      if (num_Mayor == moment().year()) break;
      this.anos.push(num_Mayor + 1);
    }
  }

  // Funcion que va a consultar la información de la facturación
  facturacion(){
    this.zeusService.GetValorFacturadoHoy().subscribe(datos_facturacion => { this.totalFacturadoDia = datos_facturacion; });
    this.zeusService.GetFacturacionMensual(this.primerDiaMes, this.today).subscribe(datos_facturacion => { this.totalFacuturadoMes = datos_facturacion; });
    this.zeusService.GetIvaVentaMensual(this.primerDiaMes, this.today).subscribe(datos_facturacion => { this.totalIvaVentaMes = datos_facturacion; });
    for (let i = 0; i < 12; i++) {
      this.zeusService.GetFacturacionTodosMeses(i+ 1, this.anoSeleccionado).subscribe(datos_facturacion => {
        if (i == 0) this.totalFacturado1 = datos_facturacion;
        if (i == 1) this.totalFacturado2 = datos_facturacion;
        if (i == 2) this.totalFacturado3 = datos_facturacion;
        if (i == 3) this.totalFacturado4 = datos_facturacion;
        if (i == 4) this.totalFacturado5 = datos_facturacion;
        if (i == 5) this.totalFacturado6 = datos_facturacion;
        if (i == 6) this.totalFacturado7 = datos_facturacion;
        if (i == 7) this.totalFacturado8 = datos_facturacion;
        if (i == 8) this.totalFacturado9 = datos_facturacion;
        if (i == 9) this.totalFacturado10 = datos_facturacion;
        if (i == 10) this.totalFacturado11 = datos_facturacion;
        if (i == 11) this.totalFacturado12 = datos_facturacion;
      });
      setTimeout(() => { this.llenarGraficaFacturacion(); }, 500);
    }
  }

   // Funcion que va a llenar la grafica de las cantidades facturadas en cada mes
  llenarGraficaFacturacion(){
    this.facturasData = {
      labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
      datasets: [
        {
          label: 'Facturación',
          data: [
            this.totalFacturado1,
            this.totalFacturado2,
            this.totalFacturado3,
            this.totalFacturado4,
            this.totalFacturado5,
            this.totalFacturado6,
            this.totalFacturado7,
            this.totalFacturado8,
            this.totalFacturado9,
            this.totalFacturado10,
            this.totalFacturado11,
            this.totalFacturado12,
          ],
          yAxisID: 'y',
          borderColor: '#FFA726',
          backgroundColor: 'rgba(255,167,38,0.2)',
          pointStyle: 'rectRot',
          pointRadius: 10,
          pointHoverRadius: 15,
          fill: true,
          tension: 0.3
        }
      ]
    };

    this.facturasOptions = {
      stacked: false,
        plugins: {
          legend: { labels: { color: '#495057', usePointStyle: true, font: { size: 20 } } },
          tooltip: { titleFont: { size: 50, }, usePointStyle: true, bodyFont: { size: 30 } }
        },
        scales: {
          x: {
            ticks: { color: '#495057', font: { size: 20 }},
            grid: { color: '#ebedef' }
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            ticks: { color: '#495057', font: { size: 20 } },
            grid: { color: '#ebedef' }
          },
        },
        datalabels: { anchor: 'end', align: 'end' }
    };
  }

  // Funcion que va a llenar la informacion de los estados de ordenes de trabajo
  llenarEstadosOrdenes() {
    this.costoTotalOrdenesMes = 0;
    this.catidadOTAbiertas = 0;
    this.cantidadOTAsignadas = 0;
    this.cantidadOTTerminada = 0;
    this.cantidadOTIniciada = 0;
    this.cantidadOtAnulada = 0;
    this.cantidadOTCerrada = 0;

    this.estadosOrdenes = [
      { Nombre : 'Abierta', Cantidad : 0, Class : 'bg-naranja', },
      { Nombre : 'Asignada', Cantidad : 0, Class : 'bg-azul', },
      { Nombre : 'Terminada', Cantidad : 0, Class : 'bg-verde', },
      { Nombre : 'En proceso', Cantidad : 0, Class : 'bg-amarillo', },
      { Nombre : 'Anulado', Cantidad : 0, Class : 'bg-rojo', },
      { Nombre : 'Cerrada', Cantidad : 0, Class : 'bg-verde2', },
    ];

    this.ordenTrabajoService.srvObtenerListaPorFechas(this.primerDiaMes, this.today).subscribe(datos_ot => {
      for (let i = 0; i < datos_ot.length; i++) {
        for (let j = 0; j < this.estadosOrdenes.length; j++) {
          if (datos_ot[i].estado_Nombre == this.estadosOrdenes[j].Nombre) this.estadosOrdenes[j].Cantidad += 1;
        }
      }
    });

    this.bagProService.GetCostoOrdenesUltimoMes_Clientes(this.primerDiaMes, this.today).subscribe(datos_ordenes => {
      this.clientesOrdenesMes = datos_ordenes;
      this.clientesOrdenesMes.sort((a,b) => Number(b.cantidad) - Number(a.cantidad));
      for (let i = 0; i < datos_ordenes.length; i++) {
        this.totalOrdenesMes += datos_ordenes[i].cantidad;
      }
    });

    this.ordenTrabajoService.GetProductosOrdenesUltimoMes(this.primerDiaMes, this.today).subscribe(datos_ordenes => {
      for (let i = 0; i < datos_ordenes.length; i++) {
        this.productosOrdenesMes.push(datos_ordenes[i]);
        this.productosOrdenesMes.sort((a,b) => a.prod_Nombre.localeCompare(b.prod_Nombre));
        this.productosOrdenesMes.sort((a,b) => Number(b.cantidad) - Number(a.cantidad));
      }
    });

    this.bagProService.GetCostoOrdenesUltimoMes_Vendedores(this.primerDiaMes, this.today).subscribe(datos => this.vendedorOrdenesMes = datos );
    this.vendedorOrdenesMes.sort((a,b) => Number(b.cantidad) - Number(a.cantidad));

    this.bagProService.GetCantOrdenesMateriales(this.primerDiaMes, this.today).subscribe(datos => this.materialesOrdenesMes = datos );
    this.materialesOrdenesMes.sort((a,b) => Number(b.cantidad) - Number(a.cantidad));

    this.bagProService.GetPesoProcesosUltimoMes(this.primerDiaMes, this.today).subscribe(datos_ordenes => {
      for (let i = 0; i < datos_ordenes.length; i++) {
        let estados : string [] = ['IMPRESION', 'LAMINADO', 'EXTRUSION', 'CORTE', 'ROTOGRABADO', 'DOBLADO', 'EMPAQUE', 'SELLADO', 'Wiketiado'];
        if (estados.includes(datos_ordenes[i].nomStatus)) {
          let id : number = 0;
          if (datos_ordenes[i].nomStatus == 'EXTRUSION') {
            id = 1;
            datos_ordenes[i].und = 0;
          }
          if (datos_ordenes[i].nomStatus == 'IMPRESION') {
            id = 2;
            datos_ordenes[i].und = 0;
          }
          if (datos_ordenes[i].nomStatus == 'ROTOGRABADO') {
            id = 3;
            datos_ordenes[i].und = 0;
          }
          if (datos_ordenes[i].nomStatus == 'LAMINADO') {
            id = 4;
            datos_ordenes[i].und = 0;
          }
          if (datos_ordenes[i].nomStatus == 'EMPAQUE') {
            id = 5;
            datos_ordenes[i].nomStatus = 'CORTE';
            datos_ordenes[i].und = 0;
          }
          if (datos_ordenes[i].nomStatus == 'DOBLADO') {
            id = 6;
            datos_ordenes[i].und = 0;
          }
          if (datos_ordenes[i].nomStatus == 'SELLADO') id = 7;
          if (datos_ordenes[i].nomStatus == 'Wiketiado') id = 8;
          let info : any  = {
            id : id,
            Nombre : datos_ordenes[i].nomStatus,
            cantidad : datos_ordenes[i].peso,
            und : datos_ordenes[i].und,
          }
          this.procesosOrdenesMes.push(info);
          this.procesosOrdenesMes.sort((a,b) => Number(a.id) - Number(b.id));
        }
      }
    });

    this.bagProService.GetCostoOrdenesUltimoMes(this.primerDiaMes, this.today).subscribe(datos_ordenes => {
      for (let i = 0; i < datos_ordenes.length; i++) {
        this.costoTotalOrdenesMes += datos_ordenes[i].costo;
      }
    });
  }

  // Funcion que mostrará el modal de los estados de las ordenes de trabajo, adicional a eso le enviará parametros para que realice la consulta
  mostrarModalEstados(estado : string){
    this.modalEstadosOrdenes = true;
    this.modalEstadosProcesos_OT.modeModal = true;
    if (estado == 'Abierta') {
      this.nombreModalEstados = 'Ordenes de Trabajo Abiertas y No Iniciadas';
      this.modalEstadosProcesos_OT.formularioOT.setValue({
        idDocumento : null,
        fecha: this.primerDiaMes,
        fechaFinal : this.today,
        estado : 15,
        fallasOT : null,
        ObservacionOT : '',
        Vendedor : '',
        cliente : null,
        Id_Vendedor : null,
        producto : null,
      });
      this.modalEstadosProcesos_OT.consultarOT();
    } else if (estado == 'Asignada') {
      this.nombreModalEstados = 'Ordenes de Trabajo Asignadas y No Iniciadas';
      this.modalEstadosProcesos_OT.formularioOT.setValue({
        idDocumento : null,
        fecha: this.primerDiaMes,
        fechaFinal : this.today,
        estado : 14,
        fallasOT : null,
        ObservacionOT : '',
        Vendedor : '',
        cliente : null,
        Id_Vendedor : null,
        producto : null,
      });
      this.modalEstadosProcesos_OT.consultarOT();
    } else if (estado == 'En proceso') {
      this.nombreModalEstados = 'Ordenes de Trabajo En Proceso';
      this.modalEstadosProcesos_OT.formularioOT.setValue({
        idDocumento : null,
        fecha: this.primerDiaMes,
        fechaFinal : this.today,
        estado : 16,
        fallasOT : null,
        ObservacionOT : '',
        Vendedor : '',
        cliente : null,
        Id_Vendedor : null,
        producto : null,
      });
      this.modalEstadosProcesos_OT.consultarOT();
    } else if (estado == 'Terminada') {
      this.nombreModalEstados = 'Ordenes de Trabajo Terminadas';
      this.modalEstadosProcesos_OT.formularioOT.setValue({
        idDocumento : null,
        fecha: this.primerDiaMes,
        fechaFinal : this.today,
        estado : 17,
        fallasOT : null,
        ObservacionOT : '',
        Vendedor : '',
        cliente : null,
        Id_Vendedor : null,
        producto : null,
      });
      this.modalEstadosProcesos_OT.consultarOT();
    } else if (estado == 'Anulado') {
      this.nombreModalEstados = 'Ordenes de Trabajo Anuladas';
      this.modalEstadosProcesos_OT.formularioOT.setValue({
        idDocumento : null,
        fecha: this.primerDiaMes,
        fechaFinal : this.today,
        estado : 13,
        fallasOT : null,
        ObservacionOT : '',
        Vendedor : '',
        cliente : null,
        Id_Vendedor : null,
        producto : null,
      });
      this.modalEstadosProcesos_OT.consultarOT();
    } else if (estado == 'Cerrada') {
      this.nombreModalEstados = 'Ordenes de Trabajo Cerradas';
      this.modalEstadosProcesos_OT.formularioOT.setValue({
        idDocumento : null,
        fecha: this.primerDiaMes,
        fechaFinal : this.today,
        estado : 18,
        fallasOT : null,
        ObservacionOT : '',
        Vendedor : '',
        cliente : null,
        Id_Vendedor : null,
        producto : null,
      });
      this.modalEstadosProcesos_OT.consultarOT();
    }
  }

  // Funcion que va a llenar la grafica con la información de los vendedores
  llenarGraficaVendedores(){
    this.mostrarGrafica = true;
    this.nombreGrafica = `Grafica de Vendedores`;
    let vendedores : any = [];
    let costoVentas : any = [];
    let cantOt : any = [];
    for (let i = 0; i < 5; i++) {
      vendedores.push(this.vendedorOrdenesMes[i].nombreCompleto);
      costoVentas.push(this.vendedorOrdenesMes[i].costo);
      cantOt.push(this.vendedorOrdenesMes[i].cantidad);
    }
    this.multiAxisData = {
      labels: vendedores,
      datasets: [
        { label: 'Cantidad de Ordenes de Trabajo hechas ', backgroundColor: [ '#42A5F5', ], yAxisID: 'y', data: cantOt },
        { label: 'Valor Total de Ordenes de Trabajo ', backgroundColor: '#4169E1', ayAxisID: 'y1', ata: costoVentas }
      ]
    };
    this.multiAxisOptions = {
      plugins: {
        legend: {  labels: { color: '#495057' } },
        tooltips: { ode: 'index', intersect: true }
      },
      scales: {
        x: {
          ticks: { color: '#495057' },
          grid: { color: '#ebedef' }
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          ticks: { min: 0, max: 100, color: '#495057' },
          grid: { color: '#ebedef' }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          grid: { drawOnChartArea: false, color: '#ebedef' },
          ticks: { min: 0, max: 100, color: '#495057' }
        }
      }
    };
  }

  // Funcion que va a llenar la grafica con informacion de los clientes
  llenarGraficaClientes(){
    this.mostrarGrafica = true;
    this.nombreGrafica = `Grafica de Clientes`;
    let clientes : any = [];
    let costo : any = [];
    let cantOt : any = [];
    for (let i = 0; i < 5; i++) {
      clientes.push(this.clientesOrdenesMes[i].clienteNom);
      costo.push(this.clientesOrdenesMes[i].costo);
      cantOt.push(this.clientesOrdenesMes[i].cantidad);
    }
    this.multiAxisData = {
      labels: clientes,
      datasets: [
        {
          label: 'Cantidad de Ordenes de Trabajo hechas ',
          backgroundColor: [ '#AB47BC', '#42A5F5', '#66BB6A', '#FFCA28', '#26A69A' ],
          yAxisID: 'y',
          data: cantOt
        },
        { label: 'Valor Total de Ordenes de Trabajo ',  backgroundColor: [ '#F5B041', ], yAxisID: 'y1', data: costo }
      ]
    };
    this.multiAxisOptions = {
      plugins: {
        legend: { labels: { color: '#495057' } },
        tooltips: { mode: 'index', intersect: true }
      },
      scales: {
        x: {
          ticks: { color: '#495057' },
          grid: { color: '#ebedef' }
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          ticks: { min: 0, max: 100, olor: '#495057' },
          grid: { color: '#ebedef' }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          grid: { drawOnChartArea: false, color: '#ebedef' },
          ticks: { min: 0, max: 100, color: '#495057' }
        }
      }
    };
  }

  // Funcion que va a ordenar el ranking de clientes
  ordenarClientesCostoOrdenes = () => this.clientesOrdenesMes.sort((a,b) => Number(b.costo) - Number(a.costo));

  // Funcion que va a ordenar el ranking de clientes
  ordenarClientesCantOrdenes = () => this.clientesOrdenesMes.sort((a,b) => Number(b.cantidad) - Number(a.cantidad));

  // Funcion que va a ordenar el ranking de clientes
  ordenarClientesPesoOrdenes = () => this.clientesOrdenesMes.sort((a,b) => Number(b.peso) - Number(a.peso));

  // Funcion que va a ordenar el ranking de vendedores
  ordenarVendedoresCostoOrdenes = () => this.vendedorOrdenesMes.sort((a,b) => Number(b.costo) - Number(a.costo));

  // Funcion que va a ordenar el ranking de clientes
  ordenarVendedoresCantOrdenes = () => this.vendedorOrdenesMes.sort((a,b) => Number(b.cantidad) - Number(a.cantidad));

  // Funcion que va a ordenar el ranking de clientes
  ordenarVendedoresPesoOrdenes = () => this.vendedorOrdenesMes.sort((a,b) => Number(b.peso) - Number(a.peso));
}
