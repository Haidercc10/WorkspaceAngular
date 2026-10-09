import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ShepherdService } from 'angular-shepherd';
import moment from 'moment';
import { Table } from 'primeng/table';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { TicketsService } from 'src/app/Servicios/Tickets/Tickets.service';
import { Tickets_ResueltosService } from 'src/app/Servicios/Tickets_Resueltos/Tickets_Resueltos.service';
import { AppComponent } from 'src/app/app.component';
import { defaultStepOptions, stepsGetionTicktes as defaultSteps } from 'src/app/data';
import { UtileriaService } from 'src/app/Servicios/Utileria/utileria.service';

@Component({
  selector: 'app-Gestion_Tickets',
  templateUrl: './Gestion_Tickets.component.html',
  styleUrls: ['./Gestion_Tickets.component.css']
})

export class Gestion_TicketsComponent implements OnInit {

  @ViewChild('dt') dt: Table | undefined; //Variable identificadora en la que se verán los tickets
  cargando : boolean = false;
  FormTicketResuelto !: FormGroup;
  storage_Id : any; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : any; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  ticketsAbiertos : number = 0; //Variable que va a almacenar la cantidad de tickets que están pendientes
  ticketsEnRevision : number = 0; //Variable que va a almacenar la cantidad de tickets que está siendo revisados
  ticketsResuletosMes : number = 0; //Variable que almacenará la cantidad de tickets que han sido revisados en el mes
  tickets : any [] = []; //Variable que almacenará la información de los tickets que están sisndo revisado y los que están en revisión
  ticketsDisponibles : any [] = [];
  anios : number [] = Array.from({length: moment().year() - 2019 + 1}, (_, index) => 2019 + index);
  meses : { id: number, nombre: string } [] = [
    { id: 1, nombre: 'ENERO' },
    { id: 2, nombre: 'FEBRERO' },
    { id: 3, nombre: 'MARZO' },
    { id: 4, nombre: 'ABRIL' },
    { id: 5, nombre: 'MAYO' },
    { id: 6, nombre: 'JUNIO' },
    { id: 7, nombre: 'JULIO' },
    { id: 8, nombre: 'AGOSTO' },
    { id: 9, nombre: 'SEPTIEMBRE' },
    { id: 10, nombre: 'OCTUBRE' },
    { id: 11, nombre: 'NOVIEMBRE' },
    { id: 12, nombre: 'DICIEMBRE' }
  ];
  anioSeleccionado : number | null = null;
  mesSeleccionado : number | null = null;
  ticketSeleccionado : any = { Codigo : '', Fecha : '', Estado : '', EstadoId : null, Descripcion: '' }; //Variable que almcanerá la información del ticket seleccionado
  imagenesTicket : any [] = []; //Variable que va a almacenar la información de las imagenes que se adjuntaron al ticket
  detalleVisible : boolean = false;
  visible : boolean = false; //Variable que validará cuando se verá el modal de ticket resuelto y cuando no
  modoSeleccionado : boolean = false; //Variable que servirá para cambiar estilos en el modo oscuro/claro

  constructor(private frmBuilder : FormBuilder,
                private AppComponent : AppComponent,
                  private ticketService : TicketsService,
                    private ticketsResueltosService : Tickets_ResueltosService,
                      private shepherdService: ShepherdService,
                        private mensajeService : MensajesAplicacionService,
                          private util : UtileriaService) {

    this.FormTicketResuelto = this.frmBuilder.group({
      Descripcion : [null],
    });
  }

  ngOnInit() {
    this.lecturaStorage();
    this.limpiarTodo();
    setInterval(() => this.modoSeleccionado = this.AppComponent.temaSeleccionado, 1000);
  }

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
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
  }

  // Funcion que va a limpiar los campos y llamar a todas las funciones de consulta iniciales a que se ejecuten de nuevo
  limpiarTodo(){
    this.ticketSeleccionado = { Codigo : '', Fecha : '', Estado : '', EstadoId : null, Descripcion: '' };
    this.imagenesTicket = [];
    this.cargando = true;
    this.tickets = [];
    this.ticketsDisponibles = [];
    this.detalleVisible = false;
    this.visible = false;
    this.consultarTickets();
    this.cantultarCantidadTickets();
  }

  // Funcion que va a consultar la información de los tickets que estén abiertos y/o en revision
  consultarTickets(){
    this.ticketService.GetTicketsAbiertosEnRevisionAsync(false).subscribe(datos => {
      this.ticketsDisponibles = datos;
      this.filtrarTicketsPorFecha();
    });
    setTimeout(() => { this.cargando = false; }, 1000);
  }

  filtrarTicketsPorFecha(){
    this.ticketDeseleccionado();
    this.tickets = this.ticketsDisponibles.filter(ticket => {
      const fecha = moment(ticket.fecha);
      if (!fecha.isValid()) return this.anioSeleccionado == null && this.mesSeleccionado == null;

      const coincideAnio = this.anioSeleccionado == null || fecha.year() === this.anioSeleccionado;
      const coincideMes = this.mesSeleccionado == null || fecha.month() + 1 === this.mesSeleccionado;
      return coincideAnio && coincideMes;
    });
  }

  filtrarMesActual(){
    this.anioSeleccionado = moment().year();
    this.mesSeleccionado = moment().month() + 1;
    this.filtrarTicketsPorFecha();
  }

  // Funcion que va a consultar la información de las cantidades de tickets que aparecen en las cards
  cantultarCantidadTickets(){
    this.ticketService.Get_CantidadTickets().subscribe(datos => {
      for (let i = 0; i < datos.length; i++) {
        if (datos[i].estado === `ABIERTO`) this.ticketsAbiertos = datos[i].cantidad;
        if (datos[i].estado === `EN REVISIÓN`) this.ticketsEnRevision = datos[i].cantidad;
        if (datos[i].estado === `RESUELTO`) this.ticketsResuletosMes = datos[i].cantidad;
      }
    });
  }

  // Funcion que va a mostrar la informacion del ticket seleccionado en el dialogo
  ticketSelccionado(data : any){
    this.imagenesTicket = [];
    this.ticketSeleccionado = { Codigo : data.codigo, Fecha : data.fecha, Hora : data.hora, Estado : data.estado, Descripcion : data.descripcion, }
    this.detalleVisible = true;
    this.ticketService.Get_Id(this.ticketSeleccionado.Codigo).subscribe(datos => {
      this.ticketSeleccionado.EstadoId = Number(datos.estado_Id);
      const nombresImagenes = datos.ticket_NombreImagen?.trim();
      const imagenes : string [] = nombresImagenes ? nombresImagenes.split('|') : [];
      for (let i = 0; i < imagenes.length; i++) {
        if (imagenes[i] != '') {
          this.ticketService.Get_ImagenesTicket(imagenes[i].trim(), datos.ticket_RutaImagen).subscribe(datos_img => {
            this.imagenesTicket.length == 0 ? this.imagenesTicket = [datos_img.body] : this.imagenesTicket.push(datos_img.body);
            this.imagenesTicket = this.imagenesTicket.filter((item) => item != undefined);
          });
        }
      }
    });
  }

  // Funcion que va a quitar la informacion del ticket seleccionado
  ticketDeseleccionado = () => this.ticketSeleccionado = { Codigo : '', Fecha : '', Estado : '', EstadoId : null, Descripcion: '' };

  // Funcion que va a cambiar el estado del ticket a "En revisión"
  ticket_EnRevision(){
    if (this.ticketSeleccionado.Codigo == '') this.mensajeService.mensajeAdvertencia(`¡Advertencia!`, `¡Debe seleccionar un ticket para cambiar su estado!`);
    else {
      this.ticketService.Get_Id(this.ticketSeleccionado.Codigo).subscribe(datos => {
        if (datos.estado_Id != 29) {
          let info : any = {
            Ticket_Id : datos.ticket_Id,
            Ticket_Fecha : datos.ticket_Fecha,
            Ticket_Hora : datos.ticket_Hora,
            Usua_Id : datos.usua_Id,
            Estado_Id : 29,
            Ticket_Descripcion : datos.ticket_Descripcion,
            Ticket_RutaImagen : datos.ticket_RutaImagen,
            Ticket_NombreImagen : datos.ticket_NombreImagen,
          }
          this.ticketService.actualizarTicket(datos.ticket_Id, info).subscribe(() => {
            this.mensajeService.mensajeConfirmacion(`¡EL Ticket #${datos.ticket_Id} ha cambiado de estado!`, `¡Se ha cambiado el estado del ticket, el ticket ahora se encuentra en revisión!`);
            this.limpiarTodo();
          }, () => {
            this.cargando = false;
            this.mensajeService.mensajeError(`¡Ha ocurrido un error!`,`¡Ha ocurrido un error al cambiar el estado del ticket!`);
          });
        } else this.mensajeService.mensajeAdvertencia(`Advertencia`, `¡El ticket ya se encuentra en estado de revisión!`);
      });
    }
  }

  // Funcion que va a mostrar el modal donde se puede cambiar el estado del ticket a resuelto
  mostrarModalTicket_Resuelto = () => this.ticketSeleccionado.Codigo == '' ? this.mensajeService.mensajeAdvertencia(`Advertencia`, `¡Debe seleccionar un ticket para cambiar su estado!`) : this.visible = true;

  // Funcion que va a colocar el ticket con estado 'Resuleto' y va a crear un registro en la tabla 'Tickets_Revisados'
  ticket_Resuelto(){
    this.ticketService.Get_Id(this.ticketSeleccionado.Codigo).subscribe(datos => {
      if (datos.estado_Id != 30) {
        let info : any = {
          Ticket_Id : datos.ticket_Id,
          Ticket_Fecha : datos.ticket_Fecha,
          Ticket_Hora : datos.ticket_Hora,
          Usua_Id : datos.usua_Id,
          Estado_Id : 30,
          Ticket_Descripcion : datos.ticket_Descripcion,
          Ticket_RutaImagen : datos.ticket_RutaImagen,
          Ticket_NombreImagen : datos.ticket_NombreImagen,
        }
        this.ticketService.actualizarTicket(datos.ticket_Id, info).subscribe(() => {
          let info : any = {
            TicketRev_Fecha : moment().format('YYYY-MM-DD'),
            TicketRev_Hora : moment().format('H:mm:ss'),
            Usua_Id : this.storage_Id,
            TicketRev_Descripcion : this.FormTicketResuelto.value.Descripcion == null ? '' : this.FormTicketResuelto.value.Descripcion,
            Ticket_Id : datos.ticket_Id,
          }
          this.ticketsResueltosService.Insert(info).subscribe(() => {
            this.mensajeService.mensajeConfirmacion(`¡EL Ticket #${datos.ticket_Id} ha cambiado de estado!`, `¡Se ha cambiado el estado del ticket, el ticket ahora se encuentra resuelto!`)
            this.limpiarTodo();
          }, () => {
            this.cargando = false;
            this.mensajeService.mensajeError(`¡Ha ocurrido un error!`,`¡Ha ocurrido un error al crear el registro del ticket resuelto!`);
          });
        }, () => {
          this.cargando = false;
          this.mensajeService.mensajeError(`¡Ha ocurrido un error!`,`¡Ha ocurrido un error al cambiar el estado del ticket!`);
        });
      } else this.mensajeService.mensajeAdvertencia(`Advertencia`, `¡El ticket ya se encuentra en estado de revisión!`);
    });
  }

  // Funcion que permitirá filtrar la información de la tabla
  aplicarfiltro = ($event, campo : any, valorCampo : string) => this.dt!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);
}
