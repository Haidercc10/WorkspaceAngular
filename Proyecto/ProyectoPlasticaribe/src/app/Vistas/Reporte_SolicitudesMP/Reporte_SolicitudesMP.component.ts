import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { stepsMovMaquilas as defaultSteps, defaultStepOptions } from 'src/app/data';
import { ShepherdService } from 'angular-shepherd';
import { MessageService } from 'primeng/api';
import { AppComponent } from 'src/app/app.component';
import moment from 'moment';
import { EstadosService } from 'src/app/Servicios/Estados/estados.service';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-Reporte_SolicitudesMP',
  templateUrl: './Reporte_SolicitudesMP.component.html',
  styleUrls: ['./Reporte_SolicitudesMP.component.css']
})
export class Reporte_SolicitudesMPComponent implements OnInit {
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro
  cargando : boolean = false;
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol
  formFiltros !: FormGroup; /** Formulario de filtros de búsqueda */
  estados : any = []; /** Array que contendrá los estados de las solicitudes */
  arrayRegistros : any = []; /** Array que contendrá la tabla luego de realizar una consulta */
  @ViewChild('dt') dt: Table | undefined;

  constructor(private frmBuilder : FormBuilder,
                  private messageService: MessageService,
                    private shepherdService: ShepherdService,
                      private AppComponent : AppComponent,
                        private servicioEstados : EstadosService) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;

    this.formFiltros = this.frmBuilder.group({
      documento : [null],
      fechaDoc: [null],
      fechaFinalDoc: [null],
      estadoDoc : [null]
    });
  }

  ngOnInit() {
    this.obtenerEstados();
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  /** Función que mostrará un tutorial describiendo paso a paso cada funcionalidad de la aplicación */
  verTutorial() {
    this.shepherdService.defaultStepOptions = defaultStepOptions;
    this.shepherdService.modal = true;
    this.shepherdService.confirmCancel = false;
    this.shepherdService.addSteps(defaultSteps);
    this.shepherdService.start();
  }

    // Funcion que va a consultar y almacenar los estados que pueden tener los documentos
  obtenerEstados(){
    this.servicioEstados.srvObtenerListaEstados().subscribe(datos_estados => {
      for (let i = 0; i < datos_estados.length; i++) {
        if (datos_estados[i].estado_Id == 11 || datos_estados[i].estado_Id == 5 || datos_estados[i].estado_Id == 4 || datos_estados[i].estado_Id == 26) this.estados.push(datos_estados[i]);
      }
    });
  }

  consultarFiltros(){
    this.cargando = true;
    this.arrayRegistros = [];
    let solicitud : number = this.formFiltros.value.documento;
    let fechaInicial : any = moment(this.formFiltros.value.fechaDoc).format('YYYY-MM-DD');
    let fechaFinal : any = moment(this.formFiltros.value.fechaFinalDoc).format('YYYY-MM-DD');
    let estado : any = this.formFiltros.value.estadoDoc;

    if (fechaInicial == 'Invalid date') fechaInicial = null;
    if (fechaFinal == 'Invalid date') fechaFinal = null;

    console.log(fechaInicial)
    console.log(fechaFinal)
  }

  /** Función para lipiar los campos del formulario */
  limpiarCampos() {
    this.formFiltros.reset();
  }

  aplicarFiltro($event, campo : any, valorCampo : string) {
    this.dt!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);
  }
}
