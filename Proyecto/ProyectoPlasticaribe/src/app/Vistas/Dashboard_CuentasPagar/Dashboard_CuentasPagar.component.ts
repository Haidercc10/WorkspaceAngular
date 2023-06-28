import { Component, OnInit, ViewChild } from '@angular/core';
import { ShepherdService } from 'angular-shepherd';
import moment from 'moment';
import { Table } from 'primeng/table';
import { ZeusContabilidadService } from 'src/app/Servicios/Zeus_Contabilidad/zeusContabilidad.service';
import { AppComponent } from 'src/app/app.component';
import { defaultStepOptions, stepsDashboardFacturacion as defaultSteps } from 'src/app/data';

@Component({
  selector: 'app-Dashboard_CuentasPagar',
  templateUrl: './Dashboard_CuentasPagar.component.html',
  styleUrls: ['./Dashboard_CuentasPagar.component.css']
})
export class Dashboard_CuentasPagarComponent implements OnInit {

  cargando : boolean = false; //Variable para validar que salga o no la imagen de carga
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  today : any = moment().format('YYYY-MM-DD'); //Variable que va a almacenar la fecha del dia de hoy
  primerDiaMes : any = moment().startOf('month').format('YYYY-MM-DD'); //Variable que va a almacenar el primer dia del mes
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro
  carteraAgrupadaProveedores : any [] = []; //Variable que almacenará la información de la cartera agrupada por los clientes
  cartera : any [] = []; //Variable que almacenará la información de la cartera, información detalla de cada una de las facturas en cartera
  totalCartera : number = 0; //Variable que almacenará el valor total de la cartera
  @ViewChild('dt_carteraAgrupada') dt_carteraAgrupada: Table | undefined;

  constructor(private AppComponent : AppComponent,
                private zeusService : ZeusContabilidadService,
                  private shepherdService: ShepherdService) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
  }

  ngOnInit() {
    this.lecturaStorage();
    this.tiempoExcedido();
  }

  // Funcion que iniciará el tutorial
  tutorial(){
    this.shepherdService.defaultStepOptions = defaultStepOptions;
    this.shepherdService.modal = true;
    this.shepherdService.confirmCancel = false;
    this.shepherdService.addSteps(defaultSteps);
    this.shepherdService.start();
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  //Funcion que se va a encargar de contar cuando pasen 1 minuto, al pasar este tiempo se cargarán nueva mente las consultas de algunas de las cards
  recargar = () => setTimeout(() => this.tiempoExcedido(), 60000);

  //Funcion que va a encargarse de cargar la información de las cards y llama a la funcion de que contará en cunato tiempo se recargará la información
  tiempoExcedido() {
    this.consultarCartera();
    this.recargar();
  }

  // Función que ejecutará las peticiones de la cartera
  consultarCartera(){
    this.cargando = true;
    this.carteraAgrupadaProveedores = [];
    this.zeusService.GetCostosProveedores('220505').subscribe(data => {
      let numDatos : number = 0;
      for (let i = 0; i < data.length; i++) {
        let info : any = {
          Id_Proveedor : data[i].idprove,
          Proveedor : data[i].razoncial,
          Cartera : data[i].sdaccta,
          Cuenta : data[i].codicta,
          Periodo : data[i].anomescta,
          Detalles : [],
        }
        this.carteraAgrupadaProveedores.push(info);
        numDatos += 1;
        numDatos == data.length ? this.cargando = false : 0;
      }
    });
    this.zeusService.GetCostosTotalProveedores('220505').subscribe(data => this.totalCartera = data);
    setTimeout(() => {
      this.zeusService.GetFacturasProveedores('220505').subscribe(data => {
        for (let i = 0; i < data.length; i++) {
          let index = this.carteraAgrupadaProveedores.findIndex(item => item.Id_Proveedor == data[i].id_Proveedor);
          this.carteraAgrupadaProveedores[index].Detalles.push(data[i]);
        }
      });
    }, 2000);
  }

  // Funcion que va a tomar a calcular los dias de retraso de la factura
  calcularDiasRetraso(factura : any, proveedor : any){
    let index = this.carteraAgrupadaProveedores.findIndex(item => item.Id_Proveedor == proveedor);
    let info : any [] = this.carteraAgrupadaProveedores[index].Detalles.filter(item => item.factura == factura);
    let dias : number = 0;
    for (let i = 0; i < info.length; i++) {
      dias = moment().diff(moment(info[i].fecha_Vencimiento), 'days');
    }
    return dias < 0 ? dias - 1 : dias;
  }

  aplicarfiltro = ($event, campo : any, valorCampo : string) => this.dt_carteraAgrupada!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);
}
