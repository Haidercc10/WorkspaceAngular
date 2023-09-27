import { Component, OnInit } from '@angular/core';
import { ShepherdService } from 'angular-shepherd';
import moment from 'moment';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { PaginaPrincipalComponent } from '../PaginaPrincipal/PaginaPrincipal.component';
import { defaultStepOptions, stepsDashboarsAreas as defaultSteps } from 'src/app/data';

@Component({
  selector: 'app-Dashboard_Areas',
  templateUrl: './Dashboard_Areas.component.html',
  styleUrls: ['./Dashboard_Areas.component.css']
})

export class Dashboard_AreasComponent implements OnInit {

  cargando : boolean = false; //Variable para validar que salga o no la imagen de carga  
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro
  anios : any [] = [2019]; //Variable que almacenará los años desde el 2019 hasta el año actual
  anioSeleccionado : number = moment().year(); //Variable que almacenará la información del año actual en princio y luego podrá cambiar a un año seleccionado
  opcionesGrafica : any; //Variable que va a almacenar la opciones de cada grafica
  graficaExtrusionProducido : any; //Variable que va a almacenar lo producido por el area de extrusion
  graficaImpresionProducido : any; //Variable que va a almacenar lo producido por el area de impresion
  graficaRotograbadoProducido : any; //Variable que va a almacenar lo producido por el area de rotograbado
  graficaDobladoProducido : any; //Variable que va a almacenar lo producido por el area de doblado
  graficaLaminadoProducido : any; //Variable que va a almacenar lo producido por el area de laminado
  graficaCorteProducido : any; //Variable que va a almacenar lo producido por el area de corte
  graficaEmpaqueProducido : any; //Variable que va a almacenar lo producido por el area de empaque
  graficaSelladoProducido : any; //Variable que va a almacenar lo producido por el area de sellado
  graficaWiketiadoProducido : any; //Variable que va a almacenar lo producido por el area de wiketiado
  aniosGraficados : number [] = []; //Variable que va a almacenar los años que se han graficado

  constructor(private shepherdService: ShepherdService,
                private paginaPrincial : PaginaPrincipalComponent,
                  private bagProService : BagproService,
                    private msj : MensajesAplicacionService,) { }

  ngOnInit() {
    this.llenarArrayAnos();
    this.inicializarGraficas();
    this.validarConsulta();
  }

  // Funcion que iniciará el tutorial
  tutorial(){
    this.shepherdService.defaultStepOptions = defaultStepOptions;
    this.shepherdService.modal = true;
    this.shepherdService.confirmCancel = false;
    this.shepherdService.addSteps(defaultSteps);
    this.shepherdService.start();
  }

  // Funcion que va a llenar el array de años
  llenarArrayAnos(){
    for (let i = 0; i < this.anios.length; i++) {
      let num_Mayor : number = Math.max(...this.anios);
      if (num_Mayor == moment().year()) break;
      this.anios.push(num_Mayor + 1);
    }
  }

  // Funcion que va a inicializar las variables con la información de las graficas
  inicializarGraficas(){
    this.aniosGraficados = [];
    this.opcionesGrafica = {
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
          ticks: {  color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'], font: { size: 20 } },
          grid: { color: '#ebedef' },
          min : 0
        },
      },
      datalabels: { anchor: 'end', align: 'end' }
    };
    this.graficaExtrusionProducido = {
      labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
      datasets: []
    };
    this.graficaImpresionProducido = {
      labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
      datasets: []
    };
    this.graficaRotograbadoProducido = {
      labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
      datasets: []
    };
    this.graficaDobladoProducido = {
      labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
      datasets: []
    };
    this.graficaLaminadoProducido = {
      labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
      datasets: []
    };
    this.graficaCorteProducido = {
      labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
      datasets: []
    };
    this.graficaEmpaqueProducido = {
      labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
      datasets: []
    };
    this.graficaSelladoProducido = {
      labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
      datasets: []
    };
    this.graficaWiketiadoProducido = {
      labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
      datasets: []
    };
  }

  //Funcion que va a encargarse de cargar la información de las cards y llama a la funcion de que contará en cunato tiempo se recargará la información
  validarConsulta(){
    if (this.paginaPrincial.inventarioAreas) {
      if (!this.aniosGraficados.includes(this.anioSeleccionado)) this.consultarInformacion();
      else this.msj.mensajeAdvertencia(`¡El año ${this.anioSeleccionado} ya se encuentra graficado, elige un año diferente!`);
    }
  }

  // Funcion que se encargará de realizar las peticiones de la información de lo producido por cada area
  consultarInformacion(){
    this.cargando = true;
    this.bagProService.GetProduccionAreas(this.anioSeleccionado).subscribe(datos => {
      let proceso : string [] = [], count : number = 0;
      datos.forEach(prod => !proceso.includes(prod.area) ? proceso.push(prod.area) : null);
      proceso.forEach(area => {
        let produccion : any = [
          this.totalMesArea(datos, 1, area),
          this.totalMesArea(datos, 2, area),
          this.totalMesArea(datos, 3, area),
          this.totalMesArea(datos, 4, area),
          this.totalMesArea(datos, 5, area),
          this.totalMesArea(datos, 6, area),
          this.totalMesArea(datos, 7, area),
          this.totalMesArea(datos, 8, area),
          this.totalMesArea(datos, 9, area),
          this.totalMesArea(datos, 10, area),
          this.totalMesArea(datos, 11, area),
          this.totalMesArea(datos, 12, area),
        ];
        this.llenarGraficas(produccion, area);
        count++;
        if (count == proceso.length) setTimeout(() => this.cargando = false, 100);
      });
      this.aniosGraficados.push(this.anioSeleccionado);
    }, () => this.cargando = false);
  }

  // Funcion que va a devolver el total
  totalMesArea = (datos : any [], mes : number, area : string) => datos.filter(x => x.area == area && x.anio == this.anioSeleccionado && x.mes == mes).reduce((a, b) => a + b.producido, 0);

  // Funcion que se encargará de llenar las graficas
  llenarGraficas(data : any [], area : string){
    let color : string = "#"+((1<<24)*Math.random()|0).toString(16);
    let info = {
      label: `${area != null ? area.replace('_', '. ') : area} - ${this.anioSeleccionado}`,
      data: data,
      yAxisID: 'y',
      borderColor: color.substring(0, 4),
      backgroundColor: color.substring(0, 4) + "2",
      pointStyle: 'rectRot',
      pointRadius: 10,
      pointHoverRadius: 15,
      fill : true,
      tension: 0.3
    };
    if (['EXTRUSION', 'DESP_EXTRUSION'].includes(area)) this.graficaExtrusionProducido.datasets.push(info);
    else if (['IMPRESION', 'DESP_IMPRESION'].includes(area)) this.graficaImpresionProducido.datasets.push(info);
    else if (['ROTOGRABADO', 'DESP_ROTOGRABADO'].includes(area)) this.graficaRotograbadoProducido.datasets.push(info);
    else if (['DOBLADO', 'DESP_DOBLADO'].includes(area)) this.graficaDobladoProducido.datasets.push(info);
    else if (['LAMINADO', 'DESP_LAMINADO'].includes(area)) this.graficaLaminadoProducido.datasets.push(info);
    else if (['CORTE', 'DESP_CORTADORES'].includes(area)) this.graficaCorteProducido.datasets.push(info);
    else if (['EMPAQUE', 'DESP_EMPAQUE'].includes(area)) this.graficaEmpaqueProducido.datasets.push(info);
    else if (['SELLADO', 'DESP_SELLADO'].includes(area)) this.graficaSelladoProducido.datasets.push(info);
    else if (['Wiketiado'].includes(area)) this.graficaWiketiadoProducido.datasets.push(info);
  }

  // Funcion que va a calcular el total de kg producidos en total en un año
  calcularKgProducidos(produccion : any, anio : number) : number {
    let total : number = 0;
    produccion.datasets.forEach(prod => {
      if (prod.label.includes(anio.toString())) {
        if (!prod.label.startsWith('DESP.')) total += prod.data.reduce((a, b) => Number(a) + Number(b), 0);
        else if (prod.label.startsWith('DESP.')) total -= prod.data.reduce((a, b) => Number(a) + Number(b), 0);
      }
    });
    return total;
  }
}
