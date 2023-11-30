import { Component, OnInit, ViewChild } from '@angular/core';
import { ShepherdService } from 'angular-shepherd';
import DataLabelsPlugin from 'chartjs-plugin-datalabels';
import moment from 'moment';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { EstadosProcesos_OTService } from 'src/app/Servicios/EstadosProcesosOT/EstadosProcesos_OT.service';
import { InventarioZeusService } from 'src/app/Servicios/InventarioZeus/inventario-zeus.service';
import { AppComponent } from 'src/app/app.component';
import { defaultStepOptions, stepsDashboardOT as defaultSteps } from 'src/app/data';
import { Reporte_Procesos_OTComponent } from '../Reporte_Procesos_OT/Reporte_Procesos_OT.component';
import { PaginaPrincipalComponent } from '../PaginaPrincipal/PaginaPrincipal.component';
import { ProduccionAreasService } from 'src/app/Servicios/ProduciconAreas/ProduccionAreas.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';

@Component({
  selector: 'app-Dashboard-OT',
  templateUrl: './Dashboard-OT.component.html',
  styleUrls: ['./Dashboard-OT.component.css']
})

export class DashboardOTComponent implements OnInit {

  @ViewChild(Reporte_Procesos_OTComponent) modalEstadosProcesos_OT : Reporte_Procesos_OTComponent;

  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  today : any = moment().format('YYYY-MM-DD'); //Variable que va a almacenar la fecha del dia de hoy
  primerDiaMes : any = moment().startOf('month').format('YYYY-MM-DD'); //Variable que va a almacenar el primer dia del mes
  cargando : boolean = false; //Variable que va a validar si se esta cargando algo o no

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
  clientesFacturados : any [] = []; //Variable que almacenará la informacion de los clientes a los que se les ha facturado en el mes
  productosFacturas : any [] = []; //Variable que almacenará la informacion de los productos a los que se les ha facturado en el mes
  vendedoresFacturas : any [] = []; //Variable que almacenará la informacion de los vendedores a los que se les ha facturado en el mes

  graficaMateriales : boolean = false; //Variable que validará si la grafica de barras que se está mostrando es la grafica de materiales
  mostrarGraficaBarras : boolean = false; //Variable que mostrará o no la información en una grafica de barras
  mostrarGraficaPie : boolean = false; //Variable que mostrará o no la información en una grafica de pie
  nombreGrafica : string = 'Grafica'; //Variable que almacenará el nombre de la grafica
  multiAxisData: any;
  multiAxisOptions: any;
  multiAxisPlugins = [ DataLabelsPlugin ];
  graficaPieData : any; //Variable que almacenará la informacion que se mostrará en la grafica de pie
  graficaPieOptions : any; //Variable que almacenará la información de los estilos que tendrá la grafica de pie
  nroCard : string = '';  /** Variable que identificará cual es la card de la cual se desea mostrar la descripción */
  modoSeleccionado : boolean

  constructor(private AppComponent : AppComponent,
                private paginaPrincial : PaginaPrincipalComponent,
                  private bagProService : BagproService,
                    private ordenTrabajoService : EstadosProcesos_OTService,
                      private zeusService : InventarioZeusService,
                        private shepherdService: ShepherdService,
                          private produccionAreasService : ProduccionAreasService,
                            private msj : MensajesAplicacionService,) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
  }

  ngOnInit() {
    this.lecturaStorage();
    this.tiempoExcedido();
    setInterval(() => this.modoSeleccionado = this.AppComponent.temaSeleccionado, 1000);
  }

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

  //Funcion que va a encargarse de cargar la información de las cards y llama a la funcion de que contará en cunato tiempo se recargará la información
  tiempoExcedido() {
    if (this.paginaPrincial.ordenTrabajo) {
      this.llenarEstadosOrdenes();
      let time = setInterval(() => {
        if (this.paginaPrincial.ordenTrabajo) this.llenarEstadosOrdenes();
        else clearInterval(time);
      }, 60000);
    }
  }

  // Funcion que va a llenar la informacion de los estados de ordenes de trabajo
  llenarEstadosOrdenes() {
    this.estadosOrdenes = [];
    this.clientesOrdenesMes = [];
    this.productosOrdenesMes = [];
    this.vendedorOrdenesMes = [];
    this.materialesOrdenesMes = [];
    this.procesosOrdenesMes = [];
    this.totalOrdenesMes = 0;
    this.costoTotalOrdenesMes = 0;

    if (this.ValidarRol == 1) {
      this.estadosOrdenes = [
        { Nombre : 'ABIERTA', Cantidad : 0, Class : 'bg-naranja', },
        { Nombre : 'ASIGNADA', Cantidad : 0, Class : 'bg-azul', },
        { Nombre : 'TERMINADA', Cantidad : 0, Class : 'bg-verde', },
        { Nombre : 'EN PROCESO', Cantidad : 0, Class : 'bg-amarillo', },
        { Nombre : 'ANULADO', Cantidad : 0, Class : 'bg-rojo', },
        { Nombre : 'CERRADO', Cantidad : 0, Class : 'bg-verde2', },
      ];
      this.consultarDatosOrdenesTrabajo();
    }
  }

  consultarDatosOrdenesTrabajo(){
    this.ordenTrabajoService.GetOrdenesMes_Estados().subscribe(datos_ot => {
      datos_ot.forEach(element => {
        this.estadosOrdenes[this.estadosOrdenes.findIndex(x => x.Nombre == element.estado_Nombre)].Cantidad = element.cantidad;
      });
    });
    this.bagProService.GetCostoOrdenesUltimoMes_Clientes(this.primerDiaMes, this.today).subscribe(datos_ordenes => {
      this.clientesOrdenesMes = datos_ordenes;
      this.clientesOrdenesMes.sort((a,b) => Number(b.cantidad) - Number(a.cantidad));
      this.totalOrdenesMes = datos_ordenes.reduce((a, b) => a + b.cantidad, 0);
    });
    this.ordenTrabajoService.GetProductosOrdenesUltimoMes(this.primerDiaMes, this.today).subscribe(datos_ordenes => {
      datos_ordenes.forEach((orden) => this.productosOrdenesMes.push(orden));
      this.productosOrdenesMes.sort((a,b) => a.prod_Nombre.localeCompare(b.prod_Nombre));
      this.productosOrdenesMes.sort((a,b) => Number(b.cantidad) - Number(a.cantidad));
    });
    this.bagProService.GetCostoOrdenesUltimoMes_Vendedores(this.primerDiaMes, this.today).subscribe(datos => this.vendedorOrdenesMes = datos );
    this.vendedorOrdenesMes.sort((a,b) => Number(b.cantidad) - Number(a.cantidad));
    this.bagProService.GetCantOrdenesMateriales(this.primerDiaMes, this.today).subscribe(datos => this.materialesOrdenesMes = datos );
    this.materialesOrdenesMes.sort((a,b) => Number(b.cantidad) - Number(a.cantidad));
    this.consultarPesoProducidoOrdenes();
    this.bagProService.GetCostoOrdenesUltimoMes(this.primerDiaMes, this.today).subscribe(datos => this.costoTotalOrdenesMes = datos.reduce((a, b) => a + b.costo, 0));
    this.zeusService.GetClienteFacturadosMes().subscribe(data => this.clientesFacturados = data);
    this.zeusService.GetProductosFaturadosMes().subscribe(data => this.productosFacturas = data);
    this.zeusService.GetVendedoresFacturasMes().subscribe(data => this.vendedoresFacturas = data);
  }

  consultarPesoProducidoOrdenes(){
    this.produccionAreasService.GetProduccionAreas_Mes(moment().year()).subscribe(produccionAreas => {
      this.procesosOrdenesMes = [];
      produccionAreas.forEach(areas => {
        let metaMesActual : number = this.metaMesActual(areas);
        let produccionMesActual : number = this.produccionMesActual(areas);
        let datos : any = {
          Orden : this.ordenArrayProcesosOrdenesMes((areas.proceso_Nombre).toUpperCase()),
          Id : areas.id,
          Area : (areas.proceso_Nombre).toUpperCase(),
          Anio : areas.anio_Produccion,
          Meta_Produccion : metaMesActual,
          Produccion : produccionMesActual,
          Porcentaje : this.porcentajeProgresoMetaProduccion(areas),
          rangoSlider : this.rangoSliderPorcentajeProcesos(this.porcentajeProgresoMetaProduccion(areas)),
          PorcentajeMeta : (produccionMesActual / metaMesActual) * 100,
          PorcentajeMensual : this.porcentajeProgresoMetaProduccion(areas),
        }
        this.procesosOrdenesMes.push(datos);
        this.procesosOrdenesMes.sort((a,b) => a.Orden - b.Orden);
      });
    });
  }

  metaMesActual(data : any) {
    let mesActual : number = moment().month() + 1;
    let metaMesActual : number = 0;
    if (mesActual == 1) metaMesActual = data.meta_Enero;
    else if (mesActual == 2) metaMesActual = data.meta_Febrero;
    else if (mesActual == 3) metaMesActual = data.meta_Marzo;
    else if (mesActual == 4) metaMesActual = data.meta_Abril;
    else if (mesActual == 5) metaMesActual = data.meta_Mayo;
    else if (mesActual == 6) metaMesActual = data.meta_Junio;
    else if (mesActual == 7) metaMesActual = data.meta_Julio;
    else if (mesActual == 8) metaMesActual = data.meta_Agosto;
    else if (mesActual == 9) metaMesActual = data.meta_Septiembre;
    else if (mesActual == 10) metaMesActual = data.meta_Octubre;
    else if (mesActual == 11) metaMesActual = data.meta_Noviembre;
    else if (mesActual == 12) metaMesActual = data.meta_Diciembre;
    return metaMesActual;
  }

  produccionMesActual(data : any){
    let mesActual : number = moment().month() + 1;
    let produccionMesActual : number = 0;
    if (mesActual == 1) produccionMesActual = data.producido_Enero;
    else if (mesActual == 2) produccionMesActual = data.producido_Febrero;
    else if (mesActual == 3) produccionMesActual = data.producido_Marzo;
    else if (mesActual == 4) produccionMesActual = data.producido_Abril;
    else if (mesActual == 5) produccionMesActual = data.producido_Mayo;
    else if (mesActual == 6) produccionMesActual = data.producido_Junio;
    else if (mesActual == 7) produccionMesActual = data.producido_Julio;
    else if (mesActual == 8) produccionMesActual = data.producido_Agosto;
    else if (mesActual == 9) produccionMesActual = data.producido_Septiembre;
    else if (mesActual == 10) produccionMesActual = data.producido_Octubre;
    else if (mesActual == 11) produccionMesActual = data.producido_Noviembre;
    else if (mesActual == 12) produccionMesActual = data.producido_Diciembre;
    return produccionMesActual;
  }

  ordenArrayProcesosOrdenesMes(area : string){
    let orden : number = 0;
    switch (area) {
      case 'EXTRUSION':
        orden = 1;
        break;
      case 'IMPRESION':
        orden = 2;
        break;
      case 'CORTE':
        orden = 3;
        break;
      case 'SELLADO':
        orden = 4;
        break;
      case 'ROTOGRABADO':
        orden = 5;
        break;
      case 'LAMINADO':
        orden = 6;
        break;
      case 'WIKETIADO':
        orden = 7;
        break;
      case 'DOBLADO':
        orden = 8;
        break;  
      default:
        break;
    }
    return orden;
  }

  porcentajeProgresoMetaProduccion(data : any) : number {
    let diasCorridos : number = parseInt(moment().format('DD')) - 1;
    let diasMes : number = moment().daysInMonth();
    let horaCorrida : number = moment().hour();
    let totalDiasCorridos : number = diasCorridos + (horaCorrida / 24);
    let metaMesActual : number = this.metaMesActual(data);
    let produccionMesActual : number = this.produccionMesActual(data);
    let promedioDias : number = produccionMesActual / totalDiasCorridos;
    let promedioMes : number = promedioDias * diasMes;
    let porcentaje : number = ((promedioMes / metaMesActual) - 1) * 100;
    return porcentaje;
  }

  rangoSliderPorcentajeProcesos(porcentaje : number){
    let rango : number [];
    let porcentajeFinal : number = porcentaje < 0 ? -1 * porcentaje : 50 + porcentaje;
    rango = [50, porcentajeFinal];
    return rango;
  }

  colorProgresoMetaProduccion(data : any) : string {
    let color : string;
    let porcentaje : number = data.PorcentajeMeta;
    if (porcentaje >= 0 && porcentaje < 21) color = 'Red';
    else if (porcentaje >= 21 && porcentaje < 41) color = 'Orange';
    else if (porcentaje >= 41 && porcentaje < 81) color = 'Yellow';
    else if (porcentaje >= 81 && porcentaje < 100) color = 'YellowGreen';
    else if (porcentaje >= 100) color = 'LimeGreen';
    return color;
  }

  // Funcion que va a llenar la grafica con la información de los vendedores
  llenarGraficaVendedores(){
    this.graficaMateriales = false;
    this.mostrarGraficaBarras = true;
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
        { label: 'Cantidad de Ordenes de Trabajo hechas ', backgroundColor: [ '#83D3FF', ], color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'], yAxisID: 'y', data: cantOt },
        { label: 'Valor Total de Ordenes de Trabajo ', backgroundColor: '#8AFC9B', color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'], yAxisID:  'y1', data: costoVentas }
      ]
    };
    this.estilosGraficasTresDimensiones();
  }

  estilosGraficasTresDimensiones(){
    this.multiAxisOptions = {
      stacked: false,
      plugins: {
        legend: { labels: { color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'], font: { size: 20 } } },
        tooltip: { titleFont: { size: 30, }, bodyFont: { size: 20 } }
      },
      scales: {
        x: {
          ticks: {
            color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'],
            font: { size: 15 },
            callback: function(value) {
              if (this.getLabelForValue(value).length > 6) return `${this.getLabelForValue(value).substring(0, 6)}...`;
              else return this.getLabelForValue(value);
            }
          },
          grid: { color: '#ebedef' }
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          ticks: { min: 0, max: 100, color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'], font: { size: 20 } },
          grid: { color: '#ebedef' }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          grid: { drawOnChartArea: false, color: '#ebedef' },
          ticks: { min: 0, max: 100, color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'], font: { size: 20 } }
        }
      },
      datalabels: { anchor: 'end', align: 'end' }
    };
  }

  estilosGraficasDosDimensiones(){
    this.multiAxisOptions = {
      stacked: false,
      plugins: {
        legend: { labels: { color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'], usePointStyle: true, font: { size: 20 } } },
        tooltip: { titleFont: { size: 50, }, usePointStyle: true, bodyFont: { size: 30 } }
      },
      scales: {
        x: {
          ticks: {
            color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'],
            font: { size: 20 },
          },
          grid: { color: '#ebedef' }
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          ticks: { color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'], font: { size: 20 } },
          grid: { color: '#ebedef' }
        },
      },
      datalabels: { anchor: 'end', align: 'end' }
    };
  }

  // Funcion que va a llenar la grafica con informacion de los clientes
  llenarGraficaClientes(){
    this.graficaMateriales = false;
    this.mostrarGraficaBarras = true;
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
        { label: 'Cantidad de Ordenes de Trabajo hechas ', backgroundColor: [ '#FF7878'], color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'], yAxisID: 'y', data: cantOt },
        { label: 'Valor Total de Ordenes de Trabajo ',  backgroundColor: [ '#F5B041', ], color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'], yAxisID: 'y1', data: costo }
      ]
    };
    this.estilosGraficasTresDimensiones();
  }

  // Funcion que va a llenar la grafica de pie con informacion de los estados de las ordenes de trabajo
  llenarGraficaEstadosOt(){
    this.mostrarGraficaPie = true;
    this.nombreGrafica = `Grafica de Estados de Ordenes de Trabajo`;
    let labels : string [] = [];
    let cantidades : number [] = [];
    for (const item of this.estadosOrdenes) {
      labels.push(item.Nombre);
      cantidades.push(item.Cantidad);
    }
    this.graficaPieData = {
      labels: labels,
      datasets: [
        {
          data: cantidades,
          backgroundColor: ['#FFCC00', '#00CCFF', '#33FF66', '#FFFF00', '#FF0033', '#009900'],
          hoverBackgroundColor: ['#FFCC66', '#CCFFFF', '#33FF99', '#FFFF99', '#FF6666', '#00CC66']
        }
      ]
    };

    this.graficaPieOptions = {
      plugins: {
        legend: {  labels: { color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'], font: { size: 18 } } },
        tooltip: { titleFont: { size: 25, }, bodyFont: { size: 20 }, },
      },
    };
  }

  // Funcion que va a llenar la grafica de barras con la informacion de las ordenes creadas para cada material, los tipos de graficas serán 3, cantidad, costo y peso
  llenarGraficaMateriales(TipoGrafica : number){
    this.graficaMateriales = true;
    this.mostrarGraficaBarras = true;
    this.nombreGrafica = `Grafica de Materiales`;
    let labels : string [] = [];
    let cantidad : number [] = [];
    let costo : number [] = [];
    let peso : number [] = [];
    let data : number [] = [];
    let nombreTipo : string = '';
    for (let i = 0; i < this.materialesOrdenesMes.length; i++) {
      labels.push(this.materialesOrdenesMes[i].extMaterialNom)
      cantidad.push(this.materialesOrdenesMes[i].cantidad);
      costo.push(this.materialesOrdenesMes[i].costo);
      peso.push(this.materialesOrdenesMes[i].peso);
    }
    if (TipoGrafica == 1) {
      data = cantidad;
      nombreTipo = 'Cantidad';
    } else if (TipoGrafica == 2) {
      data = costo;
      nombreTipo = 'Costo';
    } else if (TipoGrafica == 3) {
      data = peso;
      nombreTipo = 'Peso Kg';
    }
    this.multiAxisData = {
      labels: labels,
      datasets: [{
        label: nombreTipo,
        data: data,
        backgroundColor: ['#FFCC00', '#00CCFF', '#33FF66', '#FFFF00', '#FF0033'],
        borderColor: ['rgb(255, 159, 64)', 'rgb(75, 192, 192)', 'rgb(54, 162, 235)', 'rgb(153, 102, 255)'],
        borderWidth: 1
      }]
    };
    this.estilosGraficasDosDimensiones();
  }

  // Funcion que va a graficar la informacion de lo producido por los diferentes procesos
  llenarGraficaProcesos(){
    this.graficaMateriales = false;
    this.mostrarGraficaBarras = true;
    this.nombreGrafica = `Grafica de Procesos`;
    let labels : string [] = [];
    let cantidad : number [] = [];
    for (let i = 0; i < this.procesosOrdenesMes.length; i++) {
      labels.push(this.procesosOrdenesMes[i].Nombre)
      cantidad.push(this.procesosOrdenesMes[i].cantidad);
    }
    this.multiAxisData = {
      labels: labels,
      datasets: [{
        label: 'Cantidad',
        data: cantidad,
        backgroundColor: ['#FFCC00', '#00CCFF', '#33FF66', '#FFFF00', '#FF0033', '#009900', '#CCFF66'],
        borderColor: ['rgb(255, 159, 64)'],
        borderWidth: 1
      }]
    };
    this.estilosGraficasDosDimensiones();
  }

  llenarGraficaFactClientes() {
    this.mostrarGraficaBarras = true;
    this.nombreGrafica = `Grafica de facturación por clientes`;
    let clientes : any = [], costo : any = [], cantVeces : any = [];
    for (let i = 0; i < 10; i++) {
      clientes.push(this.clientesFacturados[i].cliente);
      costo.push(this.clientesFacturados[i].costo);
      cantVeces.push(this.clientesFacturados[i].cantidad);
    }
    this.multiAxisData = {
      labels: clientes,
      datasets: [
        { label: 'Cantidad de compras', backgroundColor: [ '#04B2D9'], color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'],  yAxisID: 'y', data: cantVeces },
        { label: 'Valor facturado',  backgroundColor: [ '#B7D996' ], color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'], yAxisID: 'y1', data: costo }
      ]
    };
    this.estilosGraficasTresDimensiones();
  }

  llenarGraficaFactVendedores() {
    this.mostrarGraficaBarras = true;
    this.nombreGrafica = `Grafica de facturación por vendedores`;
    let vendedores : any = [];
    let costo : any = [];
    let cantVentas : any = [];

    for (let i = 0; i < 5; i++) {
      vendedores.push(this.vendedoresFacturas[i].vendedor);
      costo.push(this.vendedoresFacturas[i].costo);
      cantVentas.push(this.vendedoresFacturas[i].cantidad);
    }
    this.multiAxisData = {
      labels: vendedores,
      datasets: [
        { label: 'Cantidad de ventas', backgroundColor: [ '#F2889B'], color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'],  yAxisID: 'y', data: cantVentas },
        { label: 'Valor facturado',  backgroundColor: [ '#A6874E' ], color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'], yAxisID: 'y1', data: costo }
      ]
    };
    this.estilosGraficasTresDimensiones();
  }

  mostrarModalEstados(estado : string){
    this.modalEstadosOrdenes = true;
    this.modalEstadosProcesos_OT.modeModal = true;
    this.modalEstadosProcesos_OT.formularioOT.reset()
    if (estado == 'ABIERTA') this.mostrarModalEstadosProcesos(15, 'Ordenes de Trabajo Abiertas y No Iniciadas');
    else if (estado == 'ASIGNADA') this.mostrarModalEstadosProcesos(14, 'Ordenes de Trabajo Asignadas y No Iniciadas');
    else if (estado == 'EN PROCESO') this.mostrarModalEstadosProcesos(16, 'Ordenes de Trabajo En Proceso');
    else if (estado == 'TERMINADA') this.mostrarModalEstadosProcesos(17, 'Ordenes de Trabajo Terminadas');
    else if (estado == 'ANULADO') this.mostrarModalEstadosProcesos(13, 'Ordenes de Trabajo Anuladas');
    else if (estado == 'CERRADA') this.mostrarModalEstadosProcesos(18, 'Ordenes de Trabajo Cerradas');
  }

  mostrarModalEstadosProcesos(estado : 13 | 14 | 15 | 16 | 17 | 18, nombre : string){
    this.nombreModalEstados = nombre;
    this.modalEstadosProcesos_OT.formularioOT.patchValue({
      fecha: this.primerDiaMes,
      fechaFinal : this.today,
      estado : estado,
    });
    this.modalEstadosProcesos_OT.consultarInformacionOrdenesTrabajo();
  }

  actualizarMetaProduccion(id : number, $event : any){
    let meta = this.procesosOrdenesMes.find(x => x.Id == id).Meta_Produccion;
    if ($event.key == 'Enter') {
      this.produccionAreasService.PutMetaProduccionMes(id, meta).subscribe(() => {
        this.msj.mensajeConfirmacion(`¡Meta establecida con exíto!`);
        setTimeout(() => this.consultarPesoProducidoOrdenes(), 500);
      });
    }
  }
}
