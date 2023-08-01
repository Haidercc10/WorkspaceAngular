import { Component, OnInit, ViewChild } from '@angular/core';
import { ShepherdService } from 'angular-shepherd';
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';
import moment from 'moment';
import { Table } from 'primeng/table';
import { CostosEmpresasService } from 'src/app/Servicios/CostosEmpresas/CostosEmpresas.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { ZeusContabilidadService } from 'src/app/Servicios/Zeus_Contabilidad/zeusContabilidad.service';
import { AppComponent } from 'src/app/app.component';
import { defaultStepOptions, stepsDashboardCostos as defaultSteps } from 'src/app/data';
import { logoParaPdf } from 'src/app/logoPlasticaribe_Base64';

@Component({
  selector: 'app-Dashboard_Costos',
  templateUrl: './Dashboard_Costos.component.html',
  styleUrls: ['./Dashboard_Costos.component.css']
})
export class Dashboard_CostosComponent implements OnInit {

  cargando : boolean = false; //Variable para validar que salga o no la imagen de carga
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro
  anios : any [] = [2019]; //Variable que almacenará los años desde el 2019 hasta el año actual
  anioSeleccionado : number = moment().year(); //Variable que almacenará la información del año actual en princio y luego podrá cambiar a un año seleccionado
  rangoFechas : any [] = []; //Variable que almacenará la información de la fecha de inicio y la fecha de fin

  nominaAdministrativa : any [] = []; //Variable que almacenará la información de la nomina administrativa
  nominaFabricacion : any [] = []; //Variable que almacenará la información de la nomina de fabricación
  nominaVentas : any [] = []; //

  opcionesGrafica : any; //Variable que va a almacenar la opciones de cada grafica
  graficaCostosFabricacion : any; //Variable que va a almacenar los costos de fabricación
  graficaCostosAdministrativos : any; //Variable que va a almacenar los costos administrativos
  graficaCostosVentas : any; //Variable que va a almacenar los costos de ventas
  graficaCostosNoOperacionesles : any; //Variable que va a almacenar los costos no operacionesles

  costo_Anio_fabricacion : any [] = []; //Variable que va a almacenar los costos de fabricación por año
  costo_Anio_administrativos : any [] = []; //Variable que va a almacenar los costos de administrativos por año
  costo_Anio_ventas : any [] = []; //Variable que va a almacenar los costos de ventas por año
  costo_Anio_noOperacionesles : any [] = []; //Variable que va a almacenar los costos de no operacionesles por año

  cuentasFabricacion = ['730545', '730590', '730525', '730530', '730555', '730550', '730540', '730565', '730570', '730560', '740505', '720551', '730505', '730575', '730585'];
  cuentasAdministrativos = ['519595', '519565', '519590', '519535', '519530', '519525', '519520', '519510', '519505', '51559515', '51559505', '515520', '515515', '515505', '515095', '515015', '515005', '514540', '514525', '514515', '514510', '513595', '513555', '513550', '513545', '513540', '513535', '513530', '513525', '513520', '513515', '513510', '513505', '513095', '513040', '513025', '513010', '513005', '512505', '511595', '511515', '511510', '511095'];
  cuentasVentas = ['529595', '529565', '529560', '529540', '529535', '529530', '529525', '529520', '529505', '52559515', '52559505', '525520', '525515', '525505', '525095', '525015', '524540', '524525', '524520', '524515', '523595', '523550', '523540', '523530', '523525', '523520', '523510', '523505', '523095', '523075', '523060', '523040', '523010', '521595', '521540', '521505'];
  cuentasNoOperacionesles = ['53050505', '53050510', '530515', '530525', '530535', '530595'];

  arrayCostos : any = []; /** Array que cargará la información de las cuentas empezadas con 71, 51, 52, ó 53 en la tabla del primero modal */
  arrayGastos1 : any = []; /** Array que cargará la información de una cuenta en un periodo en especifico en la tabla del segundo modal */
  totalCostoSeleccionado : number = 0; /** Variable que almacenará el valor total de el tipo de costos cargados en el modal */
  @ViewChild('dt') dt: Table | undefined;
  load : boolean = false;
  abrirModal1 : boolean = false; /** Variable que servirá para abrir el primer modal */
  abrirModal2 : boolean = false; /** Variable que servirá para abrir el segundo modal */
  graficaSeleccionada : string = ''; /** Titulo que se mostrará en el modal según la grafica seleccionada */
  arrayAnios : any[] = []; /** Array que cargará los años seleccionados en la grafica */
  cuentaSeleccionada : any[] = []; /** Array que mostrará la cuenta, el mes y el año en el titulo del segundo modal */

  constructor(private AppComponent : AppComponent,
                private msj : MensajesAplicacionService,
                  private shepherdService: ShepherdService,
                    private zeusContabilidad : ZeusContabilidadService,
                      private costosService : CostosEmpresasService,){}

  ngOnInit(): void {
    this.lecturaStorage();
    this.llenarArrayAnos();
    this.nominaAdministrativaPlasticaribe();
    this.nominaVentasPlasticaribe();
    this.nominaFabricacionPlasticaribe();
    this.inicializarGraficas();
    this.llenarGraficas();
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
    this.rangoFechas = [];
    this.arrayAnios = [];
    this.costo_Anio_fabricacion = [];
    this.costo_Anio_administrativos = [];
    this.costo_Anio_ventas = [];
    this.costo_Anio_noOperacionesles = [];

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

    this.graficaCostosFabricacion = {
      labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
      datasets: []
    };

    this.graficaCostosAdministrativos = {
      labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
      datasets: []
    };

    this.graficaCostosVentas = {
      labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
      datasets: []
    };

    this.graficaCostosNoOperacionesles = {
      labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
      datasets: []
    };
  }

  // Funcion que va a llamar a las funciones que se encargaran de llenar las graficas
  llenarGraficas(){
    this.arrayAnios.push(`${this.anioSeleccionado}`);
    this.buscarCostosFabricacion();
    setTimeout(() => this.cargando = false, 3000);
  }

  // Funcion que va a buscar informacion de los costos de fabricacion
  buscarCostosFabricacion(){
    let index : number = this.costo_Anio_fabricacion.findIndex(item => item.anio == this.anioSeleccionado);
    if (index == -1) {
      this.cargando = true;
      this.zeusContabilidad.GetCostosCuentas_Mes_Mes(`${this.anioSeleccionado}`).subscribe(dato => {
        let costos  = [dato[0], dato[1], dato[2], dato[3], dato[4], dato[5], dato[6], dato[7], dato[8], dato[9], dato[10], dato[11]].reduce((a, b) => a.concat(b));
        let costosFabricacion = [costos.filter(item => this.cuentasFabricacion.includes(item.cuenta.trim())), this.nominaFabricacion].reduce((a, b) => a.concat(b));;
        let costosAdministrativos = [costos.filter(item => this.cuentasAdministrativos.includes(item.cuenta.trim())), this.nominaAdministrativa].reduce((a, b) => a.concat(b));
        let costosVentas = [costos.filter(item => this.cuentasVentas.includes(item.cuenta.trim())), this.nominaVentas].reduce((a, b) => a.concat(b));
        let costoNoOperacionales = costos.filter(item => this.cuentasNoOperacionesles.includes(item.cuenta.trim()));

        this.datosCostosFabricacion(costosFabricacion);
        this.datosCostosAdministrativo(costosAdministrativos);
        this.datosCostosVentas(costosVentas);
        this.datosCostosNoOperacionesles(costoNoOperacionales);
      });
    } else this.msj.mensajeAdvertencia(`¡El año seleccionado ya ha sido graficado!`, ``);
  }

  // Funcion que va a traer los datos de la nomina administrativa de plasticaribe
  nominaAdministrativaPlasticaribe(){
    this.costosService.GetCostosFacturacion(this.anioSeleccionado, `NOMINA ADMINISTRACION PLASTICARIBE`).subscribe(data => {
      data.forEach(costo => {
        this.nominaAdministrativa = [
          {
            anio: costo.anio,
            credito: 0,
            cuenta: "1",
            debito: costo.enero,
            descripcionCuenta: "NOMINA ADMINISTRACION",
            mes: "01",
            periodo : `${costo.anio}01`,
            valor : costo.enero
          },
          {
            anio: costo.anio,
            credito: 0,
            cuenta: "1",
            debito: costo.febrero,
            descripcionCuenta: "NOMINA ADMINISTRACION",
            mes: "02",
            periodo : `${costo.anio}02`,
            valor : costo.febrero
          },
          {
            anio: costo.anio,
            credito: 0,
            cuenta: "1",
            debito: costo.marzo,
            descripcionCuenta: "NOMINA ADMINISTRACION",
            mes: "03",
            periodo : `${costo.anio}03`,
            valor : costo.marzo
          },
          {
            anio: costo.anio,
            credito: 0,
            cuenta: "1",
            debito: costo.abril,
            descripcionCuenta: "NOMINA ADMINISTRACION",
            mes: "04",
            periodo : `${costo.anio}04`,
            valor : costo.abril
          },
          {
            anio: costo.anio,
            credito: 0,
            cuenta: "1",
            debito: costo.mayo,
            descripcionCuenta: "NOMINA ADMINISTRACION",
            mes: "05",
            periodo : `${costo.anio}05`,
            valor : costo.mayo
          },
          {
            anio: costo.anio,
            credito: 0,
            cuenta: "1",
            debito: costo.junio,
            descripcionCuenta: "NOMINA ADMINISTRACION",
            mes: "06",
            periodo : `${costo.anio}06`,
            valor : costo.junio
          },
          {
            anio: costo.anio,
            credito: 0,
            cuenta: "1",
            debito: costo.julio,
            descripcionCuenta: "NOMINA ADMINISTRACION",
            mes: "07",
            periodo : `${costo.anio}07`,
            valor : costo.julio
          },
          {
            anio: costo.anio,
            credito: 0,
            cuenta: "1",
            debito: costo.agosto,
            descripcionCuenta: "NOMINA ADMINISTRACION",
            mes: "08",
            periodo : `${costo.anio}08`,
            valor : costo.agosto
          },
          {
            anio: costo.anio,
            credito: 0,
            cuenta: "1",
            debito: costo.septiembre,
            descripcionCuenta: "NOMINA ADMINISTRACION",
            mes: "09",
            periodo : `${costo.anio}09`,
            valor : costo.septiembre
          },
          {
            anio: costo.anio,
            credito: 0,
            cuenta: "1",
            debito: costo.octubre,
            descripcionCuenta: "NOMINA ADMINISTRACION",
            mes: "10",
            periodo : `${costo.anio}10`,
            valor : costo.octubre
          },
          {
            anio: costo.anio,
            credito: 0,
            cuenta: "1",
            debito: costo.noviembre,
            descripcionCuenta: "NOMINA ADMINISTRACION",
            mes: "11",
            periodo : `${costo.anio}11`,
            valor : costo.noviembre
          },
          {
            anio: costo.anio,
            credito: 0,
            cuenta: "1",
            debito: costo.diciembre,
            descripcionCuenta: "NOMINA ADMINISTRACION",
            mes: "12",
            periodo : `${costo.anio}12`,
            valor : costo.diciembre
          },
        ];
      });
    });
  }

  // Funcion que va a traer los datos de la nomina de ventas de plasticaribe
  nominaVentasPlasticaribe(){
    this.costosService.GetCostosFacturacion(this.anioSeleccionado, `NOMINA VENTAS PLASTICARIBE`).subscribe(data => {
      data.forEach(costo => {
        this.nominaVentas = [
          {
            anio: costo.anio,
            credito: 0,
            cuenta: "2",
            debito: costo.enero,
            descripcionCuenta: "NOMINA VENTAS",
            mes: "01",
            periodo : `${costo.anio}01`,
            valor : costo.enero
          },
          {
            anio: costo.anio,
            credito: 0,
            cuenta: "2",
            debito: costo.febrero,
            descripcionCuenta: "NOMINA VENTAS",
            mes: "02",
            periodo : `${costo.anio}02`,
            valor : costo.febrero
          },
          {
            anio: costo.anio,
            credito: 0,
            cuenta: "2",
            debito: costo.marzo,
            descripcionCuenta: "NOMINA VENTAS",
            mes: "03",
            periodo : `${costo.anio}03`,
            valor : costo.marzo
          },
          {
            anio: costo.anio,
            credito: 0,
            cuenta: "2",
            debito: costo.abril,
            descripcionCuenta: "NOMINA VENTAS",
            mes: "04",
            periodo : `${costo.anio}04`,
            valor : costo.abril
          },
          {
            anio: costo.anio,
            credito: 0,
            cuenta: "2",
            debito: costo.mayo,
            descripcionCuenta: "NOMINA VENTAS",
            mes: "05",
            periodo : `${costo.anio}05`,
            valor : costo.mayo
          },
          {
            anio: costo.anio,
            credito: 0,
            cuenta: "2",
            debito: costo.junio,
            descripcionCuenta: "NOMINA VENTAS",
            mes: "06",
            periodo : `${costo.anio}06`,
            valor : costo.junio
          },
          {
            anio: costo.anio,
            credito: 0,
            cuenta: "2",
            debito: costo.julio,
            descripcionCuenta: "NOMINA VENTAS",
            mes: "07",
            periodo : `${costo.anio}07`,
            valor : costo.julio
          },
          {
            anio: costo.anio,
            credito: 0,
            cuenta: "2",
            debito: costo.agosto,
            descripcionCuenta: "NOMINA VENTAS",
            mes: "08",
            periodo : `${costo.anio}08`,
            valor : costo.agosto
          },
          {
            anio: costo.anio,
            credito: 0,
            cuenta: "2",
            debito: costo.septiembre,
            descripcionCuenta: "NOMINA VENTAS",
            mes: "09",
            periodo : `${costo.anio}09`,
            valor : costo.septiembre
          },
          {
            anio: costo.anio,
            credito: 0,
            cuenta: "2",
            debito: costo.octubre,
            descripcionCuenta: "NOMINA VENTAS",
            mes: "10",
            periodo : `${costo.anio}10`,
            valor : costo.octubre
          },
          {
            anio: costo.anio,
            credito: 0,
            cuenta: "2",
            debito: costo.noviembre,
            descripcionCuenta: "NOMINA VENTAS",
            mes: "11",
            periodo : `${costo.anio}11`,
            valor : costo.noviembre
          },
          {
            anio: costo.anio,
            credito: 0,
            cuenta: "2",
            debito: costo.diciembre,
            descripcionCuenta: "NOMINA VENTAS",
            mes: "12",
            periodo : `${costo.anio}12`,
            valor : costo.diciembre
          },
        ];
      });
    });
  }

  // Funcion que va a traer los datos de la nomina de fabricacion de plasticaribe
  nominaFabricacionPlasticaribe(){
    this.costosService.GetCostosFacturacion(this.anioSeleccionado, `NOMINA FABRICACION PLASTICARIBE`).subscribe(data => {
      data.forEach(costo => {
        this.nominaFabricacion = [
          {
            anio: costo.anio,
            credito: 0,
            cuenta: "3",
            debito: costo.enero,
            descripcionCuenta: "NOMINA FABRICACION",
            mes: "01",
            periodo : `${costo.anio}01`,
            valor : costo.enero
          },
          {
            anio: costo.anio,
            credito: 0,
            cuenta: "3",
            debito: costo.febrero,
            descripcionCuenta: "NOMINA FABRICACION",
            mes: "02",
            periodo : `${costo.anio}02`,
            valor : costo.febrero
          },
          {
            anio: costo.anio,
            credito: 0,
            cuenta: "3",
            debito: costo.marzo,
            descripcionCuenta: "NOMINA FABRICACION",
            mes: "03",
            periodo : `${costo.anio}03`,
            valor : costo.marzo
          },
          {
            anio: costo.anio,
            credito: 0,
            cuenta: "3",
            debito: costo.abril,
            descripcionCuenta: "NOMINA FABRICACION",
            mes: "04",
            periodo : `${costo.anio}04`,
            valor : costo.abril
          },
          {
            anio: costo.anio,
            credito: 0,
            cuenta: "3",
            debito: costo.mayo,
            descripcionCuenta: "NOMINA FABRICACION",
            mes: "05",
            periodo : `${costo.anio}05`,
            valor : costo.mayo
          },
          {
            anio: costo.anio,
            credito: 0,
            cuenta: "3",
            debito: costo.junio,
            descripcionCuenta: "NOMINA FABRICACION",
            mes: "06",
            periodo : `${costo.anio}06`,
            valor : costo.junio
          },
          {
            anio: costo.anio,
            credito: 0,
            cuenta: "3",
            debito: costo.julio,
            descripcionCuenta: "NOMINA FABRICACION",
            mes: "07",
            periodo : `${costo.anio}07`,
            valor : costo.julio
          },
          {
            anio: costo.anio,
            credito: 0,
            cuenta: "3",
            debito: costo.agosto,
            descripcionCuenta: "NOMINA FABRICACION",
            mes: "08",
            periodo : `${costo.anio}08`,
            valor : costo.agosto
          },
          {
            anio: costo.anio,
            credito: 0,
            cuenta: "3",
            debito: costo.septiembre,
            descripcionCuenta: "NOMINA FABRICACION",
            mes: "09",
            periodo : `${costo.anio}09`,
            valor : costo.septiembre
          },
          {
            anio: costo.anio,
            credito: 0,
            cuenta: "3",
            debito: costo.octubre,
            descripcionCuenta: "NOMINA FABRICACION",
            mes: "10",
            periodo : `${costo.anio}10`,
            valor : costo.octubre
          },
          {
            anio: costo.anio,
            credito: 0,
            cuenta: "3",
            debito: costo.noviembre,
            descripcionCuenta: "NOMINA FABRICACION",
            mes: "11",
            periodo : `${costo.anio}11`,
            valor : costo.noviembre
          },
          {
            anio: costo.anio,
            credito: 0,
            cuenta: "3",
            debito: costo.diciembre,
            descripcionCuenta: "NOMINA FABRICACION",
            mes: "12",
            periodo : `${costo.anio}12`,
            valor : costo.diciembre
          },
        ];
      });
    });
  }

  // funcion que va a manejar los datos de los costos de fabricacion
  datosCostosFabricacion(data : any){
    let costoMeses : number [] = [0,0,0,0,0,0,0,0,0,0,0,0];
    let cantDatos : number = 0;

    for (let i = 0; i < data.length; i++) {
      costoMeses = [
        data.filter(item => item.mes == '01').reduce((a, b) => a + b.valor, 0),
        data.filter(item => item.mes == '02').reduce((a, b) => a + b.valor, 0),
        data.filter(item => item.mes == '03').reduce((a, b) => a + b.valor, 0),
        data.filter(item => item.mes == '04').reduce((a, b) => a + b.valor, 0),
        data.filter(item => item.mes == '05').reduce((a, b) => a + b.valor, 0),
        data.filter(item => item.mes == '06').reduce((a, b) => a + b.valor, 0),
        data.filter(item => item.mes == '07').reduce((a, b) => a + b.valor, 0),
        data.filter(item => item.mes == '08').reduce((a, b) => a + b.valor, 0),
        data.filter(item => item.mes == '09').reduce((a, b) => a + b.valor, 0),
        data.filter(item => item.mes == '10').reduce((a, b) => a + b.valor, 0),
        data.filter(item => item.mes == '11').reduce((a, b) => a + b.valor, 0),
        data.filter(item => item.mes == '12').reduce((a, b) => a + b.valor, 0),
      ];
      cantDatos++;
      if (cantDatos == data.length) this.llenarGraficaCostos_Fabricacion(costoMeses, 'Año');
      let index2 : number = this.costo_Anio_fabricacion.findIndex(item => item.anio == this.anioSeleccionado);
      if (index2 == -1) this.costo_Anio_fabricacion.push({ anio: this.anioSeleccionado, costo : data.reduce((a, b) => a + b.valor, 0) });
    }
  }

  // Funcion que va a llenar la grafica de fabricacion
  llenarGraficaCostos_Fabricacion(data, cuenta){
    let color : string = "#"+((1<<24)*Math.random()|0).toString(16);
    this.graficaCostosFabricacion.datasets.push({
      label: `${cuenta} - ${this.anioSeleccionado}`,
      data: data,
      yAxisID: 'y',
      borderColor: color.substring(0, 4),
      backgroundColor: color.substring(0, 4) + "2",
      pointStyle: 'rectRot',
      pointRadius: 10,
      pointHoverRadius: 15,
      fill : true,
      tension: 0.3
    });
  }

  // Funcion que va a manejar los datosde los costos administrativos
  datosCostosAdministrativo(data : any){
    let costoMeses : number [] = [0,0,0,0,0,0,0,0,0,0,0,0];
    let cantDatos : number = 0;
    for (let i = 0; i < data.length; i++) {
      costoMeses = [
        data.filter(item => item.mes == '01').reduce((a, b) => a + b.valor, 0),
        data.filter(item => item.mes == '02').reduce((a, b) => a + b.valor, 0),
        data.filter(item => item.mes == '03').reduce((a, b) => a + b.valor, 0),
        data.filter(item => item.mes == '04').reduce((a, b) => a + b.valor, 0),
        data.filter(item => item.mes == '05').reduce((a, b) => a + b.valor, 0),
        data.filter(item => item.mes == '06').reduce((a, b) => a + b.valor, 0),
        data.filter(item => item.mes == '07').reduce((a, b) => a + b.valor, 0),
        data.filter(item => item.mes == '08').reduce((a, b) => a + b.valor, 0),
        data.filter(item => item.mes == '09').reduce((a, b) => a + b.valor, 0),
        data.filter(item => item.mes == '10').reduce((a, b) => a + b.valor, 0),
        data.filter(item => item.mes == '11').reduce((a, b) => a + b.valor, 0),
        data.filter(item => item.mes == '12').reduce((a, b) => a + b.valor, 0),
      ]
      cantDatos++;
      if (cantDatos == data.length) this.llenarGraficaCostos_Administrativos(costoMeses, 'Año');
      let index2 : number = this.costo_Anio_administrativos.findIndex(item => item.anio == this.anioSeleccionado);
      if (index2 == -1) this.costo_Anio_administrativos.push({ anio: this.anioSeleccionado, costo : data.reduce((a, b) => a + b.valor, 0) });
    }
  }

  // Funcion que va a llenar la grafica de costos administrativos
  llenarGraficaCostos_Administrativos(data, cuenta){
    let color : string = "#"+((1<<24)*Math.random()|0).toString(16);
    this.graficaCostosAdministrativos.datasets.push({
      label: `${cuenta} - ${this.anioSeleccionado}`,
      data: data,
      yAxisID: 'y',
      borderColor: color.substring(0, 4),
      backgroundColor: color.substring(0, 4) + "2",
      pointStyle: 'rectRot',
      pointRadius: 10,
      pointHoverRadius: 15,
      fill : true,
      tension: 0.3
    });
  }

  // Funcion que va a manejar los datosde los costos de ventas
  datosCostosVentas(data : any){
    let costoMeses : number [] = [0,0,0,0,0,0,0,0,0,0,0,0];
    let cantDatos : number = 0;
    for (let i = 0; i < data.length; i++) {
      costoMeses = [
        data.filter(item => item.mes == '01').reduce((a, b) => a + b.valor, 0),
        data.filter(item => item.mes == '02').reduce((a, b) => a + b.valor, 0),
        data.filter(item => item.mes == '03').reduce((a, b) => a + b.valor, 0),
        data.filter(item => item.mes == '04').reduce((a, b) => a + b.valor, 0),
        data.filter(item => item.mes == '05').reduce((a, b) => a + b.valor, 0),
        data.filter(item => item.mes == '06').reduce((a, b) => a + b.valor, 0),
        data.filter(item => item.mes == '07').reduce((a, b) => a + b.valor, 0),
        data.filter(item => item.mes == '08').reduce((a, b) => a + b.valor, 0),
        data.filter(item => item.mes == '09').reduce((a, b) => a + b.valor, 0),
        data.filter(item => item.mes == '10').reduce((a, b) => a + b.valor, 0),
        data.filter(item => item.mes == '11').reduce((a, b) => a + b.valor, 0),
        data.filter(item => item.mes == '12').reduce((a, b) => a + b.valor, 0),
      ]
      cantDatos++;
      if (cantDatos == data.length) this.llenarGraficaCostos_Ventas(costoMeses, 'Año');
      let index2 : number = this.costo_Anio_ventas.findIndex(item => item.anio == this.anioSeleccionado);
      if (index2 == -1) this.costo_Anio_ventas.push({ anio: this.anioSeleccionado, costo : data.reduce((a, b) => a + b.valor, 0) });
    }
  }

  // Funcion que va a llenar la grafica de costos de ventas
  llenarGraficaCostos_Ventas(data, cuenta){
    let color : string = "#"+((1<<24)*Math.random()|0).toString(16);
    this.graficaCostosVentas.datasets.push({
      label: `${cuenta} - ${this.anioSeleccionado}`,
      data: data,
      yAxisID: 'y',
      borderColor: color.substring(0, 4),
      backgroundColor: color.substring(0, 4) + "2",
      pointStyle: 'rectRot',
      pointRadius: 10,
      pointHoverRadius: 15,
      fill : true,
      tension: 0.3
    });
  }

  // Funcion que va a manejar los datosde los costos de no operacionesles
  datosCostosNoOperacionesles(data : any){
    let costoMeses : number [] = [0,0,0,0,0,0,0,0,0,0,0,0];
    let cantDatos : number = 0;
    for (let i = 0; i < data.length; i++) {
      costoMeses = [
        data.filter(item => item.mes == '01').reduce((a, b) => a + b.valor, 0),
        data.filter(item => item.mes == '02').reduce((a, b) => a + b.valor, 0),
        data.filter(item => item.mes == '03').reduce((a, b) => a + b.valor, 0),
        data.filter(item => item.mes == '04').reduce((a, b) => a + b.valor, 0),
        data.filter(item => item.mes == '05').reduce((a, b) => a + b.valor, 0),
        data.filter(item => item.mes == '06').reduce((a, b) => a + b.valor, 0),
        data.filter(item => item.mes == '07').reduce((a, b) => a + b.valor, 0),
        data.filter(item => item.mes == '08').reduce((a, b) => a + b.valor, 0),
        data.filter(item => item.mes == '09').reduce((a, b) => a + b.valor, 0),
        data.filter(item => item.mes == '10').reduce((a, b) => a + b.valor, 0),
        data.filter(item => item.mes == '11').reduce((a, b) => a + b.valor, 0),
        data.filter(item => item.mes == '12').reduce((a, b) => a + b.valor, 0),
      ]
      cantDatos++;
      if (cantDatos == data.length) this.llenarGraficaCostos_NoOperacionesles(costoMeses, 'Año');
      let index2 : number = this.costo_Anio_noOperacionesles.findIndex(item => item.anio == this.anioSeleccionado);
      if (index2 == -1) this.costo_Anio_noOperacionesles.push({ anio: this.anioSeleccionado, costo : data.reduce((a, b) => a + b.valor, 0) });
    }
  }

  // Funcion que va a llenar la grafica de costos no operacionesles
  llenarGraficaCostos_NoOperacionesles(data, cuenta){
    let color : string = "#"+((1<<24)*Math.random()|0).toString(16);
    this.graficaCostosNoOperacionesles.datasets.push({
      label: `${cuenta} - ${this.anioSeleccionado}`,
      data: data,
      yAxisID: 'y',
      borderColor: color.substring(0, 4),
      backgroundColor: color.substring(0, 4) + "2",
      pointStyle: 'rectRot',
      pointRadius: 10,
      pointHoverRadius: 15,
      fill : true,
      tension: 0.3
    });
  }

  /** Función que cargará el modal con la información de la grafica seleccionada por meses.  */
  datosAgrupados(numero : number) {
    this.graficaSeleccionada = '';
    this.abrirModal1 = true;
    this.totalCostoSeleccionado = 0;
    this.cargando = true;

    for (let index = 0; index < this.arrayAnios.length; index++) {
      this.zeusContabilidad.GetCostosCuentas_Mes_Mes(this.arrayAnios[index]).subscribe(data => {
        let gastos = [data[0], data[1], data[2], data[3], data[4], data[5], data[6], data[7], data[8], data[9], data[10], data[11]].reduce((a, b) => a.concat(b));

        if (numero == 1) {
          let costoIndFabricacion : any = [gastos.filter(item => this.cuentasFabricacion.includes(item.cuenta.trim())), this.nominaFabricacion].reduce((a,b) => a.concat(b));
          this.llenarTabla(costoIndFabricacion);
          this.graficaSeleccionada = 'Costos indirectos de fabricación';
        }
        if (numero == 2) {
          let gastosAdmon : any = [gastos.filter(item => this.cuentasAdministrativos.includes(item.cuenta.trim())), this.nominaAdministrativa].reduce((a, b) => a.concat(b));
          this.llenarTabla(gastosAdmon);
          this.graficaSeleccionada = 'Gastos de administración';
         }
        if (numero == 3) {
          let gastosVentas : any = [gastos.filter(item => this.cuentasVentas.includes(item.cuenta.trim())), this.nominaVentas].reduce((a, b) => a.concat(b));
          this.llenarTabla(gastosVentas);
          this.graficaSeleccionada = 'Gastos de ventas';
        }
        if (numero == 4) {
          let gastoNoOperacionales : any = gastos.filter(item => this.cuentasNoOperacionesles.includes(item.cuenta.trim()));
          this.llenarTabla(gastoNoOperacionales);
          this.graficaSeleccionada = 'Gastos no operacionales';
        }
       });
    }
    setTimeout(() => this.cargando = false, 1000);
  }

  /** Función que limpiará el array de costos al momento de cerrar el modal */
  limpiarArrayCostos = () => this.arrayCostos = [];

  /** Llenar la tabla del primer modal  */
  llenarTabla(datas : any){
    let cuentas : any[] = [];
    for (let index = 0; index < datas.length; index++) {
      if(!cuentas.includes(datas[index].cuenta.trim())) {
        cuentas.push(datas[index].cuenta.trim());
        let infoMeses : any = {
          Cuenta : datas[index].cuenta,
          Descripcion : datas[index].descripcionCuenta,
          Enero : datas.filter(item => item.mes == '01' && item.cuenta.trim() == datas[index].cuenta.trim()).reduce((a, b) => a + b.valor, 0),
          Febrero : datas.filter(item => item.mes == '02' && item.cuenta.trim() == datas[index].cuenta.trim()).reduce((a, b) => a + b.valor, 0),
          Marzo : datas.filter(item => item.mes == '03' && item.cuenta.trim() == datas[index].cuenta.trim()).reduce((a, b) => a + b.valor, 0),
          Abril : datas.filter(item => item.mes == '04' && item.cuenta.trim() == datas[index].cuenta.trim()).reduce((a, b) => a + b.valor, 0),
          Mayo : datas.filter(item => item.mes == '05' && item.cuenta.trim() == datas[index].cuenta.trim()).reduce((a, b) => a + b.valor, 0),
          Junio : datas.filter(item => item.mes == '06' && item.cuenta.trim() == datas[index].cuenta.trim()).reduce((a, b) => a + b.valor, 0),
          Julio : datas.filter(item => item.mes == '07' && item.cuenta.trim() == datas[index].cuenta.trim()).reduce((a, b) => a + b.valor, 0),
          Agosto : datas.filter(item => item.mes == '08' && item.cuenta.trim() == datas[index].cuenta.trim()).reduce((a, b) => a + b.valor, 0),
          Septiembre : datas.filter(item => item.mes == '09' && item.cuenta.trim() == datas[index].cuenta.trim()).reduce((a, b) => a + b.valor, 0),
          Octubre : datas.filter(item => item.mes == '10' && item.cuenta.trim() == datas[index].cuenta.trim()).reduce((a, b) => a + b.valor, 0),
          Noviembre : datas.filter(item => item.mes == '11' && item.cuenta.trim() == datas[index].cuenta.trim()).reduce((a, b) => a + b.valor, 0),
          Diciembre : datas.filter(item => item.mes == '12' && item.cuenta.trim() == datas[index].cuenta.trim()).reduce((a, b) => a + b.valor, 0),
          TotalCuenta : datas.filter(item => item.cuenta.trim() == datas[index].cuenta.trim()).reduce((a, b) => a + b.valor, 0),
          Anio : datas[index].anio,
          Mes : datas[index].mes
        }
        this.arrayCostos.push(infoMeses);
      }
    }
  }

  calcularCostoMensual(anio : string, mes : string) : number {
    let total : number = 0;
    if (mes == '01') total = this.arrayCostos.filter(item => item.Anio == anio).reduce((a, b) => a + b.Enero, 0);
    if (mes == '02') total = this.arrayCostos.filter(item => item.Anio == anio).reduce((a, b) => a + b.Febrero, 0);
    if (mes == '03') total = this.arrayCostos.filter(item => item.Anio == anio).reduce((a, b) => a + b.Marzo, 0);
    if (mes == '04') total = this.arrayCostos.filter(item => item.Anio == anio).reduce((a, b) => a + b.Abril, 0);
    if (mes == '05') total = this.arrayCostos.filter(item => item.Anio == anio).reduce((a, b) => a + b.Mayo, 0);
    if (mes == '06') total = this.arrayCostos.filter(item => item.Anio == anio).reduce((a, b) => a + b.Junio, 0);
    if (mes == '07') total = this.arrayCostos.filter(item => item.Anio == anio).reduce((a, b) => a + b.Julio, 0);
    if (mes == '08') total = this.arrayCostos.filter(item => item.Anio == anio).reduce((a, b) => a + b.Agosto, 0);
    if (mes == '09') total = this.arrayCostos.filter(item => item.Anio == anio).reduce((a, b) => a + b.Septiembre, 0);
    if (mes == '10') total = this.arrayCostos.filter(item => item.Anio == anio).reduce((a, b) => a + b.Octubre, 0);
    if (mes == '11') total = this.arrayCostos.filter(item => item.Anio == anio).reduce((a, b) => a + b.Noviembre, 0);
    if (mes == '12') total = this.arrayCostos.filter(item => item.Anio == anio).reduce((a, b) => a + b.Diciembre, 0);
    if (mes == '00') total = this.arrayCostos.filter(item => item.Anio == anio).reduce((a, b) => a + b.TotalCuenta, 0);
    return total;
  }

  /** Aplicar filtro de busqueda a la tabla del primero modal. */
  aplicarfiltro($event, campo : any, valorCampo : string){
    this.dt!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);
    setTimeout(() => {
      if (this.dt.filteredValue != null) this.dt.filteredValue.forEach(element => this.totalCostoSeleccionado += element.valor);
      else {
        this.totalCostoSeleccionado = 0;
        this.arrayCostos.forEach(element => this.totalCostoSeleccionado += element.valor);
      }
    }, 500);
  }

  /** Función que mostrará un segundo modal con los detalles de la cuenta en el periodo seleccionado  */
  consultaCostosDetallados(datos : any, mes : string){
    this.arrayGastos1 = [];
    this.totalCostoSeleccionado = 0;
    this.cuentaSeleccionada = [];

    this.zeusContabilidad.GetCostosCuentasxMesDetallada(datos.Anio, mes, datos.Cuenta).subscribe(data => {
      if(data.length > 0) {
        this.abrirModal2 = true;
        for(let index = 0; index < data.length; index++) {
          data[index].fecha_Grabacion = data[index].fecha_Grabacion.replace('T', ' ');
          this.totalCostoSeleccionado += data[index].valor;
          this.arrayGastos1.push(data[index]);
        }
      } else this.msj.mensajeAdvertencia(`Advertencia`, `No existen detalles de la cuenta N° ${datos.Cuenta} en el periodo seleccionado!`)
    });
    setTimeout(() => this.cuentaSeleccionada = [datos.Anio, this.cambiarNumeroAMes(mes), datos.Cuenta], 500);
  }

  cambiarNumeroAMes(mes : string) : string {
    mes == '01' ? mes = 'Enero' :
    mes == '02' ? mes = 'Febrero' :
    mes == '03' ? mes = 'Marzo' :
    mes == '04' ? mes = 'Abril' :
    mes == '05' ? mes = 'Mayo' :
    mes == '06' ? mes = 'Junio' :
    mes == '07' ? mes = 'Julio' :
    mes == '08' ? mes = 'Agosto' :
    mes == '09' ? mes = 'Septiembre' :
    mes == '10' ? mes = 'Octubre' :
    mes == '11' ? mes = 'Noviembre' :
    mes == '12' ? mes = 'Diciembre' : '';
    return mes;
  }

  // Funcion que se encargará de exportar a un archivo de excel la información de las cuentas en cada uno de los meses
  exportarExcel(){
    this.cargando = true;
    let infoDocumento : any [] = [];

    if (this.rangoFechas.length > 0) this.exportarExcel_RangoFechas();
    else {
      if (this.costo_Anio_fabricacion.length > 0) {
        this.costo_Anio_fabricacion.forEach(anio => {
          this.zeusContabilidad.GetCostosCuentas_Mes_Mes(anio.anio).subscribe(dato => {
            let title : string = `Determinación de Costos del ${anio.anio} - ${moment().format('DD-MM-YYYY')}`;
            let costos  = [dato[0], dato[1], dato[2], dato[3], dato[4], dato[5], dato[6], dato[7], dato[8], dato[9], dato[10], dato[11]].reduce((a, b) => a.concat(b));
            infoDocumento = [
              this.calcularTotalMeses([costos.filter(item => this.cuentasFabricacion.includes(item.cuenta.trim())), this.nominaFabricacion].reduce((a,b) => a.concat(b))),
              this.calcularTotalMeses([costos.filter(item => this.cuentasAdministrativos.includes(item.cuenta.trim())), this.nominaAdministrativa].reduce((a,b) => a.concat(b))),
              this.calcularTotalMeses([costos.filter(item => this.cuentasVentas.includes(item.cuenta.trim())), this.nominaVentas].reduce((a,b) => a.concat(b))),,
              this.calcularTotalMeses(costos.filter(item => this.cuentasNoOperacionesles.includes(item.cuenta.trim())))
            ].reduce((a, b) => a.concat(b));
            this.formatoExcel(title, infoDocumento);
          });
        });
      } else this.msj.mensajeAdvertencia('Debe seleccionaral menos un año', '');
    }
  }

  // Funcion que va a buscar la información que aparecerá en el excel, esta información se buscará según un rango de fechas
  exportarExcel_RangoFechas(){
    this.cargando = true;
    let fechaInicial : any = this.rangoFechas.length > 0 ? moment(this.rangoFechas[0]).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD');
    let fechaFinal : any = this.rangoFechas.length > 0 ? moment(this.rangoFechas[1]).format('YYYY-MM-DD') : fechaInicial;

    let infoDocumento : any [] = [];
    let title : string = `Determinación de Costos Desde ${moment(fechaInicial).format('MMMM').toUpperCase()} ${moment(fechaInicial).format('YYYY')} Hasta ${moment(fechaFinal).format('MMMM').toUpperCase()} ${moment(fechaFinal).format('YYYY')} - ${moment().format('DD-MM-YYYY')}`;

    this.zeusContabilidad.GetCostosCuentas_Mes_Mes_RangoFechas(fechaInicial, fechaFinal).subscribe(dato => {
      let costos  = [dato[0], dato[1], dato[2], dato[3], dato[4], dato[5], dato[6], dato[7], dato[8], dato[9], dato[10], dato[11]].reduce((a, b) => a.concat(b));
      infoDocumento = [
        this.calcularTotalMeses(costos.filter(item => this.cuentasFabricacion.includes(item.cuenta.trim()))),
        this.calcularTotalMeses(costos.filter(item => this.cuentasAdministrativos.includes(item.cuenta.trim()))),
        this.calcularTotalMeses(costos.filter(item => this.cuentasVentas.includes(item.cuenta.trim()))),
        this.calcularTotalMeses(costos.filter(item => this.cuentasNoOperacionesles.includes(item.cuenta.trim())))
      ].reduce((a, b) => a.concat(b));
      this.formatoExcel(title, infoDocumento);
    });
  }

  // Funcion que va a darle el formato y a colocarlos datos en el archivo que se exportará a excel
  formatoExcel(titulo : string, datos : any){
    const header = ['Cuentas', 'Descripción Cuentas', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre', 'Total'];
    let workbook = new Workbook();
    const imageId1 = workbook.addImage({ base64:  logoParaPdf, extension: 'png', });
    let worksheet = workbook.addWorksheet(`Determinación de Costos`);
    worksheet.addImage(imageId1, 'A1:B3');
    let titleRow = worksheet.addRow([titulo]);
    titleRow.font = { name: 'Calibri', family: 4, size: 16, underline: 'double', bold: true };
    worksheet.addRow([]);
    worksheet.addRow([]);
    let headerRow = worksheet.addRow(header);
    headerRow.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'eeeeee' } }
      cell.font = { name: 'Comic Sans MS', family: 4, size: 9, underline: true, bold: true };
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
    });
    worksheet.mergeCells('A1:O3');
    worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
    let tituloCostosFab = worksheet.addRow(['Costos Indirectos de Fabricación']);
    tituloCostosFab.eachCell(cell => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'fcffa0' } }
      cell.font = { name: 'Comic Sans MS', family: 4, size: 9, underline: true, bold: true };
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
    });
    worksheet.mergeCells('A5:O5');
    datos.forEach(d => {
      let row = worksheet.addRow(d);
      row.getCell(15).font = { name: 'Comic Sans MS', family: 4, size: 9, bold: true };
      row.getCell(15).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'cbffd3' } };
      if (d[0] == 'Totales'){
        if (d[1] != 'Gastos No Operacionales') {
          let titulo = '';
          if (d[1] == 'Costos Indirectos de Fabricación') titulo = 'Gastos de Administración y Finanzas';
          if (d[1] == 'Gastos de Administración y Finanzas') titulo = 'Gastos de Ventas';
          if (d[1] == 'Gastos de Ventas') titulo = 'Gastos No Operacionales';
          worksheet.addRow([]);
          let titulorow = worksheet.addRow([titulo]);
          titulorow.eachCell(cell => {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'fcffa0' } }
            cell.font = { name: 'Comic Sans MS', family: 4, size: 9, underline: true, bold: true };
            cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
          });
        }
        row.eachCell(cell => {
          cell.font = { name: 'Comic Sans MS', family: 4, size: 9, underline: true, bold: true };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'A2D9CE' } }
        });
      };
      row.getCell(3).numFmt = '"$"#,##0.00;[Red]\-"$"#,##0.00';
      row.getCell(4).numFmt = '"$"#,##0.00;[Red]\-"$"#,##0.00';
      row.getCell(5).numFmt = '"$"#,##0.00;[Red]\-"$"#,##0.00';
      row.getCell(6).numFmt = '"$"#,##0.00;[Red]\-"$"#,##0.00';
      row.getCell(7).numFmt = '"$"#,##0.00;[Red]\-"$"#,##0.00';
      row.getCell(8).numFmt = '"$"#,##0.00;[Red]\-"$"#,##0.00';
      row.getCell(9).numFmt = '"$"#,##0.00;[Red]\-"$"#,##0.00';
      row.getCell(10).numFmt = '"$"#,##0.00;[Red]\-"$"#,##0.00';
      row.getCell(11).numFmt = '"$"#,##0.00;[Red]\-"$"#,##0.00';
      row.getCell(12).numFmt = '"$"#,##0.00;[Red]\-"$"#,##0.00';
      row.getCell(13).numFmt = '"$"#,##0.00;[Red]\-"$"#,##0.00';
      row.getCell(14).numFmt = '"$"#,##0.00;[Red]\-"$"#,##0.00';
      row.getCell(15).numFmt = '"$"#,##0.00;[Red]\-"$"#,##0.00';
    });

    worksheet.addRow([]);
    worksheet.addRow([]);

    this.calcularTotales(datos).forEach(d => {
      let row = worksheet.addRow(d);
      row.eachCell(cell => {
        cell.font = { name: 'Comic Sans MS', family: 4, size: 9, underline: true, bold: true };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'AED6F1' } }
      });
      row.getCell(3).numFmt = '"$"#,##0.00;[Red]\-"$"#,##0.00';
      row.getCell(4).numFmt = '"$"#,##0.00;[Red]\-"$"#,##0.00';
      row.getCell(5).numFmt = '"$"#,##0.00;[Red]\-"$"#,##0.00';
      row.getCell(6).numFmt = '"$"#,##0.00;[Red]\-"$"#,##0.00';
      row.getCell(7).numFmt = '"$"#,##0.00;[Red]\-"$"#,##0.00';
      row.getCell(8).numFmt = '"$"#,##0.00;[Red]\-"$"#,##0.00';
      row.getCell(9).numFmt = '"$"#,##0.00;[Red]\-"$"#,##0.00';
      row.getCell(10).numFmt = '"$"#,##0.00;[Red]\-"$"#,##0.00';
      row.getCell(11).numFmt = '"$"#,##0.00;[Red]\-"$"#,##0.00';
      row.getCell(12).numFmt = '"$"#,##0.00;[Red]\-"$"#,##0.00';
      row.getCell(13).numFmt = '"$"#,##0.00;[Red]\-"$"#,##0.00';
      row.getCell(14).numFmt = '"$"#,##0.00;[Red]\-"$"#,##0.00';
      row.getCell(15).numFmt = '"$"#,##0.00;[Red]\-"$"#,##0.00';
    });

    worksheet.getColumn(1).width = 15;
    worksheet.getColumn(2).width = 50;
    worksheet.getColumn(3).width = 22;
    worksheet.getColumn(4).width = 22;
    worksheet.getColumn(5).width = 22;
    worksheet.getColumn(6).width = 22;
    worksheet.getColumn(7).width = 22;
    worksheet.getColumn(8).width = 22;
    worksheet.getColumn(9).width = 22;
    worksheet.getColumn(10).width = 22;
    worksheet.getColumn(11).width = 22;
    worksheet.getColumn(12).width = 22;
    worksheet.getColumn(13).width = 22;
    worksheet.getColumn(14).width = 22;
    worksheet.getColumn(15).width = 22;
    worksheet.mergeCells('A23:O23');
    worksheet.mergeCells('A69:O69');
    worksheet.mergeCells('A109:O109');
    worksheet.views = [{state: 'frozen', xSplit: 2, ySplit: 4, topLeftCell: 'G10', activeCell: 'A1'}];
    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      fs.saveAs(blob, titulo + `.xlsx`);
    });
    this.cargando = false;
    this.msj.mensajeConfirmacion(`¡Información Exportada!`, titulo);
  }

  // Funcion que va a devolver un array con los totales de cada uno de los meses para cada una de las cuentas
  calcularTotalMeses(data : any){
    let datos : any [] = [];
    let cuentas : any [] = [];
    let tituloTotal = '';

    for (let i = 0; i < data.length; i++) {
      if (!cuentas.includes(data[i].cuenta.trim())){
        cuentas.push(data[i].cuenta.trim());
        datos.push([
          data[i].cuenta.trim(),
          data[i].descripcionCuenta.trim(),
          data.filter(item => item.mes == '01' && item.cuenta.trim() == data[i].cuenta.trim()).reduce((a, b) => a + b.valor, 0),
          data.filter(item => item.mes == '02' && item.cuenta.trim() == data[i].cuenta.trim()).reduce((a, b) => a + b.valor, 0),
          data.filter(item => item.mes == '03' && item.cuenta.trim() == data[i].cuenta.trim()).reduce((a, b) => a + b.valor, 0),
          data.filter(item => item.mes == '04' && item.cuenta.trim() == data[i].cuenta.trim()).reduce((a, b) => a + b.valor, 0),
          data.filter(item => item.mes == '05' && item.cuenta.trim() == data[i].cuenta.trim()).reduce((a, b) => a + b.valor, 0),
          data.filter(item => item.mes == '06' && item.cuenta.trim() == data[i].cuenta.trim()).reduce((a, b) => a + b.valor, 0),
          data.filter(item => item.mes == '07' && item.cuenta.trim() == data[i].cuenta.trim()).reduce((a, b) => a + b.valor, 0),
          data.filter(item => item.mes == '08' && item.cuenta.trim() == data[i].cuenta.trim()).reduce((a, b) => a + b.valor, 0),
          data.filter(item => item.mes == '09' && item.cuenta.trim() == data[i].cuenta.trim()).reduce((a, b) => a + b.valor, 0),
          data.filter(item => item.mes == '10' && item.cuenta.trim() == data[i].cuenta.trim()).reduce((a, b) => a + b.valor, 0),
          data.filter(item => item.mes == '11' && item.cuenta.trim() == data[i].cuenta.trim()).reduce((a, b) => a + b.valor, 0),
          data.filter(item => item.mes == '12' && item.cuenta.trim() == data[i].cuenta.trim()).reduce((a, b) => a + b.valor, 0),
          data.filter(item => item.cuenta.trim() == data[i].cuenta.trim()).reduce((a, b) => a + b.valor, 0)
        ]);
        if ((data[i].cuenta).toString().startsWith('7')) tituloTotal = 'Costos Indirectos de Fabricación';
        else if ((data[i].cuenta).toString().startsWith('51')) tituloTotal = 'Gastos de Administración y Finanzas';
        else if ((data[i].cuenta).toString().startsWith('52')) tituloTotal = 'Gastos de Ventas';
        else if ((data[i].cuenta).toString().startsWith('53')) tituloTotal = 'Gastos No Operacionales';
      }
    }

    datos.push([
      'Totales',
      tituloTotal,
      data.filter(item => item.mes == '01').reduce((a, b) => a + b.valor, 0),
      data.filter(item => item.mes == '02').reduce((a, b) => a + b.valor, 0),
      data.filter(item => item.mes == '03').reduce((a, b) => a + b.valor, 0),
      data.filter(item => item.mes == '04').reduce((a, b) => a + b.valor, 0),
      data.filter(item => item.mes == '05').reduce((a, b) => a + b.valor, 0),
      data.filter(item => item.mes == '06').reduce((a, b) => a + b.valor, 0),
      data.filter(item => item.mes == '07').reduce((a, b) => a + b.valor, 0),
      data.filter(item => item.mes == '08').reduce((a, b) => a + b.valor, 0),
      data.filter(item => item.mes == '09').reduce((a, b) => a + b.valor, 0),
      data.filter(item => item.mes == '10').reduce((a, b) => a + b.valor, 0),
      data.filter(item => item.mes == '11').reduce((a, b) => a + b.valor, 0),
      data.filter(item => item.mes == '12').reduce((a, b) => a + b.valor, 0),
      data.reduce((a, b) => a + b.valor, 0)
    ]);
    return datos;
  }

  // Funcion que va a calcular los totales de cada uno de los meses
  calcularTotales(data : any){
    let datos : any [] = ['','',0,0,0,0,0,0,0,0,0,0,0,0,0];
    for (let i = 0; i < data.length; i++) {
      datos = [
        'Total',
        'Total Gastos Mensuales',
        datos[2] += data[i][0] != 'Totales' ? data[i][2] : 0,
        datos[3] += data[i][0] != 'Totales' ? data[i][3] : 0,
        datos[4] += data[i][0] != 'Totales' ? data[i][4] : 0,
        datos[5] += data[i][0] != 'Totales' ? data[i][5] : 0,
        datos[6] += data[i][0] != 'Totales' ? data[i][6] : 0,
        datos[7] += data[i][0] != 'Totales' ? data[i][7] : 0,
        datos[8] += data[i][0] != 'Totales' ? data[i][8] : 0,
        datos[9] += data[i][0] != 'Totales' ? data[i][9] : 0,
        datos[10] += data[i][0] != 'Totales' ? data[i][10] : 0,
        datos[11] += data[i][0] != 'Totales' ? data[i][11] : 0,
        datos[12] += data[i][0] != 'Totales' ? data[i][12] : 0,
        datos[13] += data[i][0] != 'Totales' ? data[i][13] : 0,
        datos[14] += data[i][0] == 'Totales' ? data[i][14] : 0,
      ];
    }
    return [datos];
  }
}
