import { Component, OnInit, ViewChild } from '@angular/core';
import { ShepherdService } from 'angular-shepherd';
import moment from 'moment';
import { Table } from 'primeng/table';
import { CostosEmpresasService } from 'src/app/Servicios/CostosEmpresas/CostosEmpresas.service';
import { CreacionExcelService } from 'src/app/Servicios/CreacionExcel/CreacionExcel.service';
import { InventInicialDiaService } from 'src/app/Servicios/InvenatiorInicialMateriaPrima/inventInicialDia.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { Nomina_PlasticaribeService } from 'src/app/Servicios/Nomina_Plasticaribe/Nomina_Plasticaribe.service';
import { ZeusContabilidadService } from 'src/app/Servicios/Zeus_Contabilidad/zeusContabilidad.service';
import { AppComponent } from 'src/app/app.component';
import { defaultStepOptions, stepsDashboardCostos as defaultSteps } from 'src/app/data';

@Component({
  selector: 'app-Dashboard_Costos',
  templateUrl: './Dashboard_Costos.component.html',
  styleUrls: ['./Dashboard_Costos.component.css']
})
export class Dashboard_CostosComponent implements OnInit {

  cargando : boolean = false; //Variable para validar que salga o no la imagen de carga
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro
  anios : any [] = [2019]; //Variable que almacenará los años desde el 2019 hasta el año actual
  anioSeleccionado : number = moment().year(); //Variable que almacenará la información del año actual en princio y luego podrá cambiar a un año seleccionado
  rangoFechas : any [] = []; //Variable que almacenará la información de la fecha de inicio y la fecha de fin

  nominaAdministrativa : any [] = []; //Variable que almacenará la información de la nomina administrativa
  nominaFabricacion : any [] = []; //Variable que almacenará la información de la nomina de fabricación
  nominaVentas : any [] = []; //Variable que almacenará la información de la nomina de ventas

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

  cuentasCostosFijos = ['720551', '740505', '513510', '523510', '730525', '523525', '513525', '730530', '513530', '523530', '511595', '521595', '513505', '523505', '730555', '513555', '513535', '730505', '730575', '514515', '514525', '514540', '515005', '515015', '524515', '524520', '524525', '524540', '525015', '525095', '730540', '51559515', '52559515', '529535', '523550', '730550', '513550', '730585', '730590', '515515', '51559505', '515520', '515505', '525505', '525515', '52559505', '525520', '53050505', '530515', '519505', '529505', '511095', '521505', ];
  cuentasCostosVariables = ['513005','513010','513025','513040','513095','523010','523040','523060','523075','523095','513520','523520','529560','529560','730565','529530','519530','730570','519525','529525','513540','523540','519520','529520','521540','511515','53050510','530525','530535','530595','529565','529540','529595','512505',];

  materiasPrimasAgrupadas : any [] = []; //Variable que va a almacenar los costos de las materias primas agrupadas
  costosMateriasPrimas : any [] = []; //Variable que va a almacenar los costos de las materias primas

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
                      private costosService : CostosEmpresasService,
                        private nominaService : Nomina_PlasticaribeService,
                          private invMatPrimasService : InventInicialDiaService,
                            private excelService : CreacionExcelService,){}

  ngOnInit(): void {
    this.lecturaStorage();
    this.llenarArrayAnos();
    this.inicializarGraficas();
    this.llenarGraficas();
    setInterval(() => {
      this.modoSeleccionado = this.AppComponent.temaSeleccionado;
      this.opcionesGrafica.plugins.legend.labels.color = this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'];
      this.opcionesGrafica.scales.x.ticks.color = this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'];
      this.opcionesGrafica.scales.y.ticks.color = this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'];
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
    this.diseñoGrafica();
    this.graficaCostosFabricacion = this.formatoGraficas();
    this.graficaCostosAdministrativos = this.formatoGraficas();
    this.graficaCostosVentas = this.formatoGraficas();
    this.graficaCostosNoOperacionesles = this.formatoGraficas();
  }

  formatoGraficas(){
    return {
      labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
      datasets: []
    };
  }

  diseñoGrafica(){
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
  }

  // Funcion que va a llamar a las funciones que se encargaran de llenar las graficas
  llenarGraficas(){
    this.arrayAnios.push(`${this.anioSeleccionado}`);
    this.buscarCostosFabricacion();
    this.nominaAdministrativaPlasticaribe();
    this.nominaVentasPlasticaribe();
    this.nominaFabricacionPlasticaribe();
    this.informacionMateriasPrimas();
    setTimeout(() => this.cargando = false, 5000);
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
        this.nominaAdministrativa.push(
          this.llenarCostos(costo.anio, '01', costo.enero, '1', "NOMINA ADMINISTRACION"),
          this.llenarCostos(costo.anio, '02', costo.febrero, '1', "NOMINA ADMINISTRACION"),
          this.llenarCostos(costo.anio, '03', costo.marzo, '1', "NOMINA ADMINISTRACION"),
          this.llenarCostos(costo.anio, '04', costo.abril, '1', "NOMINA ADMINISTRACION"),
          this.llenarCostos(costo.anio, '05', costo.mayo, '1', "NOMINA ADMINISTRACION"),
          this.llenarCostos(costo.anio, '06', costo.junio, '1', "NOMINA ADMINISTRACION"),
          this.llenarCostos(costo.anio, '07', costo.julio, '1', "NOMINA ADMINISTRACION"),
          this.llenarCostos(costo.anio, '08', costo.agosto, '1', "NOMINA ADMINISTRACION"),
          this.llenarCostos(costo.anio, '09', costo.septiembre, '1', "NOMINA ADMINISTRACION"),
          this.llenarCostos(costo.anio, '10', costo.octubre, '1', "NOMINA ADMINISTRACION"),
          this.llenarCostos(costo.anio, '11', costo.noviembre, '1', "NOMINA ADMINISTRACION"),
          this.llenarCostos(costo.anio, '12', costo.diciembre, '1', "NOMINA ADMINISTRACION"),
        );
      });
    });
  }

  // Funcion que va a traer los datos de la nomina de ventas de plasticaribe
  nominaVentasPlasticaribe(){
    this.costosService.GetCostosFacturacion(this.anioSeleccionado, `NOMINA VENTAS PLASTICARIBE`).subscribe(data => {
      data.forEach(costo => {
        this.nominaVentas.push(
          this.llenarCostos(costo.anio, '01', costo.enero, '2', "NOMINA VENTAS"),
          this.llenarCostos(costo.anio, '02', costo.febrero, '2', "NOMINA VENTAS"),
          this.llenarCostos(costo.anio, '03', costo.marzo, '2', "NOMINA VENTAS"),
          this.llenarCostos(costo.anio, '04', costo.abril, '2', "NOMINA VENTAS"),
          this.llenarCostos(costo.anio, '05', costo.mayo, '2', "NOMINA VENTAS"),
          this.llenarCostos(costo.anio, '06', costo.junio, '2', "NOMINA VENTAS"),
          this.llenarCostos(costo.anio, '07', costo.julio, '2', "NOMINA VENTAS"),
          this.llenarCostos(costo.anio, '08', costo.agosto, '2', "NOMINA VENTAS"),
          this.llenarCostos(costo.anio, '09', costo.septiembre, '2', "NOMINA VENTAS"),
          this.llenarCostos(costo.anio, '10', costo.octubre, '2', "NOMINA VENTAS"),
          this.llenarCostos(costo.anio, '11', costo.noviembre, '2', "NOMINA VENTAS"),
          this.llenarCostos(costo.anio, '12', costo.diciembre, '2', "NOMINA VENTAS"),
        );
      });
    });
  }

  // Funcion que va a traer los datos de la nomina de fabricacion de plasticaribe
  nominaFabricacionPlasticaribe(){
    this.costosService.GetCostosFacturacion(this.anioSeleccionado, `NOMINA FABRICACION PLASTICARIBE`).subscribe(data => {
      data.forEach(costo => {
        this.nominaFabricacion.push(
          this.llenarCostos(costo.anio, '01', costo.enero, '3', "NOMINA FABRICACION"),
          this.llenarCostos(costo.anio, '02', costo.febrero, '3', "NOMINA FABRICACION"),
          this.llenarCostos(costo.anio, '03', costo.marzo, '3', "NOMINA FABRICACION"),
          this.llenarCostos(costo.anio, '04', costo.abril, '3', "NOMINA FABRICACION"),
          this.llenarCostos(costo.anio, '05', costo.mayo, '3', "NOMINA FABRICACION"),
          this.llenarCostos(costo.anio, '06', costo.junio, '3', "NOMINA FABRICACION"),
          this.llenarCostos(costo.anio, '07', costo.julio, '3', "NOMINA FABRICACION"),
          this.llenarCostos(costo.anio, '08', costo.agosto, '3', "NOMINA FABRICACION"),
          this.llenarCostos(costo.anio, '09', costo.septiembre, '3', "NOMINA FABRICACION"),
          this.llenarCostos(costo.anio, '10', costo.octubre, '3', "NOMINA FABRICACION"),
          this.llenarCostos(costo.anio, '11', costo.noviembre, '3', "NOMINA FABRICACION"),
          this.llenarCostos(costo.anio, '12', costo.diciembre, '3', "NOMINA FABRICACION"),
        );
      });
    });
  }

  // Funcion que va a llenar los costos de nomina
  llenarCostos(anio : any, mes : string, valor : number, cuenta : string, tipoNomina : string){
    let datos : any = {
      anio: anio.toString(),
      credito: 0,
      cuenta: cuenta,
      debito: valor,
      descripcionCuenta: tipoNomina,
      mes: mes,
      periodo : `${anio}${mes}`,
      valor : valor
    }
    return datos;
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
        } else if (numero == 2) {
          let gastosAdmon : any = [gastos.filter(item => this.cuentasAdministrativos.includes(item.cuenta.trim())), this.nominaAdministrativa].reduce((a, b) => a.concat(b));
          this.llenarTabla(gastosAdmon);
          this.graficaSeleccionada = 'Gastos de administración';
         } else if (numero == 3) {
          let gastosVentas : any = [gastos.filter(item => this.cuentasVentas.includes(item.cuenta.trim())), this.nominaVentas].reduce((a, b) => a.concat(b));
          this.llenarTabla(gastosVentas);
          this.graficaSeleccionada = 'Gastos de ventas';
        } else if (numero == 4) {
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

    if (datos.Cuenta.length == 1) {
      this.consultaMovimientosNomina(datos, mes);
    } else {
      this.zeusContabilidad.GetCostosCuentasxMesDetallada(datos.Anio, mes, datos.Cuenta).subscribe(data => {
        if (data.length > 0) {
          this.abrirModal2 = true;
          for(let index = 0; index < data.length; index++) {
            data[index].fecha_Grabacion = data[index].fecha_Grabacion.replace('T', ' ');
            this.totalCostoSeleccionado += data[index].valor;
            this.arrayGastos1.push(data[index]);
          }
        } else this.msj.mensajeAdvertencia(`Advertencia`, `No existen detalles de la cuenta N° ${datos.Cuenta} en el periodo seleccionado!`);
      });
    }
    setTimeout(() => this.cuentaSeleccionada = [datos.Anio, this.cambiarNumeroAMes(mes), datos.Cuenta], 500);
  }

  // Funcion que va a consultar los movimientos de nomina de un mes que sea seleccionado
  consultaMovimientosNomina(datos : any, mes : string){
    this.totalCostoSeleccionado = 0;
    this.nominaService.GetMovimientosNomina(parseInt(datos.Anio), parseInt(mes), parseInt(datos.Cuenta)).subscribe(data => {
      data == null ? data = 0 : data = data;
      if(data != 0) {
        this.abrirModal2 = true;
        data.forEach(costo => {
          this.arrayGastos1.push({
            fuente : costo.fuente,
            fecha_Transaccion : `${costo.fechaInicial.replace('T00:00:00', '')} - ${costo.fechaFinal.replace('T00:00:00', '')}`,
            id_Cuenta : costo.cuenta,
            cuenta : costo.cuenta,
            descripcion_Transaccion : costo.descripcion,
            valor : costo.valor,
            fecha_Grabacion : costo.fechaRegistro.replace('T00:00:00', ''),
            proveedor : costo.proveedor,
          });
          this.totalCostoSeleccionado += costo.valor;
        });
      } else this.msj.mensajeAdvertencia(`Advertencia`, `No existen detalles de la ${datos.Descripcion} en el periodo seleccionado!`)
    });
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

  // Funcion que va a mostrar la información de las materias primas en cada uno de los meses
  informacionMateriasPrimas(){
    this.invMatPrimasService.GetCostoInventarioMateriasPrimas().subscribe(data => {
      let datos : any [] = [];
      data.forEach(costos => datos.push(JSON.parse(`{${costos.replaceAll("'", '"')}}`)));
      this.costosMateriasPrimas.push(
        this.llenarCostos(datos[0].Anio, '01', parseFloat(datos[0].Enero), '4', datos[0].Nombre),
        this.llenarCostos(datos[0].Anio, '02', parseFloat(datos[0].Febrero), '4', datos[0].Nombre),
        this.llenarCostos(datos[0].Anio, '03', parseFloat(datos[0].Marzo), '4', datos[0].Nombre),
        this.llenarCostos(datos[0].Anio, '04', parseFloat(datos[0].Abril), '4', datos[0].Nombre),
        this.llenarCostos(datos[0].Anio, '05', parseFloat(datos[0].Mayo), '4', datos[0].Nombre),
        this.llenarCostos(datos[0].Anio, '06', parseFloat(datos[0].Junio), '4', datos[0].Nombre),
        this.llenarCostos(datos[0].Anio, '07', parseFloat(datos[0].Julio), '4', datos[0].Nombre),
        this.llenarCostos(datos[0].Anio, '08', parseFloat(datos[0].Agosto), '4', datos[0].Nombre),
        this.llenarCostos(datos[0].Anio, '09', parseFloat(datos[0].Septiembre), '4', datos[0].Nombre),
        this.llenarCostos(datos[0].Anio, '10', parseFloat(datos[0].Octubre), '4', datos[0].Nombre),
        this.llenarCostos(datos[0].Anio, '11', parseFloat(datos[0].Noviembre), '4', datos[0].Nombre),
        this.llenarCostos(datos[0].Anio, '12', parseFloat(datos[0].Diciembre), '4', datos[0].Nombre),

        this.llenarCostos(datos[1].Anio, '01', parseFloat(datos[1].Enero), '5', datos[1].Nombre),
        this.llenarCostos(datos[1].Anio, '02', parseFloat(datos[1].Febrero), '5', datos[1].Nombre),
        this.llenarCostos(datos[1].Anio, '03', parseFloat(datos[1].Marzo), '5', datos[1].Nombre),
        this.llenarCostos(datos[1].Anio, '04', parseFloat(datos[1].Abril), '5', datos[1].Nombre),
        this.llenarCostos(datos[1].Anio, '05', parseFloat(datos[1].Mayo), '5', datos[1].Nombre),
        this.llenarCostos(datos[1].Anio, '06', parseFloat(datos[1].Junio), '5', datos[1].Nombre),
        this.llenarCostos(datos[1].Anio, '07', parseFloat(datos[1].Julio), '5', datos[1].Nombre),
        this.llenarCostos(datos[1].Anio, '08', parseFloat(datos[1].Agosto), '5', datos[1].Nombre),
        this.llenarCostos(datos[1].Anio, '09', parseFloat(datos[1].Septiembre), '5', datos[1].Nombre),
        this.llenarCostos(datos[1].Anio, '10', parseFloat(datos[1].Octubre), '5', datos[1].Nombre),
        this.llenarCostos(datos[1].Anio, '11', parseFloat(datos[1].Noviembre), '5', datos[1].Nombre),
        this.llenarCostos(datos[1].Anio, '12', parseFloat(datos[1].Diciembre), '5', datos[1].Nombre),
      )
    });
  }

  // Funcion que se encargará de exportar a un archivo de excel la información de las cuentas en cada uno de los meses
  exportarExcel(){
    this.cargando = true;
    if (this.rangoFechas.length > 0) this.exportarExcel_RangoFechas();
    else {
      if (this.costo_Anio_fabricacion.length > 0) {
        this.costo_Anio_fabricacion.forEach(anio => {
          this.zeusContabilidad.GetCostosCuentas_Mes_Mes(anio.anio).subscribe(dato => {
            let title : string = `Determinación de Costos del ${anio.anio} - ${moment().format('DD-MM-YYYY')}`;
            let costos  = [dato[0], dato[1], dato[2], dato[3], dato[4], dato[5], dato[6], dato[7], dato[8], dato[9], dato[10], dato[11]].reduce((a, b) => a.concat(b));
            this.creacionExcel(title, this.calcularCostosTotalesExcel(costos), this.calcularCostosAgrupadosExcel(costos));
          });
        });
      } else this.msj.mensajeAdvertencia('Debe seleccionar al menos un año', '');
    }
  }

  calcularCostosAgrupadosExcel(costos : any){
    return [
      this.calcularCostosAgrupadosFijos([costos.filter(item => this.cuentasCostosFijos.includes(item.cuenta.trim())), this.nominaFabricacion, this.nominaAdministrativa, this.nominaVentas].reduce((a,b) => a.concat(b))),
      this.calcularCostosAgrupadosVariables([costos.filter(item => this.cuentasCostosVariables.includes(item.cuenta.trim()))].reduce((a,b) => a.concat(b))),
      this.calcularCostoAgrupadoMateriaPrima(this.costosMateriasPrimas)
    ].reduce((a, b) => a.concat(b));
  }

  calcularCostosTotalesExcel(costos : any){
    return [
      this.calcularTotalMeses([costos.filter(item => this.cuentasFabricacion.includes(item.cuenta.trim())), this.nominaFabricacion].reduce((a,b) => a.concat(b))),
      this.calcularTotalMeses([costos.filter(item => this.cuentasAdministrativos.includes(item.cuenta.trim())), this.nominaAdministrativa].reduce((a,b) => a.concat(b))),
      this.calcularTotalMeses([costos.filter(item => this.cuentasVentas.includes(item.cuenta.trim())), this.nominaVentas].reduce((a,b) => a.concat(b))),
      this.calcularTotalMeses(costos.filter(item => this.cuentasNoOperacionesles.includes(item.cuenta.trim()))),
      this.calcularTotalMeses(this.costosMateriasPrimas)
    ].reduce((a, b) => a.concat(b));
  }

  // Funcion que va a buscar la información que aparecerá en el excel, esta información se buscará según un rango de fechas
  exportarExcel_RangoFechas(){
    this.cargando = true;
    let fechaInicial : any = this.rangoFechas.length > 0 ? moment(this.rangoFechas[0]).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD');
    let fechaFinal : any = this.rangoFechas.length > 0 ? moment(this.rangoFechas[1]).format('YYYY-MM-DD') : fechaInicial;
    let title : string = `Determinación de Costos Desde ${moment(fechaInicial).format('MMMM').toUpperCase()} ${moment(fechaInicial).format('YYYY')} Hasta ${moment(fechaFinal).format('MMMM').toUpperCase()} ${moment(fechaFinal).format('YYYY')} - ${moment().format('DD-MM-YYYY')}`;

    this.zeusContabilidad.GetCostosCuentas_Mes_Mes_RangoFechas(fechaInicial, fechaFinal).subscribe(dato => {
      let costos  = [dato[0], dato[1], dato[2], dato[3], dato[4], dato[5], dato[6], dato[7], dato[8], dato[9], dato[10], dato[11]].reduce((a, b) => a.concat(b));
      this.creacionExcel(title, this.calcularCostosTotalesExcel(costos), this.calcularCostosAgrupadosExcel(costos));
    });
  }

  // Funcion que se encargará de crear el archivo de excel con los costos de cada uno de los meses
  creacionExcel(nombreArchivo : string, datosHojaUno : any, datosHojaDos : any){
    let titulo : string = `Determinación de Costos`;
    let fill : any = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'fcffa0' } };
    let font : any = { name: 'Comic Sans MS', family: 4, size: 9, underline: true, bold: true };
    let border : any = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    let workbook = this.excelService.formatoExcel(titulo);
    this.agregarHojaUnoExcel(workbook, fill, font, border, datosHojaUno);
    this.excelService.creacionHoja(workbook, `Consolidado de Costos`);
    this.agregarHojaDosExcel(workbook, fill, font, border, datosHojaDos);
    this.excelService.creacionExcel(nombreArchivo, workbook);
    this.cargando = false;
    this.msj.mensajeConfirmacion(`¡Información Exportada!`, titulo);
  }

  // Funcion que agregará la primera hoja al archivo de excel, a su vez esta funcion llamará a otras funciones que añadirán información a la hoja creada aquí
  agregarHojaUnoExcel(workbook, fill, font, border, datos){
    let hojaUno = workbook.worksheets[0];
    this.agregarEncabezadosExcel(hojaUno, font, border);
    hojaUno.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
    this.añadirCostosCuentas(hojaUno, fill, font, border, datos);
    this.calcularTotalesHojas(hojaUno, datos, font, 'Totales');
    let unirCeldasHoja1 : string [] = ['A1:O3', 'A6:O6', 'A24:O24', 'A70:O70', 'A110:O110', 'A119:O119'];
    this.estilosHojas(hojaUno, unirCeldasHoja1);
  }

  agregarEncabezadosExcel(worksheet, font, border){
    const header = ['Cuentas', 'Descripción Cuentas', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre', 'Total'];
    let headerRow = worksheet.addRow(header);
    headerRow.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'eeeeee' } }
      cell.font = font;
      cell.border = border;
    });
  }

  agregarTituloInicial(worksheet, fill, font, border, titulo){
    let tituloCostosFab = worksheet.addRow([titulo]);
    tituloCostosFab.eachCell(cell => {
      cell.fill = fill;
      cell.font = font;
      cell.border = border
    });
  }

  añadirCostosCuentas(worksheet, fill, font, border, datos){
    this.agregarTituloInicial(worksheet, fill, font, border, 'Costos Indirectos de Fabricación');
    datos.forEach(d => {
      let row = worksheet.addRow(d);
      row.getCell(15).font = { name: 'Comic Sans MS', family: 4, size: 9, bold: true };
      row.getCell(15).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'cbffd3' } };
      this.validarTitulosCostos(d, row, worksheet, fill, font, border);
    });
  }

  validarTitulosCostos(d, row, worksheet, fill, font, border){
    if (d[0] == 'Totales'){
      if (d[1] != 'Costos Materia Prima') {
        let titulo = '';
        if (d[1] == 'Costos Indirectos de Fabricación') titulo = 'Gastos de Administración y Finanzas';
        if (d[1] == 'Gastos de Administración y Finanzas') titulo = 'Gastos de Ventas';
        if (d[1] == 'Gastos de Ventas') titulo = 'Gastos No Operacionales';
        if (d[1] == 'Gastos No Operacionales') titulo = 'Costos Materia Prima';
        this.estiloTitulos(worksheet, titulo, fill, font, border);
      }
      this.estiloFilaTitulo(row, font);
    };
  }

  estiloTitulos(worksheet, titulo, fill, font, border){
    worksheet.addRow([]);
    let titulorow = worksheet.addRow([titulo]);
    titulorow.eachCell(cell => {
      cell.fill = fill;
      cell.font = font;
      cell.border = border;
    });
  }

  estiloFilaTitulo(row, font){
    row.eachCell(cell => {
      cell.font = font;
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'A2D9CE' } }
    });
  }

  calcularTotalesHojas(worksheet, datos, font, datoValidar){
    worksheet.addRow([]);
    worksheet.addRow([]);
    this.calcularTotales(datos, datoValidar).forEach(d => {
      let row = worksheet.addRow(d);
      row.eachCell(cell => {
        cell.font = font;
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'AED6F1' } }
      });
    });
  }

  estilosHojas(worksheet, unirCeldas : string []){
    let formatNumber : number [] = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
    formatNumber.forEach(i => worksheet.getColumn(i).numFmt = '"$"#,##0.00;[Red]\-"$"#,##0.00');
    for (let i = 1; i < 16; i++) {
      worksheet.getColumn(i).width = 22;
      worksheet.getColumn(1).width = 15;
      worksheet.getColumn(2).width = 50;
    }
    unirCeldas.forEach(cell => worksheet.mergeCells(cell));
    worksheet.views = [{state: 'frozen', xSplit: 2, ySplit: 4, topLeftCell: 'G10', activeCell: 'A1'}];
  }

  agregarHojaDosExcel(workbook, fill, font, border, datos){
    let hojaDos = workbook.worksheets[1];
    this.agregarEncabezadosExcel(hojaDos, font, border);
    hojaDos.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
    this.añadirCostosCuentasHojaDos(hojaDos, fill, font, border, datos);
    this.calcularTotalesHojas(hojaDos, datos, font, '');
    let unirCeldasHoja2 : string [] = ['A1:O3', 'A6:O6', 'A27:O27', 'A46:O46'];
    this.estilosHojas(hojaDos, unirCeldasHoja2);
  }

  añadirCostosCuentasHojaDos(worksheet, fill, font, border, datos){
    this.agregarTituloInicial(worksheet, fill, font, border, 'COSTO Y GASTOS FIJOS');
    datos.forEach(d => {
      let row = worksheet.addRow(d);
      row.getCell(15).font = { name: 'Comic Sans MS', family: 4, size: 9, bold: true };
      row.getCell(15).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'cbffd3' } };
      this.validarTitulosCostosHojaDos(d, row, worksheet, fill, font, border);
    });
  }

  validarTitulosCostosHojaDos(d, row, worksheet, fill, font, border){
    if (d[0] == ''){
      if (d[1] != 'TOTAL COSTO MATERIAS PRIMAS') {
        let titulo = '';
        if (d[1] == 'TOTAL COSTO Y GASTOS FIJOS') titulo = 'COSTO Y GASTOS VARIABLES';
        if (d[1] == 'TOTAL COSTO Y GASTOS VARIABLES') titulo = 'COSTO MATERIAS PRIMAS';
        this.estiloTitulos(worksheet, titulo, fill, font, border);
      }
      this.estiloFilaTitulo(row, font);
    };
  }

  // Funcion que va a devolver un array con los totales de cada uno de los meses para cada una de las cuentas
  calcularTotalMeses(data : any, tipoCosto : string = ''){
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
        if (tipoCosto != '') tituloTotal = tipoCosto;
        else {
          if ((data[i].cuenta).toString().startsWith('7')) tituloTotal = 'Costos Indirectos de Fabricación';
          else if ((data[i].cuenta).toString().startsWith('51')) tituloTotal = 'Gastos de Administración y Finanzas';
          else if ((data[i].cuenta).toString().startsWith('52')) tituloTotal = 'Gastos de Ventas';
          else if ((data[i].cuenta).toString().startsWith('53')) tituloTotal = 'Gastos No Operacionales';
          else if (['4','5'].includes(data[i].cuenta)) tituloTotal = 'Costos Materia Prima';
        }
      }
    }
    datos.push(this.calcularTotalesFinales(data, 'Totales', tituloTotal));
    return datos;
  }

  // Funcion que va a calcular y agrupar los cortos de cada uno de los meses de los costos fijos
  calcularCostosAgrupadosFijos(data : any []){
    let datos : any [] = [];
    let dotacionSumTrabajadores : any [] = ['720551'];
    let gastosPersonal : any [] = ['740505', '3', '2', '1', '513510', '523510'];
    let acueductoAlcantarillado : any [] = ['730525', '513525', '523525'];
    let energiaElectrica : any [] = ['730530', '513530', '523530'];
    let impAlumbradoPublico : any [] = ['511595', '521595'];
    let tasaSeguridadConvivencia : any [] = ['513505'];
    let tasaVigilancia : any [] = ['523505'];
    let gas : any [] = ['730555', '513555'];
    let telefono : any [] = ['513535'];
    let mantenimientoReparaciones : any [] = ['730505', '730575', '514515', '514525', '514540', '515005', '515015', '524515', '524520', '524525', '524540', '525015', '525095'];
    let combustible : any [] = ['730540', '51559515', '529535', '52559515'];
    let transporteFletes : any [] = ['730550', '513550', '523550'];
    let conos : any [] = ['730585', '730590'];
    let gastosViajes : any [] = ['515505', '515515', '515520', '51559505', '525505', '525515', '525520', '52559505'];
    let gravamenFinanciero : any [] = ['53050505'];
    let comisiones : any [] = ['519505', '529505', '530515'];
    let horarios : any [] = ['511095'];
    let impuestoIndustriaComercio : any [] = ['521505'];
    
    datos = [
      this.calcularCostoAgrupado(data.filter(item => dotacionSumTrabajadores.includes(item.cuenta.trim())), 'DOTACIÓN Y SUMINISTRO A TRABAJADORES', 'FIJO'),
      this.calcularCostoAgrupado(data.filter(item => gastosPersonal.includes(item.cuenta.trim())), 'GASTO DE PERSONAL', 'FIJO'),
      this.calcularCostoAgrupado(data.filter(item => acueductoAlcantarillado.includes(item.cuenta.trim())), 'ACUEDUCTO Y ALCANTARILLADO', 'FIJO'),
      this.calcularCostoAgrupado(data.filter(item => energiaElectrica.includes(item.cuenta.trim())), 'ENERGIA ELECTRICA', 'FIJO'),
      this.calcularCostoAgrupado(data.filter(item => impAlumbradoPublico.includes(item.cuenta.trim())), 'IMPUESTO ALUMBRADO PÚBLICO', 'FIJO'),
      this.calcularCostoAgrupado(data.filter(item => tasaSeguridadConvivencia.includes(item.cuenta.trim())), 'TASA DE SEGURIDAD Y CONVIVENCIA', 'FIJO'),
      this.calcularCostoAgrupado(data.filter(item => tasaVigilancia.includes(item.cuenta.trim())), 'TASA DE VIGILANCIA', 'FIJO'),
      this.calcularCostoAgrupado(data.filter(item => gas.includes(item.cuenta.trim())), 'GAS', 'FIJO'),
      this.calcularCostoAgrupado(data.filter(item => telefono.includes(item.cuenta.trim())), 'TELEFONO', 'FIJO'),
      this.calcularCostoAgrupado(data.filter(item => mantenimientoReparaciones.includes(item.cuenta.trim())), 'MANTENIMIENTO Y REPARACIONES', 'FIJO'),
      this.calcularCostoAgrupado(data.filter(item => combustible.includes(item.cuenta.trim())), 'COMBUSTIBLES Y LUBRICANTES', 'FIJO'),
      this.calcularCostoAgrupado(data.filter(item => transporteFletes.includes(item.cuenta.trim())), 'TRANSPORTES, FLETES Y ACARREOS', 'FIJO'),
      this.calcularCostoAgrupado(data.filter(item => conos.includes(item.cuenta.trim())), 'CONOS Y OTROS MATERIALES', 'FIJO'),
      this.calcularCostoAgrupado(data.filter(item => gastosViajes.includes(item.cuenta.trim())), 'GASTOS DE VIAJES', 'FIJO'),
      this.calcularCostoAgrupado(data.filter(item => gravamenFinanciero.includes(item.cuenta.trim())), 'GRAVAMEN A LOS MOVIMIENTOS FINANCIEROS', 'FIJO'),
      this.calcularCostoAgrupado(data.filter(item => comisiones.includes(item.cuenta.trim())), 'COMISIONES', 'FIJO'),
      this.calcularCostoAgrupado(data.filter(item => horarios.includes(item.cuenta.trim())), 'HONORARIOS', 'FIJO'),
      this.calcularCostoAgrupado(data.filter(item => impuestoIndustriaComercio.includes(item.cuenta.trim())), 'IMPUESTO DE INDUSTRIA Y COMERCIO', 'FIJO'),
    ].reduce((a,b) => a.concat(b));
    datos.push(this.calcularTotalesFinales(data, '', 'TOTAL COSTO Y GASTOS FIJOS'));
    return datos;  
  }

  calcularTotalesFinales(data, titulo1, titulo2){
    return [
      titulo1,
      titulo2,
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
    ]
  }

  // Funcion que va a calcular y agrupar los cortos de cada uno de los meses de los costos variables
  calcularCostosAgrupadosVariables(data : any []){
    let datos : any [] = [];
    let seguros : any [] = ['513005', '513010', '513025', '513040', '513095', '523010', '523040', '523060', '523075', '523095'];
    let procesamientoDatos : any [] = ['513520', '523520'];
    let casinoRestaurantes : any [] = ['730560', '529560'];
    let utilesPapeleria : any [] = ['730565', '519530', '529530'];
    let aseoCafeteria : any [] = ['730570', '519525', '529525'];
    let correosPortesTelegramas : any [] = ['513540', '523540'];
    let gastosRepresentacion : any [] = ['519520', '529520'];
    let impuestoVehiculos : any [] = ['521540'];
    let impuestoPropiedadRaiz : any [] = ['511515'];
    let chequera : any [] = ['53050510'];
    let diferenciaCambio : any [] = ['530525'];
    let descuentosComerciales : any [] = ['530535'];
    let otrosFinancieros : any [] = ['530595'];
    let parqueadero : any [] = ['529565'];
    let diversos : any [] = ['529540', '529595'];
    let contribuciones : any [] = ['512505'];

    datos = [
      this.calcularCostoAgrupado(data.filter(item => seguros.includes(item.cuenta.trim())), 'SEGUROS', 'VARIABLE'),
      this.calcularCostoAgrupado(data.filter(item => procesamientoDatos.includes(item.cuenta.trim())), 'PROCESAMIENTO DE DATOS', 'VARIABLE'),
      this.calcularCostoAgrupado(data.filter(item => casinoRestaurantes.includes(item.cuenta.trim())), 'CASINOS Y RESTAURANTES', 'VARIABLE'),
      this.calcularCostoAgrupado(data.filter(item => utilesPapeleria.includes(item.cuenta.trim())), 'UTILES Y PAPELERIA', 'VARIABLE'),
      this.calcularCostoAgrupado(data.filter(item => aseoCafeteria.includes(item.cuenta.trim())), 'ELEMENTOS DE ASEO Y CAFETERIA', 'VARIABLE'),
      this.calcularCostoAgrupado(data.filter(item => correosPortesTelegramas.includes(item.cuenta.trim())), 'CORREOS, PORTES Y TELEGRAMAS', 'VARIABLE'),
      this.calcularCostoAgrupado(data.filter(item => gastosRepresentacion.includes(item.cuenta.trim())), 'GASTOS DE REPRESENTACIÓN', 'VARIABLE'),
      this.calcularCostoAgrupado(data.filter(item => impuestoVehiculos.includes(item.cuenta.trim())), 'IMPUESTO DE VEHICULO', 'VARIABLE'),
      this.calcularCostoAgrupado(data.filter(item => impuestoPropiedadRaiz.includes(item.cuenta.trim())), 'IMPUESTO PROPIEDAD RAIZ', 'VARIABLE'),
      this.calcularCostoAgrupado(data.filter(item => chequera.includes(item.cuenta.trim())), 'CHEQUERAS', 'VARIABLE'),
      this.calcularCostoAgrupado(data.filter(item => diferenciaCambio.includes(item.cuenta.trim())), 'DIFERENCIA EN CAMBIO', 'VARIABLE'),
      this.calcularCostoAgrupado(data.filter(item => descuentosComerciales.includes(item.cuenta.trim())), 'DESCUENTOS COMERCIALES CONDICIONADOS', 'VARIABLE'),
      this.calcularCostoAgrupado(data.filter(item => otrosFinancieros.includes(item.cuenta.trim())), 'OTROS FINANCIEROS', 'VARIABLE'),
      this.calcularCostoAgrupado(data.filter(item => parqueadero.includes(item.cuenta.trim())), 'PARQUEADERO', 'VARIABLE'),
      this.calcularCostoAgrupado(data.filter(item => diversos.includes(item.cuenta.trim())), 'DIVERSOS', 'VARIABLE'),
      this.calcularCostoAgrupado(data.filter(item => contribuciones.includes(item.cuenta.trim())), 'CONTRIBUCIONES', 'VARIABLE'),
    ].reduce((a,b) => a.concat(b));
    datos.push(this.calcularTotalesFinales(data, '', 'TOTAL COSTO Y GASTOS VARIABLES'));
    return datos;  
  }

  // Funcion que va a calcular y agrupar los cortos de cada uno de los meses de los costos de las materias primas
  calcularCostoAgrupadoMateriaPrima(data : any []){
    let datos : any [] = [];
    datos = [this.calcularCostoAgrupado(data, 'COSTOS MATERIAS PRIMAS', 'MATERIA PRIMA')].reduce((a,b) => a.concat(b));
    datos.push(this.calcularTotalesFinales(data, '', 'TOTAL COSTO MATERIAS PRIMAS'));  
    return datos;
  }

  // funcion que va a  calcular el total del costo agrupado que le sea pasado
  calcularCostoAgrupado(data : any [], titulo : string, tipo : string){
    let datos : any [] = [];
    datos.push([
      tipo,
      titulo,
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
  calcularTotales(data : any, datoValidar : string){
    let datos : any [] = ['','',0,0,0,0,0,0,0,0,0,0,0,0,0];
    for (let i = 0; i < data.length; i++) {
      datos = [
        'Total',
        'Total Gastos Mensuales',
        datos[2] += data[i][0] != datoValidar ? data[i][2] : 0,
        datos[3] += data[i][0] != datoValidar ? data[i][3] : 0,
        datos[4] += data[i][0] != datoValidar ? data[i][4] : 0,
        datos[5] += data[i][0] != datoValidar ? data[i][5] : 0,
        datos[6] += data[i][0] != datoValidar ? data[i][6] : 0,
        datos[7] += data[i][0] != datoValidar ? data[i][7] : 0,
        datos[8] += data[i][0] != datoValidar ? data[i][8] : 0,
        datos[9] += data[i][0] != datoValidar ? data[i][9] : 0,
        datos[10] += data[i][0] != datoValidar ? data[i][10] : 0,
        datos[11] += data[i][0] != datoValidar ? data[i][11] : 0,
        datos[12] += data[i][0] != datoValidar ? data[i][12] : 0,
        datos[13] += data[i][0] != datoValidar ? data[i][13] : 0,
        datos[14] += data[i][0] == datoValidar ? data[i][14] : 0,
      ];
    }
    return [datos];
  }
}