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

  opcionesGrafica : any; //Variable que va a almacenar la opciones de cada grafica
  opcionesGrafica_Pagar : any; //Variable que va a almacenar las opciones de las graficas de las cuentas por pagar
  graficaFacturacion : any; // Variable que va a almacenar los datos que van a aparecer en la grafica de facturación
  graficaCuentas_Cobrar : any; // Variable que va a almacenar los datos que van a aparecer en la grafica de cuentas por cobrar
  graficaCuentas_Pagar_Plasticaribe : any; //Variable que va a almacenar los datos que van a aparecer en las cuentas por pagar de plasticaribe
  graficaCuentas_Pagar_Invergoal : any; //Variable que va a almacenar los datos que van a aparecer en las cuentas por pagar de invergoal
  graficaCuentas_Pagar_Inversuez : any; //Variable que va a almacenar los datos que van a aparecer en las cuentas por pagar de inversuez
  graficaCompras_Plasticaribe : any; //Variable que va a almacenar los datos que van a aparecere en las compras de plasticaribe
  graficaCompras_Invergoal : any; //Variable que va a almacenar los datos que van a aparecer en las compras de invergoal
  graficaCompras_Inversuez : any; //Variable que va a almacenar los datos que van a aparecer en las compras de inversuez
  graficaInventario_MatPrima : any; //Variable que va a almacenar los datos que van a aparecer en el inventario de materia prima
  graficaInventario_Productos : any; //Variable que va a almacenar los datos que van a aparecer en el inventario de productos

  facturadoAnios : any [] = []; //Funcion que va a almacenar el año y la cantidad facturada.
  cuentas_Cobrar_Anios : any [] = []; //Funcion que va a almacenar los costos de año a año de las cuentas por cobrar
  cuentas_Pagar_Anios_Plasticaribe : any [] = []; //Funcion que va a almacenar los costos de año a año de las cuentas por pagar de plasticaribe
  cuentas_Pagar_Anios_Invergoal : any [] = []; //Funcion que va a almacenar los costos de año a año de las cuentas por pagar de invergoal
  cuentas_Pagar_Anios_Inversuez : any [] = []; //Funcion que va a almacenar los costos de año a año de las cuentas por pagar de inversuez
  compras_Anios_Plasticaribe : any [] = []; //Funcion que va a almacenar los costos de año a año de las compras de plasticaribe
  compras_Anios_Invergoal : any [] = []; //Funcion que va a almacenar los costos de año a año de las compras de invergoal
  compras_Anios_Inversuez : any [] = []; //Funcion que va a almacenar los costos de año a año de las compras de inversuez
  inventarioMatPrima_Anios : any [] = []; //Funcion que va a almacenar los costos de año a año del inventario de materia prima
  inventarioProductos_Anios : any [] = []; //Funcion que va a almacenar los costos de año a año del inventario de productos

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
    this.BuscarDatosGraficaCuentas_Cobrar();
    this.BuscarDatosGraficaCuentas_Pagar();
    this.BuscarDatosGrafica_Compras();
    this.BuscarDatosGraficaInventario_MatPrima();
    this.BuscarDatosGraficaInventario_Producto();
    setTimeout(() => this.cargando = false, 5000);
  }

  // Funcion que va a buscar los datos que trandrá la grafica de facturacion
  BuscarDatosGraficaFacturacion(){
    let index : number = this.facturadoAnios.findIndex(item => item.anio == this.anioSeleccionado);
    if (index == -1) {
      let costoMeses : number [] = [0,0,0,0,0,0,0,0,0,0,0,0];
      this.zeusService.GetFacturacion_Mes_Mes(`${this.anioSeleccionado}`).subscribe(dato => {
        for (let i = 0; i < dato.length; i++) {
          let info : any = JSON.parse(`{${dato[i].replaceAll("'", '"')}}`);
          costoMeses = [
            i == 0 ? parseFloat(info.Valor) : costoMeses[0],
            i == 1 ? parseFloat(info.Valor) : costoMeses[1],
            i == 2 ? parseFloat(info.Valor) : costoMeses[2],
            i == 3 ? parseFloat(info.Valor) : costoMeses[3],
            i == 4 ? parseFloat(info.Valor) : costoMeses[4],
            i == 5 ? parseFloat(info.Valor) : costoMeses[5],
            i == 6 ? parseFloat(info.Valor) : costoMeses[6],
            i == 7 ? parseFloat(info.Valor) : costoMeses[7],
            i == 8 ? parseFloat(info.Valor) : costoMeses[8],
            i == 9 ? parseFloat(info.Valor) : costoMeses[9],
            i == 10 ? parseFloat(info.Valor) : costoMeses[10],
            i == 11 ? parseFloat(info.Valor) : costoMeses[11],
          ];
          if (i == 11) this.llenarGraficaFacturacion(costoMeses);
          let info_Anio : any = { anio: this.anioSeleccionado, costo: parseFloat(info.Valor) };
          let index2 : number = this.facturadoAnios.findIndex(item => item.anio == this.anioSeleccionado);
          if (index2 != -1) this.facturadoAnios[index2].costo += parseFloat(info.Valor);
          else this.facturadoAnios.push(info_Anio);
        }
      });
    } else this.msj.mensajeAdvertencia(`¡El año seleccionado ya ha sido graficado!`, ``);
  }

  // Funcion que va a llenar la grafica de facturacion
  llenarGraficaFacturacion(data){
    let color : string = "#"+((1<<24)*Math.random()|0).toString(16);
    this.graficaFacturacion.datasets.push({
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
    });
  }

  // Funcion que va a buscar los datos que trandrá la grafica de cuentas por cobrar
  BuscarDatosGraficaCuentas_Cobrar(){
    let index : number = this.cuentas_Cobrar_Anios.findIndex(item => item.anio == this.anioSeleccionado);
    if (index == -1) {
      let costoMeses : number [] = [0,0,0,0,0,0,0,0,0,0,0,0];
      this.zeusContabilidad.GetCartera_Mes_Anio(`${this.anioSeleccionado}`).subscribe(dato => {
        for (let i = 0; i < dato.length; i++) {
          if (dato[i] != null){
            costoMeses = [
              dato[i].mes == '01' && dato[i] != null ? dato[i].valor : costoMeses[0],
              dato[i].mes == '02' && dato[i] != null ? dato[i].valor : costoMeses[1],
              dato[i].mes == '03' && dato[i] != null ? dato[i].valor : costoMeses[2],
              dato[i].mes == '04' && dato[i] != null ? dato[i].valor : costoMeses[3],
              dato[i].mes == '05' && dato[i] != null ? dato[i].valor : costoMeses[4],
              dato[i].mes == '06' && dato[i] != null ? dato[i].valor : costoMeses[5],
              dato[i].mes == '07' && dato[i] != null ? dato[i].valor : costoMeses[6],
              dato[i].mes == '08' && dato[i] != null ? dato[i].valor : costoMeses[7],
              dato[i].mes == '09' && dato[i] != null ? dato[i].valor : costoMeses[8],
              dato[i].mes == '10' && dato[i] != null ? dato[i].valor : costoMeses[9],
              dato[i].mes == '11' && dato[i] != null ? dato[i].valor : costoMeses[10],
              dato[i].mes == '12' && dato[i] != null ? dato[i].valor : costoMeses[11],
            ];
            if (dato[i].mes == '12') this.llenarGraficaCuentas_Cobrar(costoMeses);
            let info : any = { anio: this.anioSeleccionado, costo : dato[i].valor };
            let index2 : number = this.cuentas_Cobrar_Anios.findIndex(item => item.anio == this.anioSeleccionado);
            if (index2 != -1) this.cuentas_Cobrar_Anios[index2].costo += dato[i].valor;
            else this.cuentas_Cobrar_Anios.push(info);
          } else {
            this.llenarGraficaCuentas_Cobrar(costoMeses);
            break;
          }
        }
      });
    }
  }

  // Funcion que va a llenar la grafica de facturacion
  llenarGraficaCuentas_Cobrar(data){
    let color : string = "#"+((1<<24)*Math.random()|0).toString(16);
    this.graficaCuentas_Cobrar.datasets.push({
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
    });
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
    this.graficaCuentas_Pagar_Plasticaribe.datasets.push({
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
    });
  }

  // Funcion que va a llenar la grafica de cuentas por pagar
  llenarGraficaCuentas_Pagar_Invergoal(data){
    let color : string = "#"+((1<<24)*Math.random()|0).toString(16);
    this.graficaCuentas_Pagar_Invergoal.datasets.push({
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
    });
  }

  // Funcion que va a llenar la grafica de cuentas por pagar
  llenarGraficaCuentas_Pagar_Inversuez(data){
    let color : string = "#"+((1<<24)*Math.random()|0).toString(16);
    this.graficaCuentas_Pagar_Inversuez.datasets.push({
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
    });
  }

  // Funcion que va a buscar los datos de las compras
  BuscarDatosGrafica_Compras(){
    let index : number = this.compras_Anios_Plasticaribe.findIndex(item => item.anio == this.anioSeleccionado);
    if (index == -1) {
      let costoMeses_Plasticaribe : number [] = [0,0,0,0,0,0,0,0,0,0,0,0];      
      let costoMeses_Invergoal : number [] = [0,0,0,0,0,0,0,0,0,0,0,0];
      let costoMeses_Inversuez : number [] = [0,0,0,0,0,0,0,0,0,0,0,0];

      this.zeusService.GetComprasMes_Mes_Plasticaribe(this.anioSeleccionado).subscribe(dato => {
        for (let i = 0; i < dato.length; i++) {
          let info : any = JSON.parse(`{${dato[i].replaceAll("'", '"')}}`);
          costoMeses_Plasticaribe = [
            i == 0 ? parseFloat(info.Valor) : costoMeses_Plasticaribe[0],
            i == 1 ? parseFloat(info.Valor) : costoMeses_Plasticaribe[1],
            i == 2 ? parseFloat(info.Valor) : costoMeses_Plasticaribe[2],
            i == 3 ? parseFloat(info.Valor) : costoMeses_Plasticaribe[3],
            i == 4 ? parseFloat(info.Valor) : costoMeses_Plasticaribe[4],
            i == 5 ? parseFloat(info.Valor) : costoMeses_Plasticaribe[5],
            i == 6 ? parseFloat(info.Valor) : costoMeses_Plasticaribe[6],
            i == 7 ? parseFloat(info.Valor) : costoMeses_Plasticaribe[7],
            i == 8 ? parseFloat(info.Valor) : costoMeses_Plasticaribe[8],
            i == 9 ? parseFloat(info.Valor) : costoMeses_Plasticaribe[9],
            i == 10 ? parseFloat(info.Valor) : costoMeses_Plasticaribe[10],
            i == 11 ? parseFloat(info.Valor) : costoMeses_Plasticaribe[11],
          ];
          if (i == 11) this.llenarGrafica_Compras_Plasticaribe(costoMeses_Plasticaribe);
          let info_Anio : any = { anio: this.anioSeleccionado, costo : parseFloat(info.Valor) };
          let index2 : number = this.compras_Anios_Plasticaribe.findIndex(item => item.anio == this.anioSeleccionado);
          if (index2 != -1) this.compras_Anios_Plasticaribe[index2].costo += parseFloat(info.Valor);
          else this.compras_Anios_Plasticaribe.push(info_Anio); 
        }
      });
      this.zeusService.GetComprasMes_Mes_InverGoal_InverSuez(this.anioSeleccionado, '900362200').subscribe(dato => {
        for (let i = 0; i < dato.length; i++) {
          let info : any = JSON.parse(`{${dato[i].replaceAll("'", '"')}}`);
          costoMeses_Invergoal = [
            i == 0 ? parseFloat(info.Valor) : costoMeses_Invergoal[0],
            i == 1 ? parseFloat(info.Valor) : costoMeses_Invergoal[1],
            i == 2 ? parseFloat(info.Valor) : costoMeses_Invergoal[2],
            i == 3 ? parseFloat(info.Valor) : costoMeses_Invergoal[3],
            i == 4 ? parseFloat(info.Valor) : costoMeses_Invergoal[4],
            i == 5 ? parseFloat(info.Valor) : costoMeses_Invergoal[5],
            i == 6 ? parseFloat(info.Valor) : costoMeses_Invergoal[6],
            i == 7 ? parseFloat(info.Valor) : costoMeses_Invergoal[7],
            i == 8 ? parseFloat(info.Valor) : costoMeses_Invergoal[8],
            i == 9 ? parseFloat(info.Valor) : costoMeses_Invergoal[9],
            i == 10 ? parseFloat(info.Valor) : costoMeses_Invergoal[10],
            i == 11 ? parseFloat(info.Valor) : costoMeses_Invergoal[11],
          ];
          if (i == 11) this.llenarGrafica_Compras_Invergoal(costoMeses_Invergoal);
          let info_Anio : any = { anio: this.anioSeleccionado, costo : parseFloat(info.Valor) };
          let index2 : number = this.compras_Anios_Invergoal.findIndex(item => item.anio == this.anioSeleccionado);
          if (index2 != -1) this.compras_Anios_Invergoal[index2].costo += parseFloat(info.Valor);
          else this.compras_Anios_Invergoal.push(info_Anio);
        }
      });
      this.zeusService.GetComprasMes_Mes_InverGoal_InverSuez(this.anioSeleccionado, '900458314').subscribe(dato => {
        for (let i = 0; i < dato.length; i++) {
          let info : any = JSON.parse(`{${dato[i].replaceAll("'", '"')}}`);
          costoMeses_Inversuez = [
            i == 0 ? parseFloat(info.Valor) : costoMeses_Inversuez[0],
            i == 1 ? parseFloat(info.Valor) : costoMeses_Inversuez[1],
            i == 2 ? parseFloat(info.Valor) : costoMeses_Inversuez[2],
            i == 3 ? parseFloat(info.Valor) : costoMeses_Inversuez[3],
            i == 4 ? parseFloat(info.Valor) : costoMeses_Inversuez[4],
            i == 5 ? parseFloat(info.Valor) : costoMeses_Inversuez[5],
            i == 6 ? parseFloat(info.Valor) : costoMeses_Inversuez[6],
            i == 7 ? parseFloat(info.Valor) : costoMeses_Inversuez[7],
            i == 8 ? parseFloat(info.Valor) : costoMeses_Inversuez[8],
            i == 9 ? parseFloat(info.Valor) : costoMeses_Inversuez[9],
            i == 10 ? parseFloat(info.Valor) : costoMeses_Inversuez[10],
            i == 11 ? parseFloat(info.Valor) : costoMeses_Inversuez[11],
          ];
          if (i == 11) this.llenarGrafica_Compras_Inversuez(costoMeses_Inversuez);
          let info_Anio : any = { anio: this.anioSeleccionado, costo : parseFloat(info.Valor) };
          let index2 : number = this.compras_Anios_Inversuez.findIndex(item => item.anio == this.anioSeleccionado);
          if (index2 != -1) this.compras_Anios_Inversuez[index2].costo += parseFloat(info.Valor);
          else this.compras_Anios_Inversuez.push(info_Anio);
        }
      });
    }
  }

  // Funcion que va a llenar la grafica de compras de plasticaribe
  llenarGrafica_Compras_Plasticaribe(data){
    let color : string = "#"+((1<<24)*Math.random()|0).toString(16);
    this.graficaCompras_Plasticaribe.datasets.push({
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
    });
  }
  
  // Funcion que va a llenar la grafica de compras de invergoal
  llenarGrafica_Compras_Invergoal(data){
    let color : string = "#"+((1<<24)*Math.random()|0).toString(16);
    this.graficaCompras_Invergoal.datasets.push({
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
    });
  }

  // Funcion que va a llenar la grafica de compras de inversuez
  llenarGrafica_Compras_Inversuez(data){
    let color : string = "#"+((1<<24)*Math.random()|0).toString(16);
    this.graficaCompras_Inversuez.datasets.push({
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
    });
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
    this.graficaInventario_MatPrima.datasets.push({
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
    });
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
    this.graficaInventario_Productos.datasets.push({
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
    });
  }

}