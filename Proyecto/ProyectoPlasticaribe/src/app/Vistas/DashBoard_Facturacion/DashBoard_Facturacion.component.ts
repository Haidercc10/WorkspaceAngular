import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import DataLabelsPlugin from 'chartjs-plugin-datalabels';
import moment from 'moment';
import { CookieService } from 'ngx-cookie-service';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { InventarioZeusService } from 'src/app/Servicios/InventarioZeus/inventario-zeus.service';

@Component({
  selector: 'app-DashBoard_Facturacion',
  templateUrl: './DashBoard_Facturacion.component.html',
  styleUrls: ['./DashBoard_Facturacion.component.css']
})
export class DashBoard_FacturacionComponent implements OnInit {
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

  mostrarGrafica : boolean = false; //Variable que mostrará o no la información graficada
  nombreGrafica : string = 'Grafica'; //Variable que almacenará el nombre de la grafica
  multiAxisData: any;
  multiAxisOptions: any;
  multiAxisPlugins = [ DataLabelsPlugin ];
  AppComponent: any;

  constructor(@Inject(SESSION_STORAGE) private storage: WebStorageService,
                private zeusService : InventarioZeusService,) { }

  ngOnInit() {
    this.lecturaStorage();
    this.llenarArrayAnos();
    this.tiempoExcedido();
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
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
    if (this.ValidarRol == 1 || this.ValidarRol == 60) {
      this.zeusService.GetValorFacturadoHoy().subscribe(datos_facturacion => { this.totalFacturadoDia = datos_facturacion; });
      this.zeusService.GetFacturacionMensual(this.primerDiaMes, this.today).subscribe(datos_facturacion => { this.totalFacuturadoMes = datos_facturacion; });
      this.zeusService.GetIvaVentaMensual(this.primerDiaMes, this.today).subscribe(datos_facturacion => { this.totalIvaVentaMes = datos_facturacion; });
      for (let i = 0; i < 12; i++) {
        let mes : string = `${i + 1}`.length == 1 ? `0${i + 1}` : `${i + 1}`;
        this.zeusService.GetFacturacionTodosMeses(mes, this.anoSeleccionado).subscribe(datos_facturacion => {
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
        setTimeout(() => { this.llenarGraficaFacturacion(); }, 1500);
      }
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
          borderColor: '#FF7878',
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
          ticks: {
            color: '#495057',
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
          ticks: { color: '#495057', font: { size: 20 } },
          grid: { color: '#ebedef' }
        },
      },
      datalabels: { anchor: 'end', align: 'end' }
    };
  }

}
