import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';
import moment from 'moment';
import { ConfirmationService } from 'primeng/api';
import { Table } from 'primeng/table';
import { Observable, catchError, finalize, forkJoin, map, of, switchMap } from 'rxjs';
import { modelAreas } from 'src/app/Modelo/modelAreas';
import { modelRol } from 'src/app/Modelo/modelRol';
import { modelTipoUsuario } from 'src/app/Modelo/modelTipoUsuario';
import { modelUsuario } from 'src/app/Modelo/modelUsuario';
import { modelVistasPermisos } from 'src/app/Modelo/modelVistasPermisos';
import { AreaService } from 'src/app/Servicios/Areas/area.service';
import { EstadosService } from 'src/app/Servicios/Estados/estados.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { RolesService } from 'src/app/Servicios/Roles/roles.service';
import { alCambiarTema } from 'src/app/Servicios/Tema/Tema.service';
import { SrvTipos_UsuariosService } from 'src/app/Servicios/TiposUsuarios/srvTipos_Usuarios.service';
import { TutorialesService } from 'src/app/Servicios/Tutoriales/Tutoriales.service';
import { UsuarioService } from 'src/app/Servicios/Usuarios/usuario.service';
import { Vistas_PermisosService } from 'src/app/Servicios/Vistas_Permisos/Vistas_Permisos.service';
import { ClaveTutorialUsuarios, pasosTutorialUsuarios } from 'src/app/Tutoriales/Tutoriales_Usuarios';
import { AppComponent } from 'src/app/app.component';
import { logoParaPdf } from 'src/app/logoPlasticaribe_Base64';

/** Estado "INACTIVO" por si la lista de estados aún no ha cargado. */
const ESTADO_INACTIVO_POR_DEFECTO = 8;

/** Compara nombres sin importar mayúsculas ni espacios de los extremos. */
const mismoNombre = (a : any, b : any) => `${a ?? ''}`.trim().toUpperCase() === `${b ?? ''}`.trim().toUpperCase();

/** Proporción ancho/alto del logo leída de la cabecera del PNG, para que no se deforme en el Excel (respaldo: 1972x370). */
const proporcionLogo = () : number => {
  try {
    const bytes = atob(String(logoParaPdf).split(',').pop()!.substring(0, 44));
    const leer = (i : number) => ((bytes.charCodeAt(i) << 24) >>> 0) + (bytes.charCodeAt(i + 1) << 16) + (bytes.charCodeAt(i + 2) << 8) + bytes.charCodeAt(i + 3);
    const ancho = leer(16), alto = leer(20);
    if (ancho > 0 && alto > 0) return ancho / alto;
  } catch { }
  return 1972 / 370;
};

/** Límites del formulario de usuarios. */
export const LIMITES_USUARIO = { nombre: 50, digitos: 16, password: 25 };

/** Dígitos que toma el ID de usuario desde el final de la cédula. */
const DIGITOS_ID_DESDE_CEDULA = 4;

/**
 * Valida un número de solo dígitos (ID / cédula) guardado como texto en el formulario.
 * El API lo recibe como número (long) y JavaScript solo representa enteros exactos hasta 9.007.199.254.740.991
 * (16 dígitos); por encima se alteraría al enviarlo, así que se rechaza en vez de guardar un número distinto.
 */
const numeroValido = (control : AbstractControl) : ValidationErrors | null => {
  const valor = `${control.value ?? ''}`;
  if (!valor) return null;
  if (!/^\d+$/.test(valor)) return { soloDigitos: true };
  if (!Number.isSafeInteger(Number(valor))) return { numeroMuyGrande: true };
  return null;
};

/** El ID de usuario debe ser mayor que cero. */
const mayorQueCero = (control : AbstractControl) : ValidationErrors | null => control.value !== null && control.value !== '' && Number(control.value) <= 0 ? { mayorQueCero: true } : null;

@Component({
  selector: 'app-registro-component',
  templateUrl: './registro-component.component.html',
  styleUrls: ['./registro-component.component.css']
})

export class RegistroComponentComponent implements OnInit, OnDestroy {

  @ViewChild('dt') dt : Table | undefined;

  load : boolean = true; /** false = muestra el spinner encima de la página (las tablas no se destruyen) */
  pestanaActiva : number = 0; /** 0 = Usuarios, 1 = Roles, 2 = Áreas */
  modoSeleccionado : boolean; /** Modo oscuro/claro */
  private readonly suscripcionTema = alCambiarTema(oscuro => this.modoSeleccionado = oscuro);

  // Catálogos
  arrayAreas : any[] = [];
  arrayRoles : any[] = [];
  arrayEstados : any[] = [];
  arrayTiposUsuarios : any[] = [];
  vistasAplicacion : any[] = []; /** Nodos del treeSelect de vistas (key = vp_Id) */

  // Usuarios
  FormUsuarios !: FormGroup;
  arrayUsuarios : any[] = [];
  usuariosInactivar : any[] = [];
  tooltipTotalUsuarios : string = '';
  rows = 10;
  first = 0;
  dialogUsuarios : boolean = false;
  accion : 'Crear' | 'Editar' = 'Crear';
  readonly limites = LIMITES_USUARIO;
  verPassword : boolean = false;
  /** true cuando el administrador escribió o borró el ID a mano: la cédula deja de rellenarlo. */
  private idEditadoManualmente : boolean = false;

  // Roles
  formRoles !: FormGroup;
  modalRol : boolean = false;
  editarRol : boolean = false;
  rolEditar : any = null; /** Rol (tal como vino del servidor) que se está editando */

  // Áreas
  formAreas !: FormGroup;
  modalArea : boolean = false;
  areaEditar : any = null; /** Área (tal como vino del servidor) que se está editando; null = crear */

  constructor(private formBuilder : FormBuilder,
    private servicioRoles : RolesService,
    private servicioAreas : AreaService,
    private servicioUsuarios : UsuarioService,
    private servicioEstados : EstadosService,
    private servicioTpUsuarios : SrvTipos_UsuariosService,
    private AppComponent : AppComponent,
    private msj : MensajesAplicacionService,
    private vistasPermisosService : Vistas_PermisosService,
    private confirmationService : ConfirmationService,
    private tutoriales : TutorialesService,) {

    this.FormUsuarios = this.formBuilder.group({
      usuCedula: [null, [Validators.maxLength(LIMITES_USUARIO.digitos), numeroValido]],
      usuId: [null, [Validators.required, Validators.maxLength(LIMITES_USUARIO.digitos), numeroValido, mayorQueCero]],
      usuNombre: [null, [Validators.required, Validators.maxLength(LIMITES_USUARIO.nombre)]],
      usuTipo: [null, Validators.required],
      usuArea: [null, Validators.required],
      usuRol: [null, Validators.required],
      usuEstado: [null, Validators.required],
      usuPassword: [null, [Validators.required, Validators.maxLength(LIMITES_USUARIO.password)]],
    });

    this.formRoles = this.formBuilder.group({
      rolNombre: [null, Validators.required],
      rolDescripcion: [null, Validators.required],
      Vistas: [[], Validators.required],
    });

    this.formAreas = this.formBuilder.group({
      areaNombre: [null, Validators.required],
      areaDescripcion: [null],
    });
  }

  ngOnInit() {
    this.cargarAreas();
    this.cargarRoles();
    this.cargarEstados();
    this.cargarTiposUsuarios();
    this.cargarVistas();
    this.cargarUsuarios(true);
  }

  ngOnDestroy() {
    this.tutoriales.cancelar();
  }

  /* ============================== Catálogos ============================== */

  cargarAreas = () => this.servicioAreas.srvObtenerLista().subscribe(data => this.arrayAreas = data);

  cargarRoles = () => this.servicioRoles.srvObtenerLista().subscribe(data => this.arrayRoles = data);

  cargarEstados = () => this.servicioEstados.srvObtenerListaEstados().subscribe(data => this.arrayEstados = data.filter(item => item.estado_Nombre == 'ACTIVO' || item.estado_Nombre == 'INACTIVO'));

  cargarTiposUsuarios = () => this.servicioTpUsuarios.srvObtenerLista().subscribe(data => this.arrayTiposUsuarios = data);

  cargarVistas() {
    this.vistasPermisosService.Get_Todo().subscribe((data : any[]) => {
      this.vistasAplicacion = data.map(vista => ({ key: vista.vp_Id, label: vista.vp_Nombre, data: vista.vp_Nombre, icon: vista.vp_Icono_Menu, children: [] }));
    });
  }

  /** Marca los campos para que PrimeNG resalte en rojo los obligatorios vacíos. */
  private marcarCampos(form : FormGroup) {
    Object.values(form.controls).forEach(control => {
      control.markAsDirty();
      control.markAsTouched();
    });
  }

  private get estadoInactivo() : number {
    return this.arrayEstados.find(e => e.estado_Nombre == 'INACTIVO')?.estado_Id ?? ESTADO_INACTIVO_POR_DEFECTO;
  }

  /* ============================== Usuarios ============================== */

  /** Carga la tabla de usuarios. La contraseña no se guarda en la tabla (solo se consulta al editar). */
  cargarUsuarios(iniciarTutorial : boolean = false) {
    this.load = false;
    this.servicioUsuarios.getUsuarios().pipe(finalize(() => this.load = true)).subscribe({
      next: (data : any[]) => {
        this.arrayUsuarios = data.map(usu => ({
          Id: usu.usua_Id,
          Cedula: usu.usua_Cedula ?? '',
          Nombre: usu.usua_Nombre,
          Tipo: usu.tpUsu_Nombre,
          Area: usu.area_Nombre,
          Rol: usu.rolUsu_Nombre,
          Estado: usu.estado_Nombre,
          Email: usu.usua_Email,
          Telefono: usu.usua_Telefono,
          TipoId: usu.tipoIdentificacion_Id,
          Empresa: usu.empresa_Nombre,
          Caja: usu.cajComp_Nombre,
          EPS: usu.eps_Nombre,
          FondoP: usu.fPen_Nombre,
          Fecha: usu.usua_Fecha ? moment(usu.usua_Fecha).format('YYYY-MM-DD') : '',
          Hora: usu.usua_Hora,
        }));
        this.usuariosInactivar = [];
        this.armarTooltipTotalUsuarios();
        if (iniciarTutorial) this.tutoriales.iniciarPrimeraVez(ClaveTutorialUsuarios, this.AppComponent.storage_Id, () => this.pasosTutorial());
      },
      error: () => this.msj.mensajeError(`¡Ocurrió un error!`, `¡No fue posible consultar los usuarios!`),
    });
  }

  /** Contenido (HTML) del tooltip del total de usuarios: activos e inactivos. Se arma al cargar, no en cada ciclo de vista. */
  private armarTooltipTotalUsuarios() {
    const activos = this.arrayUsuarios.filter(u => u.Estado == 'ACTIVO').length;
    const inactivos = this.arrayUsuarios.length - activos;
    const fila = (clase : string, texto : string, valor : number) =>
      `<div class="fila"><span class="punto ${clase}"></span><span class="texto">${texto}</span><b>${valor.toLocaleString('es-CO')}</b></div>`;
    this.tooltipTotalUsuarios = `<div class="titulo">Usuarios registrados</div>${fila('activo', 'Activos', activos)}${fila('inactivo', 'Inactivos', inactivos)}`;
  }

  /** Consulta el usuario completo tal como está en la base de datos. */
  private consultarUsuario = (id : number) : Observable<any> => this.servicioUsuarios.getUsuariosxId(id).pipe(map((data : any[]) => data?.[0]));

  /** Arma el usuario para el PUT conservando todo lo que ya tenía y aplicando solo los cambios indicados. */
  private armarUsuario(actual : any, cambios : any = {}) {
    return {
      Usua_Id: actual.usua_Id,
      Usua_Nombre: actual.usua_Nombre,
      TipoIdentificacion_Id: actual.tipoIdentificacion_Id,
      tpUsu_Id: actual.tpUsu_Id,
      Area_Id: actual.area_Id,
      RolUsu_Id: actual.rolUsu_Id,
      Empresa_Id: actual.empresa_Id,
      Estado_Id: actual.estado_Id,
      Usua_Email: actual.usua_Email,
      Usua_Telefono: actual.usua_Telefono,
      Usua_Contrasena: actual.usua_Contrasena,
      cajComp_Id: actual.cajComp_Id,
      eps_Id: actual.eps_Id,
      fPen_Id: actual.fPen_Id,
      Usua_Fecha: actual.usua_Fecha,
      Usua_Hora: actual.usua_Hora,
      Usua_Cedula: actual.usua_Cedula,
      ...cambios,
    };
  }

  abrirCrearUsuario() {
    this.FormUsuarios.reset();
    this.FormUsuarios.patchValue({ usuEstado: this.arrayEstados.find(e => e.estado_Nombre == 'ACTIVO')?.estado_Id ?? null });
    this.accion = 'Crear';
    this.idEditadoManualmente = false;
    this.verPassword = false;
    this.dialogUsuarios = true;
  }

  /** Abre el formulario de edición. La contraseña sí se carga: los administradores pueden verla y cambiarla. */
  abrirEditarUsuario(item : any) {
    this.FormUsuarios.reset();
    this.accion = 'Editar';
    this.load = false;
    this.consultarUsuario(item.Id).pipe(finalize(() => this.load = true)).subscribe({
      next: usu => {
        if (!usu) return this.msj.mensajeAdvertencia(`Advertencia`, `¡No se encontró el usuario ${item.Id}!`);
        this.verPassword = false;
        this.FormUsuarios.patchValue({
          usuId: `${usu.usua_Id}`,
          usuNombre: `${usu.usua_Nombre ?? ''}`.toUpperCase(),
          usuTipo: usu.tpUsu_Id,
          usuArea: usu.area_Id,
          usuRol: usu.rolUsu_Id,
          usuEstado: usu.estado_Id,
          usuPassword: usu.usua_Contrasena,
          usuCedula: usu.usua_Cedula != null ? `${usu.usua_Cedula}` : null,
        });
        this.dialogUsuarios = true;
      },
      error: () => this.msj.mensajeError(`¡Ocurrió un error!`, `¡No fue posible consultar el usuario ${item.Id}!`),
    });
  }

  guardarUsuario() {
    if (this.FormUsuarios.invalid) {
      this.marcarCampos(this.FormUsuarios);
      const numeroGrande = ['usuId', 'usuCedula'].some(c => this.FormUsuarios.get(c)?.hasError('numeroMuyGrande'));
      return this.msj.mensajeAdvertencia(`Advertencia`, numeroGrande ? `¡El ID o la cédula superan el número máximo permitido!` : `¡Debe diligenciar correctamente los campos obligatorios!`);
    }
    if (this.idExistente) return this.msj.mensajeAdvertencia(`Advertencia`, `¡El ID ${this.idExistente.Id} ya pertenece al usuario ${this.idExistente.Nombre}!`);
    if (this.accion == 'Crear') this.crearUsuario();
    else this.actualizarUsuario();
  }

  /** Usuario que ya tiene el ID escrito (solo al crear), para avisar antes de guardar. */
  get idExistente() : any {
    const id = this.FormUsuarios.value.usuId;
    if (this.accion != 'Crear' || !id) return null;
    return this.arrayUsuarios.find(u => `${u.Id}` === `${Number(id)}`) ?? null;
  }

  /** Otro usuario con la misma cédula (solo informativo: puede haber usuarios genéricos u operarios). */
  get cedulaExistente() : any {
    const cedula = this.FormUsuarios.value.usuCedula;
    if (!cedula) return null;
    return this.arrayUsuarios.find(u => `${u.Cedula}` === `${Number(cedula)}` && `${u.Id}` !== `${Number(this.FormUsuarios.value.usuId)}`) ?? null;
  }

  /** Deja solo dígitos en el campo (ID / cédula) mientras se escribe o se pega. */
  soloDigitos(evento : Event, campo : 'usuId' | 'usuCedula') {
    const input = evento.target as HTMLInputElement;
    const limpio = input.value.replace(/\D/g, '').slice(0, LIMITES_USUARIO.digitos);
    if (limpio !== input.value) input.value = limpio;
    this.FormUsuarios.get(campo)?.setValue(limpio || null, { emitModelToViewChange: false });
  }

  /** Al escribir la cédula (creando), el ID toma sus últimos 4 dígitos, salvo que el administrador ya haya editado el ID. */
  alEscribirCedula(evento : Event) {
    this.soloDigitos(evento, 'usuCedula');
    if (this.accion != 'Crear' || this.idEditadoManualmente) return;
    const cedula : string = this.FormUsuarios.value.usuCedula ?? '';
    const ultimos = cedula.slice(-DIGITOS_ID_DESDE_CEDULA);
    this.FormUsuarios.patchValue({ usuId: ultimos ? `${Number(ultimos)}` : null });
  }

  /** El administrador escribió o borró el ID: desde ahí la cédula ya no lo rellena. */
  alEscribirId(evento : Event) {
    this.soloDigitos(evento, 'usuId');
    this.idEditadoManualmente = true;
  }

  /** Convierte el nombre a mayúsculas mientras se escribe, sin mover el cursor. */
  nombreEnMayusculas(evento : Event) {
    const input = evento.target as HTMLInputElement;
    const mayusculas = input.value.toUpperCase();
    if (mayusculas !== input.value) {
      const { selectionStart, selectionEnd } = input;
      input.value = mayusculas;
      input.setSelectionRange(selectionStart, selectionEnd);
    }
    this.FormUsuarios.get('usuNombre')?.setValue(mayusculas, { emitModelToViewChange: false });
  }

  /** Texto del error de un campo de dígitos (ID / cédula), o null si está bien. */
  errorNumero(campo : 'usuId' | 'usuCedula') : string | null {
    const control = this.FormUsuarios.get(campo);
    if (!control || !(control.dirty || control.touched)) return null;
    if (control.hasError('numeroMuyGrande')) return `Supera el número máximo que se puede guardar (9.007.199.254.740.991).`;
    if (control.hasError('soloDigitos')) return `Solo se permiten números.`;
    if (control.hasError('mayorQueCero')) return `Debe ser mayor que cero.`;
    return null;
  }

  private crearUsuario() {
    const form = this.FormUsuarios.value;
    const id = Number(form.usuId);
    this.load = false;
    this.consultarUsuario(id).subscribe({
      next: existente => {
        if (existente) {
          this.load = true;
          return this.msj.mensajeAdvertencia(`Advertencia`, `¡El ID ${id} ya pertenece al usuario ${existente.usua_Nombre}!`);
        }
        const data : modelUsuario = {
          Usua_Id: id,
          Usua_Codigo: 0,
          TipoIdentificacion_Id: 'C.C',
          Usua_Nombre: `${form.usuNombre}`.trim().toUpperCase(),
          Area_Id: form.usuArea,
          tpUsu_Id: form.usuTipo,
          RolUsu_Id: form.usuRol,
          Empresa_Id: 800188732,
          Estado_Id: form.usuEstado,
          Usua_Email: '',
          Usua_Telefono: '',
          Usua_Contrasena: form.usuPassword,
          cajComp_Id: 0,
          eps_Id: 0,
          fPen_Id: 0,
          Usua_Fecha: moment().format('YYYY-MM-DD'),
          Usua_Hora: moment().format('H:mm:ss'),
          Usua_Cedula: form.usuCedula ? Number(form.usuCedula) : null,
        }
        this.servicioUsuarios.srvGuardarUsuario(data).subscribe({
          next: () => {
            this.dialogUsuarios = false;
            this.msj.mensajeConfirmacion(`¡Usuario creado!`, `¡Se creó el usuario ${data.Usua_Nombre}!`);
            this.cargarUsuarios();
          },
          error: () => {
            this.load = true;
            this.msj.mensajeError(`¡Ocurrió un error!`, `¡No fue posible crear el usuario!`);
          },
        });
      },
      error: () => {
        this.load = true;
        this.msj.mensajeError(`¡Ocurrió un error!`, `¡No fue posible validar si el usuario ya existe!`);
      },
    });
  }

  /** Actualiza solo los campos del formulario; el resto (fecha de creación, empresa, contacto...) se conserva. */
  private actualizarUsuario() {
    const form = this.FormUsuarios.value;
    this.load = false;
    this.consultarUsuario(Number(form.usuId)).pipe(
      switchMap(actual => {
        if (!actual) throw new Error('No existe');
        return this.servicioUsuarios.srvActualizarUsuario(actual.usua_Id, this.armarUsuario(actual, {
          Usua_Nombre: `${form.usuNombre}`.trim().toUpperCase(),
          tpUsu_Id: form.usuTipo,
          Area_Id: form.usuArea,
          RolUsu_Id: form.usuRol,
          Estado_Id: form.usuEstado,
          Usua_Contrasena: form.usuPassword,
          Usua_Cedula: form.usuCedula ? Number(form.usuCedula) : null,
        }));
      }),
    ).subscribe({
      next: () => {
        this.dialogUsuarios = false;
        this.msj.mensajeConfirmacion(`¡Usuario actualizado!`, `¡Se actualizaron los datos del usuario ${form.usuNombre}!`);
        this.cargarUsuarios();
      },
      error: () => {
        this.load = true;
        this.msj.mensajeError(`¡Ocurrió un error!`, `¡No fue posible actualizar el usuario ${form.usuNombre}!`);
      },
    });
  }

  /** Inactiva uno o varios usuarios, previa confirmación. */
  confirmarInactivar(usuarios : any[]) {
    const activos = usuarios.filter(u => u.Estado != 'INACTIVO');
    if (!activos.length) return this.msj.mensajeAdvertencia(`Advertencia`, `¡Los usuarios seleccionados ya están inactivos!`);
    const texto = activos.length == 1 ? `al usuario <b>${activos[0].Nombre}</b>` : `a <b>${activos.length}</b> usuarios`;
    this.confirmationService.confirm({
      key: 'inactivarUsuarios',
      header: 'Inactivar usuarios',
      message: `¿Seguro que desea inactivar ${texto}? No podrán ingresar a la aplicación hasta que se activen de nuevo.`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      accept: () => this.inactivar(activos),
    });
  }

  private inactivar(usuarios : any[]) {
    const estado = this.estadoInactivo;
    this.load = false;
    const peticiones = usuarios.map(u => this.consultarUsuario(u.Id).pipe(
      switchMap(actual => this.servicioUsuarios.srvActualizarUsuario(actual.usua_Id, this.armarUsuario(actual, { Estado_Id: estado }))),
      map(() => true),
      catchError(() => of(false)),
    ));
    forkJoin(peticiones).subscribe(resultados => {
      const fallidos = resultados.filter(ok => !ok).length;
      const exitosos = resultados.length - fallidos;
      if (exitosos) this.msj.mensajeConfirmacion(`¡Usuarios inactivados!`, `¡Se inactivaron ${exitosos} usuario(s)!`);
      if (fallidos) this.msj.mensajeError(`¡Ocurrió un error!`, `¡No fue posible inactivar ${fallidos} usuario(s)!`);
      this.cargarUsuarios();
    });
  }

  aplicarfiltroGlobal = ($event : Event, tabla : Table | undefined) => tabla?.filterGlobal(($event.target as HTMLInputElement).value, 'contains');

  /** Exporta a Excel los usuarios visibles en la tabla (respeta el filtro). No incluye contraseñas. */
  exportarExcel() {
    const usuarios : any[] = this.dt?.filteredValue ?? this.arrayUsuarios;
    if (!usuarios.length) return this.msj.mensajeAdvertencia(`Advertencia`, `¡No hay usuarios para exportar!`);

    const header = ["ID", "Cédula", "Nombre", "Tipo Usuario", "Área", "Rol", "Estado", "Email", "Teléfono", "Tipo Id", "Empresa", "Caja Compensación", "EPS", "Fondo Pensional", "Fecha Creación", "Hora Creación"];
    const anchos = [12, 14, 40, 25, 20, 25, 10, 30, 14, 8, 20, 20, 20, 20, 15, 15];
    const borde : any = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    const total = header.length;
    const filaEncabezado = 7; // filas 1-3 logo, 4 título, 5 subtítulo, 6 separación

    const workbook = new Workbook();
    const ws = workbook.addWorksheet(`Listado de Usuarios`, { views: [{ state: 'frozen', ySplit: filaEncabezado }] });
    anchos.forEach((ancho, i) => ws.getColumn(i + 1).width = ancho);

    // Logo en las filas 1-3 conservando su proporción (mismo formato que el inventario de materia prima)
    const idLogo = workbook.addImage({ base64: logoParaPdf, extension: 'png' });
    const altoLogo = 55;
    ws.addImage(idLogo, { tl: { col: 0, row: 0 }, ext: { width: Math.round(altoLogo * proporcionLogo()), height: altoLogo } });

    ws.mergeCells(4, 1, 4, total);
    ws.getRow(4).height = 24;
    ws.getCell(4, 1).value = `Listado de Usuarios - Plasticaribe SAS`;
    ws.getCell(4, 1).font = { name: 'Calibri', family: 4, size: 16, underline: 'double', bold: true };
    ws.getCell(4, 1).alignment = { vertical: 'middle', horizontal: 'left' };
    ws.mergeCells(5, 1, 5, total);
    const filtrado = usuarios.length != this.arrayUsuarios.length ? `${usuarios.length} de ${this.arrayUsuarios.length} usuarios (filtrado)` : `${usuarios.length} usuarios`;
    ws.getCell(5, 1).value = `${filtrado}  ·  Generado: ${moment().format('YYYY-MM-DD H:mm')}`;
    ws.getCell(5, 1).font = { name: 'Calibri', size: 10, italic: true };
    ws.getCell(5, 1).alignment = { horizontal: 'left' };

    const encabezado = ws.getRow(filaEncabezado);
    header.forEach((titulo, i) => {
      const celda = encabezado.getCell(i + 1);
      celda.value = titulo;
      celda.font = { bold: true };
      celda.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      celda.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'EEEEEE' } };
      celda.border = borde;
    });

    usuarios.forEach((u, f) => {
      const fila = ws.getRow(filaEncabezado + 1 + f);
      [u.Id, u.Cedula, u.Nombre, u.Tipo, u.Area, u.Rol, u.Estado, u.Email, u.Telefono, u.TipoId, u.Empresa, u.Caja, u.EPS, u.FondoP, u.Fecha, u.Hora]
        .forEach((valor, i) => {
          const celda = fila.getCell(i + 1);
          celda.value = valor ?? '';
          celda.border = borde;
        });
    });

    this.load = false;
    workbook.xlsx.writeBuffer().then(data => {
      fs.saveAs(new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), `Listado de usuarios.xlsx`);
      this.msj.mensajeConfirmacion(`¡Exportación a Excel!`, `¡Se exportaron ${usuarios.length} usuarios!`);
    }).catch(() => this.msj.mensajeError(`¡Ocurrió un error!`, `¡No fue posible generar el archivo de Excel!`))
      .finally(() => this.load = true);
  }

  /* ============================== Roles ============================== */

  /** Si el nombre escrito ya pertenece a otro rol. */
  get rolDuplicado() : boolean {
    const nombre = this.formRoles?.value?.rolNombre;
    return !!nombre && this.arrayRoles.some(r => mismoNombre(r.rolUsu_Nombre, nombre) && r.rolUsu_Id != this.rolEditar?.rolUsu_Id);
  }

  abrirCrearRol() {
    this.editarRol = false;
    this.rolEditar = null;
    this.formRoles.reset({ rolNombre: null, rolDescripcion: null, Vistas: [] });
    this.modalRol = true;
  }

  abrirEditarRol(rol : any) {
    this.editarRol = true;
    this.rolEditar = rol;
    this.formRoles.reset({ rolNombre: rol.rolUsu_Nombre, rolDescripcion: rol.rolUsu_Descripcion, Vistas: [] });
    this.load = false;
    this.vistasDelRol(rol.rolUsu_Id).pipe(finalize(() => this.load = true)).subscribe(ids => {
      // Se usan los mismos objetos del treeSelect para que aparezcan marcados
      this.formRoles.patchValue({ Vistas: this.vistasAplicacion.filter(v => ids.includes(v.key)) });
      this.modalRol = true;
    });
  }

  guardarRol() {
    if (this.formRoles.invalid || !this.formRoles.value.Vistas?.length) {
      this.marcarCampos(this.formRoles);
      return this.msj.mensajeAdvertencia(`Advertencia`, `¡Debe diligenciar el nombre, la descripción y al menos una vista!`);
    }
    if (this.rolDuplicado) return this.msj.mensajeAdvertencia(`Advertencia`, `¡Ya existe un rol con el nombre ${this.formRoles.value.rolNombre}!`);
    if (this.editarRol) this.actualizarRol();
    else this.crearRol();
  }

  /** Crea el rol, su tipo de usuario con el mismo nombre (regla de negocio) y le asigna las vistas. */
  private crearRol() {
    const nombre = `${this.formRoles.value.rolNombre}`.trim();
    const descripcion = `${this.formRoles.value.rolDescripcion}`.trim();
    const vistas : number[] = this.formRoles.value.Vistas.map(v => v.key);
    const rol : modelRol = { RolUsu_Id: 0, RolUsu_Nombre: nombre, RolUsu_Descripcion: descripcion };
    const tipo : modelTipoUsuario = { tpUsu_Id: 0, tpUsu_Nombre: nombre, tpUsu_Descripcion: descripcion };

    this.load = false;
    this.servicioRoles.srvGuardar(rol).subscribe({
      next: rolCreado => {
        forkJoin([
          this.servicioTpUsuarios.Insert(tipo).pipe(map(() => true), catchError(() => of(false))),
          this.actualizarPermisos(rolCreado.rolUsu_Id, vistas, []),
        ]).pipe(finalize(() => this.load = true)).subscribe(([tipoOk, vistasFallidas]) => {
          this.modalRol = false;
          if (tipoOk && !vistasFallidas) this.msj.mensajeConfirmacion(`¡Rol creado!`, `¡Se creó el rol ${nombre} con su tipo de usuario y ${vistas.length} vista(s)!`);
          else {
            if (!tipoOk) this.msj.mensajeError(`¡Atención!`, `¡El rol ${nombre} se creó, pero no fue posible crear su tipo de usuario!`, 6000);
            if (vistasFallidas) this.msj.mensajeError(`¡Atención!`, `¡El rol ${nombre} se creó, pero no se pudieron asignar ${vistasFallidas} vista(s)! Edítelo para corregirlo.`, 6000);
          }
          this.cargarRoles();
          this.cargarTiposUsuarios();
        });
      },
      error: () => {
        this.load = true;
        this.msj.mensajeError(`¡Ocurrió un error!`, `¡No fue posible crear el rol!`);
      },
    });
  }

  /** Actualiza nombre, descripción y vistas del rol; si cambia el nombre/descripción también se actualiza su tipo de usuario. */
  private actualizarRol() {
    const original = this.rolEditar;
    const nombre = `${this.formRoles.value.rolNombre}`.trim();
    const descripcion = `${this.formRoles.value.rolDescripcion}`.trim();
    const vistas : number[] = this.formRoles.value.Vistas.map(v => v.key);
    const rol : modelRol = { RolUsu_Id: original.rolUsu_Id, RolUsu_Nombre: nombre, RolUsu_Descripcion: descripcion };
    const tipo = this.arrayTiposUsuarios.find(t => mismoNombre(t.tpUsu_Nombre, original.rolUsu_Nombre));
    const cambioDatos = nombre != original.rolUsu_Nombre || descripcion != (original.rolUsu_Descripcion ?? '');

    this.load = false;
    this.servicioRoles.srvActualizar(original.rolUsu_Id, rol).pipe(
      switchMap(() => forkJoin([
        tipo && cambioDatos
          ? this.servicioTpUsuarios.Update(tipo.tpUsu_Id, { tpUsu_Id: tipo.tpUsu_Id, tpUsu_Nombre: nombre, tpUsu_Descripcion: descripcion }).pipe(map(() => true), catchError(() => of(false)))
          : of(true),
        this.vistasDelRol(original.rolUsu_Id).pipe(switchMap(actuales => this.actualizarPermisos(original.rolUsu_Id, vistas.filter(id => !actuales.includes(id)), actuales.filter(id => !vistas.includes(id))))),
      ])),
      finalize(() => this.load = true),
    ).subscribe({
      next: ([tipoOk, vistasFallidas]) => {
        this.modalRol = false;
        if (tipoOk && !vistasFallidas) this.msj.mensajeConfirmacion(`¡Rol actualizado!`, `¡Se actualizó el rol ${nombre}!`);
        if (!tipoOk) this.msj.mensajeError(`¡Atención!`, `¡El rol se actualizó, pero no fue posible actualizar su tipo de usuario!`, 6000);
        if (vistasFallidas) this.msj.mensajeError(`¡Atención!`, `¡No se pudieron actualizar ${vistasFallidas} vista(s) del rol!`, 6000);
        this.cargarRoles();
        this.cargarTiposUsuarios();
        if (cambioDatos) this.cargarUsuarios();
      },
      error: () => this.msj.mensajeError(`¡Ocurrió un error!`, `¡No fue posible actualizar el rol ${original.rolUsu_Nombre}!`),
    });
  }

  /** Ids de las vistas a las que tiene acceso el rol (el API responde 404 cuando no tiene ninguna). */
  private vistasDelRol = (rol : number) : Observable<number[]> => this.vistasPermisosService.Get_By_Rol(rol).pipe(
    map((data : any[]) => (data ?? []).map(v => v.id)),
    catchError(() => of([])),
  );

  /**
   * Agrega o quita el rol en la lista `|1|5|12|` de cada vista.
   * Se compara por elemento exacto, para que quitar el rol 5 no afecte al 15 ni al 25.
   * @returns cantidad de vistas que no se pudieron actualizar.
   */
  private actualizarPermisos(rol : number, agregar : number[], quitar : number[]) : Observable<number> {
    const idRol = `${rol}`;
    const cambiar = (idVista : number, conRol : boolean) => this.vistasPermisosService.Get_By_Id(idVista).pipe(
      switchMap(vista => {
        const roles = `${vista.vp_Id_Roles ?? ''}`.split('|').filter(r => r !== '');
        const tiene = roles.includes(idRol);
        if (tiene == conRol) return of(true);
        const nuevos = conRol ? [...roles, idRol] : roles.filter(r => r !== idRol);
        const info : modelVistasPermisos = {
          Vp_Id: vista.vp_Id,
          Vp_Nombre: vista.vp_Nombre,
          Vp_Icono_Dock: vista.vp_Icono_Dock,
          Vp_Icono_Menu: vista.vp_Icono_Menu,
          Vp_Ruta: vista.vp_Ruta,
          Vp_Categoria: vista.vp_Categoria,
          Vp_Id_Roles: `|${nuevos.join('|')}${nuevos.length ? '|' : ''}`,
          Vp_Estado: vista.vp_Estado,
        };
        return this.vistasPermisosService.Put(vista.vp_Id, info).pipe(map(() => true));
      }),
      catchError(() => of(false)),
    );
    const peticiones = [...agregar.map(id => cambiar(id, true)), ...quitar.map(id => cambiar(id, false))];
    if (!peticiones.length) return of(0);
    return forkJoin(peticiones).pipe(map(resultados => resultados.filter(ok => !ok).length));
  }

  /* ============================== Áreas ============================== */

  /** Si el nombre escrito ya pertenece a otra área. */
  get areaDuplicada() : boolean {
    const nombre = this.formAreas?.value?.areaNombre;
    return !!nombre && this.arrayAreas.some(a => mismoNombre(a.area_Nombre, nombre) && a.area_Id != this.areaEditar?.area_Id);
  }

  abrirCrearArea() {
    this.areaEditar = null;
    this.formAreas.reset();
    this.modalArea = true;
  }

  abrirEditarArea(area : any) {
    this.areaEditar = area;
    this.formAreas.reset({ areaNombre: area.area_Nombre, areaDescripcion: area.area_Descripcion });
    this.modalArea = true;
  }

  guardarArea() {
    if (this.formAreas.invalid) {
      this.marcarCampos(this.formAreas);
      return this.msj.mensajeAdvertencia(`Advertencia`, `¡Debe diligenciar el nombre del área!`);
    }
    if (this.areaDuplicada) return this.msj.mensajeAdvertencia(`Advertencia`, `¡Ya existe un área con el nombre ${this.formAreas.value.areaNombre}!`);

    const editando = !!this.areaEditar;
    const area : modelAreas = {
      area_Id: editando ? this.areaEditar.area_Id : 0,
      area_Nombre: `${this.formAreas.value.areaNombre}`.trim(),
      area_Descripcion: this.formAreas.value.areaDescripcion ? `${this.formAreas.value.areaDescripcion}`.trim() : null,
    };
    const peticion = editando ? this.servicioAreas.srvActualizar(area.area_Id, area) : this.servicioAreas.srvGuardar(area);

    this.load = false;
    peticion.pipe(finalize(() => this.load = true)).subscribe({
      next: () => {
        this.modalArea = false;
        this.msj.mensajeConfirmacion(editando ? `¡Área actualizada!` : `¡Área creada!`, `¡Se ${editando ? 'actualizó' : 'creó'} el área ${area.area_Nombre}!`);
        this.cargarAreas();
        if (editando) this.cargarUsuarios();
      },
      error: () => this.msj.mensajeError(`¡Ocurrió un error!`, `¡No fue posible ${editando ? 'actualizar' : 'crear'} el área!`),
    });
  }

  /* ============================== Tutorial ============================== */

  tutorial = () => this.tutoriales.iniciar(this.pasosTutorial());

  private pasosTutorial = () => pasosTutorialUsuarios({ irPestana: indice => this.pestanaActiva = indice });
}
