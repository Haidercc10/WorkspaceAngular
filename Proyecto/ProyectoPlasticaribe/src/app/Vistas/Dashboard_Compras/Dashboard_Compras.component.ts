import { Component, OnInit, ViewChild } from '@angular/core';
import { ShepherdService } from 'angular-shepherd';
import moment from 'moment';
import { Table } from 'primeng/table';
import { Facturas_Invergoal_InversuezService } from 'src/app/Servicios/Facturas_Invergoal_Inversuez/Facturas_Invergoal_Inversuez.service';
import { ZeusContabilidadService } from 'src/app/Servicios/Zeus_Contabilidad/zeusContabilidad.service';
import { AppComponent } from 'src/app/app.component';
import { defaultStepOptions, stepsDashboardCompras as defaultSteps } from 'src/app/data';
import { PaginaPrincipalComponent } from '../PaginaPrincipal/PaginaPrincipal.component';
import { InventarioZeusService } from 'src/app/Servicios/InventarioZeus/inventario-zeus.service';

@Component({
  selector: 'app-Dashboard_Compras',
  templateUrl: './Dashboard_Compras.component.html',
  styleUrls: ['./Dashboard_Compras.component.css']
})
export class Dashboard_ComprasComponent implements OnInit {

  cargando : boolean = false; //Variable para validar que salga o no la imagen de carga
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro

  @ViewChild('dt_comprasAgrupadas') dt_comprasAgrupadas: Table | undefined;
  anios : any [] = [2019]; //Variable que almacenará los años desde el 2019 hasta el año actual
  anioSeleccionado : number = moment().year(); //Variable que almacenará la información del año actual en princio y luego podrá cambiar a un año seleccionado
  facturasNoHabilitadas : string [] = []; //Variable que almacenará las facturas que no se deben sumar y/o mostrar
  compraTotalAnioPlasticaribe : number = 0; //Variable que almacenará el costo total de las compras de plasticaribe realizadas en lo que va del año
  compraTotalAnioInvergoal : number = 0; //Variable que almacenará el costo total de las compras de Invergoal realizadas en lo que va del año
  compraTotalAnioInversuez : number = 0; //Variable que almacenará el costo total de las compras de Inversuez realizadas en lo que va del año
  comprasAgrupadasPlasticaribe : any []; //Variable que almacenará los datos de las compras agrupadas por proveedor, estas compras serán de la empresa Plasticaribe
  comprasAgrupadasInvergoal : any []; //Variable que almacenará los datos de las compras agrupadas por proveedor, estas compras serán de la empresa Invergoal
  comprasAgrupadasInversuez : any []; //Variable que almacenará los datos de las compras agrupadas por proveedor, estas compras serán de la empresa Inversuez
  opcionesGrafica : any; //Variable que va a almacenar la opciones de cada grafica
  graficaComprasPlasticaribe : any; //Variable que va a almacenar los costos de las compras de plasticaribe
  graficaComprasInvergoal : any; //Variable que va a almacenar los costos de las compras de invergoal
  graficaComprasInversuez : any; //Variable que va a almacenar los costos de las compras de inversuez
  anioGraficadoPlasticaribe : number [] = []; //Variable que va a almacenar los años que se han graficado para el tab de plasticaribe
  anioGraficadoInvergoal : number [] = []; //Variable que va a almacenar los años que se han graficado para el tab de invergoal
  anioGraficadoInversuez : number [] = []; //Variable que va a almacenar los años que se han graficado para el tab de inversuez

  arrayFacturas : any = []; /** Array de objetos que contendrá los detalles de las facturas consultadas de la 2da tabla */
  modal : boolean = false; /** Variable que validará que se muestre el modal */
  valorTotal : number = 0; /** Valor total de los detalles de las facturas  */

  constructor(private AppComponent : AppComponent,
                private zeusService : ZeusContabilidadService,
                  private shepherdService: ShepherdService,
                    private paginaPrincial : PaginaPrincipalComponent,
                      private facturasService : Facturas_Invergoal_InversuezService,
                        private srvMovItems : InventarioZeusService,) { }

  ngOnInit() {
    this.llenarArrayAnos();
    this.inicializarGraficas();
    this.lecturaStorage();
    this.validarConsulta();
  }

  // Funcion que iniciará el tutorial
  tutorial(){
    this.shepherdService.defaultStepOptions = defaultStepOptions;
    this.shepherdService.modal = true;
    this.shepherdService.confirmCancel = false;
    this.shepherdService.addSteps(defaultSteps);
    this.shepherdService.start();
  }

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number : any) => number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

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

  // Funcion que se va a encargar del filtrado de información en las tablas
  aplicarfiltro = ($event, campo : any, valorCampo : string) => this.dt_comprasAgrupadas!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);

  // Funcion que va a inicializar las variables con la información de las graficas
  inicializarGraficas(){
    this.compraTotalAnioPlasticaribe = 0;
    this.compraTotalAnioInvergoal = 0;
    this.compraTotalAnioInversuez = 0;
    this.comprasAgrupadasPlasticaribe = [];
    this.comprasAgrupadasInvergoal = [];
    this.comprasAgrupadasInversuez = [];
    this.anioGraficadoPlasticaribe = [];
    this.anioGraficadoInvergoal = [];
    this.anioGraficadoInversuez = [];

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

    this.graficaComprasPlasticaribe = {
      labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
      datasets: []
    };

    this.graficaComprasInvergoal = {
      labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
      datasets: []
    };

    this.graficaComprasInversuez = {
      labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
      datasets: []
    };
  }

  //Funcion que va a encargarse de cargar la información de las cards y llama a la funcion de que contará en cunato tiempo se recargará la información
  validarConsulta(){
    if (this.paginaPrincial.compras){
      this.consultarFacturasNoHabilitadas();
      this.consultarCostos('0');
      this.consultarCostos('900362200');
      this.consultarCostos('900458314');
    }
  }

  // Funcion que va a sumar el costo total a pagar
  comprasEmpresa(data : any){
    data == 1 ? this.consultarCostos('0') : null;
    data == 2 ? this.consultarCostos('900362200') : null;
    data == 3 ? this.consultarCostos('900458314') : null;
  }

  // Funcion que va a consultar las facturas que no se deben sumar y/o mostrar
  consultarFacturasNoHabilitadas = () => this.facturasService.GetFacturasPapelIngresadas(this.anioSeleccionado).subscribe(data => this.facturasNoHabilitadas = data);

  // Funcion que va a realizar las peticiones de los costos de las compras de plasticaribe
  consultarCostos(id : string){
    this.cargando = true;
    this.zeusService.GetCostos_Compras_Proveedores_Mes_Mes(this.facturasNoHabilitadas, `${this.anioSeleccionado}`, id).subscribe(data => {
      let numDatos = 0;
      data.forEach(prov => {
        let info : any = {
          Id_Proveedor : prov.id_Proveedor,
          Proveedor : prov.proveedor,
          Costo : prov.costo,
          Cuenta : prov.cuenta2,
          Periodo : prov.periodo,
          Detalles : [],
        }
        id == '0' && !this.anioGraficadoPlasticaribe.includes(this.anioSeleccionado) ? this.comprasAgrupadasPlasticaribe.push(info) : null;
        id == '900362200' && !this.anioGraficadoInvergoal.includes(this.anioSeleccionado) ? this.comprasAgrupadasInvergoal.push(info) : null;
        id == '900458314' && !this.anioGraficadoInversuez.includes(this.anioSeleccionado) ? this.comprasAgrupadasInversuez.push(info) : null;
        numDatos++;
        if (numDatos == data.length) this.facturasProveedores(id);
      });
    });
  }

  // Funcion que va a consultar cada una de las facturas de los proveedores
  facturasProveedores(id : string){
    this.zeusService.GetCostos_Compras_Facturas_Mes_Mes(this.facturasNoHabilitadas, `${this.anioSeleccionado}`, id).subscribe(data => {
      let numDatos = 0;
      data.forEach(fact => {
        let info : any = {
          NitProveedor : fact.id_Proveedor,
          Factura : fact.factura,
          Fecha_Factura : fact.fecha_Factura,
          Fecha_Vencimiento : fact.fecha_Vencimiento,
          Costo : fact.costo,
          Cuenta : fact.cuenta2,
        }
        if (id == '0' && !this.anioGraficadoPlasticaribe.includes(this.anioSeleccionado)) {
          let i = this.comprasAgrupadasPlasticaribe.findIndex(prov => prov.Id_Proveedor == fact.id_Proveedor && prov.Periodo == fact.periodo);
          i != -1 ? this.comprasAgrupadasPlasticaribe[i].Detalles.push(info) : null;
        } else if (id == '900362200' && !this.anioGraficadoInvergoal.includes(this.anioSeleccionado)) {
          let i = this.comprasAgrupadasInvergoal.findIndex(prov => prov.Id_Proveedor == fact.id_Proveedor && prov.Periodo == fact.periodo);
          i != -1 ? this.comprasAgrupadasInvergoal[i].Detalles.push(info) : null;
        } else if (id == '900458314' && !this.anioGraficadoInversuez.includes(this.anioSeleccionado)) {
          let i = this.comprasAgrupadasInversuez.findIndex(prov => prov.Id_Proveedor == fact.id_Proveedor && prov.Periodo == fact.periodo);
          i != -1 ? this.comprasAgrupadasInversuez[i].Detalles.push(info) : null;
        }
        numDatos++;
        if (numDatos == data.length) this.buscarDatosGraficas(id);
      });
    });
  }

  // Funcion que va a tomar los datos con los que se van a llenar las graficas
  buscarDatosGraficas(id : string){
    this.zeusService.GetCostos_Compras_Mes_Mes(this.facturasNoHabilitadas, `${this.anioSeleccionado}`, id).subscribe(data => {
      id == '0' ? this.compraTotalAnioPlasticaribe = data.reduce((a, b) => a + b.costo, 0) : null;
      id == '900362200' ? this.compraTotalAnioInvergoal = data.reduce((a, b) => a + b.costo, 0) : null;
      id == '900458314' ? this.compraTotalAnioInversuez = data.reduce((a, b) => a + b.costo, 0) : null;
      let costoAnio : any = [
        data.filter(prov => prov.periodo.trim() == `${this.anioSeleccionado}01`).reduce((a, b) => a + b.costo, 0),
        data.filter(prov => prov.periodo.trim() == `${this.anioSeleccionado}02`).reduce((a, b) => a + b.costo, 0),
        data.filter(prov => prov.periodo.trim() == `${this.anioSeleccionado}03`).reduce((a, b) => a + b.costo, 0),
        data.filter(prov => prov.periodo.trim() == `${this.anioSeleccionado}04`).reduce((a, b) => a + b.costo, 0),
        data.filter(prov => prov.periodo.trim() == `${this.anioSeleccionado}05`).reduce((a, b) => a + b.costo, 0),
        data.filter(prov => prov.periodo.trim() == `${this.anioSeleccionado}06`).reduce((a, b) => a + b.costo, 0),
        data.filter(prov => prov.periodo.trim() == `${this.anioSeleccionado}07`).reduce((a, b) => a + b.costo, 0),
        data.filter(prov => prov.periodo.trim() == `${this.anioSeleccionado}08`).reduce((a, b) => a + b.costo, 0),
        data.filter(prov => prov.periodo.trim() == `${this.anioSeleccionado}09`).reduce((a, b) => a + b.costo, 0),
        data.filter(prov => prov.periodo.trim() == `${this.anioSeleccionado}10`).reduce((a, b) => a + b.costo, 0),
        data.filter(prov => prov.periodo.trim() == `${this.anioSeleccionado}11`).reduce((a, b) => a + b.costo, 0),
        data.filter(prov => prov.periodo.trim() == `${this.anioSeleccionado}12`).reduce((a, b) => a + b.costo, 0),
      ];
      id == '0' && !this.anioGraficadoPlasticaribe.includes(this.anioSeleccionado) ? this.llenarGraficaPlasticaribe(costoAnio) : null;
      id == '900362200' && !this.anioGraficadoInvergoal.includes(this.anioSeleccionado) ? this.llenarGraficaInvergoal(costoAnio) : null;
      id == '900458314' && !this.anioGraficadoInversuez.includes(this.anioSeleccionado) ? this.llenarGraficaInversuez(costoAnio) : null;
      this.cargando = false;
    });
  }

  // Funcion que va a cargar los datos de la grafica
  llenarGraficaPlasticaribe(data){
    this.anioGraficadoPlasticaribe.push(this.anioSeleccionado);
    let color : string = "#"+((1<<24)*Math.random()|0).toString(16);
    this.graficaComprasPlasticaribe.datasets.push({
      label: `Año - ${this.anioSeleccionado}`,
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

  // Funcion que va a cargar los datos de la grafica
  llenarGraficaInvergoal(data){
    this.anioGraficadoInvergoal.push(this.anioSeleccionado);
    let color : string = "#"+((1<<24)*Math.random()|0).toString(16);
    this.graficaComprasInvergoal.datasets.push({
      label: `Año - ${this.anioSeleccionado}`,
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

  // Funcion que va a cargar los datos de la grafica
  llenarGraficaInversuez(data){
    this.anioGraficadoInversuez.push(this.anioSeleccionado);
    let color : string = "#"+((1<<24)*Math.random()|0).toString(16);
    this.graficaComprasInversuez.datasets.push({
      label: `Año - ${this.anioSeleccionado}`,
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

  /** Función que cargará el detalle de las facturas con sus materias primas y valores*/
  cargarInfoFacturas(proveedor : any, factura : any){
    this.modal = true;
    this.valorTotal = 0;
    let registros : number = 0;
    this.arrayFacturas = [];
    this.srvMovItems.GetComprasDetalladas(proveedor, factura).subscribe(data => {
      for (let index = 0; index < data.length; index++) {
        data[index].fechaFactura = data[index].fechaFactura.replace('T00:00:00', '');
        data[index].fechaVence = data[index].fechaVence.replace('T00:00:00', '');
        this.valorTotal += data[index].valorNeto;
        this.arrayFacturas.push(data[index]);
        registros++
        if(registros == data.length) this.cargando = false;
      }
    });
  }

}
