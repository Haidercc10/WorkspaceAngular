import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import moment from 'moment';
import { AppComponent } from 'src/app/app.component';
import { OverlayPanel } from 'primeng/overlaypanel';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { EstadosProcesos_OTService } from 'src/app/Servicios/EstadosProcesosOT/EstadosProcesos_OT.service';
import { Reporte_Procesos_OTComponent } from '../Reporte_Procesos_OT/Reporte_Procesos_OT.component';
import DataLabelsPlugin from 'chartjs-plugin-datalabels';
import { InventarioZeusService } from 'src/app/Servicios/InventarioZeus/inventario-zeus.service';

@Component({
  selector: 'app-Dashboard-OT',
  templateUrl: './Dashboard-OT.component.html',
  styleUrls: ['./Dashboard-OT.component.css']
})
export class DashboardOTComponent implements OnInit {

  @ViewChild(Reporte_Procesos_OTComponent) modalEstadosProcesos_OT : Reporte_Procesos_OTComponent;
  @ViewChild('op') op: OverlayPanel | undefined;

  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  today : any = moment().format('YYYY-MM-DD'); //Variable que va a almacenar la fecha del dia de hoy
  primerDiaMes : any = moment().startOf('month').format('YYYY-MM-DD'); //Variable que va a almacenar el primer dia del mes

  estadosOrdenes : any [] = [];
  totalOrdenesMes : number = 0; //Variable que va a almacenar la cantidad de ordenes que se ahn hecho en el ultimo mes
  costoTotalOrdenesMes : number = 0; //Variable que va a almacenar la costo total de las ordenes de trabajo del último mes
  catidadOTAbiertas : number = 0; //Variable que va a almacenar la cantidad de ordenes de trabajo que estan abiertas y no han inciado y no tienen asignaciones de materia prima
  cantidadOTAsignadas : number = 0; //Variable que va a almacenar la cantidad de ordenes de trabajo que tienen asignaciones de materia prima hechas pero que aun no se ha iniciado su produccion
  cantidadOTIniciada : number = 0; //Variable que va a almacenar la cantidad de ordenes de trabajo a las que ya se les inició su producción
  cantidadOTTerminada : number = 0; //variable que va a almacenar la cantidad de ordenes de trabajo que se terminaron
  cantidadOtAnulada : number = 0; //Variable que va a almcenar la cantidad de ordenes de trabajo que se han anulado
  cantidadOTCerrada : number = 0; //Variable que va a almacenar la cantidad de ordenes de trabajo cerradas
  clientesOrdenesMes : any [] = []; //Variable que va a almacenar los clientes a los que se les ha hecho ordenes y la cantidad de ordenes hechas a cada uno
  productosOrdenesMes : any [] = []; //Variable que va a almacenar los productos a los que se les ha hecho ordenes de trabajo y la cantidad de ordenes hechas de cada uno
  vendedorOrdenesMes : any [] = []; //Variable que almacenará los vendedores que han tenido ordenes de trabajo y la cantidad de cada uno
  procesosOrdenesMes : any [] = []; //Variable que va a almcencar la cantidad de que se ha hecho en cada proceso de produccion
  modalEstadosOrdenes : boolean = false; //Variable que mostrará el modal de los etsados de las ordenes o no
  nombreModalEstados : string = ''; //Variable que tendrá el nombre del estado seleccionado
  materialesOrdenesMes : any [] = []; //Variable que almacenará la informacion de los materiales en ordenes de trabajo
  clientesFacturados : any [] = []; //Variable que almacenará la informacion de los clientes a los que se les ha facturado en el mes
  productosFacturas : any [] = []; //Variable que almacenará la informacion de los productos a los que se les ha facturado en el mes
  vendedoresFacturas : any [] = []; //Variable que almacenará la informacion de los vendedores a los que se les ha facturado en el mes

  mostrarGrafica : boolean = false; //Variable que mostrará o no la información graficada
  nombreGrafica : string = 'Grafica'; //Variable que almacenará el nombre de la grafica
  multiAxisData: any;
  multiAxisOptions: any;
  multiAxisPlugins = [ DataLabelsPlugin ];
  nroCard : string = '';  /** Variable que identificará cual es la card de la cual se desea mostrar la descripción */

  constructor(private AppComponent : AppComponent,
                private bagProService : BagproService,
                  private ordenTrabajoService : EstadosProcesos_OTService,
                    private zeusService : InventarioZeusService,) { }

  ngOnInit() {
    this.lecturaStorage();
    this.tiempoExcedido();
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  //Funcion que se va a encargar de contar cuando pasen 1 minuto, al pasar este tiempo se cargarán nueva mente las consultas de algunas de las cards
  recargar = () => setTimeout(() => { this.tiempoExcedido(); }, 60000);

  //Funcion que va a encargarse de cargar la información de las cards y llama a la funcion de que contará en cunato tiempo se recargará la información
  tiempoExcedido() {
    this.llenarEstadosOrdenes();
    this.recargar();
  }

  // Funcion que va a llenar la informacion de los estados de ordenes de trabajo
  llenarEstadosOrdenes() {
    this.estadosOrdenes = [];
    this.clientesOrdenesMes = [];
    this.productosOrdenesMes = [];
    this.vendedorOrdenesMes = [];
    this.materialesOrdenesMes = [];
    this.procesosOrdenesMes = [];
    this.totalOrdenesMes = 0;
    this.costoTotalOrdenesMes = 0;

    if (this.ValidarRol == 1) {
      this.estadosOrdenes = [
        { Nombre : 'Abierta', Cantidad : 0, Class : 'bg-naranja', },
        { Nombre : 'Asignada', Cantidad : 0, Class : 'bg-azul', },
        { Nombre : 'Terminada', Cantidad : 0, Class : 'bg-verde', },
        { Nombre : 'En proceso', Cantidad : 0, Class : 'bg-amarillo', },
        { Nombre : 'Anulado', Cantidad : 0, Class : 'bg-rojo', },
        { Nombre : 'Cerrada', Cantidad : 0, Class : 'bg-verde2', },
      ];

      this.ordenTrabajoService.srvObtenerListaPorFechas(this.primerDiaMes, this.today).subscribe(datos_ot => {
        for (let i = 0; i < datos_ot.length; i++) {
          for (let j = 0; j < this.estadosOrdenes.length; j++) {
            if (datos_ot[i].estado_Nombre == this.estadosOrdenes[j].Nombre) this.estadosOrdenes[j].Cantidad += 1;
          }
        }
      });

      this.bagProService.GetCostoOrdenesUltimoMes_Clientes(this.primerDiaMes, this.today).subscribe(datos_ordenes => {
        this.clientesOrdenesMes = datos_ordenes;
        this.clientesOrdenesMes.sort((a,b) => Number(b.cantidad) - Number(a.cantidad));
        for (let i = 0; i < datos_ordenes.length; i++) {
          this.totalOrdenesMes += datos_ordenes[i].cantidad;
        }
      });

      this.ordenTrabajoService.GetProductosOrdenesUltimoMes(this.primerDiaMes, this.today).subscribe(datos_ordenes => {
        for (let i = 0; i < datos_ordenes.length; i++) {
          this.productosOrdenesMes.push(datos_ordenes[i]);
          this.productosOrdenesMes.sort((a,b) => a.prod_Nombre.localeCompare(b.prod_Nombre));
          this.productosOrdenesMes.sort((a,b) => Number(b.cantidad) - Number(a.cantidad));
        }
      });

      this.bagProService.GetCostoOrdenesUltimoMes_Vendedores(this.primerDiaMes, this.today).subscribe(datos => this.vendedorOrdenesMes = datos );
      this.vendedorOrdenesMes.sort((a,b) => Number(b.cantidad) - Number(a.cantidad));

      this.bagProService.GetCantOrdenesMateriales(this.primerDiaMes, this.today).subscribe(datos => this.materialesOrdenesMes = datos );
      this.materialesOrdenesMes.sort((a,b) => Number(b.cantidad) - Number(a.cantidad));

      this.bagProService.GetPesoProcesosUltimoMes(this.primerDiaMes, this.today).subscribe(datos_ordenes => {
        for (let i = 0; i < datos_ordenes.length; i++) {
          let estados : string [] = ['IMPRESION', 'LAMINADO', 'EXTRUSION', 'CORTE', 'ROTOGRABADO', 'DOBLADO', 'EMPAQUE', 'SELLADO', 'Wiketiado'];
          if (estados.includes(datos_ordenes[i].nomStatus)) {
            let id : number = 0;
            if (datos_ordenes[i].nomStatus == 'EXTRUSION') {
              id = 1;
              datos_ordenes[i].und = 0;
            }
            if (datos_ordenes[i].nomStatus == 'IMPRESION') {
              id = 2;
              datos_ordenes[i].und = 0;
            }
            if (datos_ordenes[i].nomStatus == 'ROTOGRABADO') {
              id = 3;
              datos_ordenes[i].und = 0;
            }
            if (datos_ordenes[i].nomStatus == 'LAMINADO') {
              id = 4;
              datos_ordenes[i].und = 0;
            }
            if (datos_ordenes[i].nomStatus == 'EMPAQUE') {
              id = 5;
              datos_ordenes[i].nomStatus = 'CORTE';
              datos_ordenes[i].und = 0;
            }
            if (datos_ordenes[i].nomStatus == 'DOBLADO') {
              id = 6;
              datos_ordenes[i].und = 0;
            }
            if (datos_ordenes[i].nomStatus == 'SELLADO') id = 7;
            if (datos_ordenes[i].nomStatus == 'Wiketiado') id = 8;
            let info : any  = {
              id : id,
              Nombre : datos_ordenes[i].nomStatus,
              cantidad : datos_ordenes[i].peso,
              und : datos_ordenes[i].und,
            }
            this.procesosOrdenesMes.push(info);
            this.procesosOrdenesMes.sort((a,b) => Number(a.id) - Number(b.id));
          }
        }
      });

      this.bagProService.GetCostoOrdenesUltimoMes(this.primerDiaMes, this.today).subscribe(datos_ordenes => {
        for (let i = 0; i < datos_ordenes.length; i++) {
          this.costoTotalOrdenesMes += datos_ordenes[i].costo;
        }
      });

      this.zeusService.GetClienteFacturadosMes().subscribe(data => this.clientesFacturados = data);

      this.zeusService.GetProductosFaturadosMes().subscribe(data => this.productosFacturas = data);

      this.zeusService.GetVendedoresFacturasMes().subscribe(data => this.vendedoresFacturas = data);
    }
  }

  // Funcion que va a llenar la grafica con la información de los vendedores
  llenarGraficaVendedores(){
    this.mostrarGrafica = true;
    this.nombreGrafica = `Grafica de Vendedores`;
    let vendedores : any = [];
    let costoVentas : any = [];
    let cantOt : any = [];
    for (let i = 0; i < 5; i++) {
      vendedores.push(this.vendedorOrdenesMes[i].nombreCompleto);
      costoVentas.push(this.vendedorOrdenesMes[i].costo);
      cantOt.push(this.vendedorOrdenesMes[i].cantidad);
    }
    this.multiAxisData = {
      labels: vendedores,
      datasets: [
        { label: 'Cantidad de Ordenes de Trabajo hechas ', backgroundColor: [ '#83D3FF', ], yAxisID: 'y', data: cantOt },
        { label: 'Valor Total de Ordenes de Trabajo ', backgroundColor: '#8AFC9B', yAxisID: 'y1', data: costoVentas }
      ]
    };
    this.multiAxisOptions = {
      stacked: false,
      plugins: {
        legend: { labels: { color: '#495057', font: { size: 20 } } },
        tooltip: { titleFont: { size: 30, }, bodyFont: { size: 20 } }
      },
      scales: {
        x: {
          ticks: {
            color: '#495057',
            font: { size: 15 },
            callback: function(value) {
              if (this.getLabelForValue(value).length > 6) return `${this.getLabelForValue(value).substring(0, 6)}...`;
              else return this.getLabelForValue(value);
            }
          },
          grid: { color: '#ebedef' }
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          ticks: { min: 0, max: 100, color: '#495057', font: { size: 20 } },
          grid: { color: '#ebedef' }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          grid: { drawOnChartArea: false, color: '#ebedef' },
          ticks: { min: 0, max: 100, color: '#495057', font: { size: 20 } }
        }
      },
      datalabels: { anchor: 'end', align: 'end' }
    };
  }

  // Funcion que va a llenar la grafica con informacion de los clientes
  llenarGraficaClientes(){
    this.mostrarGrafica = true;
    this.nombreGrafica = `Grafica de Clientes`;
    let clientes : any = [];
    let costo : any = [];
    let cantOt : any = [];
    for (let i = 0; i < 5; i++) {
      clientes.push(this.clientesOrdenesMes[i].clienteNom);
      costo.push(this.clientesOrdenesMes[i].costo);
      cantOt.push(this.clientesOrdenesMes[i].cantidad);
    }
    this.multiAxisData = {
      labels: clientes,
      datasets: [
        { label: 'Cantidad de Ordenes de Trabajo hechas ', backgroundColor: [ '#FF7878'], yAxisID: 'y', data: cantOt },
        { label: 'Valor Total de Ordenes de Trabajo ',  backgroundColor: [ '#F5B041', ], yAxisID: 'y1', data: costo }
      ]
    };
    this.multiAxisOptions = {
      stacked: false,
      plugins: {
        legend: { labels: { color: '#495057', font: { size: 20 } } },
        tooltip: { titleFont: { size: 30, }, bodyFont: { size: 20 } }
      },
      scales: {
        x: {
          ticks: {
            color: '#495057',
            font: { size: 15 },
            callback: function(value) {
              if (this.getLabelForValue(value).length > 6) return `${this.getLabelForValue(value).substring(0, 6)}...`;
              else return this.getLabelForValue(value);
            }
          },
          grid: { color: '#ebedef' }
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          ticks: { min: 0, max: 100, olor: '#495057', font: { size: 20 } },
          grid: { color: '#ebedef' }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          grid: { drawOnChartArea: false, color: '#ebedef' },
          ticks: { min: 0, max: 100, color: '#495057', font: { size: 20 } }
        }
      },
      datalabels: { anchor: 'end', align: 'end' }
    };
  }

  // Funcion que mostrará el modal de los estados de las ordenes de trabajo, adicional a eso le enviará parametros para que realice la consulta
  mostrarModalEstados(estado : string){
    this.modalEstadosOrdenes = true;
    this.modalEstadosProcesos_OT.modeModal = true;
    if (estado == 'Abierta') {
      this.nombreModalEstados = 'Ordenes de Trabajo Abiertas y No Iniciadas';
      this.modalEstadosProcesos_OT.formularioOT.setValue({
        idDocumento : null,
        fecha: this.primerDiaMes,
        fechaFinal : this.today,
        estado : 15,
        fallasOT : null,
        ObservacionOT : '',
        Vendedor : '',
        cliente : null,
        Id_Vendedor : null,
        producto : null,
      });
      this.modalEstadosProcesos_OT.consultarOT();
    } else if (estado == 'Asignada') {
      this.nombreModalEstados = 'Ordenes de Trabajo Asignadas y No Iniciadas';
      this.modalEstadosProcesos_OT.formularioOT.setValue({
        idDocumento : null,
        fecha: this.primerDiaMes,
        fechaFinal : this.today,
        estado : 14,
        fallasOT : null,
        ObservacionOT : '',
        Vendedor : '',
        cliente : null,
        Id_Vendedor : null,
        producto : null,
      });
      this.modalEstadosProcesos_OT.consultarOT();
    } else if (estado == 'En proceso') {
      this.nombreModalEstados = 'Ordenes de Trabajo En Proceso';
      this.modalEstadosProcesos_OT.formularioOT.setValue({
        idDocumento : null,
        fecha: this.primerDiaMes,
        fechaFinal : this.today,
        estado : 16,
        fallasOT : null,
        ObservacionOT : '',
        Vendedor : '',
        cliente : null,
        Id_Vendedor : null,
        producto : null,
      });
      this.modalEstadosProcesos_OT.consultarOT();
    } else if (estado == 'Terminada') {
      this.nombreModalEstados = 'Ordenes de Trabajo Terminadas';
      this.modalEstadosProcesos_OT.formularioOT.setValue({
        idDocumento : null,
        fecha: this.primerDiaMes,
        fechaFinal : this.today,
        estado : 17,
        fallasOT : null,
        ObservacionOT : '',
        Vendedor : '',
        cliente : null,
        Id_Vendedor : null,
        producto : null,
      });
      this.modalEstadosProcesos_OT.consultarOT();
    } else if (estado == 'Anulado') {
      this.nombreModalEstados = 'Ordenes de Trabajo Anuladas';
      this.modalEstadosProcesos_OT.formularioOT.setValue({
        idDocumento : null,
        fecha: this.primerDiaMes,
        fechaFinal : this.today,
        estado : 13,
        fallasOT : null,
        ObservacionOT : '',
        Vendedor : '',
        cliente : null,
        Id_Vendedor : null,
        producto : null,
      });
      this.modalEstadosProcesos_OT.consultarOT();
    } else if (estado == 'Cerrada') {
      this.nombreModalEstados = 'Ordenes de Trabajo Cerradas';
      this.modalEstadosProcesos_OT.formularioOT.setValue({
        idDocumento : null,
        fecha: this.primerDiaMes,
        fechaFinal : this.today,
        estado : 18,
        fallasOT : null,
        ObservacionOT : '',
        Vendedor : '',
        cliente : null,
        Id_Vendedor : null,
        producto : null,
      });
      this.modalEstadosProcesos_OT.consultarOT();
    }
  }

  mostrarDescripcion($event, card : string){
    this.nroCard = card;
    setTimeout(() => {
      this.op!.toggle($event);
      $event.stopPropagation();
    }, 500);
  }

}
