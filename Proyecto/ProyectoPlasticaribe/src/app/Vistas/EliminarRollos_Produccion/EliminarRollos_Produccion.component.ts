import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { Table } from 'primeng/table';
import { Observable, Subscription, catchError, finalize, forkJoin, map, merge, of, switchMap } from 'rxjs';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { FallasTecnicasService } from 'src/app/Servicios/FallasTecnicas/FallasTecnicas.service';
import { DetalleError, ListadoDetalleError, MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { ProcesosService } from 'src/app/Servicios/Procesos/procesos.service';
import { Produccion_ProcesosService } from 'src/app/Servicios/Produccion_Procesos/Produccion_Procesos.service';
import { UsuarioService } from 'src/app/Servicios/Usuarios/usuario.service';
import { AppComponent } from 'src/app/app.component';
import { alCambiarTema } from 'src/app/Servicios/Tema/Tema.service';
import { TutorialesService } from 'src/app/Servicios/Tutoriales/Tutoriales.service';
import { ClaveTutorialEliminarRollos, pasosTutorialEliminarRollos } from 'src/app/Tutoriales/Tutoriales_EliminarRollos';

/*
  Usuarios autorizadores
  100       -> Fernando Lopez
  110       -> Fernando Andres Lopez Garcia
  117       -> Jefe Despacho
  3139      -> Jefe Sellado
  123456789 -> Sistemas
  115       -> Supervisor Sellado
  113       -> Jefe Impresion
  3142      -> Cesar Cortes
  3123      -> Salva
  101       -> Raul
  7676      -> Leydis Ripoll
  3130      -> Jefe Rotograbado
  114       -> Jefe Extrusion
  59137     -> Eliseo Bustos
*/
const USUARIOS_AUTORIZADORES = [100, 110, 117, 3139, 123456789, 115, 113, 3142, 3123, 101, 7676, 3130, 114, 59137];
const PROCESOS_PRODUCCION = [8, 4, 3, 7, 2, 1, 9, 5, 6, 18];
const TIPO_FALLA_ELIMINACION = 12;
/** Rollos eliminados cuya marca en BagPro falló; se guardan por usuario para poder reintentar aunque se recargue la página. */
const CLAVE_PENDIENTES_BAGPRO = 'eliminar-rollos-bagpro-pendientes';

@Component({
  selector: 'app-EliminarRollos_Produccion',
  templateUrl: './EliminarRollos_Produccion.component.html',
  styleUrls: ['./EliminarRollos_Produccion.component.css']
})
export class EliminarRollos_ProduccionComponent implements OnInit, OnDestroy {
  load : boolean = false; //Variable para validar que salga o no la imagen de carga
  today : string = moment().format('YYYY-MM-DD'); //Fecha actual
  filters !: FormGroup; //Filtros de la consulta de rollos
  authorization !: FormGroup; //Quién autoriza, motivo y observación: solo se piden para eliminar
  selectedMode : boolean = false; //Modo oscuro/claro
  private readonly suscripcionTema = alCambiarTema(oscuro => this.selectedMode = oscuro); // mantiene selectedMode al día con el tema
  private subscriptions = new Subscription();

  process : any[] = []; //Procesos de producción
  fails : any[] = []; //Motivos de eliminación
  users : any[] = []; //Usuarios que pueden autorizar

  rolls : rollRow[] = []; //Rollos disponibles consultados
  rollsInsert : rollRow[] = []; //Rollos a eliminar
  rollsTableSelection : rollRow[] = [];
  rollsInsertTableSelection : rollRow[] = [];
  rollsTotals : unitTotal[] = []; //Totales de los rollos disponibles por unidad
  rollsInsertTotals : unitTotal[] = []; //Totales de los rollos a eliminar por unidad
  consolidatedInfo : consolidatedRow[] = []; //Consolidado por OT, ítem y unidad
  searchRolls1 : string = ''; //Texto del buscador de la tabla de disponibles
  searchRolls2 : string = ''; //Texto del buscador de la tabla de rollos a eliminar

  tabEliminar : number = 0; //Pestaña activa de "Rollos a Eliminar": 0 = Rollos, 1 = Consolidado
  readonly maxObservacion : number = 500; //Rollos_Desechos.Rollo_Observacion es varchar(max): límite de uso, no de la base de datos
  confirmVisible : boolean = false; //Ventana de confirmación con el resumen
  confirmSummary : confirmSummary | null = null;
  pendingBagPro : pendingBagProRoll[] = []; //Rollos eliminados que quedaron sin marca en BagPro

  modalFails : boolean = false;
  storage_Id: any;
  storage_Name: any;
  validateRole: any;

  @ViewChild('dt1') dt1: Table | undefined;
  @ViewChild('dt2') dt2: Table | undefined;
  @ViewChild('authorizationElement') authorizationElement: ElementRef<HTMLElement> | undefined;

  /** Campos en los que busca el buscador de cada tabla (los mismos textos que se ven). */
  readonly searchFields = ['numeroRollo_BagPro', 'ot', 'prod_Id', 'prod_Nombre', 'cantidadMostrar', 'unidad', 'fechaTexto', 'proceso_Nombre'];

  constructor(private AppComponent : AppComponent,
    private frmBld : FormBuilder,
    private svcMsjs : MensajesAplicacionService,
    private svcProdProcess : Produccion_ProcesosService,
    private svcProcess : ProcesosService,
    private failsService : FallasTecnicasService,
    private svBagPro : BagproService,
    private svUsers : UsuarioService,
    private tutoriales : TutorialesService,
  ) {
    this.initForms();
  }

  ngOnInit() {
    this.readStorage();
    this.loadPendingBagPro();
    this.loadRankDates();
    this.loadCatalogs(true);
  }

  //Cierra el tutorial si el usuario sale de la página con él abierto.
  ngOnDestroy() {
    this.tutoriales.cancelar();
    this.subscriptions.unsubscribe();
  }

  //Muestra el tutorial de la página (botón "i" junto al título).
  tutorial = () => this.tutoriales.iniciar(this.pasosTutorial());

  private pasosTutorial = () => pasosTutorialEliminarRollos({
    irPestana: indice => this.tabEliminar = indice,
    hayPendientesBagPro: this.pendingBagPro.length > 0,
  });

  //Leer storage del navegador.
  readStorage() {
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Name = this.AppComponent.storage_Nombre;
    this.validateRole = this.AppComponent.storage_Rol;
  }

  //Inicializa los dos formularios. Con OT o N° de rollo se busca en todas las fechas, por eso el rango se deshabilita.
  initForms(){
    this.filters = this.frmBld.group({
      RangoFechas : [null],
      Bodega : [null],
      OT : [null],
      Rollo : [null],
    });
    this.authorization = this.frmBld.group({
      user : [null, Validators.required],
      Falla : [null, Validators.required],
      Observacion : [null, [Validators.required, Validators.pattern(/\S/), Validators.maxLength(this.maxObservacion)]],
    });

    const ot = this.filters.get('OT')!, roll = this.filters.get('Rollo')!, dates = this.filters.get('RangoFechas')!;
    this.subscriptions.add(merge(ot.valueChanges, roll.valueChanges).subscribe(() => {
      if (this.searchByIdentifier) dates.disable({ emitEvent: false });
      else dates.enable({ emitEvent: false });
    }));
  }

  /** Hay OT o N° de rollo: la consulta no se limita por fechas. */
  get searchByIdentifier() : boolean {
    const { OT, Rollo } = this.filters.getRawValue();
    return OT != null || Rollo != null;
  }

  //Carga en paralelo los procesos, los motivos y los usuarios autorizadores.
  //Con iniciarTutorial, al terminar muestra el tutorial si es la primera vez que el usuario entra.
  loadCatalogs(iniciarTutorial : boolean = false) {
    this.load = true;
    forkJoin({
      process: this.catalog(this.svcProcess.srvObtenerLista(), 'los procesos', 'Consultar procesos'),
      fails: this.catalog(this.failsService.getFallasPorTipo(TIPO_FALLA_ELIMINACION), 'los motivos de eliminación', 'Consultar motivos de eliminación'),
      users: this.catalog(this.svUsers.getUsuariosPorIds(USUARIOS_AUTORIZADORES), 'los usuarios que autorizan', 'Consultar usuarios autorizadores'),
    }).pipe(finalize(() => this.load = false)).subscribe(({ process, fails, users }) => {
      this.process = process.filter(x => PROCESOS_PRODUCCION.includes(x.proceso_Codigo));
      this.fails = fails;
      this.users = users;
      if (iniciarTutorial) this.tutoriales.iniciarPrimeraVez(ClaveTutorialEliminarRollos, this.storage_Id, () => this.pasosTutorial());
    });
  }

  //Un catálogo que falla avisa con "Ver detalles" y deja la lista vacía sin detener los demás.
  private catalog(request : Observable<any>, name : string, operacion : string) : Observable<any[]> {
    return request.pipe(catchError(error => {
      this.svcMsjs.errorDetallado(error, `No se pudieron consultar ${name}.`, { operacion, metodo: 'GET' });
      return of([]);
    }));
  }

  //Función para obtener los motivos de eliminación.
  getFails = () => this.failsService.getFallasPorTipo(TIPO_FALLA_ELIMINACION).subscribe({
    next: data => this.fails = data,
    error: error => this.svcMsjs.errorDetallado(error, 'No se pudieron consultar los motivos de eliminación.', { operacion: 'Consultar motivos de eliminación', metodo: 'GET' }),
  });

  //Falla creada desde el modal: lo cierra, recarga los motivos y deja seleccionada la nueva.
  failCreated(fail : any) {
    this.modalFails = false;
    this.getFails();
    if (fail?.falla_Id) this.authorization.patchValue({ Falla: fail.falla_Id });
  }

  //Función para cargar fechas en el rango (últimos 30 días).
  loadRankDates(){
    let initialDate = new Date(moment().subtract(30, 'days').format('YYYY-MM-DD'));
    this.filters.patchValue({ 'RangoFechas' : [initialDate, new Date()] });
  }

  //Busca los rollos disponibles. Con OT o N° de rollo busca en todas las fechas; sin ellos el rango de fechas es obligatorio.
  searchRolls(){
    if (this.load) return;
    const { RangoFechas, Bodega, OT, Rollo } = this.filters.getRawValue();
    const byIdentifier = this.searchByIdentifier;
    const [start, end] = RangoFechas ?? [];

    if (!byIdentifier && !start) {
      this.svcMsjs.mensajeAdvertencia(`Advertencia`, `Indique un rango de fechas, una OT o un N° de rollo para consultar.`);
      return;
    }

    this.load = true;
    this.svcProdProcess.getInfoProductionToDelete({
      date1: byIdentifier ? null : moment(start).format('YYYY-MM-DD'),
      date2: byIdentifier ? null : moment(end ?? start).format('YYYY-MM-DD'),
      ot: OT,
      process: Bodega,
      roll: Rollo,
    }).pipe(finalize(() => this.load = false)).subscribe({
      next: data => {
        this.loadTable(data);
        if (data.length == 0) this.svcMsjs.mensajeAdvertencia(`Sin rollos`, byIdentifier
          ? `No hay rollos disponibles con esa OT / N° de rollo. Puede que ya estén despachados, enviados a Zeus o eliminados.`
          : `No se encontraron rollos disponibles con los filtros indicados.`, 6000);
        else if (this.rolls.length == 0) this.svcMsjs.mensajeInformacion(`Sin rollos nuevos`, `Los rollos encontrados ya están en la tabla de rollos a eliminar.`, 5000);
      },
      error: (error : HttpErrorResponse) => this.svcMsjs.errorDetallado(error, `No fue posible consultar los rollos.`, { operacion: 'Consultar rollos a eliminar', metodo: 'GET' }),
    });
  }

  //Reemplaza la tabla de disponibles con el resultado de la búsqueda, sin los rollos que ya están en la tabla de rollos a eliminar.
  loadTable(data : any[]){
    const selected = new Set(this.rollsInsert.map(x => x.key));
    this.rolls = data
      .map(x => ({ ...x, key: rollKey(x), fechaTexto: moment(x.fecha).format('DD/MM/YYYY') }) as rollRow)
      .filter(x => !selected.has(x.key));
    this.afterMove();
  }

  //Pasa a la tabla de rollos a eliminar los rollos marcados en la tabla de disponibles.
  addSelected = () => this.moveToDelete(this.rollsTableSelection);

  //Pasa a la tabla de rollos a eliminar todos los disponibles que se ven con el buscador actual.
  addAllVisible = () => this.moveToDelete(this.visibleRows(this.dt1, this.rolls));

  //Pasa un rollo a la tabla de rollos a eliminar.
  addRoll = (roll : rollRow) => this.moveToDelete([roll]);

  //Devuelve a la tabla de disponibles los rollos marcados en la tabla de rollos a eliminar.
  removeSelected = () => this.moveToAvailable(this.rollsInsertTableSelection);

  //Devuelve a la tabla de disponibles todos los rollos a eliminar que se ven con el buscador actual.
  removeAllVisible = () => this.moveToAvailable(this.visibleRows(this.dt2, this.rollsInsert));

  //Devuelve un rollo a la tabla de disponibles.
  removeRoll = (roll : rollRow) => this.moveToAvailable([roll]);

  //Filas que se ven en una tabla: las filtradas por el buscador, o todas si no se ha buscado nada.
  private visibleRows = (table : Table | undefined, all : rollRow[]) : rollRow[] => (table?.filteredValue as rollRow[]) ?? all;

  private moveToDelete(rolls : rollRow[]) {
    if (rolls.length == 0) return;
    const keys = new Set(rolls.map(x => x.key));
    const already = new Set(this.rollsInsert.map(x => x.key));
    this.rollsInsert = [...this.rollsInsert, ...rolls.filter(x => !already.has(x.key))];
    this.rolls = this.rolls.filter(x => !keys.has(x.key));
    this.afterMove();
  }

  private moveToAvailable(rolls : rollRow[]) {
    if (rolls.length == 0) return;
    const keys = new Set(rolls.map(x => x.key));
    const already = new Set(this.rolls.map(x => x.key));
    this.rolls = [...this.rolls, ...rolls.filter(x => !already.has(x.key))];
    this.rollsInsert = this.rollsInsert.filter(x => !keys.has(x.key));
    this.afterMove();
  }

  //Limpia las selecciones y recalcula totales y consolidado (una sola vez por cambio, no en cada ciclo de la vista).
  private afterMove() {
    this.rollsTableSelection = [];
    this.rollsInsertTableSelection = [];
    this.rollsTotals = totalsByUnit(this.rolls);
    this.rollsInsertTotals = totalsByUnit(this.rollsInsert);
    this.getInfoConsolidated();
  }

  //Formato del número según la unidad: kilos con 2 decimales, unidades y paquetes sin decimales.
  numberFormat = (unit : string) : string => unit == 'Kg' ? '1.2-2' : '1.0-0';

  //Consolidado por OT, ítem y unidad con su cantidad y número de rollos.
  getInfoConsolidated(){
    const groups = new Map<string, consolidatedRow>();
    for (const roll of this.rollsInsert) {
      const key = `${roll.ot}|${roll.prod_Id}|${roll.unidad}`;
      const group = groups.get(key);
      if (group) {
        group.quantity += roll.cantidadMostrar;
        group.rolls++;
      } else {
        groups.set(key, { key, ot: roll.ot, prod_Id: roll.prod_Id, prod_Nombre: roll.prod_Nombre, unit: roll.unidad, quantity: roll.cantidadMostrar, rolls: 1 });
      }
    }
    this.consolidatedInfo = [...groups.values()];
  }

  //Valida la autorización y abre la ventana de confirmación con el resumen de lo que se va a eliminar.
  requestDelete() {
    if (this.load || this.rollsInsert.length == 0) return;
    if (this.authorization.invalid) {
      this.authorization.markAllAsTouched();
      Object.values(this.authorization.controls).forEach(control => control.markAsDirty());
      this.authorizationElement?.nativeElement.querySelector<HTMLElement>('.ng-invalid')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      this.svcMsjs.mensajeAdvertencia(`Advertencia`, `Debe indicar quién autoriza, el motivo y la observación.`);
      return;
    }

    const { user, Falla, Observacion } = this.authorization.value;
    this.confirmSummary = {
      rolls: this.rollsInsert.length,
      ots: new Set(this.rollsInsert.map(x => x.ot)).size,
      totals: this.rollsInsertTotals,
      authorizes: this.users.find(x => x.usua_Id == user)?.usua_Nombre ?? user,
      fail: this.fails.find(x => x.falla_Id == Falla)?.falla_Nombre ?? Falla,
      observation: Observacion.trim(),
    };
    this.confirmVisible = true;
  }

  //Elimina los rollos (una sola petición transaccional) y luego marca los eliminados en BagPro.
  deleteRolls(){
    if (this.load || this.authorization.invalid || this.rollsInsert.length == 0) return;
    this.confirmVisible = false;

    this.load = true;
    const request = {
      rolls: this.rollsInsert.map(x => ({ roll: x.numeroRollo_BagPro, process: x.proceso_Id })),
      fail: this.authorization.value.Falla,
      observation: this.authorization.value.Observacion.trim(),
      userAuthorize: this.authorization.value.user,
      userDelete: this.storage_Id,
    };

    this.svcProdProcess.putDeleteRolls(request).pipe(
      switchMap(result => this.svBagPro.putObservationDeletedRolls2(result.deleted).pipe(
        map(bagPro => ({ deleted: result.deleted, notFound: bagPro.notFound, bagProError: null as any })),
        catchError(bagProError => of({ deleted: result.deleted, notFound: [] as number[], bagProError })),
      )),
      finalize(() => this.load = false),
    ).subscribe({
      next: ({ deleted, notFound, bagProError }) => {
        if (bagProError) {
          this.addPendingBagPro(deleted);
          this.svcMsjs.mensajeErrorDetallado(
            `Se eliminaron ${deleted.length} rollo(s), pero no se pudieron marcar en BagPro. Use "Reintentar BagPro".`,
            this.errorDetail(bagProError, 'BagPro', 'Marcar rollos eliminados en BagPro', 'POST',
              this.rollsListing('Rollos eliminados sin marca en BagPro', deleted)),
            20000);
        } else if (notFound.length > 0) {
          this.svcMsjs.mensajeErrorDetallado(
            `Se eliminaron ${deleted.length} rollo(s), pero ${notFound.length} no se encontraron en BagPro.`,
            this.notFoundDetail('Marcar rollos eliminados en BagPro', deleted.filter(x => notFound.includes(x.roll))),
            20000);
        } else {
          this.svcMsjs.mensajeConfirmacion(`OK!`, `${deleted.length} rollo(s) eliminado(s) con éxito!`);
        }
        this.afterDelete();
      },
      error: (error : HttpErrorResponse) => this.handleDeleteError(error, request.rolls),
    });
  }

  //Tras eliminar: vacía la tabla de rollos a eliminar y la autorización (cada solicitud tiene su propio motivo y autorizador).
  //Los filtros y la tabla de disponibles se conservan para seguir trabajando con la misma consulta.
  private afterDelete() {
    this.rollsInsert = [];
    this.searchRolls2 = '';
    this.dt2?.reset();
    this.authorization.reset();
    this.confirmSummary = null;
    this.afterMove();
  }

  //Muestra el error con "Ver detalles" y la lista de rollos que no se eliminaron con su OT.
  //Si algunos rollos ya no están disponibles (409), además los quita de la tabla de rollos a eliminar para poder reintentar.
  private handleDeleteError(error : HttpErrorResponse, requested : rollsToDelete[]) {
    const notAvailable : rollsToDelete[] = error.status == 409 ? (error.error?.notAvailable ?? []) : [];
    const listing = this.rollsListing('Rollos que no se pudieron eliminar', notAvailable.length > 0 ? notAvailable : requested);
    const detail = this.errorDetail(error, 'Plasticaribe', 'Eliminar rollos', 'PUT', listing);

    if (error.status == 409 && notAvailable.length > 0) {
      const keys = new Set(notAvailable.map(x => rollKey({ numeroRollo_BagPro: x.roll, proceso_Id: x.process })));
      this.rollsInsert = this.rollsInsert.filter(x => !keys.has(x.key));
      this.afterMove();
      detail.listado!.titulo = 'Rollos no disponibles (se quitaron de la tabla)';
      this.svcMsjs.mensajeErrorDetallado(`${notAvailable.length} rollo(s) ya no están disponibles. No se eliminó ningún rollo, intente de nuevo.`, detail, 20000);
    } else {
      this.svcMsjs.mensajeErrorDetallado(MensajesAplicacionService.mensajeAmigable(error, `No fue posible eliminar los rollos. No se eliminó ninguno.`, 'Plasticaribe'), detail, 20000);
    }
  }

  //Vuelve a marcar en BagPro solo los rollos que quedaron pendientes. Es seguro repetirlo: solo vuelve a escribir el mismo texto.
  retryBagPro() {
    if (this.load || this.pendingBagPro.length == 0) return;
    const pending = [...this.pendingBagPro];

    this.load = true;
    this.svBagPro.putObservationDeletedRolls2(pending.map(x => ({ roll: x.roll, process: x.process })))
      .pipe(finalize(() => this.load = false))
      .subscribe({
        next: result => {
          //Los no encontrados en BagPro no se arreglan reintentando: se informan y salen de la lista.
          this.savePendingBagPro([]);
          const updated = result.updatedExtrusion + result.updatedSellado;
          if (result.notFound.length > 0) {
            this.svcMsjs.mensajeErrorDetallado(
              `Se marcaron ${updated} rollo(s) en BagPro; ${result.notFound.length} no se encontraron.`,
              this.notFoundDetail('Reintentar marca de rollos eliminados en BagPro', pending.filter(x => result.notFound.includes(x.roll))),
              20000);
          } else {
            this.svcMsjs.mensajeConfirmacion(`OK!`, `Se marcaron ${updated} rollo(s) eliminado(s) en BagPro.`, 6000);
          }
        },
        error: error => this.svcMsjs.mensajeErrorDetallado(
          MensajesAplicacionService.mensajeAmigable(error, `No fue posible marcar los rollos en BagPro. Siguen pendientes.`, 'BagPro'),
          this.errorDetail(error, 'BagPro', 'Reintentar marca de rollos eliminados en BagPro', 'POST',
            this.rollsListing('Rollos pendientes de marca en BagPro', pending)),
          20000),
      });
  }

  //Agrega a los pendientes de BagPro los rollos eliminados (con su OT, que se toma de la tabla antes de vaciarla).
  private addPendingBagPro(deleted : rollsToDelete[]) {
    const byKey = new Map(this.rollsInsert.map(x => [x.key, x]));
    const current = new Set(this.pendingBagPro.map(x => rollKey({ numeroRollo_BagPro: x.roll, proceso_Id: x.process })));
    const added = deleted
      .filter(x => !current.has(rollKey({ numeroRollo_BagPro: x.roll, proceso_Id: x.process })))
      .map(x => {
        const row = byKey.get(rollKey({ numeroRollo_BagPro: x.roll, proceso_Id: x.process }));
        return { roll: x.roll, process: x.process, ot: row?.ot, processName: row?.proceso_Nombre };
      });
    this.savePendingBagPro([...this.pendingBagPro, ...added]);
  }

  private get pendingKey() : string {
    return `${CLAVE_PENDIENTES_BAGPRO}-${this.storage_Id}`;
  }

  //Lee los pendientes de BagPro guardados en el navegador (si el almacenamiento no está disponible, empieza vacío).
  private loadPendingBagPro() {
    try {
      const saved = JSON.parse(localStorage.getItem(this.pendingKey) ?? '[]');
      this.pendingBagPro = Array.isArray(saved) ? saved : [];
    } catch {
      this.pendingBagPro = [];
    }
  }

  private savePendingBagPro(pending : pendingBagProRoll[]) {
    this.pendingBagPro = pending;
    try {
      if (pending.length > 0) localStorage.setItem(this.pendingKey, JSON.stringify(pending));
      else localStorage.removeItem(this.pendingKey);
    } catch { }
  }

  //Arma el detalle técnico del error para la ventana "Ver detalles".
  private errorDetail(error : any, api : string, operacion : string, metodo : string, listado : ListadoDetalleError) : DetalleError {
    return { ...MensajesAplicacionService.detalleDeError(error, { api, operacion, metodo }), listado };
  }

  //Detalle para los rollos que BagPro no encontró (no es un error HTTP, sino rollos que no existen allá).
  private notFoundDetail(operacion : string, rolls : rollReference[]) : DetalleError {
    return {
      api: 'BagPro', operacion, statusText: 'Rollos no encontrados en BagPro',
      conInternet: navigator.onLine, fecha: moment().format('YYYY-MM-DD HH:mm:ss'),
      listado: this.rollsListing('Rollos no encontrados en BagPro', rolls),
    };
  }

  //Tabla de rollos (N° rollo, OT, proceso) para la ventana "Ver detalles". Toma la OT de la tabla de rollos a eliminar si no viene.
  private rollsListing(titulo : string, rolls : rollReference[]) : ListadoDetalleError {
    const byKey = new Map(this.rollsInsert.map(x => [x.key, x]));
    return {
      titulo,
      columnas: ['N° Rollo', 'OT', 'Proceso'],
      filas: rolls.map(x => {
        const row = byKey.get(rollKey({ numeroRollo_BagPro: x.roll, proceso_Id: x.process }));
        return [x.roll, x.ot ?? row?.ot, x.processName ?? row?.proceso_Nombre ?? x.process];
      }),
    };
  }

  //Limpia solo los filtros de la consulta: las tablas y la autorización se conservan.
  clearFilters() {
    this.filters.reset();
    this.loadRankDates();
  }

  //Limpia filtros, tablas, buscadores y autorización.
  clearAll() {
    this.clearFilters();
    this.authorization.reset();
    this.rolls = [];
    this.rollsInsert = [];
    this.searchRolls1 = '';
    this.searchRolls2 = '';
    this.dt1?.reset();
    this.dt2?.reset();
    this.afterMove();
  }
}

//Llave única de un rollo: el número de BagPro se puede repetir entre ProcExtrusion y ProcSellado.
const rollKey = (x : { numeroRollo_BagPro : number, proceso_Id : string }) => `${x.numeroRollo_BagPro}|${x.proceso_Id}`;

//Suma de cantidades por unidad (Kg, Und, Paquete).
const totalsByUnit = (rolls : rollRow[]) : unitTotal[] => {
  const totals = new Map<string, number>();
  for (const roll of rolls) totals.set(roll.unidad, (totals.get(roll.unidad) ?? 0) + roll.cantidadMostrar);
  return [...totals.entries()].map(([unit, quantity]) => ({ unit, quantity }));
};

export interface rollsToDelete {
  roll : number;
  process : string;
}

interface rollReference extends rollsToDelete {
  ot? : number;
  processName? : string;
}

interface pendingBagProRoll extends rollReference { }

interface rollRow {
  key : string;
  id : number;
  ot : number;
  prod_Id : number;
  prod_Nombre : string;
  numeroRollo_BagPro : number;
  proceso_Id : string;
  proceso_Nombre : string;
  fecha : string;
  fechaTexto : string;
  presentacion : string;
  peso_Neto : number;
  cantidad : number;
  cantidadMostrar : number;
  unidad : string;
}

interface unitTotal {
  unit : string;
  quantity : number;
}

interface consolidatedRow {
  key : string;
  ot : number;
  prod_Id : number;
  prod_Nombre : string;
  unit : string;
  quantity : number;
  rolls : number;
}

interface confirmSummary {
  rolls : number;
  ots : number;
  totals : unitTotal[];
  authorizes : string;
  fail : string;
  observation : string;
}
