import { Component, OnInit, ViewChild } from '@angular/core';
import moment from 'moment';
import { Table } from 'primeng/table';
import { ZeusContabilidadService } from 'src/app/Servicios/Zeus_Contabilidad/zeusContabilidad.service';
import { AppComponent } from 'src/app/app.component';

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

  constructor(private AppComponent : AppComponent,
                private zeusContabilidad : ZeusContabilidadService,){}

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
    this.buscarCostosFabricacion();
    setTimeout(() => this.cargando = false, 2000);
  }

  // Funcion que va a buscar informacion de los costos de fabricacion
  buscarCostosFabricacion(){
    let index : number = this.costo_Anio_fabricacion.findIndex(item => item.anio == this.anioSeleccionado);
    if (index == -1) {
      let cuentasFacbricacion = ['730545', '730590', '730525', '730530', '730555', '730550', '730540', '730565', '730570', '730560', '740505', '720551'];
      let cuentasAdministrativos = ['5110', '5115', '5125', '5130', '513505', '513510', '513520', '513525', '513530', '513535', '513540', '513550', '5145', '5155', '5195'];
      let cuentasVentas = ['5210', '5215', '5230', '523505', '523510', '523520', '523525', '523530', '523535', '523540', '523550', '5254', '5250', '5255', '5295'];
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

  datosAgrupados(numero : number) {
    this.graficaSeleccionada = '';
    this.abrirModal1 = true;
    this.totalCostoSeleccionado = 0;

    this.arrayAnios.push()
    //let indice : number = this.arrayCostos.findIndex(item => item.anio == this.anioSeleccionado);

    //if(indice == -1 ) {
      let cuentas7 : any[] = ['730545', '730590', '730525', '730530', '730555', '730550', '730540', '730565', '730570', '730560', '740505', '720551'];
      let cuentas51 : any[] = ['5110', '5115', '5125', '5130', '5135', '5145', '5150', '5155', '5195'];
      let cuentas52 : any[] = ['5210', '5215', '5230', '5235', '5245', '5250', '5255', '5295'];
      let cuentas53 : any[] = ['530505', '53050505', '530510', '53050510', '530515', '530525', '530535', '530595'];

         this.zeusContabilidad.GetCostosCuentas_Mes_Mes(`${this.anioSeleccionado}`).subscribe(data => {
          let gastos = [data[0], data[1], data[2], data[3], data[4], data[5], data[6], data[7], data[8], data[9], data[10], data[11]].reduce((a, b) => a.concat(b))

          if (numero == 1) {
            this.arrayCostos = [];
            let costoIndFabricacion : any = gastos.filter(item => cuentas7.includes(item.cuenta.trim()));
            this.llenarTabla(costoIndFabricacion);
            this.graficaSeleccionada = 'Costos indirectos de fabricación';
          }
          if (numero == 2) {
            this.arrayCostos = [];
            let gastosAdmon : any = gastos.filter(item => cuentas51.includes(item.cuenta.trim().substr(0,4)));
            this.llenarTabla(gastosAdmon);
            this.graficaSeleccionada = 'Gastos de administración';
           }
          if (numero == 3) {
            this.arrayCostos = [];
            let gastosVentas : any = gastos.filter(item => cuentas52.includes(item.cuenta.trim().substr(0,4)));
            this.llenarTabla(gastosVentas);
            this.graficaSeleccionada = 'Gastos de ventas'; };
          if (numero == 4) {
            this.arrayCostos = [];
             let gastoNoOperacionales : any = gastos.filter(item => cuentas53.includes(item.cuenta.trim()));
            this.llenarTabla(gastoNoOperacionales);
            this.graficaSeleccionada = 'Gastos no operacionales';
          }
        });
    //}
  }

  llenarTabla(datas : any){
    for (let index = 0; index < datas.length; index++) {
      this.cambiarNumeroAMes(datas[index]);

      this.totalCostoSeleccionado += datas[index].valor;
      this.arrayCostos.push(datas[index]);
    }
  }

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

  consultaCostosDetallados(datos : any){
    this.abrirModal2 = true;
    this.arrayGastos1 = [];
    this.totalCostoSeleccionado = 0;

    this.cambiarMesANumero(datos);

    this.zeusContabilidad.GetCostosCuentasxMesDetallada(datos.anio, datos.mes, datos.cuenta).subscribe(data => {
      for(let index = 0; index < data.length; index++) {
        data[index].fecha_Grabacion = data[index].fecha_Grabacion.replace('T', ' ')
        this.arrayGastos1.push(data[index]);
      }
    });
    setTimeout(() => { this.cambiarNumeroAMes(datos); }, 500);
  }

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
}
