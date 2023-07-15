import { Component, OnInit } from '@angular/core';
import moment from 'moment';
import { InventInicialDiaService } from 'src/app/Servicios/InvenatiorInicialMateriaPrima/inventInicialDia.service';
import { InventarioZeusService } from 'src/app/Servicios/InventarioZeus/inventario-zeus.service';
import { Inventario_Mes_ProductosService } from 'src/app/Servicios/Inventario_Mes_Productos/Inventario_Mes_Productos.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { ZeusContabilidadService } from 'src/app/Servicios/Zeus_Contabilidad/zeusContabilidad.service';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-Dashboard_General',
  templateUrl: './Dashboard_General.component.html',
  styleUrls: ['./Dashboard_General.component.css']
})
export class Dashboard_GeneralComponent implements OnInit {

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

  opcionesGrafica : any;
  opcionesGrafica_Pagar : any;
  graficaFacturacion : any;
  graficaCuentas_Cobrar : any;
  graficaCuentas_Pagar_Plasticaribe : any;
  graficaCuentas_Pagar_Invergoal : any;
  graficaCuentas_Pagar_Inversuez : any;
  graficaCompras_Plasticaribe : any;
  graficaCompras_Invergoal : any;
  graficaCompras_Inversuez : any;
  graficaInventario_MatPrima : any;
  graficaInventario_Productos : any;

  facturadoAnios : any [] = []; //Funcion que va a almacenar el año y la cantidad facturada. almacenará cada uno de los años que se grafiquen
  cuentas_Cobrar_Anios : any [] = []; //Funcion que va a almacenar el año y la cantidad facturada almacenará cada uno de los años que se grafiquen
  cuentas_Pagar_Anios_Plasticaribe : any [] = []; //Funcion que va a almacenar el año y la cantidad facturada almacenará cada uno de los años que se grafiquen
  cuentas_Pagar_Anios_Invergoal : any [] = []; //Funcion que va a almacenar el año y la cantidad facturada almacenará cada uno de los años que se grafiquen
  cuentas_Pagar_Anios_Inversuez : any [] = []; //Funcion que va a almacenar el año y la cantidad facturada almacenará cada uno de los años que se grafiquen
  compras_Anios_Plasticaribe : any [] = []; //Funcion que va a almacenar el año y la cantidad facturada almacenará cada uno de los años que se grafiquen
  compras_Anios_Invergoal : any [] = []; //Funcion que va a almacenar el año y la cantidad facturada almacenará cada uno de los años que se grafiquen
  compras_Anios_Inversuez : any [] = []; //Funcion que va a almacenar el año y la cantidad facturada almacenará cada uno de los años que se grafiquen
  inventarioMatPrima_Anios : any [] = []; //Funcion que va a almacenar el año y la cantidad facturada almacenará cada uno de los años que se grafiquen
  inventarioProductos_Anios : any [] = []; //Funcion que va a almacenar el año y la cantidad facturada almacenará cada uno de los años que se grafiquen

  constructor(private AppComponent : AppComponent,
                private zeusService : InventarioZeusService,
                  private msj : MensajesAplicacionService,
                    private zeusContabilidad : ZeusContabilidadService,
                      private inventarioMatPrima : InventInicialDiaService,
                        private inventarioProductos : Inventario_Mes_ProductosService) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
  }

  ngOnInit() {
    this.inicializarGraficas();
    this.llenarArrayAnos();
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

  // Funcion que va a inicializar cada una de las graficas
  inicializarGraficas(){
    this.facturadoAnios = [];
    this.cuentas_Cobrar_Anios = [];
    this.cuentas_Pagar_Anios_Plasticaribe = [];
    this.cuentas_Pagar_Anios_Invergoal = [];
    this.cuentas_Pagar_Anios_Inversuez = [];
    this.compras_Anios_Plasticaribe = [];
    this.compras_Anios_Invergoal = [];
    this.compras_Anios_Inversuez = [];
    this.inventarioMatPrima_Anios = [];
    this.inventarioProductos_Anios = [];
    
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
    this.opcionesGrafica_Pagar = {
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
          max : 0
        },
      },
      datalabels: { anchor: 'end', align: 'end' }
    };
    
    this.graficaFacturacion = {
      labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
      datasets: []
    };
    
    this.graficaCuentas_Cobrar = {
      labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
      datasets: []
    };
    
    this.graficaCuentas_Pagar_Plasticaribe = {
      labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
      datasets: []
    };
    
    this.graficaCuentas_Pagar_Invergoal = {
      labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
      datasets: []
    };
    
    this.graficaCuentas_Pagar_Inversuez = {
      labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
      datasets: []
    };
    
    this.graficaCompras_Plasticaribe = {
      labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
      datasets: []
    };
    
    this.graficaCompras_Invergoal = {
      labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
      datasets: []
    };
    
    this.graficaCompras_Inversuez = {
      labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
      datasets: []
    };
    
    this.graficaInventario_MatPrima = {
      labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
      datasets: []
    };
    
    this.graficaInventario_Productos = {
      labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
      datasets: []
    };
  }

  // Funcion que va a llamar a las funciones que se encargaran de llenar las graficas
  llenarGraficas(){
    this.cargando = true;
    this.BuscarDatosGraficaFacturacion();
    // this.BuscarDatosGraficaCuentas_Cobrar();
    this.BuscarDatosGraficaCuentas_Pagar();
    this.BuscarDatosGrafica_Compras();
    this.BuscarDatosGraficaInventario_MatPrima();
    this.BuscarDatosGraficaInventario_Producto();
    setTimeout(() => this.cargando = false, 3000);
  }

  // Funcion que va a buscar los datos que trandrá la grafica de facturacion
  BuscarDatosGraficaFacturacion(){
    let index : number = this.facturadoAnios.findIndex(item => item.anio == this.anioSeleccionado);
    if (index == -1) {
      let costoMeses : number [] = [0,0,0,0,0,0,0,0,0,0,0,0];
      for (let i = 0; i < 12; i++) {
        let mes : string = `${i + 1}`.length == 1 ? `0${i + 1}` : `${i + 1}`;
        this.zeusService.GetFacturacionTodosMeses(mes, this.anioSeleccionado).subscribe(datos_facturacion => {
          costoMeses = [
            i == 0 ? datos_facturacion : costoMeses[0],
            i == 1 ? datos_facturacion : costoMeses[1],
            i == 2 ? datos_facturacion : costoMeses[2],
            i == 3 ? datos_facturacion : costoMeses[3],
            i == 4 ? datos_facturacion : costoMeses[4],
            i == 5 ? datos_facturacion : costoMeses[5],
            i == 6 ? datos_facturacion : costoMeses[6],
            i == 7 ? datos_facturacion : costoMeses[7],
            i == 8 ? datos_facturacion : costoMeses[8],
            i == 9 ? datos_facturacion : costoMeses[9],
            i == 10 ? datos_facturacion : costoMeses[10],
            i == 11 ? datos_facturacion : costoMeses[11],
          ];
          if (i == 11) this.llenarGraficaFacturacion(costoMeses);
          let info : any = { anio: this.anioSeleccionado, costo: datos_facturacion };
          let index2 : number = this.facturadoAnios.findIndex(item => item.anio == this.anioSeleccionado);
          if (index2 != -1) this.facturadoAnios[index2].costo += datos_facturacion;
          else this.facturadoAnios.push(info);
        });
      }
    } else this.msj.mensajeAdvertencia(`¡El año seleccionado ya ha sido graficado!`, ``);
  }

  // Funcion que va a llenar la grafica de facturacion
  llenarGraficaFacturacion(data){
    let color : string = "#"+((1<<24)*Math.random()|0).toString(16);
    let info : any = {
      label: `Año ${this.anioSeleccionado}`,
      data: data,
      yAxisID: 'y',
      borderColor: color.substring(0, 4),
      backgroundColor: color.substring(0, 4) + "2",
      pointStyle: 'rectRot',
      pointRadius: 10,
      pointHoverRadius: 15,
      fill : true,
      tension: 0.3
    };
    this.graficaFacturacion.datasets.push(info);
  }

  // Funcion que va a buscar los datos que trandrá la grafica de cuentas por cobrar
  BuscarDatosGraficaCuentas_Cobrar(){
    let index : number = this.cuentas_Cobrar_Anios.findIndex(item => item.anio == this.anioSeleccionado);
    if (index == -1) {
      let costoMeses : number [] = [0,0,0,0,0,0,0,0,0,0,0,0];
      for (let i = 0; i < 12; i++) {
        let mes : string = `${i + 1}`.length == 1 ? `0${i + 1}` : `${i + 1}`;
        this.zeusContabilidad.GetCartera_Anio_Mes(this.anioSeleccionado.toString(), mes).subscribe(dato => {
          costoMeses = [
            i == 0 ? dato : costoMeses[0],
            i == 1 ? dato : costoMeses[1],
            i == 2 ? dato : costoMeses[2],
            i == 3 ? dato : costoMeses[3],
            i == 4 ? dato : costoMeses[4],
            i == 5 ? dato : costoMeses[5],
            i == 6 ? dato : costoMeses[6],
            i == 7 ? dato : costoMeses[7],
            i == 8 ? dato : costoMeses[8],
            i == 9 ? dato : costoMeses[9],
            i == 10 ? dato : costoMeses[10],
            i == 11 ? dato : costoMeses[11],
          ];
          if (i == 11) this.llenarGraficaCuentas_Cobrar(costoMeses);
          let info : any = { anio: this.anioSeleccionado, costo : dato };
          let index2 : number = this.cuentas_Cobrar_Anios.findIndex(item => item.anio == this.anioSeleccionado);
          if (index2 != -1) this.cuentas_Cobrar_Anios[index2].costo += dato;
          else this.cuentas_Cobrar_Anios.push(info);
        });
      }
    }
  }

  // Funcion que va a llenar la grafica de facturacion
  llenarGraficaCuentas_Cobrar(data){
    let color : string = "#"+((1<<24)*Math.random()|0).toString(16);
    let info : any = {
      label: `Año ${this.anioSeleccionado}`,
      data: data,
      yAxisID: 'y',
      borderColor: color.substring(0, 4),
      backgroundColor: color.substring(0, 4) + "2",
      pointStyle: 'rectRot',
      pointRadius: 10,
      pointHoverRadius: 15,
      fill : true,
      tension: 0.3
    };
    this.graficaCuentas_Cobrar.datasets.push(info);
  }

  // Funcion que va a buscar los datos que trandrá la grafica de cuentas por pagar
  BuscarDatosGraficaCuentas_Pagar(){
    let index : number = this.cuentas_Pagar_Anios_Plasticaribe.findIndex(item => item.anio == this.anioSeleccionado);
    if (index == -1) {
      let costoMeses_Plasticaribe : number [] = [0,0,0,0,0,0,0,0,0,0,0,0];      
      let costoMeses_Invergoal : number [] = [0,0,0,0,0,0,0,0,0,0,0,0];
      let costoMeses_Inversuez : number [] = [0,0,0,0,0,0,0,0,0,0,0,0];
      this.zeusContabilidad.GetCostosProveedores_Mes_Mes(this.anioSeleccionado.toString(), '220505').subscribe(dato => {
        dato.forEach(mes => {
          let numMes = mes.periodo.trim().substring(4, 6);
          if (mes.empresa == 'Plasticaribe SAS') {
            costoMeses_Plasticaribe = [
              numMes == '01' ? mes.costo : costoMeses_Plasticaribe[0],
              numMes == '02' ? mes.costo : costoMeses_Plasticaribe[1],
              numMes == '03' ? mes.costo : costoMeses_Plasticaribe[2],
              numMes == '04' ? mes.costo : costoMeses_Plasticaribe[3],
              numMes == '05' ? mes.costo : costoMeses_Plasticaribe[4],
              numMes == '06' ? mes.costo : costoMeses_Plasticaribe[5],
              numMes == '07' ? mes.costo : costoMeses_Plasticaribe[6],
              numMes == '08' ? mes.costo : costoMeses_Plasticaribe[7],
              numMes == '09' ? mes.costo : costoMeses_Plasticaribe[8],
              numMes == '10' ? mes.costo : costoMeses_Plasticaribe[9],
              numMes == '11' ? mes.costo : costoMeses_Plasticaribe[10],
              numMes == '12' ? mes.costo : costoMeses_Plasticaribe[11],
            ];
          
            let info_Plasticaribe : any = { anio: this.anioSeleccionado, costo : mes.costo };
            let index_Plasticaribe : number = this.cuentas_Pagar_Anios_Plasticaribe.findIndex(item => item.anio == this.anioSeleccionado);
            if (index_Plasticaribe != -1) this.cuentas_Pagar_Anios_Plasticaribe[index_Plasticaribe].costo += mes.costo;
            else this.cuentas_Pagar_Anios_Plasticaribe.push(info_Plasticaribe);
          } else if (mes.empresa == 'Invergoal SAS') {
            costoMeses_Invergoal = [
              numMes == '01' ? mes.costo : costoMeses_Invergoal[0],
              numMes == '02' ? mes.costo : costoMeses_Invergoal[1],
              numMes == '03' ? mes.costo : costoMeses_Invergoal[2],
              numMes == '04' ? mes.costo : costoMeses_Invergoal[3],
              numMes == '05' ? mes.costo : costoMeses_Invergoal[4],
              numMes == '06' ? mes.costo : costoMeses_Invergoal[5],
              numMes == '07' ? mes.costo : costoMeses_Invergoal[6],
              numMes == '08' ? mes.costo : costoMeses_Invergoal[7],
              numMes == '09' ? mes.costo : costoMeses_Invergoal[8],
              numMes == '10' ? mes.costo : costoMeses_Invergoal[9],
              numMes == '11' ? mes.costo : costoMeses_Invergoal[10],
              numMes == '12' ? mes.costo : costoMeses_Invergoal[11],
            ];
          
            let info_Invergoal : any = { anio: this.anioSeleccionado, costo : mes.costo };
            let index_Invergoal : number = this.cuentas_Pagar_Anios_Invergoal.findIndex(item => item.anio == this.anioSeleccionado);
            if (index_Invergoal != -1) this.cuentas_Pagar_Anios_Invergoal[index_Invergoal].costo += mes.costo;
            else this.cuentas_Pagar_Anios_Invergoal.push(info_Invergoal);
          } else if (mes.empresa == 'Inversuez SAS') {
            costoMeses_Inversuez = [
              numMes == '01' ? mes.costo : costoMeses_Inversuez[0],
              numMes == '02' ? mes.costo : costoMeses_Inversuez[1],
              numMes == '03' ? mes.costo : costoMeses_Inversuez[2],
              numMes == '04' ? mes.costo : costoMeses_Inversuez[3],
              numMes == '05' ? mes.costo : costoMeses_Inversuez[4],
              numMes == '06' ? mes.costo : costoMeses_Inversuez[5],
              numMes == '07' ? mes.costo : costoMeses_Inversuez[6],
              numMes == '08' ? mes.costo : costoMeses_Inversuez[7],
              numMes == '09' ? mes.costo : costoMeses_Inversuez[8],
              numMes == '10' ? mes.costo : costoMeses_Inversuez[9],
              numMes == '11' ? mes.costo : costoMeses_Inversuez[10],
              numMes == '12' ? mes.costo : costoMeses_Inversuez[11],
            ];
          
            let info_Inversuez : any = { anio: this.anioSeleccionado, costo : mes.costo };
            let index_Inversuez : number = this.cuentas_Pagar_Anios_Inversuez.findIndex(item => item.anio == this.anioSeleccionado);
            if (index_Inversuez != -1) this.cuentas_Pagar_Anios_Inversuez[index_Inversuez].costo += mes.costo;
            else this.cuentas_Pagar_Anios_Inversuez.push(info_Inversuez);   
          }
        });
        this.llenarGraficaCuentas_Pagar_Plasticaribe(costoMeses_Plasticaribe);
        this.llenarGraficaCuentas_Pagar_Invergoal(costoMeses_Invergoal);
        this.llenarGraficaCuentas_Pagar_Inversuez(costoMeses_Inversuez);
      });
    }
  }

  // Funcion que va a llenar la grafica de cuentas por pagar
  llenarGraficaCuentas_Pagar_Plasticaribe(data){
    let color : string = "#"+((1<<24)*Math.random()|0).toString(16);
    let info : any = {
      label: `Año ${this.anioSeleccionado}`,
      data: data,
      yAxisID: 'y',
      borderColor: color.substring(0, 4),
      backgroundColor: color.substring(0, 4) + "2",
      pointStyle: 'rectRot',
      pointRadius: 10,
      pointHoverRadius: 15,
      fill : true,
      tension: 0.3
    };
    this.graficaCuentas_Pagar_Plasticaribe.datasets.push(info);
  }

  // Funcion que va a llenar la grafica de cuentas por pagar
  llenarGraficaCuentas_Pagar_Invergoal(data){
    let color : string = "#"+((1<<24)*Math.random()|0).toString(16);
    let info : any = {
      label: `Año ${this.anioSeleccionado}`,
      data: data,
      yAxisID: 'y',
      borderColor: color.substring(0, 4),
      backgroundColor: color.substring(0, 4) + "2",
      pointStyle: 'rectRot',
      pointRadius: 10,
      pointHoverRadius: 15,
      fill : true,
      tension: 0.3
    };
    this.graficaCuentas_Pagar_Invergoal.datasets.push(info);
  }

  // Funcion que va a llenar la grafica de cuentas por pagar
  llenarGraficaCuentas_Pagar_Inversuez(data){
    let color : string = "#"+((1<<24)*Math.random()|0).toString(16);
    let info : any = {
      label: `Año ${this.anioSeleccionado}`,
      data: data,
      yAxisID: 'y',
      borderColor: color.substring(0, 4),
      backgroundColor: color.substring(0, 4) + "2",
      pointStyle: 'rectRot',
      pointRadius: 10,
      pointHoverRadius: 15,
      fill : true,
      tension: 0.3
    };
    this.graficaCuentas_Pagar_Inversuez.datasets.push(info);
  }

  // Funcion que va a buscar los datos de las compras
  BuscarDatosGrafica_Compras(){
    let index : number = this.compras_Anios_Plasticaribe.findIndex(item => item.anio == this.anioSeleccionado);
    if (index == -1) {
      let costoMeses_Plasticaribe : number [] = [0,0,0,0,0,0,0,0,0,0,0,0];      
      let costoMeses_Invergoal : number [] = [0,0,0,0,0,0,0,0,0,0,0,0];
      let costoMeses_Inversuez : number [] = [0,0,0,0,0,0,0,0,0,0,0,0];
      for (let i = 0; i < 12; i++) {
        this.zeusService.GetComprasMes(this.anioSeleccionado, i + 1).subscribe(data => {
          costoMeses_Plasticaribe = [
            i == 0 ? data : costoMeses_Plasticaribe[0],
            i == 1 ? data : costoMeses_Plasticaribe[1],
            i == 2 ? data : costoMeses_Plasticaribe[2],
            i == 3 ? data : costoMeses_Plasticaribe[3],
            i == 4 ? data : costoMeses_Plasticaribe[4],
            i == 5 ? data : costoMeses_Plasticaribe[5],
            i == 6 ? data : costoMeses_Plasticaribe[6],
            i == 7 ? data : costoMeses_Plasticaribe[7],
            i == 8 ? data : costoMeses_Plasticaribe[8],
            i == 9 ? data : costoMeses_Plasticaribe[9],
            i == 10 ? data : costoMeses_Plasticaribe[10],
            i == 11 ? data : costoMeses_Plasticaribe[11],
          ];
          if (i == 11) this.llenarGrafica_Compras_Plasticaribe(costoMeses_Plasticaribe);
          let info : any = { anio: this.anioSeleccionado, costo : data };
          let index2 : number = this.compras_Anios_Plasticaribe.findIndex(item => item.anio == this.anioSeleccionado);
          if (index2 != -1) this.compras_Anios_Plasticaribe[index2].costo += data;
          else this.compras_Anios_Plasticaribe.push(info); 
        });
        this.zeusService.GetComprasMesInverGoal_InverSuez(this.anioSeleccionado, i + 1, '900362200').subscribe(data => {
          costoMeses_Invergoal = [
            i == 0 ? data : costoMeses_Invergoal[0],
            i == 1 ? data : costoMeses_Invergoal[1],
            i == 2 ? data : costoMeses_Invergoal[2],
            i == 3 ? data : costoMeses_Invergoal[3],
            i == 4 ? data : costoMeses_Invergoal[4],
            i == 5 ? data : costoMeses_Invergoal[5],
            i == 6 ? data : costoMeses_Invergoal[6],
            i == 7 ? data : costoMeses_Invergoal[7],
            i == 8 ? data : costoMeses_Invergoal[8],
            i == 9 ? data : costoMeses_Invergoal[9],
            i == 10 ? data : costoMeses_Invergoal[10],
            i == 11 ? data : costoMeses_Invergoal[11],
          ];
          if (i == 11) this.llenarGrafica_Compras_Invergoal(costoMeses_Invergoal);
          let info : any = { anio: this.anioSeleccionado, costo : data };
          let index2 : number = this.compras_Anios_Invergoal.findIndex(item => item.anio == this.anioSeleccionado);
          if (index2 != -1) this.compras_Anios_Invergoal[index2].costo += data;
          else this.compras_Anios_Invergoal.push(info);      
        });
        this.zeusService.GetComprasMesInverGoal_InverSuez(this.anioSeleccionado, i + 1, '900458314').subscribe(data => {
          costoMeses_Inversuez = [
            i == 0 ? data : costoMeses_Inversuez[0],
            i == 1 ? data : costoMeses_Inversuez[1],
            i == 2 ? data : costoMeses_Inversuez[2],
            i == 3 ? data : costoMeses_Inversuez[3],
            i == 4 ? data : costoMeses_Inversuez[4],
            i == 5 ? data : costoMeses_Inversuez[5],
            i == 6 ? data : costoMeses_Inversuez[6],
            i == 7 ? data : costoMeses_Inversuez[7],
            i == 8 ? data : costoMeses_Inversuez[8],
            i == 9 ? data : costoMeses_Inversuez[9],
            i == 10 ? data : costoMeses_Inversuez[10],
            i == 11 ? data : costoMeses_Inversuez[11],
          ];
          if (i == 11) this.llenarGrafica_Compras_Inversuez(costoMeses_Inversuez);
          let info : any = { anio: this.anioSeleccionado, costo : data };
          let index2 : number = this.compras_Anios_Inversuez.findIndex(item => item.anio == this.anioSeleccionado);
          if (index2 != -1) this.compras_Anios_Inversuez[index2].costo += data;
          else this.compras_Anios_Inversuez.push(info);
        });
      }
    }
  }

  // Funcion que va a llenar la grafica de compras de plasticaribe
  llenarGrafica_Compras_Plasticaribe(data){
    let color : string = "#"+((1<<24)*Math.random()|0).toString(16);
    let info : any = {
      label: `Año ${this.anioSeleccionado}`,
      data: data,
      yAxisID: 'y',
      borderColor: color.substring(0, 4),
      backgroundColor: color.substring(0, 4) + "2",
      pointStyle: 'rectRot',
      pointRadius: 10,
      pointHoverRadius: 15,
      fill : true,
      tension: 0.3
    };
    this.graficaCompras_Plasticaribe.datasets.push(info);
  }
  
  // Funcion que va a llenar la grafica de compras de invergoal
  llenarGrafica_Compras_Invergoal(data){
    let color : string = "#"+((1<<24)*Math.random()|0).toString(16);
    let info : any = {
      label: `Año ${this.anioSeleccionado}`,
      data: data,
      yAxisID: 'y',
      borderColor: color.substring(0, 4),
      backgroundColor: color.substring(0, 4) + "2",
      pointStyle: 'rectRot',
      pointRadius: 10,
      pointHoverRadius: 15,
      fill : true,
      tension: 0.3
    };
    this.graficaCompras_Invergoal.datasets.push(info);
  }

  // Funcion que va a llenar la grafica de compras de inversuez
  llenarGrafica_Compras_Inversuez(data){
    let color : string = "#"+((1<<24)*Math.random()|0).toString(16);
    let info : any = {
      label: `Año ${this.anioSeleccionado}`,
      data: data,
      yAxisID: 'y',
      borderColor: color.substring(0, 4),
      backgroundColor: color.substring(0, 4) + "2",
      pointStyle: 'rectRot',
      pointRadius: 10,
      pointHoverRadius: 15,
      fill : true,
      tension: 0.3
    };
    this.graficaCompras_Inversuez.datasets.push(info);
  }

  // Funcion que va a buscar la informacion de la grafica de inventario de materias primas
  BuscarDatosGraficaInventario_MatPrima(){
    let index : number = this.inventarioMatPrima_Anios.findIndex(item => item.anio == this.anioSeleccionado);
    if (index == -1) {
      let costoMeses : number [] = [0,0,0,0,0,0,0,0,0,0,0,0];
      this.inventarioMatPrima.Get_Cantidad_Material_Meses().subscribe(data => {
        let info : any = JSON.parse(`{${data[0].replaceAll("'", '"')}}`);
        costoMeses = [
          parseFloat(info.Enero),
          parseFloat(info.Febrero),
          parseFloat(info.Marzo),
          parseFloat(info.Abril),
          parseFloat(info.Mayo),
          parseFloat(info.Junio),
          parseFloat(info.Julio),
          parseFloat(info.Agosto),
          parseFloat(info.Septiembre),
          parseFloat(info.Octubre),
          parseFloat(info.Noviembre),
          parseFloat(info.Diciembre)
        ];
        this.llenarGraficaInventario_MatPrima(costoMeses);
      });
    }
  }

  // Funcion que va a llenar la grafica de inventario de materias primas
  llenarGraficaInventario_MatPrima(data){
    let color : string = "#"+((1<<24)*Math.random()|0).toString(16);
    let info : any = {
      label: `Año ${this.anioSeleccionado}`,
      data: data,
      yAxisID: 'y',
      borderColor: color.substring(0, 4),
      backgroundColor: color.substring(0, 4) + "2",
      pointStyle: 'rectRot',
      pointRadius: 10,
      pointHoverRadius: 15,
      fill : true,
      tension: 0.3
    };
    this.graficaInventario_MatPrima.datasets.push(info);
  }

  // Funcion que va a buscar la informacion de la grafica de inventario de productos
  BuscarDatosGraficaInventario_Producto(){
    let index : number = this.inventarioProductos_Anios.findIndex(item => item.anio == this.anioSeleccionado);
    if (index == -1) {
      let costoMeses : number [] = [0,0,0,0,0,0,0,0,0,0,0,0];
      this.inventarioProductos.Get_Cantidad_Productos_Meses().subscribe(data => {
        let info : any = JSON.parse(`{${data[0].replaceAll("'", '"')}}`);
        costoMeses = [
          parseFloat(info.Enero),
          parseFloat(info.Febrero),
          parseFloat(info.Marzo),
          parseFloat(info.Abril),
          parseFloat(info.Mayo),
          parseFloat(info.Junio),
          parseFloat(info.Julio),
          parseFloat(info.Agosto),
          parseFloat(info.Septiembre),
          parseFloat(info.Octubre),
          parseFloat(info.Noviembre),
          parseFloat(info.Diciembre)
        ];
        this.llenarGraficaInventario_Producto(costoMeses);
      });
    }
  }

  // Funcion que va a llenar la grafica de inventario de productos
  llenarGraficaInventario_Producto(data){
    let color : string = "#"+((1<<24)*Math.random()|0).toString(16);
    let info : any = {
      label: `Año ${this.anioSeleccionado}`,
      data: data,
      yAxisID: 'y',
      borderColor: color.substring(0, 4),
      backgroundColor: color.substring(0, 4) + "2",
      pointStyle: 'rectRot',
      pointRadius: 10,
      pointHoverRadius: 15,
      fill : true,
      tension: 0.3
    };
    this.graficaInventario_Productos.datasets.push(info);
  }

}