import { DOCUMENT } from '@angular/common';
import { Component, Inject, Injectable, OnInit } from '@angular/core';
import moment from 'moment';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { PrimeNGConfig } from 'primeng/api';
import { EncriptacionService } from './Servicios/Encriptacion/Encriptacion.service';
import { TamanoLetraService } from './Servicios/TamanoLetra/TamanoLetra.service';
import { TemaService } from './Servicios/Tema/Tema.service';
import { User } from './_Models/user';
import { User_BagPro } from './_Models/user_BagPro';
import { user_Conta_Zeus } from './_Models/user_Conta_Zeus';
import { User_Inv_Zeus } from './_Models/user_Inv_Zeus';
import { AuthenticationService } from './_Services/authentication.service';
import { authentication_BagPro } from './_Services/authentication_BagPro.service';
import { authentication_ContaZeus } from './_Services/authentication_ContaZeus.service';
import { AuthenticationService_InvZeus } from './_Services/authentication_InvZeus.service';
import { Subject } from 'rxjs/internal/Subject';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { CLAVE_TOAST_ERROR_DETALLADO, DetalleError, MensajesAplicacionService } from './Servicios/MensajesAplicacion/MensajesAplicacion.service';

const pdfMake = require('pdfmake/build/pdfmake');
const pdfFonts = require('pdfmake/build/vfs_fonts');

if (pdfFonts && pdfFonts.pdfMake) {
  pdfMake.vfs = pdfFonts.pdfMake.vfs;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

@Injectable({
  providedIn: 'root'
})

export class AppComponent implements OnInit {

  user?: User | null;
  user_InvZeus?: User_Inv_Zeus | null;
  user_ContaZeus?: user_Conta_Zeus | null;
  user_BagPro?: User_BagPro | null;
  title = 'ProyectoPlasticaribe';
  storage_Id: number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre: any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol: any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol !: any; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  rutaCarpetaArchivos: string = 'D:\\Calidad'; //Variable que va a almacenar la ruta principal en la que se almacenarán los archivos de la aplicacion
  private destroy$ = new Subject<void>(); // Crear un Subject para controlar el ciclo de vida

  constructor(@Inject(SESSION_STORAGE) private storage: WebStorageService,
    private authenticationService: AuthenticationService,
    private authenticationInvZeusService: AuthenticationService_InvZeus,
    private authenticationContaZeusService: authentication_ContaZeus,
    private authenticationBagProService: authentication_BagPro,
    private config: PrimeNGConfig,
    private encriptacion: EncriptacionService,
    @Inject(DOCUMENT) private document: Document,
    private temaService: TemaService,
    private tamanoLetraService: TamanoLetraService, // se inyecta aquí para que el tamaño de letra se aplique al arrancar
    public mensajes: MensajesAplicacionService,) {

    this.authenticationService.user.pipe(takeUntil(this.destroy$)).subscribe(x => this.user = x);
    this.authenticationInvZeusService.user.pipe(takeUntil(this.destroy$)).subscribe(x => this.user_InvZeus = x);
    this.authenticationContaZeusService.user.pipe(takeUntil(this.destroy$)).subscribe(x => this.user_ContaZeus = x);
    this.authenticationBagProService.user.pipe(takeUntil(this.destroy$)).subscribe(x => this.user_BagPro = x);
    this.inactividad();
  }

  /**
   * Tema actual (true = oscuro). Se mantiene por compatibilidad con las vistas que lo leen; la fuente de verdad es
   * TemaService. Para reaccionar a los cambios de tema usar alCambiarTema (Servicios/Tema/Tema.service.ts).
   */
  get temaSeleccionado(): boolean {
    return this.temaService.oscuro;
  }

  set temaSeleccionado(oscuro: boolean) {
    this.temaService.cambiar(oscuro);
  }

  //#region Errores con "Ver detalles"
  readonly claveToastErrorDetallado = CLAVE_TOAST_ERROR_DETALLADO;

  /** Si el botón "Copiar" debe mostrarse como "Copiado!" (vuelve a "Copiar" a los 2 segundos). */
  detalleCopiado: boolean = false;
  private temporizadorCopiado?: ReturnType<typeof setTimeout>;

  /** Copia el detalle técnico del error al portapapeles (para enviarlo a soporte). */
  copiarDetalleError(detalle: DetalleError) {
    const texto = MensajesAplicacionService.detalleComoTexto(detalle);
    const copiado = () => {
      this.detalleCopiado = true;
      clearTimeout(this.temporizadorCopiado);
      this.temporizadorCopiado = setTimeout(() => this.detalleCopiado = false, 2000);
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(texto).then(copiado, () => this.copiarConRespaldo(texto) && copiado());
    } else if (this.copiarConRespaldo(texto)) copiado();
  }

  /** Cierra la ventana de detalles y deja el botón de nuevo en "Copiar". */
  cerrarDetalleError() {
    clearTimeout(this.temporizadorCopiado);
    this.detalleCopiado = false;
    this.mensajes.cerrarDetalles();
  }

  /** Copia sin la API de portapapeles (no disponible en http de la red interna, que no es contexto seguro). */
  private copiarConRespaldo(texto: string): boolean {
    const area = this.document.createElement('textarea');
    area.value = texto;
    area.style.position = 'fixed';
    area.style.opacity = '0';
    this.document.body.appendChild(area);
    area.select();
    let ok = false;
    try { ok = this.document.execCommand('copy'); } catch { ok = false; }
    this.document.body.removeChild(area);
    return ok;
  }
  //#endregion

  ngOnInit(): void {
    moment.locale('es');
    this.lecturaStorage();
    this.config.setTranslation({
      accept: 'Aceptar',
      reject: 'Cancelar',
      monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
      monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
      dayNames: ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'],
      dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'],
      dayNamesMin: ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'],
      matchAll: 'Todo',
      matchAny: 'Cualquiera',
      startsWith: 'Empiece con',
      contains: 'Contiene',
      notContains: 'No Contiene',
      equals: 'Igual',
      notEquals: 'No Igual',
      endsWith: 'Termina con',
      apply: 'Aplicar',
      clear: 'Limpiar',
      addRule: 'Añadir Regla',
      removeRule: 'Quitar Regla',
      emptyFilterMessage: 'No hay resultados',
      emptyMessage: 'No hay resultados',
      today: 'Hoy',
      passwordPrompt: 'Ingrese la Contraseña',
      strong: 'Fuerte',
      medium: 'Medio',
      weak: 'Debil',
      noFilter: 'Sin Filtros',
      choose: 'Elegir',
      upload: 'Cargar',
      cancel: 'Cancelar'
    });
  }

  ngOnDestroy(): void {
    // LIMPIAR TODAS LAS SUBSCRIPCIONES
    this.destroy$.next();
    this.destroy$.complete();
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage() {
    this.storage_Id = this.encriptacion.decrypt(this.storage.get('Id') == undefined ? '' : this.storage.get('Id'));
    this.storage_Nombre = this.encriptacion.decrypt(this.storage.get('Nombre') == undefined ? '' : this.storage.get('Nombre'));
    this.ValidarRol = parseInt(this.encriptacion.decrypt(this.storage.get('Rol') == undefined ? '' : this.storage.get('Rol')));
    this.storage_Rol = this.ValidarRol;
  }

  /**
   * Cierra la sesión cuando pasan 120 minutos sin actividad (mouse, teclado, toque o scroll) en esta pestaña.
   * - Se usa addEventListener (no document.onclick = …) para no reemplazar otros manejadores de la página.
   * - El scroll se escucha en fase de captura porque no burbujea: así cuenta también el de tablas y paneles internos.
   * - En el login (/) no corre el contador: no hay sesión que cerrar.
   */
  inactividad() {
    const tiempoMaximoInactividadMs: number = 120 * 60 * 1000; // 120 minutos
    let temporizador: ReturnType<typeof setTimeout> | undefined;

    const tiempoExcedido = () => {
      if (this.storage.get('Token')) this.authenticationService.logout();
      else {
        this.storage.clear();
        window.location.pathname = '/';
      }
    };

    const reiniciarTiempo = () => {
      clearTimeout(temporizador);
      if (window.location.pathname === '/') return;
      temporizador = setTimeout(tiempoExcedido, tiempoMaximoInactividadMs);
    };

    ['mousemove', 'mousedown', 'keydown', 'touchstart', 'click', 'scroll'].forEach(evento =>
      this.document.addEventListener(evento, reiniciarTiempo, { capture: true, passive: true }));
    reiniciarTiempo();
  }
}