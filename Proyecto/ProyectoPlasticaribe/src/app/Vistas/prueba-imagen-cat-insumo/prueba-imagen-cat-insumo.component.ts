
import moment from 'moment';
import { ZeusContabilidadService } from 'src/app/Servicios/Zeus_Contabilidad/zeusContabilidad.service';
import { AppComponent } from 'src/app/app.component';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-prueba-imagen-cat-insumo',
  templateUrl: './prueba-imagen-cat-insumo.component.html',
  styleUrls: ['./prueba-imagen-cat-insumo.component.css']
})

export class PruebaImagenCatInsumoComponent implements OnInit  {

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
  totalCostoSeleccionado : number = 0;
  @ViewChild('dt') dt: Table | undefined;
  load : boolean = false;

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

        let costos  = [dato[0], dato[1], dato[2], dato[3], dato[4], dato[5], dato[6], dato[7], dato[8], dato[9], dato[10], dato[11]].reduce((a, b) => a.concat(b));
        let costosFabricacion = costos.filter(item => cuentasFacbricacion.includes(item.cuenta.trim()));
        let costosAdministrativos = costos.filter(item => cuentasAdministrativos.includes(item.cuenta.trim()));
        let costosVentas = costos.filter(item => cuentasVentas.includes(item.cuenta.trim()));
        let costoNoOperacionales = costos.filter(item => cuentasNoOperacionesles.includes(item.cuenta.trim()));

        console.log(this.sumarDatos(costosFabricacion))

        this.manejarDatosCostosFabricacion(costosFabricacion);
        this.manejarDatosCostosAdministrativos(costosAdministrativos);
        this.manejarDatosCostosNoOperacionesles(costoNoOperacionales)
        this.manejarDatosCostosVentas(costosVentas);

        // this.datosCostosFabricacion(costosFabricacion)
        // this.datosCostosAdministrativo(costosAdministrativos)
        // this.datosCostosVentas(costosVentas)
        // this.datosCostosNoOperacionesles(costoNoOperacionales)
      });
    }
  }

  // Funcion que va a sumar todos los datos de un array de objetos utilizando reduce
  sumarDatos(data : any){
    let suma : number = data.reduce((a, b) => a + b.valor, 0);
    return suma;
  }

  // da
  datosCostosFabricacion(data : any){
    let costoMeses : number [] = [0,0,0,0,0,0,0,0,0,0,0,0];
    let cantDatos : number = 0;

    let index : number = this.costo_Anio_fabricacion.findIndex(item => item.anio == this.anioSeleccionado);
    if (index == -1) {
      for (let i = 0; i < data.length; i++) {
        costoMeses = [
          data.filter(item => item.mes == '01').reduce((a, b) => a + b.valor, 0),


          data[i].mes == '01' ? data[i].valor + costoMeses[0] : costoMeses[0],
          data[i].mes == '02' ? data[i].valor + costoMeses[1] : costoMeses[1],
          data[i].mes == '03' ? data[i].valor + costoMeses[2] : costoMeses[2],
          data[i].mes == '04' ? data[i].valor + costoMeses[3] : costoMeses[3],
          data[i].mes == '05' ? data[i].valor + costoMeses[4] : costoMeses[4],
          data[i].mes == '06' ? data[i].valor + costoMeses[5] : costoMeses[5],
          data[i].mes == '07' ? data[i].valor + costoMeses[6] : costoMeses[6],
          data[i].mes == '08' ? data[i].valor + costoMeses[7] : costoMeses[7],
          data[i].mes == '09' ? data[i].valor + costoMeses[8] : costoMeses[8],
          data[i].mes == '10' ? data[i].valor + costoMeses[9] : costoMeses[9],
          data[i].mes == '11' ? data[i].valor + costoMeses[10] : costoMeses[10],
          data[i].mes == '12' ? data[i].valor + costoMeses[11] : costoMeses[11],
        ]
        cantDatos++;
        if (cantDatos == data.length) this.llenarGraficaCostos_Fabricacion(costoMeses, 'Año');
        let info : any = { anio: this.anioSeleccionado, costo : data[i].valor };
        let index2 : number = this.costo_Anio_fabricacion.findIndex(item => item.anio == this.anioSeleccionado);
        if (index2 != -1) this.costo_Anio_fabricacion[index2].costo += data[i].valor;
        else this.costo_Anio_fabricacion.push(info);
      }
    }
  }

  datosCostosAdministrativo(data : any){
    let costoMeses : number [] = [0,0,0,0,0,0,0,0,0,0,0,0];
    let cantDatos : number = 0;
    let index : number = this.costo_Anio_administrativos.findIndex(item => item.anio == this.anioSeleccionado);
    if (index == -1) {
      for (let i = 0; i < data.length; i++) {
        costoMeses = [
          data[i].mes == '01' ? data[i].valor + costoMeses[0] : costoMeses[0],
          data[i].mes == '02' ? data[i].valor + costoMeses[1] : costoMeses[1],
          data[i].mes == '03' ? data[i].valor + costoMeses[2] : costoMeses[2],
          data[i].mes == '04' ? data[i].valor + costoMeses[3] : costoMeses[3],
          data[i].mes == '05' ? data[i].valor + costoMeses[4] : costoMeses[4],
          data[i].mes == '06' ? data[i].valor + costoMeses[5] : costoMeses[5],
          data[i].mes == '07' ? data[i].valor + costoMeses[6] : costoMeses[6],
          data[i].mes == '08' ? data[i].valor + costoMeses[7] : costoMeses[7],
          data[i].mes == '09' ? data[i].valor + costoMeses[8] : costoMeses[8],
          data[i].mes == '10' ? data[i].valor + costoMeses[9] : costoMeses[9],
          data[i].mes == '11' ? data[i].valor + costoMeses[10] : costoMeses[10],
          data[i].mes == '12' ? data[i].valor + costoMeses[11] : costoMeses[11],
        ]
        cantDatos++;
        if (cantDatos == data.length) this.llenarGraficaCostos_Administrativos(costoMeses, 'Año');
        let info : any = { anio: this.anioSeleccionado, costo : data[i].valor };
        let index2 : number = this.costo_Anio_administrativos.findIndex(item => item.anio == this.anioSeleccionado);
        if (index2 != -1) this.costo_Anio_administrativos[index2].costo += data[i].valor;
        else this.costo_Anio_administrativos.push(info);
      }
    }
  }

  datosCostosVentas(data : any){
    let costoMeses : number [] = [0,0,0,0,0,0,0,0,0,0,0,0];
    let cantDatos : number = 0;
    let index : number = this.costo_Anio_ventas.findIndex(item => item.anio == this.anioSeleccionado);
    if (index == -1) {
      for (let i = 0; i < data.length; i++) {
        costoMeses = [
          data[i].mes == '01' ? data[i].valor + costoMeses[0] : costoMeses[0],
          data[i].mes == '02' ? data[i].valor + costoMeses[1] : costoMeses[1],
          data[i].mes == '03' ? data[i].valor + costoMeses[2] : costoMeses[2],
          data[i].mes == '04' ? data[i].valor + costoMeses[3] : costoMeses[3],
          data[i].mes == '05' ? data[i].valor + costoMeses[4] : costoMeses[4],
          data[i].mes == '06' ? data[i].valor + costoMeses[5] : costoMeses[5],
          data[i].mes == '07' ? data[i].valor + costoMeses[6] : costoMeses[6],
          data[i].mes == '08' ? data[i].valor + costoMeses[7] : costoMeses[7],
          data[i].mes == '09' ? data[i].valor + costoMeses[8] : costoMeses[8],
          data[i].mes == '10' ? data[i].valor + costoMeses[9] : costoMeses[9],
          data[i].mes == '11' ? data[i].valor + costoMeses[10] : costoMeses[10],
          data[i].mes == '12' ? data[i].valor + costoMeses[11] : costoMeses[11],
        ]
        cantDatos++;
        if (cantDatos == data.length) this.llenarGraficaCostos_Ventas(costoMeses, 'Año');
        let info : any = { anio: this.anioSeleccionado, costo : data[i].valor };
        let index2 : number = this.costo_Anio_ventas.findIndex(item => item.anio == this.anioSeleccionado);
        if (index2 != -1) this.costo_Anio_ventas[index2].costo += data[i].valor;
        else this.costo_Anio_ventas.push(info);
      }
    }
  }

  datosCostosNoOperacionesles(data : any){
    let costoMeses : number [] = [0,0,0,0,0,0,0,0,0,0,0,0];
    let cantDatos : number = 0;
    let index : number = this.costo_Anio_noOperacionesles.findIndex(item => item.anio == this.anioSeleccionado);
    if (index == -1) {
      for (let i = 0; i < data.length; i++) {
        costoMeses = [
          data[i].mes == '01' ? data[i].valor + costoMeses[0] : costoMeses[0],
          data[i].mes == '02' ? data[i].valor + costoMeses[1] : costoMeses[1],
          data[i].mes == '03' ? data[i].valor + costoMeses[2] : costoMeses[2],
          data[i].mes == '04' ? data[i].valor + costoMeses[3] : costoMeses[3],
          data[i].mes == '05' ? data[i].valor + costoMeses[4] : costoMeses[4],
          data[i].mes == '06' ? data[i].valor + costoMeses[5] : costoMeses[5],
          data[i].mes == '07' ? data[i].valor + costoMeses[6] : costoMeses[6],
          data[i].mes == '08' ? data[i].valor + costoMeses[7] : costoMeses[7],
          data[i].mes == '09' ? data[i].valor + costoMeses[8] : costoMeses[8],
          data[i].mes == '10' ? data[i].valor + costoMeses[9] : costoMeses[9],
          data[i].mes == '11' ? data[i].valor + costoMeses[10] : costoMeses[10],
          data[i].mes == '12' ? data[i].valor + costoMeses[11] : costoMeses[11],
        ]
        cantDatos++;
        if (cantDatos == data.length) this.llenarGraficaCostos_NoOperacionesles(costoMeses, 'Año');
        let info : any = { anio: this.anioSeleccionado, costo : data[i].valor };
        let index2 : number = this.costo_Anio_noOperacionesles.findIndex(item => item.anio == this.anioSeleccionado);
        if (index2 != -1) this.costo_Anio_noOperacionesles[index2].costo += data[i].valor;
        else this.costo_Anio_noOperacionesles.push(info);
      }
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


consultaCostosDetallados(){
  this.arrayCostos = [];
  this.totalCostoSeleccionado = 0;
  let cuentas7 : any[] = ['730545', '730590', '730525', '730530', '730555', '730550', '730540', '730565', '730570', '730560', '740505', '720551'];
  let cuentas51 : any[] = ['5110', '5115', '5125', '5130', '5135', '5145', '5150', '5155', '5195'];
  let cuentas52 : any[] = ['5210', '5215', '5230', '5235', '5245', '5250', '5255', '5295'];
  let cuentas53 : any[] = ['530505', '53050505', '530510', '53050510', '530515', '530525', '530535', '530595'];
  let array1 : any[] = [];
  let array2 : any[] = [];
  let array3 : any[] = [];
  let array4 : any[] = [];

  this.zeusContabilidad.GetCostosCuentasxMesDetallada('2023', '06').subscribe(data => {
    for(let index = 0; index < data.length; index++) {

      array1 = cuentas7.filter(item => item.includes(data[index].id_Cuenta.trim())).concat(
        array2 = cuentas51.filter(item => item.includes(data[index].id_Cuenta.trim().substr(0,4))).concat(
          array3 = cuentas52.filter(item => item.includes(data[index].id_Cuenta.trim().substr(0,4))).concat(
            array4 = cuentas53.filter(item => item.includes(data[index].id_Cuenta.trim())))))

            console.log(array1)

      //if(cuentas7.includes(data[index].id_Cuenta.trim())) array1 = data[index];
      //if(cuentas51.includes(data[index].id_Cuenta.trim().substr(0,4))) array2 = data[index];
    }
  });
}

llenarTabla(datos : any) {
  datos.fecha_Grabacion = datos.fecha_Grabacion.replace('T', ' ')
  this.totalCostoSeleccionado += datos.valor;
  this.arrayCostos.push(datos);
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

}
