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

  // Funcion que se encargará de enviar al API la información del usuario que desea iniciar sesion y dependiendo de la respuesta de esta se actuará
  consultaLogin() {
    this.cargando = true;
    let empresa: number = this.formularioUsuario.value.Empresa;
    let idUsuario: number = this.formularioUsuario.value.Identificacion;
    let contrasena: string = this.formularioUsuario.value.Contrasena;
    let data: any = { "id_Usuario": idUsuario, "contrasena": contrasena, "empresa": empresa };

    this.authenticationService.login(data).subscribe(datos => {
      this.authenticationInvZeusService.login().subscribe(() => {
        this.authenticationContaZeusService.login().subscribe(() => {
          this.authenticationBagPro.login().subscribe(() => {
            let idUsuario: number = datos.usua_Id;
            let nombre: string = datos.usuario;
            let rol: number = datos.rolUsu_Id;
            let infoMovimientoAplicacion: any = {
              "Usua_Id": idUsuario,
              "MovApp_Nombre": `Inicio de sesión`,
              "MovApp_Descripcion": `El usuario "${nombre}" con el ID ${idUsuario} inició sesión el día ${moment().format('YYYY-MM-DD')} a las ${moment().format('H:mm:ss')} horas.`,
              "MovApp_Fecha": moment().format('YYYY-MM-DD'),
              "MovApp_Hora": moment().format('H:mm:ss'),
            }
            this.movAplicacionService.insert(infoMovimientoAplicacion).subscribe(() => {
              this.saveInLocal('Id', this.encriptacion.encrypt(idUsuario.toString()));
              this.saveInLocal('Nombre', this.encriptacion.encrypt(nombre.toString()));
              this.saveInLocal('Rol', this.encriptacion.encrypt(rol.toString()));
              this.guardarPreferenciaRecordarme();
              window.location.pathname = '/home';
            }, () => {
              this.mensajeService.mensajeError(`¡Error!`, `¡Error al registrar el inicio de sesión!`);
              this.cargando = false;
            });
          }, (error: HttpErrorResponse) => {
            this.mensajeService.mensajeError(`¡Error al conectarse con BagPro!`, `Error: ${error.statusText} | Status: ${error.status}`);
            this.cargando = false;
          });
        }, (error: HttpErrorResponse) => {
          this.mensajeService.mensajeError(`¡Error al conectarse con Contabilidad de Zeus!`, `Error: ${error.statusText} | Status: ${error.status}`);
          this.cargando = false;
        });
      }, (error: HttpErrorResponse) => {
        this.mensajeService.mensajeError(`¡Error al conectarse con Inventario de Zeus!`, `Error: ${error.statusText} | Status: ${error.status}`);
        this.cargando = false;
      });
    }, (error: HttpErrorResponse) => {
      this.mensajeService.mensajeError(`¡No fue posible iniciar sesión!`, `Error: ${error.statusText} | Status: ${error.status}`);
      this.cargando = false;
    });
  }

  consultaLogin2() {
    this.cargando = true;

    const { Empresa, Identificacion, Contrasena } = this.formularioUsuario.value;

    const data = {
      id_Usuario: Identificacion,
      contrasena: Contrasena,
      empresa: Empresa
    };

    this.authenticationService.login(data).pipe(

      // Ejecutar logins secundarios en paralelo
      switchMap((datos) => {

        return forkJoin({
          inv: this.authenticationInvZeusService.login().pipe(
            catchError((error: HttpErrorResponse) => {
              this.mensajeService.mensajeError(
                `¡Error al conectarse con Inventario de Zeus!`,
                `Error: ${error.statusText} | Status: ${error.status}`
              );
              return of(null); // evita que se caiga todo
            })
          ),
          conta: this.authenticationContaZeusService.login().pipe(
            catchError((error: HttpErrorResponse) => {
              this.mensajeService.mensajeError(
                `¡Error al conectarse con Contabilidad de Zeus!`,
                `Error: ${error.statusText} | Status: ${error.status}`
              );
              return of(null);
            })
          ),
          bag: this.authenticationBagPro.login().pipe(
            catchError((error: HttpErrorResponse) => {
              this.mensajeService.mensajeError(
                `¡Error al conectarse con BagPro!`,
                `Error: ${error.statusText} | Status: ${error.status}`
              );
              return of(null);
            })
          )
        }).pipe(
          map(() => datos) // mantenemos datos del login principal
        );
      }),

      // 🔹 Registrar movimiento
      switchMap((datos) => {

        const idUsuario = datos.usua_Id;
        const nombre = datos.usuario;
        const rol = datos.rolUsu_Id;

        const fecha = moment();
        const infoMovimientoAplicacion = {
          Usua_Id: idUsuario,
          MovApp_Nombre: `Inicio de sesión`,
          MovApp_Descripcion: `El usuario "${nombre}" con el ID ${idUsuario} inició sesión el día ${fecha.format('YYYY-MM-DD')} a las ${fecha.format('H:mm:ss')} horas.`,
          MovApp_Fecha: fecha.format('YYYY-MM-DD'),
          MovApp_Hora: fecha.format('H:mm:ss')
        };

        return this.movAplicacionService.insert(infoMovimientoAplicacion).pipe(
          map(() => ({ idUsuario, nombre, rol }))
        );
      }),

      // 🔹 Guardar en storage + navegación
      tap(({ idUsuario, nombre, rol }) => {
        this.saveInLocal('Id', this.encriptacion.encrypt(idUsuario.toString()));
        this.saveInLocal('Nombre', this.encriptacion.encrypt(nombre));
        this.saveInLocal('Rol', this.encriptacion.encrypt(rol.toString()));
        this.guardarPreferenciaRecordarme();

        this.router.navigate(['/home']); // ✅ sin recargar página
      }),

      // 🔴 Manejo global de errores (login principal)
      catchError((error: HttpErrorResponse) => {
        this.mensajeService.mensajeError(
          `¡No fue posible iniciar sesión!`,
          `Error: ${error.statusText} | Status: ${error.status}`
        );
        return of(null);
      }),

      finalize(() => {
        this.cargando = false;
      })

    ).subscribe();
  }
}


