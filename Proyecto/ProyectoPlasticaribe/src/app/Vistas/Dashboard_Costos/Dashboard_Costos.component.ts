import { Component, OnInit } from '@angular/core';
import moment from 'moment';
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
    setTimeout(() => this.cargando = false, 3000);
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
        let costosFabricacion = dato[0].filter(item => cuentasFacbricacion.includes(item.cuenta.trim())).concat(
          dato[1].filter(item => cuentasFacbricacion.includes(item.cuenta.trim())),
          dato[2].filter(item => cuentasFacbricacion.includes(item.cuenta.trim())),
          dato[3].filter(item => cuentasFacbricacion.includes(item.cuenta.trim())),
          dato[4].filter(item => cuentasFacbricacion.includes(item.cuenta.trim())),
          dato[5].filter(item => cuentasFacbricacion.includes(item.cuenta.trim())),
          dato[6].filter(item => cuentasFacbricacion.includes(item.cuenta.trim())),
          dato[7].filter(item => cuentasFacbricacion.includes(item.cuenta.trim())),
          dato[8].filter(item => cuentasFacbricacion.includes(item.cuenta.trim())),
          dato[9].filter(item => cuentasFacbricacion.includes(item.cuenta.trim())),
          dato[10].filter(item => cuentasFacbricacion.includes(item.cuenta.trim())),
          dato[11].filter(item => cuentasFacbricacion.includes(item.cuenta.trim())),
        );
        this.manejarDatosCostosFabricacion(costosFabricacion);

        let costosAdministrativos = dato[0].filter(item => cuentasAdministrativos.includes(item.cuenta.trim())).concat(
          dato[1].filter(item => cuentasAdministrativos.includes(item.cuenta.trim())),
          dato[2].filter(item => cuentasAdministrativos.includes(item.cuenta.trim())),
          dato[3].filter(item => cuentasAdministrativos.includes(item.cuenta.trim())),
          dato[4].filter(item => cuentasAdministrativos.includes(item.cuenta.trim())),
          dato[5].filter(item => cuentasAdministrativos.includes(item.cuenta.trim())),
          dato[6].filter(item => cuentasAdministrativos.includes(item.cuenta.trim())),
          dato[7].filter(item => cuentasAdministrativos.includes(item.cuenta.trim())),
          dato[8].filter(item => cuentasAdministrativos.includes(item.cuenta.trim())),
          dato[9].filter(item => cuentasAdministrativos.includes(item.cuenta.trim())),
          dato[10].filter(item => cuentasAdministrativos.includes(item.cuenta.trim())),
          dato[11].filter(item => cuentasAdministrativos.includes(item.cuenta.trim())),
        );
        this.manejarDatosCostosAdministrativos(costosAdministrativos);

        let costosVentas = dato[0].filter(item => cuentasVentas.includes(item.cuenta.trim())).concat(
          dato[1].filter(item => cuentasVentas.includes(item.cuenta.trim())),
          dato[2].filter(item => cuentasVentas.includes(item.cuenta.trim())),
          dato[3].filter(item => cuentasVentas.includes(item.cuenta.trim())),
          dato[4].filter(item => cuentasVentas.includes(item.cuenta.trim())),
          dato[5].filter(item => cuentasVentas.includes(item.cuenta.trim())),
          dato[6].filter(item => cuentasVentas.includes(item.cuenta.trim())),
          dato[7].filter(item => cuentasVentas.includes(item.cuenta.trim())),
          dato[8].filter(item => cuentasVentas.includes(item.cuenta.trim())),
          dato[9].filter(item => cuentasVentas.includes(item.cuenta.trim())),
          dato[10].filter(item => cuentasVentas.includes(item.cuenta.trim())),
          dato[11].filter(item => cuentasVentas.includes(item.cuenta.trim())),
        );
        this.manejarDatosCostosVentas(costosVentas);

        let costoNoOperacionales = dato[0].filter(item => cuentasNoOperacionesles.includes(item.cuenta.trim())).concat(
          dato[1].filter(item => cuentasNoOperacionesles.includes(item.cuenta.trim())),
          dato[2].filter(item => cuentasNoOperacionesles.includes(item.cuenta.trim())),
          dato[3].filter(item => cuentasNoOperacionesles.includes(item.cuenta.trim())),
          dato[4].filter(item => cuentasNoOperacionesles.includes(item.cuenta.trim())),
          dato[5].filter(item => cuentasNoOperacionesles.includes(item.cuenta.trim())),
          dato[6].filter(item => cuentasNoOperacionesles.includes(item.cuenta.trim())),
          dato[7].filter(item => cuentasNoOperacionesles.includes(item.cuenta.trim())),
          dato[8].filter(item => cuentasNoOperacionesles.includes(item.cuenta.trim())),
          dato[9].filter(item => cuentasNoOperacionesles.includes(item.cuenta.trim())),
          dato[10].filter(item => cuentasNoOperacionesles.includes(item.cuenta.trim())),
          dato[11].filter(item => cuentasNoOperacionesles.includes(item.cuenta.trim())),
        );
        this.manejarDatosCostosNoOperacionesles(costoNoOperacionales)
      });
    }
  }

  // funcion que va a manejar los datos de los costos de fabricacion
  manejarDatosCostosFabricacion(data : any){
    let costoMeses : number [] = [0,0,0,0,0,0,0,0,0,0,0,0];
    let cuentasGraficadas : string [] = [];

    for (let i = 0; i < data.length; i++) {
      if (!cuentasGraficadas.includes(data[i].cuenta.trim())) {
        cuentasGraficadas.push(data[i].cuenta.trim());
        let datosGraficas = this.obtenerDatosMes(data, data[i].cuenta);
        let cantDatos : number = 0;
        datosGraficas.forEach(datos => {
          costoMeses = [
            datos.mes == '01' && datos != null ? datos.valor : costoMeses[0],
            datos.mes == '02' && datos != null ? datos.valor : costoMeses[1],
            datos.mes == '03' && datos != null ? datos.valor : costoMeses[2],
            datos.mes == '04' && datos != null ? datos.valor : costoMeses[3],
            datos.mes == '05' && datos != null ? datos.valor : costoMeses[4],
            datos.mes == '06' && datos != null ? datos.valor : costoMeses[5],
            datos.mes == '07' && datos != null ? datos.valor : costoMeses[6],
            datos.mes == '08' && datos != null ? datos.valor : costoMeses[7],
            datos.mes == '09' && datos != null ? datos.valor : costoMeses[8],
            datos.mes == '10' && datos != null ? datos.valor : costoMeses[9],
            datos.mes == '11' && datos != null ? datos.valor : costoMeses[10],
            datos.mes == '12' && datos != null ? datos.valor : costoMeses[11],
          ];
          cantDatos++;
          if (datos.mes == '12' || cantDatos == datosGraficas.length) this.llenarGraficaCostos_Fabricacion(costoMeses, data[i].cuenta.trim());
          let info : any = { anio: this.anioSeleccionado, costo : datos.valor };
          let index2 : number = this.costo_Anio_fabricacion.findIndex(item => item.anio == this.anioSeleccionado);
          if (index2 != -1) this.costo_Anio_fabricacion[index2].costo += datos.valor;
          else this.costo_Anio_fabricacion.push(info);
        });
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
  manejarDatosCostosAdministrativos(data : any){
    let costoMeses : number [] = [0,0,0,0,0,0,0,0,0,0,0,0];
    let cuentasGraficadas : string [] = [];

    for (let i = 0; i < data.length; i++) {
      if (!cuentasGraficadas.includes(data[i].cuenta.trim())) {
        cuentasGraficadas.push(data[i].cuenta.trim());
        let datosGraficas = this.obtenerDatosMes(data, data[i].cuenta);
        let cantDatos : number = 0;
        datosGraficas.forEach(datos => {
          costoMeses = [
            datos.mes == '01' && datos != null ? datos.valor : costoMeses[0],
            datos.mes == '02' && datos != null ? datos.valor : costoMeses[1],
            datos.mes == '03' && datos != null ? datos.valor : costoMeses[2],
            datos.mes == '04' && datos != null ? datos.valor : costoMeses[3],
            datos.mes == '05' && datos != null ? datos.valor : costoMeses[4],
            datos.mes == '06' && datos != null ? datos.valor : costoMeses[5],
            datos.mes == '07' && datos != null ? datos.valor : costoMeses[6],
            datos.mes == '08' && datos != null ? datos.valor : costoMeses[7],
            datos.mes == '09' && datos != null ? datos.valor : costoMeses[8],
            datos.mes == '10' && datos != null ? datos.valor : costoMeses[9],
            datos.mes == '11' && datos != null ? datos.valor : costoMeses[10],
            datos.mes == '12' && datos != null ? datos.valor : costoMeses[11],
          ];
          cantDatos++;
          if (datos.mes == '12' || cantDatos == datosGraficas.length) this.llenarGraficaCostos_Administrativos(costoMeses, data[i].cuenta.trim());
          let info : any = { anio: this.anioSeleccionado, costo : datos.valor };
          let index2 : number = this.costo_Anio_administrativos.findIndex(item => item.anio == this.anioSeleccionado);
          if (index2 != -1) this.costo_Anio_administrativos[index2].costo += datos.valor;
          else this.costo_Anio_administrativos.push(info);
        });
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
  manejarDatosCostosVentas(data : any){
    let costoMeses : number [] = [0,0,0,0,0,0,0,0,0,0,0,0];
    let cuentasGraficadas : string [] = [];

    for (let i = 0; i < data.length; i++) {
      if (!cuentasGraficadas.includes(data[i].cuenta.trim())) {
        cuentasGraficadas.push(data[i].cuenta.trim());
        let datosGraficas = this.obtenerDatosMes(data, data[i].cuenta);
        let cantDatos : number = 0;
        datosGraficas.forEach(datos => {
          costoMeses = [
            datos.mes == '01' && datos != null ? datos.valor : costoMeses[0],
            datos.mes == '02' && datos != null ? datos.valor : costoMeses[1],
            datos.mes == '03' && datos != null ? datos.valor : costoMeses[2],
            datos.mes == '04' && datos != null ? datos.valor : costoMeses[3],
            datos.mes == '05' && datos != null ? datos.valor : costoMeses[4],
            datos.mes == '06' && datos != null ? datos.valor : costoMeses[5],
            datos.mes == '07' && datos != null ? datos.valor : costoMeses[6],
            datos.mes == '08' && datos != null ? datos.valor : costoMeses[7],
            datos.mes == '09' && datos != null ? datos.valor : costoMeses[8],
            datos.mes == '10' && datos != null ? datos.valor : costoMeses[9],
            datos.mes == '11' && datos != null ? datos.valor : costoMeses[10],
            datos.mes == '12' && datos != null ? datos.valor : costoMeses[11],
          ];
          cantDatos++;
          if (datos.mes == '12' || cantDatos == datosGraficas.length) this.llenarGraficaCostos_Ventas(costoMeses, data[i].cuenta.trim());
          let info : any = { anio: this.anioSeleccionado, costo : datos.valor };
          let index2 : number = this.costo_Anio_ventas.findIndex(item => item.anio == this.anioSeleccionado);
          if (index2 != -1) this.costo_Anio_ventas[index2].costo += datos.valor;
          else this.costo_Anio_ventas.push(info);
        });
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
  manejarDatosCostosNoOperacionesles(data : any){
    let costoMeses : number [] = [0,0,0,0,0,0,0,0,0,0,0,0];
    let cuentasGraficadas : string [] = [];

    for (let i = 0; i < data.length; i++) {
      if (!cuentasGraficadas.includes(data[i].cuenta.trim())) {
        cuentasGraficadas.push(data[i].cuenta.trim());
        let datosGraficas = this.obtenerDatosMes(data, data[i].cuenta);
        let cantDatos : number = 0;
        datosGraficas.forEach(datos => {
          costoMeses = [
            datos.mes == '01' && datos != null ? datos.valor : costoMeses[0],
            datos.mes == '02' && datos != null ? datos.valor : costoMeses[1],
            datos.mes == '03' && datos != null ? datos.valor : costoMeses[2],
            datos.mes == '04' && datos != null ? datos.valor : costoMeses[3],
            datos.mes == '05' && datos != null ? datos.valor : costoMeses[4],
            datos.mes == '06' && datos != null ? datos.valor : costoMeses[5],
            datos.mes == '07' && datos != null ? datos.valor : costoMeses[6],
            datos.mes == '08' && datos != null ? datos.valor : costoMeses[7],
            datos.mes == '09' && datos != null ? datos.valor : costoMeses[8],
            datos.mes == '10' && datos != null ? datos.valor : costoMeses[9],
            datos.mes == '11' && datos != null ? datos.valor : costoMeses[10],
            datos.mes == '12' && datos != null ? datos.valor : costoMeses[11],
          ];
          cantDatos++;
          if (datos.mes == '12' || cantDatos == datosGraficas.length) this.llenarGraficaCostos_NoOperacionesles(costoMeses, data[i].cuenta.trim());
          let info : any = { anio: this.anioSeleccionado, costo : datos.valor };
          let index2 : number = this.costo_Anio_noOperacionesles.findIndex(item => item.anio == this.anioSeleccionado);
          if (index2 != -1) this.costo_Anio_noOperacionesles[index2].costo += datos.valor;
          else this.costo_Anio_noOperacionesles.push(info);
        });
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

  // funcion que va a devolver un array con la informacion de cada uno de los meses de una misma cuenta
  obtenerDatosMes = (data : any, cuenta : string) : any[] => data.filter(item => item.cuenta == cuenta);
}
