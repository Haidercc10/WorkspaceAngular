import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ShepherdService } from 'angular-shepherd';
import moment from 'moment';
import pdfMake from 'pdfmake/build/pdfmake';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { TicketsService } from 'src/app/Servicios/Tickets/Tickets.service';
import { AppComponent } from 'src/app/app.component';
import { defaultStepOptions, stepsCreacionTickets as defaultSteps } from 'src/app/data';
import { logoParaPdf } from 'src/app/logoPlasticaribe_Base64';

@Component({
  selector: 'app-Tickets',
  templateUrl: './Tickets.component.html',
  styleUrls: ['./Tickets.component.css']
})

export class TicketsComponent implements OnInit {

  FormTickets !: FormGroup;
  cargando : boolean = false;
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : string; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : number; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  archivoSeleccionado : any;
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro

  constructor(private AppComponent : AppComponent,
                private frmBuiler : FormBuilder,
                  private ticketService : TicketsService,
                    private msj : MensajesAplicacionService,
                      private shepherdService: ShepherdService) {

    this.FormTickets = this.frmBuiler.group({
      Codigo_Ticket : [null, Validators.required],
      Descripcion : [null, Validators.required],
    });
  }

  ngOnInit() {
    this.lecturaStorage();
    this.limpiarTodo();
  }

  /** Mostrar tutorial escrito dentro del programa que especificará la funcionalidad de este módulo */
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

  // Funcion que va a limpiar los campos y todas las variables
  limpiarTodo(){
    this.FormTickets.reset();
    this.ticketService.GetUltimoTicket().subscribe(data => this.FormTickets.patchValue({Codigo_Ticket : data}));
    this.cargando = false;
    this.archivoSeleccionado = null;
  }

  // Funcion que va a almacnear en una variable la informacion de los archivos seleccionados
  onUpload(event) {
    this.archivoSeleccionado = <File>event.currentFiles;
  }

  // Funcion que va a enviar a la base de datos la información del ticket
  enviarTickets(){
    if (this.FormTickets.valid) {
      let imagenes : string = '';
      for (let i = 0; i < this.archivoSeleccionado.length; i++) {
        imagenes += `${this.archivoSeleccionado[i].name}|`;
      }
      let info : any = {
        Ticket_Fecha : moment().format('YYYY-MM-DD'),
        Ticket_Hora : moment().format('H:mm:ss'),
        Usua_Id : this.storage_Id,
        Estado_Id : 28,
        Ticket_Descripcion : this.FormTickets.value.Descripcion,
        Ticket_RutaImagen : 'C:\\Users\\SANDRA\\Desktop\\Plasticaribe',
        Ticket_NombreImagen : imagenes.length == 0 ? '' : imagenes.substring(0, imagenes.length - 1),
      }
      this.ticketService.crearTicket(info).subscribe(data => {
        this.crearPDF(data.ticket_Id);
        this.msj.mensajeConfirmacion(`¡Ticket #${data.ticket_Id} Creado!`, `¡Se ha creado un nuevo ticket!`);
      }, error => {
         this.msj.mensajeError(`¡Ha ocurrido un error!`,`¡Ha ocurrido un error al crear el ticket!`);
         this.cargando = false;
        });
      if (this.archivoSeleccionado.length > 0) this.enviarArchivos(this.archivoSeleccionado);
      this.limpiarTodo();
    } else {
      this.msj.mensajeAdvertencia(`Advertencia`, `¡Hay Campos Vacios!`);
      this.cargando = false;
    }
  }

  // Funcion que va a enaviar los datos de los archivos al api
  async enviarArchivos(archivos: File[]) {
    for (let i = 0; i < archivos.length; i++) {
      const formData = new FormData();
      formData.append('archivo', archivos[i]);
      try {
        const data = await this.ticketService.crearImgTicket(formData).toPromise();
        this.msj.mensajeConfirmacion(`¡Se ha subido el Archivo!`, `¡Archivo adjuntado al ticket creado!`);
      } catch (error) {
        this.msj.mensajeError(`¡Ha ocurrido un error al subir la imagen!`, `¡Ocurrió un error al intentar subir la imagen : ${error}!`);
        this.cargando = false;
      }
    }
  }

  // Funcion que va a crear un pdf con la información de lticket creado
  crearPDF(codigo : number){
    this.ticketService.Get_InfoTicket_PDF(codigo).subscribe(datos => {
      for (let i = 0; i < datos.length; i++) {
        const pdfDefinicion : any = {
          info: { title: `Ticket N° ${datos[i].codigo}` },
          pageSize: 'A6',
          header: {
            image : logoParaPdf, width : 220, height : 40,
            alignment: 'center',
            margin: [0, 20, 0, 0],
          },
          // footer: {
          //   columns: [
          //     { text: `Ticket generado por ${datos[i].usuario}`, alignment: ' left', fontSize: 8, margin: [30, 0, 0, 0] },
          //     { text: `${datos[i].fecha.replace('T00:00:00', '')} - ${datos[i].hora}`, alignment: 'right', fontSize: 8, margin: [0, 0, 30, 0] },
          //   ]
          // },
          watermark: { text: 'PLASTICARIBE SAS', color: 'red', opacity: 0.05, bold: true, italics: false },
          content : [
            // { text : `${datos[i].direccion_Empresa}`, alignment: 'center', fontSize: 7, margin: [0, 10, 0, 0], },
            // { text : `Ticket #${datos[i].codigo}`, alignment: 'justify', fontSize: 15, margin: [0, 80, 0, 0], bold : true },
            // { text : `${datos[i].descripcion}`, alignment: 'left', fontSize: 7, margin: [0, 10, 0, 0], },
            // { text : `Estado Ticket : ${datos[i].estado}.`, alignment: 'right', fontSize: 7, margin: [0, 10, 0, 0], },

            { text : `${datos[i].direccion_Empresa}`, alignment: 'center', fontSize: 7, margin: [0, 10, 0, 0], },

            { text : `Ticket #${datos[i].codigo}`, alignment: 'left', fontSize: 25, margin: [0, 50, 0, 0], bold : true },

            { text : `Descripción`, alignment: 'left', fontSize: 10, margin: [0, 15, 0, 0], bold : true },
            { text : `${datos[i].descripcion}`, alignment: 'justify', fontSize: 7 },

            { text : `Estado Ticket :`, alignment: 'left', fontSize: 10, margin: [0, 10, 0, 0], bold : true },
            { text : `${datos[i].estado}.`, alignment: 'left', fontSize: 7 },

            { text: `Ticket generado por:`, alignment: ' left', fontSize: 10, margin: [0, 10, 0, 0], bold : true },
            { text: `${datos[i].usuario}`, alignment: ' left', fontSize: 8 },

            { text: `Fecha: ${datos[i].usuario}`, alignment: ' left', fontSize: 10, margin: [0, 10, 0, 0], bold : true },
            { text: `${datos[i].fecha.replace('T00:00:00', '')} - ${datos[i].hora}`, alignment: 'left', fontSize: 8, },

          ],
          styles: {
            header: { fontSize: 10, bold: true },
            titulo: { fontSize: 20, bold: true }
          }
        }
        const pdf = pdfMake.createPdf(pdfDefinicion);
        pdf.open();
      }
    });
  }
}
