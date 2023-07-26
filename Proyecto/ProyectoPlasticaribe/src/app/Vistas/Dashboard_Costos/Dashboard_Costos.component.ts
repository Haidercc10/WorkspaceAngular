import { Component, OnInit, ViewChild } from '@angular/core';
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';
import moment from 'moment';
import { Table } from 'primeng/table';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { ZeusContabilidadService } from 'src/app/Servicios/Zeus_Contabilidad/zeusContabilidad.service';
import { AppComponent } from 'src/app/app.component';
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
  today : any = moment().format('YYYY-MM-DD'); //Variable que va a almacenar la fecha del dia de hoy
  primerDiaMes : any = moment().startOf('month').format('YYYY-MM-DD'); //Variable que va a almacenar el primer dia del mes
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro
  anios : any [] = [2019]; //Variable que almacenará los años desde el 2019 hasta el año actual
  anioSeleccionado : number = moment().year(); //Variable que almacenará la información del año actual en princio y luego podrá cambiar a un año seleccionado
  rangoFechas : any; //Variable que almacenará la información de la fecha de inicio y la fecha de fin

  opcionesGrafica : any; //Variable que va a almacenar la opciones de cada grafica
  graficaCostosFabricacion : any; //Variable que va a almacenar los costos de fabricación
  graficaCostosAdministrativos : any; //Variable que va a almacenar los costos administrativos
  graficaCostosVentas : any; //Variable que va a almacenar los costos de ventas
  graficaCostosNoOperacionesles : any; //Variable que va a almacenar los costos no operacionesles

  costo_Anio_fabricacion : any [] = []; //Variable que va a almacenar los costos de fabricación por año
  costo_Anio_administrativos : any [] = []; //Variable que va a almacenar los costos de administrativos por año
  costo_Anio_ventas : any [] = []; //Variable que va a almacenar los costos de ventas por año
  costo_Anio_noOperacionesles : any [] = []; //Variable que va a almacenar los costos de no operacionesles por año

  arrayCostos : any = [];
  arrayGastos1 : any = [];
  totalCostoSeleccionado : number = 0;
  @ViewChild('dt') dt: Table | undefined;
  load : boolean = false;
  abrirModal1 : boolean = false;
  abrirModal2 : boolean = false;
  graficaSeleccionada : string = '';
  arrayAnios : any[] = [];
  cuentaSeleccionada : any[] = [];

  constructor(private AppComponent : AppComponent,
                private zeusContabilidad : ZeusContabilidadService,
                  private msj : MensajesAplicacionService,){}

  ngOnInit(): void {
    this.llenarArrayAnos();
    this.inicializarGraficas();
    this.llenarGraficas();
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
    this.cargando = true;
    this.arrayAnios.push(`${this.anioSeleccionado}`);
    this.buscarCostosFabricacion();
    setTimeout(() => this.cargando = false, 2000);
  }

  // Funcion que va a buscar informacion de los costos de fabricacion
  buscarCostosFabricacion(){
    let index : number = this.costo_Anio_fabricacion.findIndex(item => item.anio == this.anioSeleccionado);
    if (index == -1) {
      let cuentasFacbricacion = ['730545', '730590', '730525', '730530', '730555', '730550', '730540', '730565', '730570', '730560', '740505', '720551', '730505', '730575', '730585'];
      let cuentasAdministrativos = ['519595', '519565', '519590', '519535', '519530', '519525', '519520', '519510', '519505', '51559515', '51559505', '515520', '515515', '515505', '515095', '515015', '515005', '514540', '514525', '514515', '514510', '513595', '513555', '513550', '513545', '513540', '513535', '513530', '513525', '513520', '513515', '513510', '513505', '513095', '513040', '513025', '513010', '513005', '512505', '511595', '511515', '511510', '511095'];
      let cuentasVentas = ['529595', '529565', '529560', '529540', '529535', '529530', '529525', '529520', '529505', '52559515', '52559505', '525520', '525515', '525505', '525095', '525015', '524540', '524525', '524520', '524515', '523595', '523550', '523540', '523530', '523525', '523520', '523510', '523505', '523095', '523075', '523060', '523040', '523010', '521595', '521540', '521505'];
      let cuentasNoOperacionesles = ['53050505', '53050510', '530515', '530525', '530535', '530595'];

      this.zeusContabilidad.GetCostosCuentas_Mes_Mes(`${this.anioSeleccionado}`).subscribe(dato => {
        let costos  = [dato[0], dato[1], dato[2], dato[3], dato[4], dato[5], dato[6], dato[7], dato[8], dato[9], dato[10], dato[11]].reduce((a, b) => a.concat(b));
        let costosFabricacion = costos.filter(item => cuentasFacbricacion.includes(item.cuenta.trim()));
        let costosAdministrativos = costos.filter(item => cuentasAdministrativos.includes(item.cuenta.trim()));
        let costosVentas = costos.filter(item => cuentasVentas.includes(item.cuenta.trim()));
        let costoNoOperacionales = costos.filter(item => cuentasNoOperacionesles.includes(item.cuenta.trim()));

        this.datosCostosFabricacion(costosFabricacion);
        this.datosCostosAdministrativo(costosAdministrativos);
        this.datosCostosVentas(costosVentas);
        this.datosCostosNoOperacionesles(costoNoOperacionales);
      });
    }
  }

  // funcion que va a manejar los datos de los costos de fabricacion
  datosCostosFabricacion(data : any){
    let costoMeses : number [] = [0,0,0,0,0,0,0,0,0,0,0,0];
    let cantDatos : number = 0;

    let index : number = this.costo_Anio_fabricacion.findIndex(item => item.anio == this.anioSeleccionado);
    if (index == -1) {
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
        if (cantDatos == data.length) this.llenarGraficaCostos_Fabricacion(costoMeses, 'Año');
        let info : any = { anio: this.anioSeleccionado, costo : data[i].valor };
        let index2 : number = this.costo_Anio_fabricacion.findIndex(item => item.anio == this.anioSeleccionado);
        if (index2 != -1) this.costo_Anio_fabricacion[index2].costo = data.reduce((a, b) => a + b.valor, 0);
        else this.costo_Anio_fabricacion.push(info);
      }
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
    let index : number = this.costo_Anio_administrativos.findIndex(item => item.anio == this.anioSeleccionado);
    if (index == -1) {
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
        let info : any = { anio: this.anioSeleccionado, costo : data[i].valor };
        let index2 : number = this.costo_Anio_administrativos.findIndex(item => item.anio == this.anioSeleccionado);
        if (index2 != -1) this.costo_Anio_administrativos[index2].costo = data.reduce((a, b) => a + b.valor, 0);
        else this.costo_Anio_administrativos.push(info);
      }
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
    let index : number = this.costo_Anio_ventas.findIndex(item => item.anio == this.anioSeleccionado);
    if (index == -1) {
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
        let info : any = { anio: this.anioSeleccionado, costo : data[i].valor };
        let index2 : number = this.costo_Anio_ventas.findIndex(item => item.anio == this.anioSeleccionado);
        if (index2 != -1) this.costo_Anio_ventas[index2].costo = data.reduce((a, b) => a + b.valor, 0);
        else this.costo_Anio_ventas.push(info);
      }
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
    let index : number = this.costo_Anio_noOperacionesles.findIndex(item => item.anio == this.anioSeleccionado);
    if (index == -1) {
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
        let info : any = { anio: this.anioSeleccionado, costo : data[i].valor };
        let index2 : number = this.costo_Anio_noOperacionesles.findIndex(item => item.anio == this.anioSeleccionado);
        if (index2 != -1) this.costo_Anio_noOperacionesles[index2].costo = data.reduce((a, b) => a + b.valor, 0);
        else this.costo_Anio_noOperacionesles.push(info);
      }
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

    let cuentas7 = ['730545', '730590', '730525', '730530', '730555', '730550', '730540', '730565', '730570', '730560', '740505', '720551', '730505', '730575', '730585'];
    let cuentas51 = ['519595', '519565', '519590', '519535', '519530', '519525', '519520', '519510', '519505', '51559515', '51559505', '515520', '515515', '515505', '515095', '515015', '515005', '514540', '514525', '514515', '514510', '513595', '513555', '513550', '513545', '513540', '513535', '513530', '513525', '513520', '513515', '513510', '513505', '513095', '513040', '513025', '513010', '513005', '512505', '511595', '511515', '511510', '511095'];
    let cuentas52 = ['529595', '529565', '529560', '529540', '529535', '529530', '529525', '529520', '529505', '52559515', '52559505', '525520', '525515', '525505', '525095', '525015', '524540', '524525', '524520', '524515', '523595', '523550', '523540', '523530', '523525', '523520', '523510', '523505', '523095', '523075', '523060', '523040', '523010', '521595', '521540', '521505'];
    let cuentas53 = ['53050505', '53050510', '530515', '530525', '530535', '530595'];

    for (let index = 0; index < this.arrayAnios.length; index++) {

      this.zeusContabilidad.GetCostosCuentas_Mes_Mes(this.arrayAnios[index]).subscribe(data => {
        let gastos = [data[0], data[1], data[2], data[3], data[4], data[5], data[6], data[7], data[8], data[9], data[10], data[11]].reduce((a, b) => a.concat(b))

        if (numero == 1) {
          let costoIndFabricacion : any = gastos.filter(item => cuentas7.includes(item.cuenta.trim()));
          this.llenarTabla(costoIndFabricacion);
          this.graficaSeleccionada = 'Costos indirectos de fabricación';
        }
        if (numero == 2) {
          let gastosAdmon : any = gastos.filter(item => cuentas51.includes(item.cuenta.trim()));
          this.llenarTabla(gastosAdmon);
          this.graficaSeleccionada = 'Gastos de administración';
         }
        if (numero == 3) {
          let gastosVentas : any = gastos.filter(item => cuentas52.includes(item.cuenta.trim()));
          this.llenarTabla(gastosVentas);
          this.graficaSeleccionada = 'Gastos de ventas';
        }
        if (numero == 4) {
          let gastoNoOperacionales : any = gastos.filter(item => cuentas53.includes(item.cuenta.trim()));
          this.llenarTabla(gastoNoOperacionales);
          this.graficaSeleccionada = 'Gastos no operacionales';
        }
       });
    }
  }

  /** Función que limpiará el array de costos al  */
  limpiarArrayCostos = () => this.arrayCostos = [];

  /** Llenar la tabla del primer modal  */
  llenarTabla(datos : any){
    for (let index = 0; index < datos.length; index++) {
      this.cambiarNumeroAMes(datos[index]);

      this.totalCostoSeleccionado += datos[index].valor;
      this.arrayCostos.push(datos[index]);
    }
  }

  /** Aplicar filtro de busqueda a la tabla del primero modal. */
  aplicarfiltro($event, campo : any, valorCampo : string){
    this.dt!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);
    setTimeout(() => {
      if(this.dt.filteredValue != null) {
        this.totalCostoSeleccionado = 0;
        this.dt.filteredValue.forEach(element => { this.totalCostoSeleccionado += element.valor; });
      } else {
        this.totalCostoSeleccionado = 0;
        this.arrayCostos.forEach(element => { this.totalCostoSeleccionado += element.valor; });
      }
    }, 500);
  }

  /** Función que mostrará un segundo modal con los detalles de la cuenta en el periodo seleccionado  */
  consultaCostosDetallados(datos : any){
    this.abrirModal2 = true;
    this.arrayGastos1 = [];
    this.totalCostoSeleccionado = 0;
    this.cuentaSeleccionada = [];

    this.cambiarMesANumero(datos);

    this.zeusContabilidad.GetCostosCuentasxMesDetallada(datos.anio, datos.mes, datos.cuenta).subscribe(data => {
      for(let index = 0; index < data.length; index++) {
        data[index].fecha_Grabacion = data[index].fecha_Grabacion.replace('T', ' ')
        this.arrayGastos1.push(data[index]);
      }
    });
    setTimeout(() => { this.cambiarNumeroAMes(datos); this.cuentaSeleccionada = [datos.anio, datos.mes, datos.cuenta]; }, 500);
  }

  /** Cambiar del numero al nombre del mes */
  cambiarNumeroAMes(info : any){
      info.mes == '01' ? info.mes = 'Enero' :
      info.mes == '02' ? info.mes = 'Febrero' :
      info.mes == '03' ? info.mes = 'Marzo' :
      info.mes == '04' ? info.mes = 'Abril' :
      info.mes == '05' ? info.mes = 'Mayo' :
      info.mes == '06' ? info.mes = 'Junio' :
      info.mes == '07' ? info.mes = 'Julio' :
      info.mes == '08' ? info.mes = 'Agosto' :
      info.mes == '09' ? info.mes = 'Septiembre' :
      info.mes == '10' ? info.mes = 'Octubre' :
      info.mes == '11' ? info.mes = 'Noviembre' :
      info.mes == '12' ? info.mes = 'Diciembre' : '';
  }

  /** Cambiar del nombre del mes al número. */
  cambiarMesANumero(info : any){
    info.mes == 'Enero' ? info.mes = '01' :
    info.mes == 'Febrero' ? info.mes = '02' :
    info.mes == 'Marzo' ? info.mes = '03' :
    info.mes == 'Abril' ? info.mes = '04' :
    info.mes == 'Mayo' ? info.mes = '05' :
    info.mes == 'Junio' ? info.mes = '06' :
    info.mes == 'Julio' ? info.mes = '07' :
    info.mes == 'Agosto' ? info.mes = '08' :
    info.mes == 'Septiembre' ? info.mes = '09' :
    info.mes == 'Octubre' ? info.mes = '10' :
    info.mes == 'Noviembre' ? info.mes = '11' :
    info.mes == 'Diciembre' ? info.mes = '12' : '';
  }

  // Funcion que se encargará de exportar a un archivo de excel la información de las cuentas en cada uno de los meses
  exportarExcel(){
    this.cargando = true;
    let infoDocumento : any [] = [];
    let title : string = `Determinación de Costos`;
    let cuentasFacbricacion = ['730545', '730590', '730525', '730530', '730555', '730550', '730540', '730565', '730570', '730560', '740505', '720551', '730505', '730575', '730585'];
    let cuentasAdministrativos = ['519595', '519565', '519590', '519535', '519530', '519525', '519520', '519510', '519505', '51559515', '51559505', '515520', '515515', '515505', '515095', '515015', '515005', '514540', '514525', '514515', '514510', '513595', '513555', '513550', '513545', '513540', '513535', '513530', '513525', '513520', '513515', '513510', '513505', '513095', '513040', '513025', '513010', '513005', '512505', '511595', '511515', '511510', '511095'];
    let cuentasVentas = ['529595', '529565', '529560', '529540', '529535', '529530', '529525', '529520', '529505', '52559515', '52559505', '525520', '525515', '525505', '525095', '525015', '524540', '524525', '524520', '524515', '523595', '523550', '523540', '523530', '523525', '523520', '523510', '523505', '523095', '523075', '523060', '523040', '523010', '521595', '521540', '521505'];
    let cuentasNoOperacionesles = ['53050505', '53050510', '530515', '530525', '530535', '530595'];
    let costosIndirectosFabricacion : any [] = [];
    let gastosAdmon : any [] = [];
    let gastosVentas : any [] = [];
    let gastosNoOperacionales : any [] = [];
    const header = ['Cuentas', 'Descripción Cuentas', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre', 'Total'];

    if (this.costo_Anio_fabricacion.length > 0) {
      this.costo_Anio_fabricacion.forEach(anio => {
        this.zeusContabilidad.GetCostosCuentas_Mes_Mes(anio.anio).subscribe(dato => {
          let costos  = [dato[0], dato[1], dato[2], dato[3], dato[4], dato[5], dato[6], dato[7], dato[8], dato[9], dato[10], dato[11]].reduce((a, b) => a.concat(b));
          costosIndirectosFabricacion = this.calcularTotalMeses(costos.filter(item => cuentasFacbricacion.includes(item.cuenta.trim())));
          gastosAdmon = this.calcularTotalMeses(costos.filter(item => cuentasAdministrativos.includes(item.cuenta.trim())));
          gastosVentas = this.calcularTotalMeses(costos.filter(item => cuentasVentas.includes(item.cuenta.trim())));
          gastosNoOperacionales = this.calcularTotalMeses(costos.filter(item => cuentasNoOperacionesles.includes(item.cuenta.trim())));
          infoDocumento = [costosIndirectosFabricacion, gastosAdmon, gastosVentas, gastosNoOperacionales].reduce((a, b) => a.concat(b));

          let workbook = new Workbook();
          const imageId1 = workbook.addImage({ base64:  logoParaPdf, extension: 'png', });
          let worksheet = workbook.addWorksheet(title);
          worksheet.addImage(imageId1, 'A1:B3');
          let titleRow = worksheet.addRow([title]);
          titleRow.font = { name: 'Calibri', family: 4, size: 16, underline: 'double', bold: true };
          worksheet.addRow([]);
          worksheet.addRow([]);
          let headerRow = worksheet.addRow(header);
          headerRow.eachCell((cell) => {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'eeeeee' }
            }
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
          infoDocumento.forEach(d => {
            let row = worksheet.addRow(d);
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
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'cbffd3' } }
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
          worksheet.mergeCells('A22:O22');
          worksheet.mergeCells('A67:O67');
          worksheet.mergeCells('A106:O106');
          setTimeout(() => {
            workbook.xlsx.writeBuffer().then((data) => {
              let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
              fs.saveAs(blob, title + `.xlsx`);
            });
            this.cargando = false
            this.msj.mensajeConfirmacion(`¡Información Exportada!`, title);
          }, 1000);
        });
      });
    } else this.msj.mensajeAdvertencia('Debe seleccionaral menos un año', '');
  }

  // Funcion que va a devolver un objeto con los totales de cada uno de los meses
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
}
