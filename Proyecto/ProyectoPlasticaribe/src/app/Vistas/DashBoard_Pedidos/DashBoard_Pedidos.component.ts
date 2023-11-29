import { Component, OnInit } from '@angular/core';
import { ShepherdService } from 'angular-shepherd';
import moment from 'moment';
import { EstadosProcesos_OTService } from 'src/app/Servicios/EstadosProcesosOT/EstadosProcesos_OT.service';
import { InventarioZeusService } from 'src/app/Servicios/InventarioZeus/inventario-zeus.service';
import { AppComponent } from 'src/app/app.component';
import { defaultStepOptions, stepsDashboardPedidos as defaultSteps } from 'src/app/data';
import { PaginaPrincipalComponent } from '../PaginaPrincipal/PaginaPrincipal.component';

@Component({
  selector: 'app-DashBoard_Pedidos',
  templateUrl: './DashBoard_Pedidos.component.html',
  styleUrls: ['./DashBoard_Pedidos.component.css']
})
export class DashBoard_PedidosComponent implements OnInit {

  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  today : any = moment().format('YYYY-MM-DD'); //Variable que va a almacenar la fecha del dia de hoy
  primerDiaMes : any = moment().startOf('month').format('YYYY-MM-DD'); //Variable que va a almacenar el primer dia del mes
  cantidadTotalPedidos : number = 0; //Variable que se encargará de almacenar la cantidad total de pedidos que hay
  costoTotalPedidos : number = 0; //Variable que se encargará de almcanar el costo total de totos los pedidos
  cantidadPedidosPendientes : number = 0;
  cantidadPedidosParciales : number = 0; //Variable que almacenará la cantidad total de pedidos parciales
  costoPedidosPendientes : number = 0; //Variable que almacenará el costo total ed los pedidos pendientes
  costoPedidosParicles : number = 0; //Variable que almacenará el costo total de los pedidos parcieles

  /* INFORMACIÓN GENERAL DE LOS PEDIDOS */
  pedidosClientes : any [] = []; //Variable que se llenará con la información de los pedidos agrupados por clientes
  pedidosProductos : any [] = []; //Variable que se llenará con la información de los pedidos agrupados por productos
  pedidosVendedores : any [] = []; //Variable que se llenará con la información de los pedidos agrupados por vendedores
  pedidosEstados : any [] = []; //Variable que se llenará con la información de los pedidos con estado "Parcialmente Satisfecho" y con estado "Pendiente"
  pedidosTotales : any [] = []; //VAriable que se llenará con la infromación de los totales de los pedidos
  pedidos_Ot : any [] = []; //Variable que se llenará con la información de los pedidos que tengan OT asociadas
  pedidosStock : any [] = []; //Variable que se llenará con los pedidos con un stock (de producto pedido) igual o mayor a la cantidad pediente

  mostrarTabla : boolean = false; //Variable que mostrará o no la información graficada
  multiAxisData: any;
  multiAxisOptions: any;

  nombreGrafica : string;
  graficaPedidosClientes : any;
  opcionesGraficas : any;

  graficaPedidosProductos : any;

  graficaPedidosVendedores : any;

  infoTablaModal : any [] = [];
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro

  constructor(private AppComponent : AppComponent,
                private zeusService : InventarioZeusService,
                  private ordenTrabajoService : EstadosProcesos_OTService,
                    private shepherdService: ShepherdService,
                      private paginaPrincial : PaginaPrincipalComponent,) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
  }

  ngOnInit() {
    this.lecturaStorage();
    if (this.ValidarRol == 1 || this.ValidarRol == 60 || this.ValidarRol == 61) this.tiempoExcedido();
    setInterval(() => {
      this.modoSeleccionado = this.AppComponent.temaSeleccionado;
      this.multiAxisOptions.plugins.legend.labels.color = this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'];
      this.opcionesGraficas.plugins.legend.labels.color = this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'];
      this.opcionesGraficas.scales.x.ticks.color = this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'];
      this.opcionesGraficas.scales.y.ticks.color = this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'];
      this.opcionesGraficas.scales.y1.ticks.color = this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'];
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

  //Funcion que va a encargarse de cargar la información de las cards y llama a la funcion de que contará en cunato tiempo se recargará la información
  tiempoExcedido() {
    if (this.paginaPrincial.pedidos) {
      this.pedidosZeus();
      let time = setInterval(() => {
        if (this.paginaPrincial.pedidos) this.pedidosZeus();
        else clearInterval(time);
      }, 60000);
    }
  }

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number) => number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

  // Funcion que va a consultar la información general de los pedidos creados en Zeus
  pedidosZeus(){
    this.zeusService.getPedidosCliente().subscribe(datos_pedidos => this.pedidosClientes = datos_pedidos); // Pedidos CLientes
    this.zeusService.getPedidosProductos().subscribe(datos_pedidos => this.pedidosProductos = datos_pedidos); // Pedidos Productos
    this.zeusService.getPedidosVendedores().subscribe(datos_pedidos => this.pedidosVendedores = datos_pedidos); //Pedidos Vendedores
    this.consultarPedidosEstados(); // Pedidos Estados
    this.consultarPedidosOrdenesTrabajo(); // Pedidos con ordenes de trabajo asociadas
    this.zeusService.getPedidosStock().subscribe(datos_pedidos => this.pedidosStock = datos_pedidos ); //Pedidos Stock

    setTimeout(() => {
      this.pedidosClientes.sort((a,b) => b.cantidad - a.cantidad);
      this.pedidosProductos.sort((a,b) => b.cantidad - a.cantidad);
      this.pedidosVendedores.sort((a,b) => b.cantidad - a.cantidad);
      this.pedidosStock.sort((a,b) => a.consecutivo - b.consecutivo);
    }, 500);
    setTimeout(() => {
      this.llenarGraficaPedidosClientes();
      this.llenarGraficaPedidosProductos();
      this.llenarGraficaPedidosVendedores();
      this.llenarGraficaPedidos();
    }, 1000);
  }

  consultarPedidosEstados(){
    this.zeusService.getPedidosEstados().subscribe(datos_pedidos => {
      this.pedidosTotales = [];
      this.cantidadTotalPedidos = 0;
      this.costoTotalPedidos = 0;
      this.cantidadPedidosPendientes = 0;
      this.cantidadPedidosParciales = 0;
      this.costoPedidosPendientes = 0;
      this.costoPedidosParicles = 0;

      for (const { estado, cantidad } of datos_pedidos) {
        estado === 'Pendiente' ? this.cantidadPedidosPendientes = cantidad : this.cantidadPedidosParciales = cantidad;
      }
      this.pedidosEstados = datos_pedidos;
      let info = { cantidad : 0, costo: 0 };
      for (const { cantidad, costo } of datos_pedidos) {
        this.cantidadTotalPedidos += cantidad;
        this.costoTotalPedidos += costo;
      }
      this.pedidosTotales.push(info);
    });
  }

  consultarPedidosOrdenesTrabajo(){
    this.zeusService.GetPedidos().subscribe(async datos_pedidos => {
      this.pedidos_Ot = [];
      for (let i = 0; i < datos_pedidos.length; i++) {
        const datos_orden = await this.ordenTrabajoService.GetOrdenesTrabajo_Pedido(datos_pedidos[i].consecutivo).toPromise();
        for (let j = 0; j < datos_orden.length; j++) {
          if (parseInt(datos_pedidos[i].id_Producto) == datos_orden[j].prod_Id) {
            let info : any = {
              pedido : datos_pedidos[i].consecutivo,
              orden : datos_orden[j].estProcOT_OrdenTrabajo,
              cliente : datos_pedidos[i].cliente,
              producto : datos_pedidos[i].producto,
              proceso : ''
            }
            if (datos_orden[j].estProcOT_ExtrusionKg > 0) info.proceso = `Extrusión ${this.formatonumeros(datos_orden[j].estProcOT_ExtrusionKg.toFixed(2))} Kg`;
            if (datos_orden[j].estProcOT_ImpresionKg > 0) info.proceso = `Impresión ${this.formatonumeros(datos_orden[j].estProcOT_ImpresionKg.toFixed(2))} Kg`;
            if (datos_orden[j].estProcOT_RotograbadoKg > 0) info.proceso = `Rotograbado ${this.formatonumeros(datos_orden[j].estProcOT_RotograbadoKg.toFixed(2))} Kg`;
            if (datos_orden[j].estProcOT_LaminadoKg > 0) info.proceso = `Laminado ${this.formatonumeros(datos_orden[j].estProcOT_LaminadoKg.toFixed(2))} Kg`;
            if (datos_orden[j].estProcOT_CorteKg > 0) info.proceso = `Corte - ${this.formatonumeros(datos_orden[j].estProcOT_CorteKg.toFixed(2))} Kg`;
            if (datos_orden[j].estProcOT_DobladoKg > 0) info.proceso = `Doblado ${this.formatonumeros(datos_orden[i].estProcOT_DobladoKg.toFixed(2))} Kg`;
            if (datos_orden[j].estProcOT_EmpaqueKg > 0) info.proceso = `Empaque ${this.formatonumeros(datos_orden[j].estProcOT_EmpaqueKg.toFixed(2))} Kg`;
            if (datos_orden[j].estProcOT_SelladoKg > 0) info.proceso = `Sellado ${this.formatonumeros(datos_orden[j].estProcOT_SelladoUnd.toFixed(2))} Und - ${this.formatonumeros(datos_orden[j].estProcOT_SelladoKg.toFixed(2))} Kg`;
            if (datos_orden[j].estProcOT_WiketiadoKg > 0) info.proceso = `Wiketiado ${this.formatonumeros(datos_orden[j].estProcOT_WiketiadoUnd.toFixed(2))} Und - ${this.formatonumeros(datos_orden[j].estProcOT_WiketiadoKg.toFixed(2))} Kg`;
            this.pedidos_Ot.push(info);
            this.pedidos_Ot.sort((a,b) => Number(a.pedido) - Number(b.pedido));
          }
        }
      }
    });
  }

  // Funcion que va a llenar la grafica de pie de la cantidad de pedidos por estados
  llenarGraficaPedidos(){
    this.multiAxisData = {
      labels: ['Pendiente', 'Parcialmente Satisfecho'],
      datasets: [
        {
          data: [this.cantidadPedidosPendientes, this.cantidadPedidosParciales],
          backgroundColor: ['#87B6FF', '#FF87B6'],
          hoverBackgroundColor: ['#BDD7FF', '#FFBDD7']
        }
      ]
    };

    this.multiAxisOptions = {
      plugins: {
        legend: {labels: {color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'], font: {size: 18}}},
        tooltip: {titleFont: {size: 25}, bodyFont: {size: 20}},
      },
    };
  }

  // Funcion que va a llenar la grafcia de los clientes con mas pedidos
  llenarGraficaPedidosClientes(){
    let clientes : any = [];
    let costo : any = [];
    let cantOt : any = [];
    for (let i = 0; i < 5; i++) {
      clientes.push(this.pedidosClientes[i].cliente);
      costo.push(this.pedidosClientes[i].costo);
      cantOt.push(this.pedidosClientes[i].cantidad);
    }
    this.graficaPedidosClientes = {
      labels: clientes,
      datasets: [
        {label: 'Cantidad de Pedidos por Clientes', backgroundColor: ['#FFFF64'], color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'], yAxisID: 'y', data: cantOt},
        {label: 'Valor Total de Ordenes de Pedidos ',  backgroundColor: ['#6475FF'], color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'], yAxisID: 'y1', data: costo}
      ]
    };
    this.estilosGrafica();
  }

  estilosGrafica(){
    this.opcionesGraficas = {
      stacked: false,
      plugins: {
        legend: { labels: {  color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'], usePointStyle: true, font: { size: 18 } } },
        tooltip: { titleFont: { size: 23, }, usePointStyle: true, bodyFont: { size: 18 } }
      },
      tooltip: { usePointStyle: true, },
      scales: {
        x: {
          ticks: {
              color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'],
            font: { size: 18 },
            callback: function(value) {
              if (this.getLabelForValue(value).length > 8) return `${this.getLabelForValue(value).substring(0, 5)}...`;
              else return this.getLabelForValue(value);
            }
          },
          grid: {color: '#ebedef'}
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          ticks: {color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'], font: {size: 18}},
          grid: {color: '#ebedef'}
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          ticks: {color: this.modoSeleccionado == true ? ['#F4F6F6'] : ['#495057'], font: {size: 18}},
          grid: {drawOnChartArea: false, color: '#ebedef'}
        },
      },
    };
  }

  // Funcion que va a llenar la grafica de los productos con mas pedidos
  llenarGraficaPedidosProductos(){
    let clientes : any = [];
    let costo : any = [];
    let cantOt : any = [];
    for (let i = 0; i < 5; i++) {
      clientes.push(this.pedidosProductos[i].producto);
      costo.push(this.pedidosProductos[i].costo);
      cantOt.push(this.pedidosProductos[i].cantidad);
    }
    this.graficaPedidosProductos = {
      labels: clientes,
      datasets: [
        {label: 'Cantidad de Pedidos vigentes ', backgroundColor: ['#FF646E'], yAxisID: 'y', data: cantOt},
        {label: 'Valor Total de Ordenes de Pedidos ',  backgroundColor: ['#A453FD',], yAxisID: 'y1', data: costo},
      ]
    };
  }

  // Funcion que va a llenar la grafica de los vendedores con mas pedidos
  llenarGraficaPedidosVendedores(){
    let vendedores : any = [];
    let costo : any = [];
    let cantidad_Pedidos : any = [];
    for(let i = 0; i < 5; i++) {
      vendedores.push(this.pedidosVendedores[i].vendedor);
      costo.push(this.pedidosVendedores[i].costo);
      cantidad_Pedidos.push(this.pedidosVendedores[i].cantidad);
    }
    this.graficaPedidosVendedores = {
      labels: vendedores,
      datasets : [{
        label: `Cantidad de pedidos`,
        backgroundColor : ['#42A5F5'],
        yAxisID: 'y',
        data : cantidad_Pedidos
      },
      {label: 'Valor Total de Ordenes de Pedidos ',  backgroundColor: ['#FFCA28'], yAxisID: 'y1', data: costo}
    ]
    };
  }

  // Funcion que va a mostrar la tabla detallada de cada una de los ranking de pedidos
  mostrarModal(tipo : string){
    this.mostrarTabla = true;
    this.infoTablaModal = [];
    if (tipo === 'Clientes') this.mostrarModalClientes();
    else if (tipo === 'Productos') this.mostrarModalProductos();
    else if (tipo === 'Vendedores') this.mostrarModalVendedores();
    this.infoTablaModal.sort((a,b) => Number(b.Cantidad) - Number(a.Cantidad));
  }

  mostrarModalClientes(){
    this.nombreGrafica = 'Información detallada del ranking de pedidos por clientes';
    for (let i = 0; i < this.pedidosClientes.length; i++) {
      this.infoTablaModal.push({
        Nombre : this.pedidosClientes[i].cliente,
        Cantidad : this.pedidosClientes[i].cantidad,
        Costo : this.pedidosClientes[i].costo
      });
    }
  }

  mostrarModalProductos(){
    this.nombreGrafica = 'Información detallada del ranking de pedidos por productos';
    for (let i = 0; i < this.pedidosProductos.length; i++) {
      this.infoTablaModal.push({
        Nombre : this.pedidosProductos[i].producto,
        Cantidad : this.pedidosProductos[i].cantidad,
        Costo : this.pedidosProductos[i].costo
      });
    }
  }

  mostrarModalVendedores(){
    this.nombreGrafica = 'Información detallada del ranking de pedidos por vendedores';
    for (let i = 0; i < this.pedidosVendedores.length; i++) {
      this.infoTablaModal.push({
        Nombre : this.pedidosVendedores[i].vendedor,
        Cantidad : this.pedidosVendedores[i].cantidad,
        Costo : this.pedidosVendedores[i].costo
      });
    }
  }
}