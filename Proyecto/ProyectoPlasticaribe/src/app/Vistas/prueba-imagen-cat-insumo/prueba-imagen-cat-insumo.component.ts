
import moment from 'moment';
import { ZeusContabilidadService } from 'src/app/Servicios/Zeus_Contabilidad/zeusContabilidad.service';
import { AppComponent } from 'src/app/app.component';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { logoParaPdf } from 'src/app/logoPlasticaribe_Base64';
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';

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
  arrayGastos1 : any = [];
  totalCostoSeleccionado : number = 0;
  @ViewChild('dt') dt: Table | undefined;
  load : boolean = false;
  abrirModal1 : boolean = false;
  abrirModal2 : boolean = false;
  totalMes : any = [];
  arrayTotales : any[] = [];

  constructor(private AppComponent : AppComponent,
                private zeusContabilidad : ZeusContabilidadService,
                  private msj : MensajesAplicacionService,){}

  ngOnInit(): void {
    this.llenarArrayAnos();
    this.inicializarGraficas();
    this.llenarGraficas();
    this.datasAgrupados(1);
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

      this.zeusContabilidad.GetCostosCuentas_Mes_Mes(`${this.anioSeleccionado}`).subscribe(data => {

        let costos  = [data[0], data[1], data[2], data[3], data[4], data[5], data[6], data[7], data[8], data[9], data[10], data[11]].reduce((a, b) => a.concat(b));
        let costosFabricacion = costos.filter(item => cuentasFacbricacion.includes(item.cuenta.trim()));
        let costosAdministrativos = costos.filter(item => cuentasAdministrativos.includes(item.cuenta.trim()));
        let costosVentas = costos.filter(item => cuentasVentas.includes(item.cuenta.trim()));
        let costoNoOperacionales = costos.filter(item => cuentasNoOperacionesles.includes(item.cuenta.trim()));

        //console.log(this.sumarDatos(costosFabricacion))

        this.manejarDatosCostosFabricacion(costosFabricacion);
        this.manejarDatosCostosAdministrativos(costosAdministrativos);
        this.manejarDatosCostosNoOperacionesles(costoNoOperacionales)
        this.manejarDatosCostosVentas(costosVentas);

        // this.datasCostosFabricacion(costosFabricacion)
        // this.datasCostosAdministrativo(costosAdministrativos)
        // this.datasCostosVentas(costosVentas)
        // this.datasCostosNoOperacionesles(costoNoOperacionales)
      });
    }
  }

  // Funcion que va a sumar todos los datas de un array de objetos utilizando reduce
  sumarDatos(data : any){
    let suma : number = data.reduce((a, b) => a + b.valor, 0);
    return suma;
  }

  // da
  datasCostosFabricacion(data : any){
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

  datasCostosAdministrativo(data : any){
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

  datasCostosVentas(data : any){
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

  datasCostosNoOperacionesles(data : any){
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

  // funcion que va a manejar los datas de los costos de fabricacion
  manejarDatosCostosFabricacion(data : any){
    let costoMeses : number [] = [0,0,0,0,0,0,0,0,0,0,0,0];
    let cuentasGraficadas : string [] = [];

    for (let i = 0; i < data.length; i++) {
      if (!cuentasGraficadas.includes(data[i].cuenta.trim())) {
        cuentasGraficadas.push(data[i].cuenta.trim());
        let datasGraficas = this.obtenerDatosMes(data, data[i].cuenta);
        let cantDatos : number = 0;
        datasGraficas.forEach(datas => {
          costoMeses = [
            datas.mes == '01' && datas != null ? datas.valor : costoMeses[0],
            datas.mes == '02' && datas != null ? datas.valor : costoMeses[1],
            datas.mes == '03' && datas != null ? datas.valor : costoMeses[2],
            datas.mes == '04' && datas != null ? datas.valor : costoMeses[3],
            datas.mes == '05' && datas != null ? datas.valor : costoMeses[4],
            datas.mes == '06' && datas != null ? datas.valor : costoMeses[5],
            datas.mes == '07' && datas != null ? datas.valor : costoMeses[6],
            datas.mes == '08' && datas != null ? datas.valor : costoMeses[7],
            datas.mes == '09' && datas != null ? datas.valor : costoMeses[8],
            datas.mes == '10' && datas != null ? datas.valor : costoMeses[9],
            datas.mes == '11' && datas != null ? datas.valor : costoMeses[10],
            datas.mes == '12' && datas != null ? datas.valor : costoMeses[11],
          ];
          cantDatos++;
          if (datas.mes == '12' || cantDatos == datasGraficas.length) this.llenarGraficaCostos_Fabricacion(costoMeses, data[i].cuenta.trim());
          let info : any = { anio: this.anioSeleccionado, costo : datas.valor };
          let index2 : number = this.costo_Anio_fabricacion.findIndex(item => item.anio == this.anioSeleccionado);
          if (index2 != -1) this.costo_Anio_fabricacion[index2].costo += datas.valor;
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

  // Funcion que va a manejar los datasde los costos administrativos
  manejarDatosCostosAdministrativos(data : any){
    let costoMeses : number [] = [0,0,0,0,0,0,0,0,0,0,0,0];
    let cuentasGraficadas : string [] = [];

    for (let i = 0; i < data.length; i++) {
      if (!cuentasGraficadas.includes(data[i].cuenta.trim())) {
        cuentasGraficadas.push(data[i].cuenta.trim());
        let datasGraficas = this.obtenerDatosMes(data, data[i].cuenta);
        let cantDatos : number = 0;
        datasGraficas.forEach(datas => {
          costoMeses = [
            datas.mes == '01' && datas != null ? datas.valor : costoMeses[0],
            datas.mes == '02' && datas != null ? datas.valor : costoMeses[1],
            datas.mes == '03' && datas != null ? datas.valor : costoMeses[2],
            datas.mes == '04' && datas != null ? datas.valor : costoMeses[3],
            datas.mes == '05' && datas != null ? datas.valor : costoMeses[4],
            datas.mes == '06' && datas != null ? datas.valor : costoMeses[5],
            datas.mes == '07' && datas != null ? datas.valor : costoMeses[6],
            datas.mes == '08' && datas != null ? datas.valor : costoMeses[7],
            datas.mes == '09' && datas != null ? datas.valor : costoMeses[8],
            datas.mes == '10' && datas != null ? datas.valor : costoMeses[9],
            datas.mes == '11' && datas != null ? datas.valor : costoMeses[10],
            datas.mes == '12' && datas != null ? datas.valor : costoMeses[11],
          ];
          cantDatos++;
          if (datas.mes == '12' || cantDatos == datasGraficas.length) this.llenarGraficaCostos_Administrativos(costoMeses, data[i].cuenta.trim());
          let info : any = { anio: this.anioSeleccionado, costo : datas.valor };
          let index2 : number = this.costo_Anio_administrativos.findIndex(item => item.anio == this.anioSeleccionado);
          if (index2 != -1) this.costo_Anio_administrativos[index2].costo += datas.valor;
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

  // Funcion que va a manejar los datasde los costos de ventas
  manejarDatosCostosVentas(data : any){
    let costoMeses : number [] = [0,0,0,0,0,0,0,0,0,0,0,0];
    let cuentasGraficadas : string [] = [];

    for (let i = 0; i < data.length; i++) {
      if (!cuentasGraficadas.includes(data[i].cuenta.trim())) {
        cuentasGraficadas.push(data[i].cuenta.trim());
        let datasGraficas = this.obtenerDatosMes(data, data[i].cuenta);
        let cantDatos : number = 0;
        datasGraficas.forEach(datas => {
          costoMeses = [
            datas.mes == '01' && datas != null ? datas.valor : costoMeses[0],
            datas.mes == '02' && datas != null ? datas.valor : costoMeses[1],
            datas.mes == '03' && datas != null ? datas.valor : costoMeses[2],
            datas.mes == '04' && datas != null ? datas.valor : costoMeses[3],
            datas.mes == '05' && datas != null ? datas.valor : costoMeses[4],
            datas.mes == '06' && datas != null ? datas.valor : costoMeses[5],
            datas.mes == '07' && datas != null ? datas.valor : costoMeses[6],
            datas.mes == '08' && datas != null ? datas.valor : costoMeses[7],
            datas.mes == '09' && datas != null ? datas.valor : costoMeses[8],
            datas.mes == '10' && datas != null ? datas.valor : costoMeses[9],
            datas.mes == '11' && datas != null ? datas.valor : costoMeses[10],
            datas.mes == '12' && datas != null ? datas.valor : costoMeses[11],
          ];
          cantDatos++;
          if (datas.mes == '12' || cantDatos == datasGraficas.length) this.llenarGraficaCostos_Ventas(costoMeses, data[i].cuenta.trim());
          let info : any = { anio: this.anioSeleccionado, costo : datas.valor };
          let index2 : number = this.costo_Anio_ventas.findIndex(item => item.anio == this.anioSeleccionado);
          if (index2 != -1) this.costo_Anio_ventas[index2].costo += datas.valor;
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

  // Funcion que va a manejar los datasde los costos de no operacionesles
  manejarDatosCostosNoOperacionesles(data : any){
    let costoMeses : number [] = [0,0,0,0,0,0,0,0,0,0,0,0];
    let cuentasGraficadas : string [] = [];

    for (let i = 0; i < data.length; i++) {
      if (!cuentasGraficadas.includes(data[i].cuenta.trim())) {
        cuentasGraficadas.push(data[i].cuenta.trim());
        let datasGraficas = this.obtenerDatosMes(data, data[i].cuenta);
        let cantDatos : number = 0;
        datasGraficas.forEach(datas => {
          costoMeses = [
            datas.mes == '01' && datas != null ? datas.valor : costoMeses[0],
            datas.mes == '02' && datas != null ? datas.valor : costoMeses[1],
            datas.mes == '03' && datas != null ? datas.valor : costoMeses[2],
            datas.mes == '04' && datas != null ? datas.valor : costoMeses[3],
            datas.mes == '05' && datas != null ? datas.valor : costoMeses[4],
            datas.mes == '06' && datas != null ? datas.valor : costoMeses[5],
            datas.mes == '07' && datas != null ? datas.valor : costoMeses[6],
            datas.mes == '08' && datas != null ? datas.valor : costoMeses[7],
            datas.mes == '09' && datas != null ? datas.valor : costoMeses[8],
            datas.mes == '10' && datas != null ? datas.valor : costoMeses[9],
            datas.mes == '11' && datas != null ? datas.valor : costoMeses[10],
            datas.mes == '12' && datas != null ? datas.valor : costoMeses[11],
          ];
          cantDatos++;
          if (datas.mes == '12' || cantDatos == datasGraficas.length) this.llenarGraficaCostos_NoOperacionesles(costoMeses, data[i].cuenta.trim());
          let info : any = { anio: this.anioSeleccionado, costo : datas.valor };
          let index2 : number = this.costo_Anio_noOperacionesles.findIndex(item => item.anio == this.anioSeleccionado);
          if (index2 != -1) this.costo_Anio_noOperacionesles[index2].costo += datas.valor;
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

  consultaCostosDetallados(datos : any, mes : string){
    this.abrirModal2 = true;
    this.arrayGastos1 = [];
    this.totalCostoSeleccionado = 0;

    this.zeusContabilidad.GetCostosCuentasxMesDetallada(datos.Anio, mes, datos.Cuenta).subscribe(data => {
      for(let index = 0; index < data.length; index++) {
        data[index].fecha_Grabacion = data[index].fecha_Grabacion.replace('T', ' ');
        this.arrayGastos1.push(data[index]);
      }
    });
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

  datasAgrupados(numero : number) {
    let arrayAnios : any[] = ['2023', '2022'];
    this.cargando = true;
    let cuentas7 : any[] = ['730545', '730590', '730525', '730530', '730555', '730550', '730540', '730565', '730570', '730560', '740505', '720551'];
    let cuentas51 : any[] = ['5110', '5115', '5125', '5130', '5135', '5145', '5150', '5155', '5195'];
    let cuentas52 : any[] = ['5210', '5215', '5230', '5235', '5245', '5250', '5255', '5295'];
    let cuentas53 : any[] = ['530505', '53050505', '530510', '53050510', '530515', '530525', '530535', '530595'];

    for (let index = 0; index < arrayAnios.length; index++) {
      this.zeusContabilidad.GetCostosCuentas_Mes_Mes(arrayAnios[index]).subscribe(data => {
        let gastos : any[] = [data[0], data[1], data[2], data[3], data[4], data[5], data[6], data[7], data[8], data[9], data[10], data[11]].reduce((a, b) => a.concat(b))
        let costoIndFabricacion : any = gastos.filter(item => cuentas7.includes(item.cuenta.trim()));
        let gastosAdmon : any = gastos.filter(item => cuentas51.includes(item.cuenta.trim().substr(0,4)));
        let gastosVentas : any = gastos.filter(item => cuentas52.includes(item.cuenta.trim().substr(0,4)));
        let gastoNoOperacionales : any = gastos.filter(item => cuentas53.includes(item.cuenta.trim()));

        if (numero == 1) this.llenarTabla(costoIndFabricacion);
        if (numero == 2) this.llenarTabla(gastosAdmon);
        if (numero == 3) this.llenarTabla(gastosVentas);
        if (numero == 4) this.llenarTabla(gastoNoOperacionales);
      }, error => {console.log(error)});
    }

    setTimeout(() => { this.cargando = false; }, 2000);
  }

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
}
