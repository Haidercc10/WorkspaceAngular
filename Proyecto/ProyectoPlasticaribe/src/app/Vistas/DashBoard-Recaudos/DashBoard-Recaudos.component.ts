import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ShepherdService } from 'angular-shepherd';
import moment from 'moment';
import { Table } from 'primeng/table';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { UsuarioService } from 'src/app/Servicios/Usuarios/usuario.service';
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

  @ViewChild('dt1') dt1: Table | undefined;
  cargando : boolean = false; //Variable para validar que salga o no la imagen de carga  
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
  vendedores : any [] = []; //Variable que almacenará la información de los vendedores
  clientes : any [] = []; //Variable que almacenará la información de los clientes
  FormFiltros : FormGroup;

  constructor(private AppComponent : AppComponent,
                private zeusService : ZeusContabilidadService,
                  private shepherdService: ShepherdService,
                    private paginaPrincial : PaginaPrincipalComponent,
                      private frmBuilder : FormBuilder,
                        private vendedorService : UsuarioService,
                          private msj : MensajesAplicacionService,) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;

    this.FormFiltros = this.frmBuilder.group({
      Cliente : [null],
      Vendedor : [null],
    });
  }

  ngOnInit() {
    this.lecturaStorage();
    this.obtenerVendedor();
    this.obtenerClientes();
    this.tiempoExcedido();
    setInterval(() => this.modoSeleccionado = this.AppComponent.temaSeleccionado, 1000);
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

  aplicarfiltro = ($event, data : any, campo : any) => data!.filter(($event.target as HTMLInputElement).value, campo, 'contains');

  //Funcion que se va a encargar de contar cuando pasen 1 minuto, al pasar este tiempo se cargarán nueva mente las consultas de algunas de las cards
  recargar = () => setInterval(() => this.tiempoExcedido(), 60000);

  //Funcion que va a encargarse de cargar la información de las cards y llama a la funcion de que contará en cunato tiempo se recargará la información
  tiempoExcedido() {
    if (this.paginaPrincial.recaudos){
      this.consultarCartera();
      // this.recargar();
    }
  }

  // Funcion que consultará los clientes
  obtenerClientes = () => this.zeusService.GetClientes().subscribe(data => this.clientes = data);

  // Funcion que consultará los vendedores
  obtenerVendedor = () => this.vendedorService.GetVendedores().subscribe(data => this.vendedores = data.map(x => x.usua_Nombre));

  // Función que ejecutará las peticiones de la cartera
  consultarCartera(){
    this.cargando = true;
    let ruta : string = "";
    let cliente : string = this.FormFiltros.value.Cliente;
    let vendedor : string = this.FormFiltros.value.Vendedor;

    this.carteraAgrupadaClientes = [];
    this.carteraAgrupadaVendedores = [];
    this.cartera = [];
    this.totalCartera = 0;

    if (vendedor != null) ruta += `vendedor=${vendedor}`;
    if (cliente != null) ruta.length > 0 ? ruta += `&cliente=${cliente}` : ruta += `cliente=${cliente}`;
    if (ruta.length > 0) ruta = `?${ruta}`;

    this.zeusService.GetCarteraAgrupadaClientes(ruta).subscribe(data => this.carteraAgrupadaClientes = data);
    this.zeusService.GetCarteraAgrupadaVendedores(ruta).subscribe(data => this.carteraAgrupadaVendedores = data);
    this.zeusService.GetCartera(ruta).subscribe(data => this.totalCartera = data, err => this.msj.mensajeError(`${err.error}`));
    this.zeusService.GetCarteraTotal(ruta).subscribe(data => this.cartera = data);
    setTimeout(() => this.cargando = false, 5000);
  }
}