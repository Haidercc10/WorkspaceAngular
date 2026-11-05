import { HttpErrorResponse } from '@angular/common/http';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TutorialesService } from 'src/app/Servicios/Tutoriales/Tutoriales.service';
import { MessageService } from 'primeng/api';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { claseEstadoTicket, rangoFechasTicketsPorDefecto, ReportanteTicket, TicketListado, TicketsService, TipoTicket } from 'src/app/Servicios/Tickets/Tickets.service';
import { AppComponent } from 'src/app/app.component';
import { ClavesTutorialTickets, pasosTutorialTickets } from 'src/app/Tutoriales/Tutoriales_Tickets';

interface ImagenSeleccionada { archivo: File; vistaPrevia: string; }

@Component({
  selector: 'app-Tickets',
  templateUrl: './Tickets.component.html',
  styleUrls: ['./Tickets.component.css']
})

export class TicketsComponent implements OnInit, OnDestroy {

  static readonly MAX_IMAGENES = 5;
  static readonly MAX_BYTES_IMAGEN = 5 * 1024 * 1024;
  private static readonly TIPOS_PERMITIDOS = ['image/png', 'image/jpeg'];

  readonly maxImagenes = TicketsComponent.MAX_IMAGENES;
  FormTickets !: FormGroup;
  cargando : boolean = false;
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro
  private intervaloTema : any;

  tabActiva : number = 0; // 0 = Nuevo ticket, 1 = Mis tickets
  tiposTicket : TipoTicket[] = [];
  imagenes : ImagenSeleccionada[] = [];
  arrastrando : boolean = false;

  misTickets : TicketListado[] = [];
  cargandoMisTickets : boolean = false;
  /** Rango de fechas de creación de "Mis tickets" (por defecto, el último año). */
  fechaInicio : Date = rangoFechasTicketsPorDefecto().inicio;
  fechaFin : Date = rangoFechasTicketsPorDefecto().fin;
  readonly hoy : Date = new Date();
  /** Índice de la primera fila visible del paginador; se pone en 0 al cambiar el filtro. */
  primeraFilaMisTickets : number = 0;
  esSoporte : boolean = false;
  /** Solo soporte: usuarios activos con la etiqueta "NOMBRE - ID - ÁREA" (por la que también se filtra). */
  reportantes : (ReportanteTicket & { etiqueta: string })[] = [];
  codigoDetalle : number | null = null;
  detalleVisible : boolean = false;

  constructor(private AppComponent : AppComponent,
                private frmBuiler : FormBuilder,
                  private ticketService : TicketsService,
                    private msj : MensajesAplicacionService,
                      private messageService : MessageService,
                        private router : Router,
                          private tutoriales : TutorialesService) {

    this.FormTickets = this.frmBuiler.group({
      Asunto : [null, [Validators.required, Validators.maxLength(150)]],
      TipoTicket : [null, Validators.required],
      Descripcion : [null, [Validators.required, Validators.maxLength(2000)]],
      Reportante : [null], // solo soporte; vacío = a nombre propio
    });
  }

  ngOnInit() {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
    this.intervaloTema = setInterval(() => this.modoSeleccionado = this.AppComponent.temaSeleccionado, 1000);
    this.ticketService.getTipos().subscribe(tipos => {
      this.tiposTicket = tipos;
      this.limpiarTodo();
    });
    this.ticketService.getPermisos().subscribe(p => {
      this.esSoporte = p.esSoporte;
      if (this.esSoporte) this.ticketService.getReportantes().subscribe(usuarios =>
        this.reportantes = usuarios.map(u => ({ ...u, etiqueta: `${u.nombre} - ${u.id}${u.area ? ' - ' + u.area : ''}` })));
      // Se espera a conocer el rol para que soporte vea también sus pasos extra
      this.tutoriales.iniciarPrimeraVez(ClavesTutorialTickets.TICKETS, this.AppComponent.storage_Id, () => this.pasosTutorial());
    });
  }

  ngOnDestroy() {
    clearInterval(this.intervaloTema);
    this.messageService.clear('ticketCreado');
  }

  /** Mostrar tutorial escrito dentro del programa que especificará la funcionalidad de este módulo */
  tutorial = () => this.tutoriales.iniciar(this.pasosTutorial());

  private pasosTutorial = () => pasosTutorialTickets({
    esSoporte : this.esSoporte,
    irAPestana : indice => { if (this.tabActiva !== indice) this.cambioTab(indice); },
  });

  /** Limpia el formulario y deja "Incidente" (el tipo más común) seleccionado por defecto. */
  limpiarTodo(){
    this.FormTickets.reset({ TipoTicket : this.tiposTicket.length ? this.tiposTicket[0].id : null });
    this.imagenes = [];
    this.cargando = false;
  }

  // ------------------------------------------------------------ imágenes

  seleccionarArchivos(event : Event) {
    const input = event.target as HTMLInputElement;
    this.agregarImagenes(Array.from(input.files ?? []));
    input.value = ''; // permite volver a elegir el mismo archivo después de quitarlo
  }

  soltarArchivos(event : DragEvent) {
    event.preventDefault();
    this.arrastrando = false;
    this.agregarImagenes(Array.from(event.dataTransfer?.files ?? []));
  }

  /** Permite pegar capturas de pantalla (Ctrl+V) mientras está abierta la pestaña "Nuevo ticket". */
  @HostListener('document:paste', ['$event'])
  pegarImagen(event : ClipboardEvent) {
    if (this.tabActiva !== 0 || this.detalleVisible) return;
    const archivos = Array.from(event.clipboardData?.files ?? []).filter(f => f.type.startsWith('image/'));
    if (!archivos.length) return; // pegar texto funciona normal
    event.preventDefault();
    const fecha = new Date().toISOString().replace(/[-:T]/g, '').substring(0, 14);
    this.agregarImagenes(archivos.map((f, i) => new File([f], `captura_${fecha}_${i + 1}.${f.type === 'image/png' ? 'png' : 'jpg'}`, { type: f.type })));
  }

  private agregarImagenes(archivos : File[]) {
    for (const archivo of archivos) {
      if (this.imagenes.length >= TicketsComponent.MAX_IMAGENES) {
        this.msj.mensajeAdvertencia('¡Límite de imágenes!', `Solo se pueden adjuntar ${TicketsComponent.MAX_IMAGENES} imágenes por ticket.`);
        return;
      }
      const extensionValida = /\.(png|jpe?g)$/i.test(archivo.name);
      if (!TicketsComponent.TIPOS_PERMITIDOS.includes(archivo.type) || !extensionValida) {
        this.msj.mensajeAdvertencia('¡Archivo no permitido!', `"${archivo.name}" no es una imagen .png o .jpg.`);
        continue;
      }
      if (archivo.size > TicketsComponent.MAX_BYTES_IMAGEN) {
        this.msj.mensajeAdvertencia('¡Imagen muy pesada!', `"${archivo.name}" supera los 5 MB.`);
        continue;
      }
      const imagen : ImagenSeleccionada = { archivo, vistaPrevia: '' };
      this.imagenes = [...this.imagenes, imagen];
      const lector = new FileReader();
      lector.onload = () => imagen.vistaPrevia = lector.result as string;
      lector.readAsDataURL(archivo);
    }
  }

  quitarImagen = (indice : number) => this.imagenes = this.imagenes.filter((_, i) => i !== indice);

  // ------------------------------------------------------------ crear ticket

  enviarTickets(){
    if (this.cargando) return;
    if (this.FormTickets.invalid) {
      this.FormTickets.markAllAsTouched();
      this.msj.mensajeAdvertencia(`Advertencia`, `¡Debe llenar el asunto, el tipo y la descripción!`);
      return;
    }
    const { Asunto, TipoTicket, Descripcion, Reportante } = this.FormTickets.value;
    if (!String(Asunto).trim() || !String(Descripcion).trim()) {
      this.msj.mensajeAdvertencia(`Advertencia`, `¡El asunto y la descripción no pueden estar en blanco!`);
      return;
    }

    this.cargando = true;
    const reportanteId = this.esSoporte ? Reportante : null;
    this.ticketService.crearTicket(String(Asunto).trim(), TipoTicket, String(Descripcion).trim(), this.imagenes.map(i => i.archivo), reportanteId).subscribe({
      next: ({ codigo, reportante }) => {
        this.limpiarTodo();
        this.messageService.clear('ticketCreado');
        this.messageService.add({
          key : 'ticketCreado',
          severity : 'success',
          summary : reportante ? `¡Ticket #${codigo} creado a nombre de ${reportante}!` : `¡Ticket #${codigo} creado correctamente!`,
          detail : 'Soporte lo revisará pronto. Puede seguir su estado en "Mis tickets".',
          life : 8000,
        });
      },
      error: (error : HttpErrorResponse) => {
        this.cargando = false;
        // Solo mostrar mensajes cortos de la API (validaciones); nunca un stack trace completo
        const mensajeApi = typeof error.error === 'string' ? error.error.trim() : '';
        const detalle = mensajeApi && mensajeApi.length <= 300 && !mensajeApi.includes(' at ') ? mensajeApi : '¡Ha ocurrido un error al crear el ticket!';
        this.msj.mensajeError(`¡No se pudo crear el ticket!`, detalle);
      }
    });
  }

  // ------------------------------------------------------------ mis tickets

  verMisTickets() {
    this.messageService.clear('ticketCreado');
    this.tabActiva = 1;
    this.consultarMisTickets();
  }

  cambioTab(indice : number) {
    this.tabActiva = indice;
    if (indice === 1) this.consultarMisTickets();
  }

  /**
   * Consulta los tickets propios del rango de fechas.
   * @param reiniciarPagina true cuando cambió el filtro; false al recargar tras comentar o cambiar un ticket.
   */
  consultarMisTickets(reiniciarPagina : boolean = false) {
    if (!this.fechaInicio || !this.fechaFin) {
      this.msj.mensajeAdvertencia('¡Faltan fechas!', 'Seleccione la fecha inicial y la fecha final.');
      return;
    }
    if (this.fechaInicio > this.fechaFin) {
      this.msj.mensajeAdvertencia('¡Rango inválido!', 'La fecha inicial no puede ser mayor que la fecha final.');
      return;
    }
    this.cargandoMisTickets = true;
    this.ticketService.getMisTickets(this.fechaInicio, this.fechaFin).subscribe({
      next: tickets => {
        this.misTickets = tickets;
        if (reiniciarPagina) this.primeraFilaMisTickets = 0;
        this.cargandoMisTickets = false;
      },
      error: () => { this.cargandoMisTickets = false; this.msj.mensajeError('¡No se pudieron consultar sus tickets!'); }
    });
  }

  /** Vuelve al rango por defecto (último año) y consulta. */
  limpiarFiltrosMisTickets() {
    const rango = rangoFechasTicketsPorDefecto();
    this.fechaInicio = rango.inicio;
    this.fechaFin = rango.fin;
    this.consultarMisTickets(true);
  }

  abrirDetalle(ticket : TicketListado) {
    this.codigoDetalle = ticket.codigo;
    this.detalleVisible = true;
  }

  cerrarDetalle = () => this.codigoDetalle = null;

  irAGestion = () => this.router.navigateByUrl('/Gestion-Tickets');

  claseEstado = (estadoId : number) => claseEstadoTicket(estadoId);
}
