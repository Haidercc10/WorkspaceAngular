import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import moment from 'moment';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { CorreoWeb, CorreosWebService, EstadoCorreo, EstadoCorreoWeb, MAX_CARACTERES_RESPUESTA, claseEstadoCorreo, nombreEstadoCorreo } from 'src/app/Servicios/CorreosWeb/CorreosWeb.service';
import { AppComponent } from 'src/app/app.component';

type FiltroCorreos = 'nuevos' | 'leidos' | 'respondidos' | 'archivados' | 'todos';

/**
 * Bandeja de los correos que llegan desde el formulario de contacto de la página web (Firebase, colección Correos).
 * Flujo: Nuevo → (al abrirlo) Leído → (al responder) Respondido; cualquiera puede archivarse.
 */
@Component({
  selector: 'app-Correos_PaginaWeb',
  templateUrl: './Correos_PaginaWeb.component.html',
  styleUrls: ['./Correos_PaginaWeb.component.css']
})
export class Correos_PaginaWebComponent implements OnInit {

  private readonly destroyRef = inject(DestroyRef);
  readonly maxCaracteres = MAX_CARACTERES_RESPUESTA;

  cargando: boolean = true;
  errorCarga: boolean = false;
  enviando: boolean = false;

  correos: CorreoWeb[] = [];             // todos, del más reciente al más antiguo
  correosFiltrados: CorreoWeb[] = [];    // los que se ven según el filtro y la búsqueda
  conteos: Record<FiltroCorreos, number> = { nuevos: 0, leidos: 0, respondidos: 0, archivados: 0, todos: 0 };
  opcionesFiltro: { label: string, value: FiltroCorreos }[] = [];
  filtro: FiltroCorreos = 'nuevos';
  busqueda: string = '';

  seleccionado: CorreoWeb | null = null;
  respuesta: string = '';                // borrador; se conserva si el envío falla

  constructor(private correosService: CorreosWebService,
    private mensajeService: MensajesAplicacionService,
    private AppComponent: AppComponent) { }

  ngOnInit() {
    this.correosService.correos$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: lista => {
        this.correos = lista;
        this.cargando = false;
        this.errorCarga = false;
        // Si nunca hubo nuevos al abrir, se arranca en "Todos" para no mostrar una bandeja vacía
        if (this.conteos.todos == 0 && !lista.some(c => c.estado == EstadoCorreo.NUEVO)) this.filtro = 'todos';
        this.actualizarConteos();
        this.aplicarFiltros();
        // Mantiene el detalle al día (p. ej. cuando otro usuario responde el mismo correo)
        if (this.seleccionado) this.seleccionado = lista.find(c => c.id == this.seleccionado!.id) ?? null;
      },
      error: () => {
        this.cargando = false;
        this.errorCarga = true;
      },
    });
  }

  private actualizarConteos() {
    const cuenta = (estado: EstadoCorreoWeb) => this.correos.filter(c => c.estado == estado).length;
    this.conteos = {
      nuevos: cuenta(EstadoCorreo.NUEVO),
      leidos: cuenta(EstadoCorreo.LEIDO),
      respondidos: cuenta(EstadoCorreo.RESPONDIDO),
      archivados: cuenta(EstadoCorreo.ARCHIVADO),
      todos: this.correos.filter(c => c.estado != EstadoCorreo.ARCHIVADO).length,
    };
    this.opcionesFiltro = [
      { label: `Nuevos (${this.conteos.nuevos})`, value: 'nuevos' },
      { label: `Leídos (${this.conteos.leidos})`, value: 'leidos' },
      { label: `Respondidos (${this.conteos.respondidos})`, value: 'respondidos' },
      { label: `Todos (${this.conteos.todos})`, value: 'todos' },
      { label: `Archivados (${this.conteos.archivados})`, value: 'archivados' },
    ];
  }

  /** Filtra siempre sobre la lista completa: los filtros no se acumulan. */
  aplicarFiltros() {
    const porFiltro: Record<FiltroCorreos, (c: CorreoWeb) => boolean> = {
      nuevos: c => c.estado == EstadoCorreo.NUEVO,
      leidos: c => c.estado == EstadoCorreo.LEIDO,
      respondidos: c => c.estado == EstadoCorreo.RESPONDIDO,
      archivados: c => c.estado == EstadoCorreo.ARCHIVADO,
      todos: c => c.estado != EstadoCorreo.ARCHIVADO,
    };
    const texto = this.busqueda.trim().toLowerCase();
    this.correosFiltrados = this.correos.filter(c => porFiltro[this.filtro](c)
      && (!texto || [c.nombre, c.correo, c.telefono, c.asunto, c.mensaje].some(v => v.toLowerCase().includes(texto))));
  }

  get mensajeVacio(): string {
    if (this.busqueda.trim()) return 'Ningún correo coincide con la búsqueda.';
    switch (this.filtro) {
      case 'nuevos': return 'No hay correos nuevos.';
      case 'leidos': return 'No hay correos leídos pendientes de respuesta.';
      case 'respondidos': return 'Aún no se ha respondido ningún correo.';
      case 'archivados': return 'No hay correos archivados.';
      default: return 'No han llegado correos desde la página web.';
    }
  }

  abrir(correo: CorreoWeb) {
    if (this.seleccionado?.id != correo.id) this.respuesta = '';
    this.seleccionado = correo;
    this.correosService.marcarLeido(correo).catch(() => { /* si falla, seguirá como nuevo; no impide leerlo */ });
  }

  /** En celular, vuelve de la lectura a la lista. */
  volver = () => this.seleccionado = null;

  async marcarNoLeido() {
    if (!this.seleccionado) return;
    await this.ejecutar(() => this.correosService.cambiarEstado(this.seleccionado!.id, EstadoCorreo.NUEVO), 'Marcado como no leído');
    this.seleccionado = null;
  }

  async archivar() {
    if (!this.seleccionado) return;
    await this.ejecutar(() => this.correosService.cambiarEstado(this.seleccionado!.id, EstadoCorreo.ARCHIVADO), 'Correo archivado');
    this.seleccionado = null;
  }

  async desarchivar() {
    if (!this.seleccionado) return;
    await this.ejecutar(() => this.correosService.desarchivar(this.seleccionado!), 'Correo restaurado');
  }

  private async ejecutar(accion: () => Promise<void>, exito: string) {
    try {
      await accion();
      this.mensajeService.mensajeConfirmacion('OK!', exito);
    } catch {
      this.mensajeService.mensajeError('¡Ocurrió un error!', '¡No se pudo actualizar el correo, intente nuevamente!');
    }
  }

  get puedeEnviar(): boolean {
    const texto = this.respuesta.trim();
    return !!this.seleccionado && !this.enviando && texto.length > 0 && texto.length <= this.maxCaracteres;
  }

  enviarRespuesta() {
    if (!this.puedeEnviar) return;
    const correo = this.seleccionado!;
    this.enviando = true;
    this.correosService.enviarRespuesta(correo, this.respuesta, this.AppComponent.storage_Nombre ?? 'Plasticaribe').subscribe({
      next: () => {
        this.enviando = false;
        this.respuesta = '';
        this.mensajeService.mensajeConfirmacion('OK!', `Respuesta enviada a ${correo.correo}`);
      },
      error: () => {
        this.enviando = false; // el borrador se conserva para reintentar
        this.mensajeService.mensajeError('¡No se pudo enviar la respuesta!', 'El correo no salió y no se marcó como respondido. Intente nuevamente.');
      },
    });
  }

  copiar(texto: string, que: string) {
    navigator.clipboard?.writeText(texto)
      .then(() => this.mensajeService.mensajeConfirmacion('Copiado', `${que} copiado al portapapeles`))
      .catch(() => this.mensajeService.mensajeAdvertencia('No se pudo copiar', texto));
  }

  claseEstado = (estado: EstadoCorreoWeb) => claseEstadoCorreo(estado);
  nombreEstado = (estado: EstadoCorreoWeb) => nombreEstadoCorreo(estado);
  esNuevo = (correo: CorreoWeb) => correo.estado == EstadoCorreo.NUEVO;
  esArchivado = (correo: CorreoWeb) => correo.estado == EstadoCorreo.ARCHIVADO;
  trackPorId = (_: number, correo: CorreoWeb) => correo.id;

  /** Fecha corta para la lista: hora si es de hoy, "Ayer", o día y mes. */
  fechaCorta(correo: CorreoWeb): string {
    const fecha = moment(correo.marcaTiempo, 'YYYY-MM-DD HH:mm:ss', true);
    if (!fecha.isValid()) return correo.fecha;
    if (fecha.isSame(moment(), 'day')) return fecha.format('h:mm a');
    if (fecha.isSame(moment().subtract(1, 'day'), 'day')) return 'Ayer';
    return fecha.isSame(moment(), 'year') ? fecha.format('DD MMM') : fecha.format('DD MMM YYYY');
  }

  /** Fecha completa para el detalle. */
  fechaLarga(fecha: string | null, hora: string | null): string {
    if (!fecha) return '';
    const valor = moment(`${fecha} ${hora ?? ''}`.trim(), ['YYYY-MM-DD HH:mm:ss', 'YYYY-MM-DD H:mm:ss', 'YYYY-MM-DD'], true);
    return valor.isValid() ? valor.format('DD [de] MMMM [de] YYYY, h:mm a') : `${fecha} ${hora ?? ''}`;
  }
}
