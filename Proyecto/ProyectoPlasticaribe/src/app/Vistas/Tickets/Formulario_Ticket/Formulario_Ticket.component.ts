import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { catchError, forkJoin, of } from 'rxjs';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { ReportanteTicket, TicketsService, TipoTicket } from 'src/app/Servicios/Tickets/Tickets.service';

interface ImagenSeleccionada { archivo: File; vistaPrevia: string; }

/**
 * Adjuntar imágenes (botón, arrastrar y Ctrl+V) desactivado hasta que se defina dónde se guardan los archivos en el
 * servidor de producción. Con false la sección no se muestra, Ctrl+V y soltar archivos no hacen nada y el tutorial
 * omite su paso. Para habilitarlo, basta con cambiarlo a true.
 */
export const IMAGENES_HABILITADAS = false;

/** Datos del ticket recién creado (para que el contenedor muestre su aviso de éxito). */
export interface TicketCreado { codigo: number; reportante: string | null; }

/**
 * Formulario "Nuevo ticket": campos, validaciones, imágenes y envío.
 * Lo usan la pestaña "Nuevo ticket" de la página de Tickets y el panel lateral del botón flotante de soporte.
 * Los Id de los campos (#campoAsunto, #enviarTicket…) los usa el tutorial de Tickets: no cambiarlos.
 * El aviso de éxito lo muestra el contenedor al recibir (creado), porque su botón "VER MIS TICKETS" depende de dónde esté.
 */
@Component({
  selector: 'app-formulario-ticket',
  templateUrl: './Formulario_Ticket.component.html',
  styleUrls: ['./Formulario_Ticket.component.css']
})
export class FormularioTicketComponent implements OnInit {

  static readonly MAX_IMAGENES = 5;
  static readonly MAX_BYTES_IMAGEN = 5 * 1024 * 1024;
  private static readonly TIPOS_PERMITIDOS = ['image/png', 'image/jpeg'];

  /** false mientras el formulario no está a la vista (otra pestaña, un popup encima): así Ctrl+V no agrega imágenes a escondidas. */
  @Input() pegadoActivo : boolean = true;
  /** Panel lateral angosto: cada campo ocupa todo el ancho (las columnas col-lg dependen de la ventana, no del panel). */
  @Input() compacto : boolean = false;
  /** Página desde donde se reporta (botón flotante): se anota al final de la descripción para que soporte sepa dónde pasó. */
  @Input() paginaOrigen : { nombre : string, url : string } | null = null;
  /** Se emite cuando la API creó el ticket; el formulario ya quedó limpio. */
  @Output() creado = new EventEmitter<TicketCreado>();

  static readonly MAX_DESCRIPCION = 2000;

  readonly maxImagenes = FormularioTicketComponent.MAX_IMAGENES;
  readonly imagenesHabilitadas = IMAGENES_HABILITADAS;
  FormTickets !: FormGroup;
  cargando : boolean = false;
  /** Skeletons de los campos hasta tener los tipos de ticket y los permisos (sin ellos no se sabe si va "Reportado por"). */
  cargandoInicial : boolean = true;
  tiposTicket : TipoTicket[] = [];
  imagenes : ImagenSeleccionada[] = [];
  arrastrando : boolean = false;
  esSoporte : boolean = false;
  /** Solo soporte: usuarios activos con la etiqueta "NOMBRE - ID - ÁREA" (por la que también se filtra). */
  reportantes : (ReportanteTicket & { etiqueta: string })[] = [];

  constructor(private frmBuiler : FormBuilder,
                private ticketService : TicketsService,
                  private msj : MensajesAplicacionService) {

    this.FormTickets = this.frmBuiler.group({
      Asunto : [null, [Validators.required, Validators.maxLength(150)]],
      TipoTicket : [null, Validators.required],
      Descripcion : [null, [Validators.required, Validators.maxLength(FormularioTicketComponent.MAX_DESCRIPCION)]],
      Reportante : [null], // solo soporte; vacío = a nombre propio
    });
  }

  ngOnInit() {
    // Si los permisos fallan se sigue como usuario normal (sin "Reportado por"); si fallan los tipos, se avisa con detalles
    let errorTipos : unknown = null;
    forkJoin({
      tipos : this.ticketService.getTipos().pipe(catchError(error => { errorTipos = error; return of([] as TipoTicket[]); })),
      permisos : this.ticketService.getPermisos().pipe(catchError(() => of({ esSoporte : false }))),
    }).subscribe(({ tipos, permisos }) => {
      this.tiposTicket = tipos;
      this.esSoporte = permisos.esSoporte;
      this.limpiarTodo();
      this.cargandoInicial = false;
      if (errorTipos) this.msj.errorDetallado(errorTipos, 'No se pudieron cargar los tipos de ticket. Cierre y vuelva a abrir el formulario, o recargue la página.',
        { operacion: 'Consultar tipos de ticket', metodo: 'GET' });
      if (this.esSoporte) this.ticketService.getReportantes().subscribe(usuarios =>
        this.reportantes = usuarios.map(u => ({ ...u, etiqueta: `${u.nombre} - ${u.id}${u.area ? ' - ' + u.area : ''}` })));
    });
  }

  /** Nota que se agrega al final de la descripción cuando se reporta desde otra página ('' si no aplica). */
  get notaPagina() : string {
    return this.paginaOrigen ? `\n\n---\nReportado desde: ${this.paginaOrigen.nombre} (${this.paginaOrigen.url})` : '';
  }

  /** Caracteres disponibles para la descripción: el máximo de la API menos la nota de la página. */
  get maxDescripcion() : number {
    return FormularioTicketComponent.MAX_DESCRIPCION - this.notaPagina.length;
  }

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

  /** Permite pegar capturas de pantalla (Ctrl+V) mientras el formulario está a la vista. */
  @HostListener('document:paste', ['$event'])
  pegarImagen(event : ClipboardEvent) {
    if (!IMAGENES_HABILITADAS || !this.pegadoActivo) return;
    const archivos = Array.from(event.clipboardData?.files ?? []).filter(f => f.type.startsWith('image/'));
    if (!archivos.length) return; // pegar texto funciona normal
    event.preventDefault();
    const fecha = new Date().toISOString().replace(/[-:T]/g, '').substring(0, 14);
    this.agregarImagenes(archivos.map((f, i) => new File([f], `captura_${fecha}_${i + 1}.${f.type === 'image/png' ? 'png' : 'jpg'}`, { type: f.type })));
  }

  private agregarImagenes(archivos : File[]) {
    if (!IMAGENES_HABILITADAS) return;
    for (const archivo of archivos) {
      if (this.imagenes.length >= FormularioTicketComponent.MAX_IMAGENES) {
        this.msj.mensajeAdvertencia('¡Límite de imágenes!', `Solo se pueden adjuntar ${FormularioTicketComponent.MAX_IMAGENES} imágenes por ticket.`);
        return;
      }
      const extensionValida = /\.(png|jpe?g)$/i.test(archivo.name);
      if (!FormularioTicketComponent.TIPOS_PERMITIDOS.includes(archivo.type) || !extensionValida) {
        this.msj.mensajeAdvertencia('¡Archivo no permitido!', `"${archivo.name}" no es una imagen .png o .jpg.`);
        continue;
      }
      if (archivo.size > FormularioTicketComponent.MAX_BYTES_IMAGEN) {
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

  /**
   * Pasa el asunto a mayúsculas mientras se escribe. Conserva la posición del cursor (si se cambiara el valor del
   * formulario sin más, el cursor saltaría al final al corregir una letra en medio del texto).
   */
  asuntoEnMayusculas(evento : Event) {
    const campo = evento.target as HTMLInputElement;
    const mayusculas = campo.value.toUpperCase();
    if (mayusculas === campo.value) return;
    const { selectionStart, selectionEnd } = campo;
    campo.value = mayusculas;
    campo.setSelectionRange(selectionStart, selectionEnd);
    this.FormTickets.get('Asunto')?.setValue(mayusculas, { emitEvent: false });
  }

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
    const descripcion = String(Descripcion).trim().slice(0, this.maxDescripcion) + this.notaPagina;
    this.ticketService.crearTicket(String(Asunto).trim().toUpperCase(), TipoTicket, descripcion, this.imagenes.map(i => i.archivo), reportanteId).subscribe({
      next: ({ codigo, reportante }) => {
        this.limpiarTodo();
        this.creado.emit({ codigo, reportante });
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
}
