import { TutorialesService } from 'src/app/Servicios/Tutoriales/Tutoriales.service';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, HostListener, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import moment from 'moment';
import { CookieService } from 'ngx-cookie-service';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { finalize, tap, of, map, timeout, Observable, retry, timer, throwError, TimeoutError, MonoTypeOperatorFunction } from 'rxjs';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import { catchError } from 'rxjs/internal/operators/catchError';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { EmpresaService } from 'src/app/Servicios/Empresa/empresa.service';
import { EncriptacionService } from 'src/app/Servicios/Encriptacion/Encriptacion.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { MovimientosAplicacionService } from 'src/app/Servicios/Movimientos_Aplicacion/MovimientosAplicacion.service';
import { AuthenticationService } from 'src/app/_Services/authentication.service';
import { authentication_BagPro } from 'src/app/_Services/authentication_BagPro.service';
import { authentication_ContaZeus } from 'src/app/_Services/authentication_ContaZeus.service';
import { AuthenticationService_InvZeus } from 'src/app/_Services/authentication_InvZeus.service';
import { AppComponent } from 'src/app/app.component';
import { environment } from 'src/environments/environment';
import { VERSION_APP } from 'src/environments/version';

/**
 * The `LoginComponentComponent` class handles the login functionality of the application.
 * It includes methods for validating user credentials, logging in, and redirecting to different pages based on the user's role.
 * It also interacts with various services for authentication and storing user information.
 */

@Component({
  selector: 'app-Vista-login-component',
  templateUrl: './login-component.component.html',
  styleUrls: ['./login-component.component.css']
})

export class LoginComponentComponent implements OnInit {

  cargando: boolean = false; // Variable para mostrar el cargando mientras se valida el inicio de sesión
  formularioUsuario !: FormGroup; // Formulario para capturar la información del usuario que desea iniciar sesión
  data: any = []; // Variable para almacenar información que se guardará en el session storage
  ruta: any; // Variable para almacenar la ruta a la que se redireccionará al usuario dependiendo de su rol
  mostrarPass: boolean = false; // Variable para mostrar o ocultar la contraseña en el campo del formulario
  empresas: any[] = []; //  Variable para almacenar la información de las empresas que se mostrará en el combo box del formulario
  ipAddress: any; // Variable para almacenar la ip del usuario que inicia sesión
  modoSeleccionado: boolean; //Variable para validar el tema seleccionado, si la variable es true estará en modo oscuro, si es false estará en modo claro

  /** Llave de localStorage del usuario recordado. Usa el prefijo `login:` para sobrevivir a la limpieza de TutorialesService. */
  static readonly CLAVE_USUARIO_RECORDADO = 'login:usuarioRecordado';
  private static readonly SIN_INTERNET = 'No hay conexión a internet. Verifica tu red.';
  private readonly tiempoMaximoConexionMs = 15000;
  private readonly esperaAntesDeReintentarMs = 2000;

  /** Estado de la verificación inicial: mientras no esté 'listo' la tarjeta muestra el logo animado y un mensaje en lugar del formulario. */
  estadoConexion: 'verificando' | 'error' | 'listo' = 'verificando';
  mensajeConexion: string = 'Iniciando...';
  erroresConexion: string[] = []; // Un mensaje por API con problemas; la tarjeta muestra uno por renglón
  esBeta: boolean = environment.esBeta; //Indica si la app se compiló para el entorno de pruebas (npm run build:beta)
  versionApp: string = VERSION_APP; //Versión de la app (package.json), se sube con npm run version:parche | version:menor | version:mayor

  constructor(private empresaServices: EmpresaService,
    private frmBuilderUsuario: FormBuilder,
    @Inject(SESSION_STORAGE) private storage: WebStorageService,
    private authenticationService: AuthenticationService,
    private router: Router,
    private movAplicacionService: MovimientosAplicacionService,
    private authenticationInvZeusService: AuthenticationService_InvZeus,
    private authenticationContaZeusService: authentication_ContaZeus,
    private authenticationBagPro: authentication_BagPro,
    private encriptacion: EncriptacionService,
    private cookiesServices: CookieService,
    private mensajeService: MensajesAplicacionService,
    private appComponent: AppComponent,
    private http: HttpClient,) {

    if (!this.storage.get('Token')) {
      TutorialesService.limpiarLocalStorageConservandoTutoriales();
    }
    if ((this.storage.get('Token')
      && this.storage.get('Token_BagPro')
      && this.storage.get('Token_Inv_Zeus')
      && this.storage.get('Token_Conta_Zeus')) || localStorage.getItem('user')) this.router.navigate(['/home']);

    window.localStorage.setItem('theme', this.cookiesServices.get('theme'));
    this.modoSeleccionado = window.localStorage.getItem('theme') == 'dark' ? true : false;
    this.formularioUsuario = this.frmBuilderUsuario.group({
      Identificacion: [null, Validators.required],
      Contrasena: [null, Validators.required],
      Empresa: [null, Validators.required],
      Recordarme: [false],
    });
  }

  ngOnInit(): void {
    this.storage.clear();
    this.cookiesServices.delete('MostrarEventosDia');
    TutorialesService.limpiarLocalStorageConservandoTutoriales();
    this.appComponent.ValidarRol = NaN;
    this.verificarConexion();
  }

  // Funcion que guardará informacion a en la sesion
  saveInLocal(key, val): void {
    this.storage.set(key, val);
    this.data[key] = this.storage.get(key);
  }

  // Botón "Reintentar": recarga la página completa (también trae la versión más reciente del frontend si hubo despliegue).
  recargarPagina = () => window.location.reload();

  // Si la red vuelve mientras se muestra un error de conexión, se reintenta solo.
  @HostListener('window:online')
  alRecuperarRed() {
    if (this.estadoConexion == 'error') this.verificarConexion();
  }

  /**
   * Verifica que haya red y que respondan las 4 APIs antes de mostrar el formulario.
   * Plasticaribe se valida cargando las empresas; las demás, con una consulta sin efectos (ver `verificarServiciosSecundarios`).
   */
  verificarConexion() {
    this.estadoConexion = 'verificando';
    this.mensajeConexion = 'Iniciando...';
    this.erroresConexion = [];
    if (!navigator.onLine) return this.mostrarErrorConexion(LoginComponentComponent.SIN_INTERNET);

    this.mensajeConexion = 'Cargando empresas...';
    this.empresaServices.getIdNombreEmpresas().pipe(
      this.esperarConUnReintento(),
      switchMap(empresas => {
        this.empresas = empresas ?? [];
        this.mensajeConexion = 'Conectando con los servicios...';
        return this.verificarServiciosSecundarios();
      }),
    ).subscribe({
      next: (erroresServicios) => {
        if (!this.empresas.length) return this.mostrarErrorConexion('No hay empresas registradas.');
        if (erroresServicios.length) return this.mostrarErrorConexion(erroresServicios);
        this.prepararFormulario();
      },
      error: (error) => this.mostrarErrorConexion(this.mensajeErrorConexion('Plasticaribe', error)),
    });
  }

  /**
   * Comprueba Inventario Zeus, Contabilidad Zeus y BagPro con `GET api/Salud` (anónimo, no inicia sesión ni guarda tokens).
   * Ese endpoint responde 200 si la API y su base de datos están bien, o 503 si la API está arriba pero sin base de datos.
   * @returns Mensajes cortos de los servicios con problemas (vacío si todos respondieron bien).
   */
  private verificarServiciosSecundarios(): Observable<string[]> {
    const servicios = [
      { nombre: 'Inventario de Zeus', ruta: environment.rutaZeus },
      { nombre: 'Contabilidad de Zeus', ruta: environment.rutaZeusContabilidad },
      { nombre: 'BagPro', ruta: environment.rutaBagPro },
    ];
    return forkJoin(servicios.map(servicio => this.http.get(`${servicio.ruta}/Salud`).pipe(
      this.esperarConUnReintento(),
      map(() => null),
      catchError(error => of({ nombre: servicio.nombre, error })),
    ))).pipe(map(resultados => {
      const fallidos = resultados.filter(r => !!r) as { nombre: string, error: any }[];
      if (fallidos.length && !navigator.onLine) return [LoginComponentComponent.SIN_INTERNET];
      return fallidos.map(f => this.mensajeErrorConexion(f.nombre, f.error)); // un mensaje (renglón) por API
    }));
  }

  /**
   * Tiempo máximo de espera + un reintento si la API no alcanzó a responder (timeout o status 0).
   * Cubre el arranque en frío de las APIs en IIS (p. ej. Contabilidad de Zeus construyendo su modelo EF tras publicar o reciclar):
   * la primera petición puede pasarse del tiempo, pero deja la API caliente y el reintento ya responde rápido.
   */
  private esperarConUnReintento<T>(): MonoTypeOperatorFunction<T> {
    return (fuente: Observable<T>) => fuente.pipe(
      timeout(this.tiempoMaximoConexionMs),
      retry({
        count: 1,
        delay: (error) => this.esFallaTransitoria(error) ? timer(this.esperaAntesDeReintentarMs) : throwError(() => error),
      }),
    );
  }

  private esFallaTransitoria = (error: any): boolean => navigator.onLine && (error instanceof TimeoutError || (error instanceof HttpErrorResponse && error.status === 0));

  private apiRespondio = (error: any): boolean => error instanceof HttpErrorResponse && error.status !== 0;

  /** Mensaje corto para la tarjeta: nunca el error completo, que no cabe en la interfaz. */
  private mensajeErrorConexion(api: string, error: any): string {
    if (!navigator.onLine) return LoginComponentComponent.SIN_INTERNET;
    if (error instanceof TimeoutError) return `${api} está tardando demasiado en responder.`;
    if (this.apiRespondio(error) && error.status == 503) return `${api} no pudo conectarse a su base de datos.`;
    if (this.apiRespondio(error)) return `${api} respondió con un error (${error.status}).`;
    return `No se pudo conectar con ${api}.`;
  }

  private mostrarErrorConexion(mensajes: string | string[]) {
    this.estadoConexion = 'error';
    this.erroresConexion = Array.isArray(mensajes) ? mensajes : [mensajes];
  }

  /** Deja escogida la empresa (oculta en el formulario) y precarga el usuario recordado. */
  private prepararFormulario() {
    const empresa = this.empresas.find(e => `${e.empresa_Nombre ?? ''}`.toUpperCase().includes('PLASTICARIBE')) ?? this.empresas[0];
    const usuarioRecordado = this.leerUsuarioRecordado();
    this.formularioUsuario.patchValue({
      Empresa: empresa.empresa_Id,
      Identificacion: usuarioRecordado,
      Recordarme: !!usuarioRecordado,
    });
    this.estadoConexion = 'listo';
  }

  // "Recuérdame" guarda solo el ID de usuario; la contraseña la sigue llenando el gestor de contraseñas del navegador.
  private leerUsuarioRecordado(): string | null {
    try { return window.localStorage.getItem(LoginComponentComponent.CLAVE_USUARIO_RECORDADO); } catch { return null; }
  }

  private guardarPreferenciaRecordarme() {
    try {
      const { Recordarme, Identificacion } = this.formularioUsuario.value;
      if (Recordarme) window.localStorage.setItem(LoginComponentComponent.CLAVE_USUARIO_RECORDADO, `${Identificacion}`.trim());
      else window.localStorage.removeItem(LoginComponentComponent.CLAVE_USUARIO_RECORDADO);
    } catch { /* sin almacenamiento: simplemente no se recuerda */ }
  }

  // Funcion que va a redireccionar al apartado de archivos
  redireccionarArchivos = () => this.router.navigate(['/Archivos']);

  //Funcion que va a validar si hay campos vacios
  validarCamposVacios = () => this.formularioUsuario.valid ? this.consultaLogin() : this.mensajeService.mensajeAdvertencia('Advertencia', '¡Por favor llenar los campos vacios!');

  /**
   * Inicia sesión en Plasticaribe y, si las credenciales son válidas, en Inventario de Zeus, Contabilidad de Zeus y BagPro (en paralelo).
   * Cada paso etiqueta su error con la API que falló, para mostrar un mensaje preciso con "Ver detalles".
   * Si algo falla después del login principal, se borran los tokens ya guardados para no dejar la sesión a medias.
   */
  consultaLogin() {
    this.cargando = true;
    const { Empresa, Identificacion, Contrasena } = this.formularioUsuario.value;
    const data = { id_Usuario: Identificacion, contrasena: Contrasena, empresa: Empresa };

    this.authenticationService.login(data).pipe(
      this.esperarConUnReintento(),
      this.etiquetarFallo(LoginComponentComponent.API_PRINCIPAL, `${environment.rutaPlasticaribeAPI}/Authentication/login`),
      switchMap(datos => forkJoin([
        this.authenticationInvZeusService.login().pipe(this.esperarConUnReintento(), this.etiquetarFallo('Inventario de Zeus', `${environment.rutaZeus}/Authentication/login`)),
        this.authenticationContaZeusService.login().pipe(this.esperarConUnReintento(), this.etiquetarFallo('Contabilidad de Zeus', `${environment.rutaZeusContabilidad}/Authentication/login`)),
        this.authenticationBagPro.login().pipe(this.esperarConUnReintento(), this.etiquetarFallo('BagPro', `${environment.rutaBagPro}/Authentication/login`)),
      ]).pipe(map(() => datos))),
      // El registro del movimiento no se reintenta: si el servidor alcanzó a guardarlo, quedaría duplicado.
      switchMap(datos => this.movAplicacionService.insert(this.movimientoInicioSesion(datos)).pipe(
        timeout(this.tiempoMaximoConexionMs),
        this.etiquetarFallo(LoginComponentComponent.API_PRINCIPAL, undefined, 'Registro del inicio de sesión'),
        map(() => datos),
      )),
    ).subscribe({
      next: (datos) => {
        this.saveInLocal('Id', this.encriptacion.encrypt(datos.usua_Id.toString()));
        this.saveInLocal('Nombre', this.encriptacion.encrypt(datos.usuario.toString()));
        this.saveInLocal('Rol', this.encriptacion.encrypt(datos.rolUsu_Id.toString()));
        this.guardarPreferenciaRecordarme();
        window.location.pathname = '/home';
      },
      error: (fallo: FalloLogin) => {
        this.limpiarSesionParcial();
        this.notificarFalloLogin(fallo);
        this.cargando = false;
      },
    });
  }

  private static readonly API_PRINCIPAL = 'Plasticaribe';

  /** Convierte cualquier error del paso en un FalloLogin con la API, la URL y la operación. */
  private etiquetarFallo<T>(api: string, url?: string, operacion: string = 'Inicio de sesión'): MonoTypeOperatorFunction<T> {
    return catchError((error: any) => throwError(() => (error?.esFalloLogin ? error : { esFalloLogin: true, api, url, operacion, error } as FalloLogin)));
  }

  private movimientoInicioSesion(datos: any) {
    const fecha = moment();
    return {
      "Usua_Id": datos.usua_Id,
      "MovApp_Nombre": `Inicio de sesión`,
      "MovApp_Descripcion": `El usuario "${datos.usuario}" con el ID ${datos.usua_Id} inició sesión el día ${fecha.format('YYYY-MM-DD')} a las ${fecha.format('H:mm:ss')} horas.`,
      "MovApp_Fecha": fecha.format('YYYY-MM-DD'),
      "MovApp_Hora": fecha.format('H:mm:ss'),
    };
  }

  /** Muestra el error con título "Error", un mensaje breve y "Ver detalles" (sin el cuerpo de la petición, que lleva la contraseña). */
  private notificarFalloLogin(fallo: FalloLogin) {
    const error = fallo?.esFalloLogin ? fallo.error : fallo;
    const api = fallo?.esFalloLogin ? fallo.api : LoginComponentComponent.API_PRINCIPAL;
    const status = error instanceof HttpErrorResponse ? error.status : undefined;
    if (api == LoginComponentComponent.API_PRINCIPAL && status == 401) this.formularioUsuario.patchValue({ Contrasena: '' });

    const detalle = MensajesAplicacionService.detalleDeError(error, { api, operacion: fallo?.operacion ?? 'Inicio de sesión', metodo: 'POST', url: fallo?.url });
    this.mensajeService.mensajeErrorDetallado(this.mensajeFalloLogin(api, error, fallo?.operacion), detalle);
  }

  /** Mensaje breve y entendible según la causa del error. */
  private mensajeFalloLogin(api: string, error: any, operacion?: string): string {
    const esLoginPrincipal = api == LoginComponentComponent.API_PRINCIPAL && (operacion ?? 'Inicio de sesión') == 'Inicio de sesión';
    if (!navigator.onLine) return 'No hay conexión a internet. Verifica tu red e inténtalo de nuevo.';
    if (error instanceof TimeoutError) return `${api} tardó demasiado en responder. Inténtalo de nuevo.`;
    if (!(error instanceof HttpErrorResponse)) return 'Ocurrió un error inesperado al iniciar sesión.';

    switch (true) {
      case error.status == 0: return `No se pudo conectar con ${api}. Verifica que estés en la red de la empresa o que el servidor esté encendido.`;
      case esLoginPrincipal && error.status == 400: return 'Faltan datos para iniciar sesión. Completa la identificación y la contraseña.';
      case esLoginPrincipal && error.status == 401: return 'Usuario, contraseña o empresa incorrectos.';
      case esLoginPrincipal && error.status == 403: return 'El usuario está inactivo. Comunícate con el administrador del sistema.';
      case !esLoginPrincipal && api == LoginComponentComponent.API_PRINCIPAL: return 'No se pudo registrar el inicio de sesión. Inténtalo de nuevo.';
      case [401, 403].includes(error.status): return `${api} rechazó el acceso del sistema. Informa a soporte.`;
      case error.status == 404: return `No se encontró el servicio de inicio de sesión en ${api}. Informa a soporte.`;
      case error.status == 503: return `${api} no pudo conectarse a su base de datos. Inténtalo en unos minutos.`;
      case error.status >= 500: return `${api} tuvo un error interno. Inténtalo de nuevo; si continúa, informa a soporte.`;
      default: return `${api} respondió con un error inesperado (${error.status}).`;
    }
  }

  /** Borra los tokens que alcanzaron a guardarse si el inicio de sesión no se completó. */
  private limpiarSesionParcial() {
    ['Token', 'Token_Inv_Zeus', 'Token_Conta_Zeus', 'Token_BagPro', ''].forEach(clave => { try { this.storage.remove(clave); } catch { } });
    ['user', 'user_Inv_Zeus', 'user_Conta_Zeus', 'user_BagPro', ''].forEach(clave => { try { localStorage.removeItem(clave); } catch { } });
  }
}

/** Error de un paso del inicio de sesión, con la API que falló. */
interface FalloLogin {
  esFalloLogin: true;
  api: string;
  url?: string;
  operacion: string;
  error: any;
}


