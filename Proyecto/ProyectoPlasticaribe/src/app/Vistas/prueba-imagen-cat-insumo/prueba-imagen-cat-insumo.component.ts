import { Component, OnInit } from '@angular/core';
import { ShepherdService } from 'angular-shepherd';
import moment from 'moment';
import { CostosEmpresasService } from 'src/app/Servicios/CostosEmpresas/CostosEmpresas.service';
import { InventInicialDiaService } from 'src/app/Servicios/InvenatiorInicialMateriaPrima/inventInicialDia.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { Nomina_PlasticaribeService } from 'src/app/Servicios/Nomina_Plasticaribe/Nomina_Plasticaribe.service';
import { ZeusContabilidadService } from 'src/app/Servicios/Zeus_Contabilidad/zeusContabilidad.service';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-prueba-imagen-cat-insumo',
  templateUrl: './prueba-imagen-cat-insumo.component.html',
  styleUrls: ['./prueba-imagen-cat-insumo.component.css']
})

export class PruebaImagenCatInsumoComponent implements OnInit {

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


  constructor(private AppComponent : AppComponent,
    private msj : MensajesAplicacionService,
      private shepherdService: ShepherdService,
        private zeusContabilidad : ZeusContabilidadService,
          private costosService : CostosEmpresasService,
            private nominaService : Nomina_PlasticaribeService,
              private invMatPrimasService : InventInicialDiaService){}

  ngOnInit(): void {
    this.lecturaStorage();
    this.llenarArrayAnos();
    this.inicializarGraficas();
    setInterval(() => {
      this.modoSeleccionado = this.AppComponent.temaSeleccionado;
      this.opcionesGrafica.plugins.legend.labels.color = this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'];
      this.opcionesGrafica.scales.x.ticks.color = this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'];
      this.opcionesGrafica.scales.y.ticks.color = this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'];
    }, 1000);
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
    this.buscarCostosFabricacion();
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
      });
    } else this.msj.mensajeAdvertencia(`¡El año seleccionado ya ha sido graficado!`, ``);
  }

}