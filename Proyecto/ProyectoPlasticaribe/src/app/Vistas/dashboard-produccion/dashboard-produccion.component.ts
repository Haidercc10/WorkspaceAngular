import { Component, Injectable, OnInit, ViewChild } from '@angular/core';
import moment from 'moment';
import { AppComponent } from 'src/app/app.component';
import { PaginaPrincipalComponent } from '../PaginaPrincipal/PaginaPrincipal.component';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { ProduccionAreasService } from 'src/app/Servicios/ProduciconAreas/ProduccionAreas.service';
import { ProduccionDiariaService } from 'src/app/Servicios/Produccion_Diaria/produccion-diaria.service';
import DataLabelsPlugin from 'chartjs-plugin-datalabels';
import { ReporteProduccionComponent } from '../Reporte-Produccion/Reporte-Produccion.component';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-dashboard-produccion',
  templateUrl: './dashboard-produccion.component.html',
  styleUrls: ['./dashboard-produccion.component.css']
})
export class DashboardProduccionComponent implements OnInit {
  @ViewChild(ReporteProduccionComponent) cmproduction : ReporteProduccionComponent;
  storage_Id: number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre: any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol: any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol: number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  today: any = moment().format('YYYY-MM-DD'); //Variable que va a almacenar la fecha del dia de hoy
  primerDiaMes: any = moment().startOf('month').format('YYYY-MM-DD'); //Variable que va a almacenar el primer dia del mes
  cargando: boolean = false; //Variable que va a validar si se esta cargando algo o no
  procesosOrdenesMes: any[] = []; //Variable que va a almcencar la cantidad de que se ha hecho en cada proceso de produccion
  productionExt: any[] = [];
  productionImp: any[] = [];
  productionCorte: any[] = [];
  productionSella: any[] = [];
  productionCami: any[] = [];
  productionPerf: any[] = [];
  productionMachines: any[] = [];
  productionReport : boolean = false;

  //* Variables grafica comparativa
  ComparativoData : any;
  ComparativoOptions : any;
  ComparativoDataExtrusion : any;
  ComparativoOptionsExtrusion : any;
  ComparativoDataImpresion : any;
  ComparativoOptionsImpresion : any;
  ComparativoDataEmpaque : any;
  ComparativoOptionsEmpaque : any;
  ComparativoDataSellado : any;
  ComparativoOptionsSellado : any;
  ComparativoDataCamisilla : any;
  ComparativoOptionsCamisilla : any;
  ComparativoDataPerforado : any;
  ComparativoOptionsPerforado : any;
  ComparativoPlugins = [ DataLabelsPlugin ];

  totalProduction : any = []
  totalGoal : any = []

  totalPercentageExt : number = 0;
  totalPercentageImp : number = 0;
  totalPercentageEmp : number = 0;
  totalPercentageSella : number = 0;
  totalPercentagePerf : number = 0;
  totalPercentageCami : number = 0;

  totalPercentageMonth : number = 0;

  modoSeleccionado: boolean;

  constructor(
    private AppComponent: AppComponent,
    private mainPage: PaginaPrincipalComponent,
    private svBagpro: BagproService,
    private svMsj: MensajesAplicacionService,
    private svProdAreas: ProduccionAreasService,
    private svDailyProd : ProduccionDiariaService,
    //private cmpProduction : ReporteProduccionComponent,
  ) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
  }

  ngOnInit() {
    this.tiempoExcedido();
    this.lecturaStorage();
    setInterval(() =>  {
      this.modoSeleccionado = this.AppComponent.temaSeleccionado;
      this.ComparativoOptions.plugins.legend.labels.color = this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'];
      this.ComparativoOptions.scales.x.ticks.color = this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'];
      this.ComparativoOptions.scales.y.ticks.color = this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'];
      //EXTRUSIÓN
      this.ComparativoOptionsExtrusion.plugins.legend.labels.color = this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'];
      this.ComparativoOptionsExtrusion.scales.x.ticks.color = this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'];
      this.ComparativoOptionsExtrusion.scales.y.ticks.color = this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'];
      //IMPRESIÓN
      this.ComparativoOptionsImpresion.plugins.legend.labels.color = this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'];
      this.ComparativoOptionsImpresion.scales.x.ticks.color = this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'];
      this.ComparativoOptionsImpresion.scales.y.ticks.color = this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'];
      //EMPAQUE
      this.ComparativoOptionsEmpaque.plugins.legend.labels.color = this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'];
      this.ComparativoOptionsEmpaque.scales.x.ticks.color = this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'];
      this.ComparativoOptionsEmpaque.scales.y.ticks.color = this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'];
      //SELLADO
      this.ComparativoOptionsSellado.plugins.legend.labels.color = this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'];
      this.ComparativoOptionsSellado.scales.x.ticks.color = this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'];
      this.ComparativoOptionsSellado.scales.y.ticks.color = this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'];
    }, 1000);
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage() {
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  //Funcion que va a encargarse de cargar la información de las cards y llama a la funcion de que contará en cunato tiempo se recargará la información
  tiempoExcedido() {
    if (this.mainPage.production) {
      setTimeout(() => this.loadDataProduction(), 1000);
      setTimeout(() => {
        this.llenarGraficaComparativoExtrusion();
        this.llenarGraficaComparativoImpresion();
        this.llenarGraficaComparativoEmpaque();
        this.llenarGraficaComparativoSellado();
        this.llenarGraficaComparativoCamisilla();
        this.llenarGraficaComparativoPerforado();
      }, 3000);
      
      let time = setInterval(() => {
        if (this.mainPage.production) {
          setTimeout(() => this.loadDataProduction(), 1000);
          setTimeout(() => {
            this.llenarGraficaComparativoExtrusion();
            this.llenarGraficaComparativoImpresion();
            this.llenarGraficaComparativoEmpaque();
            this.llenarGraficaComparativoSellado();
            this.llenarGraficaComparativoCamisilla();
            this.llenarGraficaComparativoPerforado();
          }, 3000);
          
        } else clearInterval(time);
      }, 60000);
    }
  }

  //TODO: Solo información del dashboard
  loadDataProduction() {
    let date1: any = moment().subtract(1, 'd').format('YYYY-MM-DD');
    let date2: any = moment().subtract(1, 'd').format('YYYY-MM-DD');

    this.consultarPesoProducidoOrdenes();
    //this.getDataForMachine(date1, date2);
    this.getDataForMachine2(date1, date2);
  }

  //Función para obtener la información por maquinas.
  getDataForMachine(date1, date2) {
    this.productionMachines = [];
    this.svBagpro.getProductionDay(date1, date2).subscribe(data => {
      this.productionMachines = data.filter(x => x.proceso == 'EXTRUSION');
    });
  }

  //Obtener datos de producción por maquina
  getDataForMachine2(date1 : any, date2 : any){
    this.clearFields();

    this.svDailyProd.getProductionDay(date1, date2).subscribe(data => {
      this.productionMachines = data;
      this.totalPercentageCami = this.totalPercentageForProcess('CAMISILLA');
      this.totalPercentageExt = this.totalPercentageForProcess('EXT');
      this.totalPercentageImp = this.totalPercentageForProcess('IMP');
      this.totalPercentageEmp = this.totalPercentageForProcess('EMP');
      this.totalPercentageSella = this.totalPercentageForProcess('SELLA');
      this.totalPercentagePerf = this.totalPercentageForProcess('PERF');
    });
  }

  clearFields(){
    this.productionMachines= [];
    this.totalPercentageCami = 0;
    this.totalPercentageExt = 0;
    this.totalPercentageImp = 0;
    this.totalPercentageEmp = 0;
    this.totalPercentageSella = 0;
    this.totalPercentagePerf = 0;
  }

  //Función para actualizar la meta del día por maquina.
  updateGoalForMachine(data : any, $event : any, process : string){
    let goal = this.productionMachineProcess(process).find(x => x.machine == data.machine).goal; 

    this.svDailyProd.putGoalForMachine(data.machine, process, '2025-10-31', goal).subscribe(dataa => {
      if ($event.key == 'Enter') this.svMsj.mensajeConfirmacion(`¡Meta establecida con éxito!`);
    }, error => {
      this.svMsj.mensajeError('Error', ``)
    })
  }

  productionMachineProcess = (process: string) => this.productionMachines.filter(x => x.process == process);

  totalPercentageForProcess = (process : string) => Number.isNaN((this.totalKgProcess(process) * 100 / this.totalMetaProcess(process))) ? 0 : Math.round(this.totalKgProcess(process) * 100 / this.totalMetaProcess(process));

  //Total meta producción por proceso
  totalMetaProcess = (process: string) => this.productionMachines.filter(x => x.process == process && x.weight > 0).reduce((a, b) => a += b.goal, 0);

  //Total kg por proceso
  totalKgProcess = (process: string) => this.productionMachines.filter(x => x.process == process).reduce((a, b) => a += b.weight, 0);
  
  //Total kg por proceso
  totalPerc = (process: string) => this.productionMachines.filter(x => x.process == process).reduce((a, b) => this.totalPercentageExt += b.percentage, 0);

  //Total meta proceso
  totalGoalMonth = (process: string) => this.procesosOrdenesMes.filter(x => x.Area == process).reduce((a, b) => a += b.Meta_Produccion, 0);

  //Total kg proceso
  totalKgMonth = (process: string) => this.procesosOrdenesMes.filter(x => x.Area == process).reduce((a, b) => a += b.Produccion, 0);

  totalKgDay = (process: string) => this.productionMachines.filter(x => x.process == process && x.weight > 0).reduce((a, b) => a += b.weightDay, 0);

  totalKgNight = (process: string) => this.productionMachines.filter(x => x.process == process && x.weight > 0).reduce((a, b) => a += b.weightNight, 0);

  //totalTotalNight = (process: string) => this.productionMachines.filter(x => x.process == process && x.weight > 0).reduce((a, b) => a += b.weightNight, 0); 

  //Total kg proceso
  totalPercMonth(process: string) {
    this.totalPercentageMonth = 0;
    this.totalPercentageMonth = this.procesosOrdenesMes.filter(x => x.Area == process).reduce((a, b) => a += b.PorcentajeMeta, 0);
    this.totalPercentageMonth = (Math.round(this.totalPercentageMonth));
    return this.totalPercentageMonth;
  } 


  //* Función para obtener la información por procesos.
  consultarPesoProducidoOrdenes() {
    this.svProdAreas.GetProduccionAreas_Mes(moment().year()).subscribe(produccionAreas => {
      this.procesosOrdenesMes = [];
      produccionAreas.forEach(areas => {
        if (!['Doblado'].includes(areas.proceso_Nombre)) {
          let metaMesActual: number = this.metaMesActual(areas);
          let produccionMesActual: number = this.produccionMesActual(areas);
          let datos: any = {
            'Orden': this.ordenArrayProcesosOrdenesMes((areas.proceso_Nombre).toUpperCase()),
            'Id': areas.id,
            'Area': (areas.proceso_Nombre).toUpperCase(),
            'Anio': areas.anio_Produccion,
            'Meta_Produccion': metaMesActual,
            'Produccion': produccionMesActual,
            'Porcentaje': this.porcentajeProgresoMetaProduccion(areas),
            'rangoSlider': this.rangoSliderPorcentajeProcesos(this.porcentajeProgresoMetaProduccion(areas)),
            'PorcentajeMeta': (produccionMesActual / metaMesActual) * 100,
            'PorcentajeMensual': this.porcentajeProgresoMetaProduccion(areas),
          }
          this.procesosOrdenesMes.push(datos);
          this.procesosOrdenesMes.sort((a, b) => a.Orden - b.Orden);
        }
      });
      //this.totalPercMonth();
    });
  }

  metaMesActual(data: any) {
    let mesActual: number = moment().month() + 1;
    let metaMesActual: number = 0;
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

  produccionMesActual(data: any) {
    let mesActual: number = moment().month() + 1;
    let produccionMesActual: number = 0;
    if (mesActual == 1) produccionMesActual = data.producido_Enero;
    else if (mesActual == 2) produccionMesActual = data.producido_Febrero;
    else if (mesActual == 3) produccionMesActual = data.producido_Marzo;
    else if (mesActual == 4) produccionMesActual = data.producido_Abril;
    else if (mesActual == 5) produccionMesActual = data.producido_Mayo;
    else if (mesActual == 6) produccionMesActual = data.producido_Junio;
    else if (mesActual == 7) produccionMesActual = data.producido_Julio;
    else if (mesActual == 8) produccionMesActual = data.producido_Agosto;
    else if (mesActual == 9) produccionMesActual = data.producido_Septiembre;
    else if (mesActual == 10) produccionMesActual = data.producido_OCtubre;
    else if (mesActual == 11) produccionMesActual = data.producido_Noviembre;
    else if (mesActual == 12) produccionMesActual = data.producido_Diciembre;
    return produccionMesActual;
  }

  ordenArrayProcesosOrdenesMes(area: string) {
    let orden: number = 0;
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
      case 'CAMISILLA':
        orden = 5;
        break;
      case 'PERFORADO':
        orden = 6;
        break;
      case 'ROTOGRABADO':
        orden = 7;
        break;
      case 'LAMINADO':
        orden = 8;
        break;
      case 'WIKETIADO':
        orden = 9;
        break;
      case 'DOBLADO':
        orden = 10;
        break;
      default:
        break;
    }
    return orden;
  }

  porcentajeProgresoMetaProduccion(data: any): number {
    let diasCorridos: number = parseInt(moment().format('DD')) - 1;
    let diasMes: number = moment().daysInMonth();
    let horaCorrida: number = moment().hour();
    let totalDiasCorridos: number = diasCorridos + (horaCorrida / 24);
    let metaMesActual: number = this.metaMesActual(data);
    let produccionMesActual: number = this.produccionMesActual(data);
    let promedioDias: number = produccionMesActual / totalDiasCorridos;
    let promedioMes: number = promedioDias * diasMes;
    let porcentaje: number = ((promedioMes / metaMesActual) - 1) * 100;
    return porcentaje;
  }

  rangoSliderPorcentajeProcesos(porcentaje: number) {
    let rango: number[];
    let porcentajeFinal: number = porcentaje < 0 ? -1 * porcentaje : 50 + porcentaje;
    rango = [50, porcentajeFinal];
    return rango;
  }

  colorProgresoMetaProduccion(data: any): string {
    let color: string;
    let porcentaje: number = data.PorcentajeMeta;
    if (porcentaje >= 0 && porcentaje < 21) color = 'Red';
    else if (porcentaje >= 21 && porcentaje < 41) color = 'Orange';
    else if (porcentaje >= 41 && porcentaje < 81) color = 'Yellow';
    else if (porcentaje >= 81 && porcentaje < 100) color = 'YellowGreen';
    else if (porcentaje >= 100) color = 'LimeGreen';
    return color;
  }

  getDetailsProductionForMachine(process? : string, machine? : number, turn? : string){
    let date: any = moment().format('YYYY-MM-DD');
    this.productionReport = true;
    this.cmproduction.formFiltros.patchValue({ 'rangoFechas': [new Date(date), new Date(date)], 'proceso': process.toUpperCase(), 'Maquina' : machine, 'Turno' : turn,});
    this.cmproduction.consultarProduccion();
  }

  //TODO: GRAFICA 1 BARRAS ACOSTADAS

  /** Función para llamar la grafica de extrusión*/
  llenarGraficaComparativoExtrusion() {
    this.ComparativoDataExtrusion = {
      labels: [''],
      datasets: [
        { label: 'Producción', backgroundColor: '#f0d800ff', color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'], data: [this.totalKgMonth('EXTRUSION')] },
        { label: 'Meta', backgroundColor: '#ff9900ff ', color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'], data: [this.totalGoalMonth('EXTRUSION')] }
      ]
    };

    this.ComparativoOptionsExtrusion = {
      indexAxis: 'y',
      plugins: {
        legend: { labels: { color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'], } },
        tooltip: { titleFont: { size: 35, }, usePointStyle: true, bodyFont: { size: 15 } }
      },
      scales: {
        x: { ticks: { color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'] }, grid: { color: '#ebedef' } },
        y: { ticks: { color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'] }, grid: { color: '#ebedef' } }
      }
    };
  }

  /** Función para llamar la grafica de impresión*/
  llenarGraficaComparativoImpresion() {
    this.ComparativoDataImpresion = {
      labels: [''],
      datasets: [
        { label: 'Producción', backgroundColor: '#60f000ff', color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'], data: [this.totalKgMonth('IMPRESION')] },
        { label: 'Meta', backgroundColor: '#009632ff ', color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'], data: [this.totalGoalMonth('IMPRESION')] }
      ]
    };

    this.ComparativoOptionsImpresion = {
      indexAxis: 'y',
      plugins: {
        legend: { labels: { color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'], } },
        tooltip: { titleFont: { size: 35, }, usePointStyle: true, bodyFont: { size: 15 } }
      },
      scales: {
        x: { ticks: { color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'] }, grid: { color: '#ebedef' } },
        y: { ticks: { color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'] }, grid: { color: '#ebedef' } }
      }
    };
  }

  /** Función para llamar la grafica de empaque */
  llenarGraficaComparativoEmpaque() {
    this.ComparativoDataEmpaque = {
      labels: [''],
      datasets: [
        { label: 'Producción', backgroundColor: '#2e8fffff', color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'], data: [this.totalKgMonth('CORTE')] },
        { label: 'Meta', backgroundColor: '#003cffff ', color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'], data: [this.totalGoalMonth('CORTE')] }
      ]
    };

    this.ComparativoOptionsEmpaque = {
      indexAxis: 'y',
      plugins: {
        legend: { labels: { color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'], } },
        tooltip: { titleFont: { size: 35, }, usePointStyle: true, bodyFont: { size: 15 } }
      },
      scales: {
        x: { ticks: { color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'] }, grid: { color: '#ebedef' } },
        y: { ticks: { color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'] }, grid: { color: '#ebedef' } }
      }
    };
  }

  /** Función para llamar la grafica de sellado*/
  llenarGraficaComparativoSellado() {
    this.ComparativoDataSellado = {
      labels: [''],
      datasets: [
        { label: 'Producción', backgroundColor: '#ff5353ff', color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'], data: [this.totalKgMonth('SELLADO')] },
        { label: 'Meta', backgroundColor: '#ff1111ff ', color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'], data: [this.totalGoalMonth('SELLADO')] }
      ]
    };

    this.ComparativoOptionsSellado = {
      indexAxis: 'y',
      plugins: {
        legend: { labels: { color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'], } },
        tooltip: { titleFont: { size: 35, }, usePointStyle: true, bodyFont: { size: 15 } }
      },
      scales: {
        x: { ticks: { color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'] }, grid: { color: '#ebedef' } },
        y: { ticks: { color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'] }, grid: { color: '#ebedef' } }
      }
    };
  }

  /** Función para llamar la grafica de camisilla*/
  llenarGraficaComparativoCamisilla() {
    this.ComparativoDataCamisilla = {
      labels: [''],
      datasets: [
        { label: 'Producción', backgroundColor: '#00d9ffff', color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'], data: [this.totalKgMonth('CAMISILLA')] },
        { label: 'Meta', backgroundColor: '#008c91ff ', color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'], data: [this.totalGoalMonth('CAMISILLA')] }
      ]
    };

    this.ComparativoOptionsCamisilla = {
      indexAxis: 'y',
      plugins: {
        legend: { labels: { color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'], } },
        tooltip: { titleFont: { size: 35, }, usePointStyle: true, bodyFont: { size: 15 } }
      },
      scales: {
        x: { ticks: { color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'] }, grid: { color: '#ebedef' } },
        y: { ticks: { color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'] }, grid: { color: '#ebedef' } }
      }
    };
  }

  /** Función para llamar la grafica de perforado*/
  llenarGraficaComparativoPerforado() {
    this.ComparativoDataPerforado = {
      labels: [''],
      datasets: [
        { label: 'Producción', backgroundColor: '#8255ffff', color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'], data: [this.totalKgMonth('PERFORADO')] },
        { label: 'Meta', backgroundColor: '#2000b1ff ', color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'], data: [this.totalGoalMonth('PERFORADO')] }
      ]
    };

    this.ComparativoOptionsPerforado = {
      indexAxis: 'y',
      plugins: {
        legend: { labels: { color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'], } },
        tooltip: { titleFont: { size: 35, }, usePointStyle: true, bodyFont: { size: 15 } }
      },
      scales: {
        x: { ticks: { color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'] }, grid: { color: '#ebedef' } },
        y: { ticks: { color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'] }, grid: { color: '#ebedef' } }
      }
    };
  }
}
