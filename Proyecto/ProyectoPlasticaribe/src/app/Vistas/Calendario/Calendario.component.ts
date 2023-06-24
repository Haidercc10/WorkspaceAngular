import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CalendarOptions } from '@fullcalendar/core';
import esLocale from '@fullcalendar/core/locales/es';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import moment from 'moment';
import { MessageService } from 'primeng/api';
import { modelEventosCalendario } from 'src/app/Modelo/modelEventosCalendario';
import { EventosCalendarioService } from 'src/app/Servicios/EventosCalendario/EventosCalendario.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { RolesService } from 'src/app/Servicios/Roles/roles.service';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-Calendario',
  templateUrl: './Calendario.component.html',
  styleUrls: ['./Calendario.component.css']
})

export class CalendarioComponent implements OnInit {

  FormEvento !: FormGroup; //Formulario que tendrá la informacion del evento a crear o el evento a editar
  cargando : boolean = false;
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro
  modalEvento : boolean = false; //Variable que validará si se ve el modal de creación, edición y eliminación de eventos
  accion : string = 'Crear'; //Variable que tendrá la información del titulo que tendrá el modal
  visibilidadSeleccionable: any[] = [{ key: `A`, label: `Solo Yo`, data: `Solo Yo`, icon: 'pi pi-fw pi-user', children: [] }]; //Variable que almacenará las opciones de usuarios a ver el evento
  visibilidadSeleccionada: any; //VAriable que almacenará los usuarios que podrán ver el evento
  eventoSeleccionado : number = 0; //VAriable que almacenará el id del evento a editar o eliminar
  events : any [] = []; //Variable que almacenará la información de los eventos
  options : CalendarOptions; //Variable que almacenará la configuración del calendario

  constructor(private eventosCalService : EventosCalendarioService,
                private AppComponent : AppComponent,
                  private frmBuilder : FormBuilder,
                    private rolesService : RolesService,
                      private mensajesService : MensajesAplicacionService,
                        private messageService: MessageService,) {
    this.FormEvento = this.frmBuilder.group({
      Nombre : [null, Validators.required],
      Descripcion : [null, Validators.required],
      FechaInicio : [null, Validators.required],
      FechaFin : [null, Validators.required],
      Visibilidad : [null, Validators.required],
    });
  }

  ngOnInit() {
    this.lecturaStorage();
    this.obtenerRoles();
    this.opcionesCalendario();
    this.obtenerEventos('');
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
  }

  // Funcion que va a limpiar los datos del modal
  limpiarModal(){
    this.cargando = false;
    this.FormEvento.reset();
    this.visibilidadSeleccionada = [];
    this.modalEvento = false;
    this.eventoSeleccionado = 0;
  }

  // Funcion que va a cargar los roles que se podrán elegir en la visibilidad del evento
  obtenerRoles() {
    this.visibilidadSeleccionable.push(
      { key: `B`, label: `Todos`, data: `Todos`, icon: 'pi pi-fw pi-users', children: [] },
      { key: `C`, label: `Solo...`, data: `Solo...`, icon: 'pi pi-fw pi-user', children: [] }
    );
    this.rolesService.srvObtenerLista().subscribe(data => {
      for (let i = 0; i < data.length; i++) {
        this.visibilidadSeleccionable[2].children.push({
          key: data[i].rolUsu_Id,
          label: data[i].rolUsu_Nombre,
          data: data[i].rolUsu_Nombre,
          icon: 'pi pi-fw pi-user',
          children: []
        });
      }
    });
    setTimeout(() => {
      if (this.ValidarRol != 1) {
        this.visibilidadSeleccionable[2].children = this.visibilidadSeleccionable[2].children.filter(item => item.key == this.ValidarRol);
        this.visibilidadSeleccionable.splice(1, 1);
      }
    }, 500);
  }

  // Funcion que llenará la información de la configuración del calendario
  opcionesCalendario() {
    this.options = {
      plugins: [dayGridPlugin,timeGridPlugin,interactionPlugin],
      dateClick: this.fechaClick.bind(this),
      eventClick : this.eventoClick.bind(this),
      // datesSet: ,
      locale: esLocale,
      headerToolbar: {
        start: 'dayGridMonth,timeGridWeek,timeGridDay',
        center: 'title',
        end: 'prevYear,prev,next,nextYear'
      },
      editable: false,
      selectable: true
    }
  }

  // Funcion que buscará en la base de datos los eventos
  obtenerEventos(data : any){
    this.cargando = true;
    this.events = [];
    let inicio : any = data == '' ? moment().startOf('month').format('YYYY-MM-DD') : moment(data.start).format('YYYY-MM-DD');
    let fin : any = data == '' ? moment().endOf('month').format('YYYY-MM-DD') : moment(data.end).format('YYYY-MM-DD');
    this.eventosCalService.GetEventosUsuario(this.storage_Id, this.ValidarRol, inicio, fin).subscribe(data => {
      for (let i = 0; i < data.length; i++) {
        this.events.push({
          Id: data[i].eventoCal_Id,
          title: data[i].eventoCal_Nombre,
          start: `${data[i].eventoCal_FechaInicial.replace('T00:00:00', '')} ${(data[i].eventoCal_HoraInicial).length < 8 ? `0${data[i].eventoCal_HoraInicial}` : data[i].eventoCal_HoraInicial}`,
          end: `${data[i].eventoCal_FechaFinal.replace('T00:00:00', '')} ${(data[i].eventoCal_HoraFinal).length < 8 ? `0${data[i].eventoCal_HoraFinal}` : data[i].eventoCal_HoraFinal}`,
          descripcion: data[i].eventoCal_Descripcion,
          Visibilidad: data[i].eventoCal_Visibilidad,
        });
      }
    }, error => this.mensajesService.mensajeError(`¡Ocurrió un error!`, `¡${error.error}!`));
    setTimeout(() => this.cargando = false, 500);
  }

  // Funcion que va a abrir el modal de creacion, edicion y eliminacion de eventos cada vez que presionene click sobre una fecha
  fechaClick(data : any) {
    this.limpiarModal();
    this.accion = 'Crear';
    this.FormEvento.patchValue({
      FechaInicio : `${data.dateStr} 00:00:00`,
      FechaFin : `${data.dateStr} 00:00:00`,
    });
    this.modalEvento = true;
  }

  // Funcion que va a abrir el modal con la información del evento sobre el que se ha hecho click para que pueda ser editado
  eventoClick(data : any){
    this.accion = 'Editar';
    this.eventoSeleccionado = data.event._def.extendedProps.Id;
    this.visibilidadSeleccionada = [];
    let visibilidad : any [] = data.event._def.extendedProps.Visibilidad.trim().split('|').filter((item: string) => item != '');
    let c : number = this.visibilidadSeleccionable.findIndex(item => item.key == 'C');
    if (visibilidad[0] == 'Solo Yo') {
      visibilidad[0] = 'A';
      this.visibilidadSeleccionada = this.visibilidadSeleccionable.filter(item => item.key == visibilidad[0]);
    } else {
      if (visibilidad.length == this.visibilidadSeleccionable[c].children.length) {
        visibilidad = ['B'];
        this.visibilidadSeleccionada = this.visibilidadSeleccionable.filter(item => item.key == visibilidad[0]);
      } else {
        for (let i = 0; i < this.visibilidadSeleccionable[c].children.length; i++) {
          if (visibilidad.includes((this.visibilidadSeleccionable[c].children[i].key).toString())) {
            this.visibilidadSeleccionada.push(this.visibilidadSeleccionable[c].children[i]);
          }
        }
      }
    }

    this.FormEvento.patchValue({
      Nombre : data.event.title,
      Descripcion : data.event._def.extendedProps.descripcion,
      FechaInicio : moment(data.event.start).format('YYYY-MM-DD H:mm:ss'),
      FechaFin : moment(data.event.end).format('YYYY-MM-DD H:mm:ss'),
    });
    this.modalEvento = true;
  }

  // Funcion que va a validar si el formulario de creacion, edicion y eliminacion de eventos es valido y que función se está ejecutando
  validarFormularioEvento(){
    if (this.FormEvento.valid) {
      if (this.accion == 'Crear') this.crearEvento();
      else if (this.accion == 'Editar') this.editarEvento();
    } else this.mensajesService.mensajeAdvertencia(`¡Advertencia!`, `¡Debe llenar todos los campos para poder crear o editar el evento!`);
  }

  // Funcion que va a crear un evento
  crearEvento(){
    let visibilidad : string = '';
    let todos : string = '';
    this.rolesService.srvObtenerLista().subscribe(data => {
      for (let i = 0; i < data.length; i++) {
        todos += `|${data[i].rolUsu_Id}`
      }
    });
    setTimeout(() => {
      for (const item of this.visibilidadSeleccionada) {
        if (this.visibilidadSeleccionada.some(item => item.key == 'A')) {
          visibilidad = `|Solo Yo`;
          break;
        }
        if (this.visibilidadSeleccionada.some(item => item.key == 'B')) {
          visibilidad = todos;
          break;
        }
        visibilidad += `|${item.key}`;
      }
      let datos : modelEventosCalendario = {
        Usua_Id: this.storage_Id,
        EventoCal_FechaCreacion: moment().format('YYYY-MM-DD'),
        EventoCal_HoraCreacion: moment().format('H:mm:ss'),
        EventoCal_Nombre: this.FormEvento.value.Nombre,
        EventoCal_Descripcion: this.FormEvento.value.Descripcion,
        EventoCal_FechaInicial: moment(this.FormEvento.value.FechaInicio).format('YYYY-MM-DD'),
        EventoCal_HoraInicial: moment(this.FormEvento.value.FechaInicio).format('H:mm:ss'),
        EventoCal_FechaFinal:  moment(this.FormEvento.value.FechaFin).format('YYYY-MM-DD'),
        EventoCal_HoraFinal: moment(this.FormEvento.value.FechaFin).format('H:mm:ss'),
        EventoCal_Visibilidad: visibilidad += '|',
      }
      this.eventosCalService.Post(datos).subscribe(() => {
        this.mensajesService.mensajeConfirmacion(`¡Evento Creado!`, `¡Se ha creado un nuevo evento!`);
        this.obtenerEventos('');
        setTimeout(() => this.limpiarModal(), 500);
      }, () =>  this.mensajesService.mensajeError(`¡Error!`, `¡No se pudo crear el evento!`));
    }, 200);
  }

  // Funcion que va a editar un evento
  editarEvento() {
    let visibilidad : string = '';
    let todos : string = '';
    this.rolesService.srvObtenerLista().subscribe(data => {
      for (let i = 0; i < data.length; i++) {
        todos += `|${data[i].rolUsu_Id}`
      }
    });
    setTimeout(() => {
      for (const item of this.visibilidadSeleccionada) {
        if (this.visibilidadSeleccionada.some(item => item.key == 'A')) {
          visibilidad = `|Solo Yo`;
          break;
        }
        if (this.visibilidadSeleccionada.some(item => item.key == 'B')) {
          visibilidad = todos;
          break;
        }
        visibilidad += `|${item.key}`;
      }
      let datos : modelEventosCalendario = {
        EventoCal_Id : this.eventoSeleccionado,
        Usua_Id: this.storage_Id,
        EventoCal_FechaCreacion: moment().format('YYYY-MM-DD'),
        EventoCal_HoraCreacion: moment().format('H:mm:ss'),
        EventoCal_Nombre: this.FormEvento.value.Nombre,
        EventoCal_Descripcion: this.FormEvento.value.Descripcion,
        EventoCal_FechaInicial: moment(this.FormEvento.value.FechaInicio).format('YYYY-MM-DD'),
        EventoCal_HoraInicial: moment(this.FormEvento.value.FechaInicio).format('H:mm:ss'),
        EventoCal_FechaFinal:  moment(this.FormEvento.value.FechaFin).format('YYYY-MM-DD'),
        EventoCal_HoraFinal: moment(this.FormEvento.value.FechaFin).format('H:mm:ss'),
        EventoCal_Visibilidad: visibilidad += '|',
      }
      this.eventosCalService.Put(datos.EventoCal_Id, datos).subscribe(() => {
        this.mensajesService.mensajeConfirmacion(`¡Evento Editado!`, `¡Se ha editado un evento!`);
        this.obtenerEventos('');
        setTimeout(() => this.limpiarModal(), 500);
      }, () => this.mensajesService.mensajeError(`¡Error!`, `¡No se pudo editar el evento!`));
    }, 200);
  }

  // Funcion que va a confirmar que si se desea eliminar un evento
  confirmarEliminacion(){
    this.messageService.add({
      severity:'warn',
      key: 'eliminar',
      summary:'¿Estás seguro de eliminar el evento?',
      detail:
      `<b>Evento:</b> ${this.FormEvento.value.Nombre} <br> ` +
      `<b>Fecha Inicio:</b> ${this.FormEvento.value.FechaInicio} <br>` +
      `<b>Fecha Fin:</b> ${this.FormEvento.value.FechaFin} <br>`,
      sticky: true
    });
  }

  // Funcion que va a eliminar un evento
  eliminarEvento(){
    this.cerrarMensaje('eliminar');
    this.eventosCalService.Delete(this.eventoSeleccionado).subscribe(() => {
      this.mensajesService.mensajeConfirmacion(`¡Evento Eliminado!`, `¡Se ha eliminado el evento seleccionado!`);
      this.obtenerEventos('');
      setTimeout(() => this.limpiarModal(), 500);
    }, () => this.mensajesService.mensajeError(`¡Ocurrió un error!`, `¡Ocurrió un error al intentar eliminar el evento, por favor intente nuevamente!`));
  }

  // Funcion que va a cerrar un mensaje
  cerrarMensaje = (key : string) => this.messageService.clear(key);
}
