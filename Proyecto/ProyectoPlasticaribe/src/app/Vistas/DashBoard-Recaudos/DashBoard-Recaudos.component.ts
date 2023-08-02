import { Component, OnInit } from '@angular/core';
import { ShepherdService } from 'angular-shepherd';
import moment from 'moment';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { ZeusContabilidadService } from 'src/app/Servicios/Zeus_Contabilidad/zeusContabilidad.service';
import { AppComponent } from 'src/app/app.component';
import { defaultStepOptions, stepsDashboardRecaudos as defaultSteps } from 'src/app/data';
import { PaginaPrincipalComponent } from '../PaginaPrincipal/PaginaPrincipal.component';

@Component({
  selector: 'app-DashBoard-Recaudos',
  templateUrl: './DashBoard-Recaudos.component.html',
  styleUrls: ['./DashBoard-Recaudos.component.css']
})
export class DashBoardRecaudosComponent implements OnInit {

  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  today : any = moment().format('YYYY-MM-DD'); //Variable que va a almacenar la fecha del dia de hoy
  primerDiaMes : any = moment().startOf('month').format('YYYY-MM-DD'); //Variable que va a almacenar el primer dia del mes
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro
  carteraAgrupadaClientes : any [] = []; //Variable que almacenará la información de la cartera agrupada por los clientes
  carteraAgrupadaVendedores : any [] = []; //Variable que almacenará la información de la cartera agrupada por vendedores
  cartera : any [] = []; //Variable que almacenará la información de la cartera, información detalla de cada una de las facturas en cartera
  totalCartera : number = 0; //Variable que almacenará el valor total de la cartera

  constructor(private AppComponent : AppComponent,
                private zeusService : ZeusContabilidadService,
                  private shepherdService: ShepherdService,
                    private paginaPrincial : PaginaPrincipalComponent,) {
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
    if (this.paginaPrincial.recaudos){
      this.consultarCartera();
      this.recargar();
    }
  }

  // Función que ejecutará las peticiones de la cartera
  consultarCartera(){
    this.zeusService.GetCarteraAgrupadaClientes().subscribe(data => this.carteraAgrupadaClientes = data);
    this.zeusService.GetCarteraAgrupadaVendedores().subscribe(data => this.carteraAgrupadaVendedores = data);
    this.zeusService.GetCartera().subscribe(data => this.totalCartera = data);
    this.zeusService.GetCarteraTotal().subscribe(data => this.cartera = data);

  }
}
