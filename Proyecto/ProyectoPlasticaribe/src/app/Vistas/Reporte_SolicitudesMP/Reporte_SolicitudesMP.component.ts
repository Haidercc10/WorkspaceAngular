import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { stepsMovMaquilas as defaultSteps, defaultStepOptions } from 'src/app/data';
import { ShepherdService } from 'angular-shepherd';
import { MessageService } from 'primeng/api';
import { AppComponent } from 'src/app/app.component';
import moment from 'moment';
import { EstadosService } from 'src/app/Servicios/Estados/estados.service';
import { Table } from 'primeng/table';
import { Reporte_SolicitudesMPService } from 'src/app/Servicios/Reporte_SolicitudesMP/Reporte_SolicitudesMP.service';
import { SolicitudMateriaPrimaService } from 'src/app/Servicios/SolicitudMateriaPrima/SolicitudMateriaPrima.service';
import { DetalleSolicitudMateriaPrimaService } from 'src/app/Servicios/DetalleSolicitudMateriaPrima/DetalleSolicitudMateriaPrima.service';

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
  cantPendientes : number = 0; /** Variable que mostrará el número de solicitudes pendientes */
  cantAceptadas : number = 0; /** Variable que mostrará el número de solicitudes aceptadas */
  cantFinalizadas : number = 0; /** Variable que mostrará el número de solicitudes finalizadas */
  cantCanceladas : number = 0; /** Variable que mostrará el número de solicitudes canceladas */

  constructor(private frmBuilder : FormBuilder,
                  private messageService: MessageService,
                    private shepherdService: ShepherdService,
                      private AppComponent : AppComponent,
                        private servicioEstados : EstadosService,
                          private servicioSolicitudesMP : SolicitudMateriaPrimaService,
                            private servicioDtSolicitudesMP : DetalleSolicitudMateriaPrimaService) {
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
    this.lecturaStorage();
    this.getEstadoSolitudes();
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

  /** Función que mostrará el numero de solicitudes por estado. */
  getEstadoSolitudes(){
    this.cantPendientes = 0;
    this.cantAceptadas = 0;
    this.cantFinalizadas = 0;
    this.cantCanceladas = 0;

    this.servicioSolicitudesMP.GetTodo().subscribe(data => {
      for (let index = 0; index < data.length; index++) {
        if(data[index].estado_Id == 11) this.cantPendientes += 1;
        if(data[index].estado_Id == 26) this.cantAceptadas += 1;
        if(data[index].estado_Id == 5) this.cantFinalizadas += 1;
        if(data[index].estado_Id == 4) this.cantCanceladas += 1;
      }
    });
  }

  /** Consulta para cargar información de las solicitudes de materia prima.  */
  consultarFiltros(){
    this.cargando = true;
    this.arrayRegistros = [];
    let solicitud : number = this.formFiltros.value.documento;
    let fechaInicial : any = moment(this.formFiltros.value.fechaDoc).format('YYYY-MM-DD');
    let fechaFinal : any = moment(this.formFiltros.value.fechaFinalDoc).format('YYYY-MM-DD');
    let estado : any = this.formFiltros.value.estadoDoc;
    let tamanoConsulta : number = 0;
    let arrayId : any = [];

    if (fechaInicial == 'Invalid date') fechaInicial = null;
    if (fechaFinal == 'Invalid date') fechaFinal = null;
    if(fechaInicial != null && fechaFinal == null) fechaFinal = fechaInicial;

    if(solicitud != null && estado != null && fechaInicial != null && fechaFinal != null) {
      this.servicioDtSolicitudesMP.GetInfoSolicitud(solicitud).subscribe(data => {
        tamanoConsulta = data.length;
        for (let index = 0; index < data.length; index++) {
          if(!arrayId.includes(data[index].consecutivo)) {
            this.llenarTabla(data[index]);
            arrayId.push(data[index].consecutivo);
          }
        }
      });
    } else if(solicitud != null && fechaInicial != null && estado != null) {
      this.servicioDtSolicitudesMP.GetInfoSolicitud(solicitud).subscribe(data => {
        tamanoConsulta = data.length;
        for (let index = 0; index < data.length; index++) {
          if(!arrayId.includes(data[index].consecutivo)) {
            this.llenarTabla(data[index]);
            arrayId.push(data[index].consecutivo);
          }
        }
      });
    } else if(solicitud != null && fechaInicial != null && fechaFinal != null) {
      this.servicioDtSolicitudesMP.GetInfoSolicitud(solicitud).subscribe(data => {
        tamanoConsulta = data.length;
        for (let index = 0; index < data.length; index++) {
          if(!arrayId.includes(data[index].consecutivo)) {
            this.llenarTabla(data[index]);
            arrayId.push(data[index].consecutivo);
          }
        }
      });
    } else if(solicitud != null && fechaInicial != null) {
      this.servicioDtSolicitudesMP.GetInfoSolicitud(solicitud).subscribe(data => {
        tamanoConsulta = data.length;
        for (let index = 0; index < data.length; index++) {
          if(!arrayId.includes(data[index].consecutivo)) {
            this.llenarTabla(data[index]);
            arrayId.push(data[index].consecutivo);
          }
        }
      });
    } else if(solicitud != null && estado != null) {
      this.servicioDtSolicitudesMP.GetInfoSolicitud(solicitud).subscribe(data => {
        tamanoConsulta = data.length;
        for (let index = 0; index < data.length; index++) {
          this.llenarTabla(data[index]);
        }
      });
    } else if(fechaInicial != null && fechaFinal != null) {
      this.servicioSolicitudesMP.getFechas(fechaInicial, fechaFinal).subscribe(data => {
        tamanoConsulta = data.length;
        for (let index = 0; index < data.length; index++) {
          if(!arrayId.includes(data[index].consecutivo)) {
            this.llenarTabla(data[index]);
            arrayId.push(data[index].consecutivo);
          }
        }
      });
    } else if(fechaInicial != null && estado != null) {
      this.servicioSolicitudesMP.getFechasEstado(fechaInicial, fechaInicial, estado).subscribe(data => {
        if(data.length > 0) {
          for (let index = 0; index < data.length; index++) {
            this.llenarTabla(data[index]);
          }
        } else this.mostrarAdvertencia(`Advertencia`, `No se encontraron registros con los filtros consultados!`);
      });
    } else if(solicitud != null) {
      this.servicioDtSolicitudesMP.GetInfoSolicitud(solicitud).subscribe(data => {
        tamanoConsulta = data.length;
        for (let index = 0; index < data.length; index++) {
          if(!arrayId.includes(data[index].consecutivo)) {
            this.llenarTabla(data[index]);
            arrayId.push(data[index].consecutivo);
          }
        }
      });
    } else if(estado != null) {
      this.servicioSolicitudesMP.getEstados(estado).subscribe(data => {
        tamanoConsulta = data.length;
        for (let index = 0; index < data.length; index++) {
          if(!arrayId.includes(data[index].consecutivo)) {
            this.llenarTabla(data[index]);
            arrayId.push(data[index].consecutivo);
          }
        }
      });
    } else if(fechaInicial != null) {
      this.servicioSolicitudesMP.getFechas(fechaInicial, fechaInicial).subscribe(data => {
        tamanoConsulta = data.length;
        for (let index = 0; index < data.length; index++) {
          if(!arrayId.includes(data[index].consecutivo)) {
            this.llenarTabla(data[index]);
            arrayId.push(data[index].consecutivo);
          }
        }
      });
    } else {
      this.servicioSolicitudesMP.getFechas(this.today, this.today).subscribe(data => {
        tamanoConsulta = data.length;
        for (let index = 0; index < data.length; index++) {
          if(!arrayId.includes(data[index].consecutivo)) {
            this.llenarTabla(data[index]);
            arrayId.push(data[index].consecutivo);
          }
        }
      });
    }

    if(tamanoConsulta == 0) {
      setTimeout(() => {
        this.cargando = false;
        this.mostrarAdvertencia(`Advertencia`, `No se encontraron registros con los filtros consultados!`)
      }, 2000);
    }
  }

  /** Función para limpiar los campos del formulario */
  limpiarCampos() {
    this.formFiltros.reset();
  }

  aplicarFiltro($event, campo : any, valorCampo : string) {
    this.dt!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);
  }

  /** Llenar array con los registros de los detalles de las solicitudes de materia prima. */
  llenarTabla(datos : any) {
    let solicitudes : any = {
      id : datos.consecutivo,
      usuario : datos.usuario,
      fecha : datos.fecha.replace('T00:00:00', ''),
      estado : datos.estado_Solicitud,
    }
    this.arrayRegistros.push(solicitudes);
    console.log(this.arrayRegistros);
  }

   /** Mostrar mensaje de confirmación  */
  mostrarConfirmacion(mensaje : any, titulo?: any) {
   this.messageService.add({severity: 'success', summary: mensaje, detail: titulo, life : 2000});
  }

  /** Mostrar mensaje de error  */
  mostrarError(mensaje : any, titulo?: any) {
   this.messageService.add({severity:'error', summary: mensaje, detail: titulo , life : 5000});
  }

  /** Mostrar mensaje de advertencia */
  mostrarAdvertencia(mensaje : any, titulo?: any) {
   this.messageService.add({severity:'warn', summary: mensaje, detail: titulo , life : 2000});
  }
}
