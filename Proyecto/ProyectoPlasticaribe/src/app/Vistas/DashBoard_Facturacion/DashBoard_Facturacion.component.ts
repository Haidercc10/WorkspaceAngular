import { Component, OnInit } from '@angular/core';
import { ShepherdService } from 'angular-shepherd';
import DataLabelsPlugin from 'chartjs-plugin-datalabels';
import moment from 'moment';
import { InventarioZeusService } from 'src/app/Servicios/InventarioZeus/inventario-zeus.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { AppComponent } from 'src/app/app.component';
import { defaultStepOptions, stepsDashboardFacturacion as defaultSteps } from 'src/app/data';
import { PaginaPrincipalComponent } from '../PaginaPrincipal/PaginaPrincipal.component';

@Component({
  selector: 'app-DashBoard_Facturacion',
  templateUrl: './DashBoard_Facturacion.component.html',
  styleUrls: ['./DashBoard_Facturacion.component.css']
})
export class DashBoard_FacturacionComponent implements OnInit {

  cargando : boolean = false;
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
  totalFacturadoanio : number = 0; //Variable que almacenará lo facturado en todo el año
  facturadoAnios : any[] = []; //variable que almacenará la información de lo facturado por los años
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro

  constructor(private AppComponent : AppComponent,
                private zeusService : InventarioZeusService,
                  private shepherdService: ShepherdService,
                    private mensajeAplicacion : MensajesAplicacionService,
                      private paginaPrincial : PaginaPrincipalComponent,) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
  }

  ngOnInit() {
    this.lecturaStorage();
    this.llenarArrayAnos();
    this.tiempoExcedido();
    this.graficarDatos();
    setInterval(() => {
      this.modoSeleccionado = this.AppComponent.temaSeleccionado;
      this.facturasOptions.plugins.legend.labels.color = this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'];
      this.facturasOptions.scales.x.ticks.color = this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'];
      this.facturasOptions.scales.y.ticks.color = this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'];
    }, 1000);
  }

  tutorial(){
    this.shepherdService.defaultStepOptions = defaultStepOptions;
    this.shepherdService.modal = true;
    this.shepherdService.confirmCancel = false;
    this.shepherdService.addSteps(defaultSteps);
    this.shepherdService.start();
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage = () => this.ValidarRol = this.AppComponent.storage_Rol;

  //Funcion que va a encargarse de cargar la información de las cards y llama a la funcion de que contará en cunato tiempo se recargará la información
  tiempoExcedido() {
    if (this.paginaPrincial.facturacion) {
      this.facturacionAnio();
      this.facturacion();
      let time = setInterval(() => {
        if (this.paginaPrincial.facturacion) {
          this.facturacionAnio(true);
          this.facturacion();
        } else clearInterval(time);
      }, 60000);
    }
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
    if (this.ValidarRol == 1 || this.ValidarRol == 60 || this.ValidarRol == 6) {
      this.zeusService.ValorTotalFacturadoHoy().subscribe(datos_facturacion => this.totalFacturadoDia = datos_facturacion);
      this.zeusService.GetFacturacionMensual(this.primerDiaMes, this.today).subscribe(datos_facturacion => {
        if (moment().month() == 7 && this.anoSeleccionado == 2023) this.totalFacuturadoMes = (datos_facturacion + 6249600 + 12091700);
        else if (moment().month() == 7 && this.anoSeleccionado == 2024) this.totalFacuturadoMes = (datos_facturacion - 709073187 + 17726829.68);
        else this.totalFacuturadoMes = datos_facturacion;
      }); 
      this.zeusService.GetIvaVentaMensual(this.primerDiaMes, this.today).subscribe(datos_facturacion => this.totalIvaVentaMes = datos_facturacion);
      this.totalFacturadoAnioActual();
    }
  }

  totalFacturadoAnioActual(){
    this.totalFacturadoanio = 0;
    for (let i = 0; i < 12; i++) {
      let mes : string = `${i + 1}`.length == 1 ? `0${i + 1}` : `${i + 1}`;
      this.zeusService.GetFacturacionTodosMeses(mes, this.anoSeleccionado).subscribe(datos_facturacion => {
        if (this.anoSeleccionado == 2023 && mes == '08') this.totalFacturadoanio += (datos_facturacion + 6249600 + 12091700);
        else if (this.anoSeleccionado == 2024 && mes == '08') this.totalFacturadoanio += (datos_facturacion - 709073187 + 17726829.68);
        else this.totalFacturadoanio += datos_facturacion;
      });
    }
  }

  // Funcion que va a consultar la facturación por año
  facturacionAnio(autoRecarga?){
    let index : number = this.facturadoAnios.findIndex(item => item.anio == this.anoSeleccionado);
    if (index == -1) {
      this.cargando = true;
      let costoMeses : number [] = [0,0,0,0,0,0,0,0,0,0,0,0];
      this.zeusService.GetFacturacion_Mes_Mes(`${this.anoSeleccionado}`).subscribe(dato => {
        for (let i = 0; i < dato.length; i++) {
          let info : any = JSON.parse(`{${dato[i].replaceAll("'", '"')}}`);
          costoMeses = [
            i == 0 ? parseFloat(info.Valor) : costoMeses[0],
            i == 1 ? parseFloat(info.Valor) : costoMeses[1],
            i == 2 ? parseFloat(info.Valor) : costoMeses[2],
            i == 3 ? parseFloat(info.Valor) : costoMeses[3],
            i == 4 ? parseFloat(info.Valor) : costoMeses[4],
            i == 5 ? parseFloat(info.Valor) : costoMeses[5],
            i == 6 ? parseFloat(info.Valor) : costoMeses[6],
            i == 7 ? this.anoSeleccionado == 2024 ? (parseFloat(info.Valor) - 709073187 + 17726829.68) : parseFloat(info.Valor) : costoMeses[7],
            i == 8 ? this.anoSeleccionado == 2023 ? (parseFloat(info.Valor) + 6249600 + 12091700) : parseFloat(info.Valor) : costoMeses[8],
            i == 9 ? parseFloat(info.Valor) : costoMeses[9],
            i == 10 ? parseFloat(info.Valor) : costoMeses[10],
            i == 11 ? parseFloat(info.Valor) : costoMeses[11],
          ];
          if (i == 11) this.llenarGraficaFacturacion(costoMeses);
          let info_Anio : any = { 
            anio: this.anoSeleccionado, 
            costo: costoMeses.reduce((a,b) => a + b, 0),
          };
          let index2 : number = this.facturadoAnios.findIndex(item => item.anio == this.anoSeleccionado);
          if (index2 != -1) this.facturadoAnios[index2].costo = costoMeses.reduce((a,b) => a + b, 0);
          else this.facturadoAnios.push(info_Anio);
        }
      });
    } else !autoRecarga ? this.mensajeAplicacion.mensajeAdvertencia(`¡El año seleccionado ya ha sido graficado!`, ``) : null;
  }

  // funcion que llenará el array con las opciones de la grafica
  graficarDatos(){
    this.facturadoAnios = [];
    this.facturasData = {
      labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
      datasets: []
    };

    this.facturasOptions = {
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
  }

  // Funcion que va a llenar la grafica de las cantidades facturadas en cada mes
  llenarGraficaFacturacion(datos){
    let color : string = "#"+((1<<24)*Math.random()|0).toString(16);
    let info : any = {
      label: `Año ${this.anoSeleccionado}`,
      data: datos,
      yAxisID: 'y',
      borderColor: color.substring(0, 4),
      backgroundColor: color.substring(0, 4) + "2",
      pointStyle: 'rectRot',
      pointRadius: 10,
      pointHoverRadius: 15,
      fill : true,
      tension: 0.3
    };
    this.facturasData.datasets.push(info);
    this.cargando = false;
  }
}
