import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, Injectable, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { catchError, finalize, forkJoin, map, of, switchMap } from 'rxjs';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { FallasTecnicasService } from 'src/app/Servicios/FallasTecnicas/FallasTecnicas.service';
import { DetalleError, ListadoDetalleError, MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { SrvRollosEliminadosService } from 'src/app/Servicios/RollosDesechos/srvRollosEliminados.service';
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

// Se mantiene @Injectable porque Crear_FallasComponent inyecta este componente.
@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-EliminarRollos_Produccion',
  templateUrl: './EliminarRollos_Produccion.component.html',
  styleUrls: ['./EliminarRollos_Produccion.component.css']
})
export class EliminarRollos_ProduccionComponent implements OnInit, OnDestroy {
  load : boolean = false; //Variable para validar que salga o no la imagen de carga
  today : string = moment().format('YYYY-MM-DD'); //Fecha actual
  form !: FormGroup; //Formulario de filtros y datos de la eliminación
  selectedMode : boolean = false; //Modo oscuro/claro
  private readonly suscripcionTema = alCambiarTema(oscuro => this.selectedMode = oscuro); // mantiene selectedMode al día con el tema
  process : any[] = []; //Procesos de producción
  rolls : rollRow[] = []; //Rollos consultados
  rollsInsert : rollRow[] = []; //Rollos a eliminar
  rollsTableSelection : rollRow[] = [];
  rollsInsertTableSelection : rollRow[] = [];
  consolidatedInfo : consolidatedRow[] = []; //Consolidado por OT, ítem y unidad (totales ya calculados)
  consolidatedTotals : { unit : string, quantity : number }[] = []; //Totales del consolidado por unidad
  fails : any[] = [];
  @ViewChild('dt1') dt1: Table | undefined;
  @ViewChild('dt2') dt2: Table | undefined;
  @ViewChild('formElement') formElement: ElementRef<HTMLElement> | undefined;
  modalFails : boolean = false;
  users : any[] = [];
  storage_Id: any;
  storage_Name: any;
  validateRole: any;

  constructor(private AppComponent : AppComponent,
    private frmBld : FormBuilder,
    private svcMsjs : MensajesAplicacionService,
    private svcProdProcess : Produccion_ProcesosService,
    private svcProcess : ProcesosService,
    private svcMsg : MessageService,
    private failsService : FallasTecnicasService,
    private svBagPro : BagproService,
    private svUsers : UsuarioService,
    private svDiscardRolls : SrvRollosEliminadosService,
    private tutoriales : TutorialesService,
  ) {
    this.initForm();
  }

  ngOnInit() {
    this.readStorage();
    this.loadRankDates();
    this.loadCatalogs(true);
  }

  //Cierra el tutorial si el usuario sale de la página con él abierto.
  ngOnDestroy() {
    this.tutoriales.cancelar();
  }

  //Muestra el tutorial de la página (botón "i" junto al título).
  tutorial = () => this.tutoriales.iniciar(this.pasosTutorial());

  private pasosTutorial = () => pasosTutorialEliminarRollos({ esAdmin: this.isAdmin });

  //TEMPORAL: solo el administrador (rol 1) ve el botón de reenviar la observación a BagPro.
  get isAdmin() : boolean {
    return Number(this.validateRole) === 1;
  }

  //Leer storage del navegador.
  readStorage() {
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Name = this.AppComponent.storage_Nombre;
    this.validateRole = this.AppComponent.storage_Rol;
  }

  //Carga en paralelo los procesos, las fallas y los usuarios autorizadores.
  //Con iniciarTutorial, al terminar muestra el tutorial si es la primera vez que el usuario entra.
  loadCatalogs(iniciarTutorial : boolean = false) {
    this.load = true;
    forkJoin({
      process: this.svcProcess.srvObtenerLista().pipe(catchError(() => of([]))),
      fails: this.failsService.getFallasPorTipo(TIPO_FALLA_ELIMINACION).pipe(catchError(() => of([]))),
      users: this.svUsers.getUsuariosPorIds(USUARIOS_AUTORIZADORES).pipe(catchError(() => of([]))),
    }).pipe(finalize(() => this.load = false)).subscribe(({ process, fails, users }) => {
      this.process = (process as any[]).filter(x => PROCESOS_PRODUCCION.includes(x.proceso_Codigo));
      this.fails = fails;
      this.users = users;
      if (iniciarTutorial) this.tutoriales.iniciarPrimeraVez(ClaveTutorialEliminarRollos, this.storage_Id, () => this.pasosTutorial());
    });
  }

  //Función para obtener las fallas técnicas (también la usa Crear_FallasComponent).
  getFails = () => this.failsService.getFallasPorTipo(TIPO_FALLA_ELIMINACION).subscribe(data => this.fails = data);

  //Función para cargar fechas en el rango.
  loadRankDates(){
    let initialDate = new Date(moment().subtract(30, 'days').format('YYYY-MM-DD'));
    this.form.patchValue({ 'RangoFechas' : [initialDate, new Date()] });
  }

  //Función para inicializar el formulario. Motivo, observación y usuario solo son obligatorios para eliminar.
  initForm(){
    this.form = this.frmBld.group({
      RangoFechas : [null],
      Bodega : [null],
      Rollo : [null],
      OT : [null],
      Falla : [null, Validators.required],
      Observacion : [null, Validators.required],
      user : [null, Validators.required],
    });
  }

  //Función para buscar los rollos a eliminar.
  searchRolls(){
    const [start, end] = this.form.value.RangoFechas ?? [];
    const date1 = start ? moment(start).format('YYYY-MM-DD') : this.today;
    const date2 = end ? moment(end).format('YYYY-MM-DD') : date1;

    this.load = true;
    this.svcProdProcess.getInfoProductionToDelete(date1, date2, {
      ot: this.form.value.OT,
      process: this.form.value.Bodega,
      roll: this.form.value.Rollo,
    }).pipe(finalize(() => this.load = false)).subscribe({
      next: data => {
        if (data.length == 0) this.svcMsjs.mensajeAdvertencia(`Advertencia`, `No se encontraron rollos disponibles con los filtros indicados!`);
        this.loadTable(data);
      },
      error: (error : HttpErrorResponse) => this.svcMsjs.errorHttp(`Error consultando los rollos`, error),
    });
  }

  //Reemplaza la tabla de consultados con el resultado de la búsqueda, sin los rollos que ya están en la tabla de rollos a eliminar.
  loadTable(data : any[]){
    const selected = new Set(this.rollsInsert.map(x => x.key));
    this.rolls = data
      .map(x => ({ ...x, key: rollKey(x) }) as rollRow)
      .filter(x => !selected.has(x.key));
    this.rollsTableSelection = [];
  }

  //Pasa a la tabla de rollos a eliminar todos los rollos consultados que estén visibles con el filtro actual.
  selectAllRolls(){
    const visible : rollRow[] = (this.dt1?.filteredValue as rollRow[]) ?? this.rolls;
    const keys = new Set(visible.map(x => x.key));
    this.rollsInsert = [...this.rollsInsert, ...visible];
    this.rolls = this.rolls.filter(x => !keys.has(x.key));
    this.afterMove();
  }

  //Función para seleccionar un rollo consultado a la tabla de rollos a eliminar.
  loadRollInsert(roll : rollRow){
    if(!this.rollsInsert.some(x => x.key == roll.key)) this.rollsInsert = [...this.rollsInsert, roll];
    this.rolls = this.rolls.filter(x => x.key != roll.key);
    this.afterMove();
  }

  //Devuelve a la tabla de consultados todos los rollos a eliminar que estén visibles con el filtro actual.
  quitAllRolls(){
    const visible : rollRow[] = (this.dt2?.filteredValue as rollRow[]) ?? this.rollsInsert;
    const keys = new Set(visible.map(x => x.key));
    this.rolls = [...this.rolls, ...visible];
    this.rollsInsert = this.rollsInsert.filter(x => !keys.has(x.key));
    this.afterMove();
  }

  //Función para deseleccionar un rollo a eliminar.
  quitRollInsert(roll : rollRow){
    if(!this.rolls.some(x => x.key == roll.key)) this.rolls = [...this.rolls, roll];
    this.rollsInsert = this.rollsInsert.filter(x => x.key != roll.key);
    this.afterMove();
  }

  private afterMove() {
    this.rollsTableSelection = [];
    this.rollsInsertTableSelection = [];
    this.getInfoConsolidated();
  }

  //Cantidad que se muestra de un rollo: unidades si es sellado en Und/Paquete, si no kilos.
  quantity = (roll : rollRow) : number => isUnits(roll) ? roll.cantidad : roll.peso_Neto;

  //Unidad de la cantidad que se muestra.
  unit = (roll : rollRow) : string => isUnits(roll) ? roll.presentacion : 'Kg';

  //Consolidado por OT, ítem y unidad con sus totales, calculado una sola vez (no en cada ciclo de la vista).
  getInfoConsolidated(){
    const groups = new Map<string, consolidatedRow>();
    const totals = new Map<string, number>();

    for (const roll of this.rollsInsert) {
      const unit = this.unit(roll);
      const quantity = this.quantity(roll);
      const key = `${roll.ot}|${roll.prod_Id}|${unit}`;
      const group = groups.get(key);

      if (group) {
        group.quantity += quantity;
        group.rolls++;
      } else {
        groups.set(key, { ot: roll.ot, prod_Id: roll.prod_Id, prod_Nombre: roll.prod_Nombre, unit, quantity, rolls: 1 });
      }
      totals.set(unit, (totals.get(unit) ?? 0) + quantity);
    }

    this.consolidatedInfo = [...groups.values()];
    this.consolidatedTotals = [...totals.entries()].map(([unit, quantity]) => ({ unit, quantity }));
  }

  //Función para mostrar mensaje de confirmación de eliminación de rollos.
  seeMsgElection() {
    if (!this.form.valid) {
      this.markInvalidFields();
      this.svcMsjs.mensajeAdvertencia(`Advertencia`, `Debe llenar el motivo, la observación y el usuario que autoriza.`);
      return;
    }
    this.svcMsg.add({severity:'warn', key:'delete', summary:'Elección', detail: `¿Está seguro que desea eliminar el/los ${this.rollsInsert.length} rollo(s) seleccionado(s)?`, sticky: true});
  }

  //Marca en rojo los campos obligatorios vacíos (como en el formulario de usuarios) y desplaza la vista hasta el primero.
  private markInvalidFields() {
    Object.values(this.form.controls).forEach(control => {
      control.markAsDirty();
      control.markAsTouched();
    });
    const firstInvalid = this.formElement?.nativeElement.querySelector<HTMLElement>('[formControlName].ng-invalid');
    firstInvalid?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  //Elimina los rollos (una sola petición transaccional) y luego registra la observación en BagPro.
  deleteRolls(){
    this.onReject('delete');
    if (this.load) return;
    if (!this.form.valid) {
      this.svcMsjs.mensajeAdvertencia(`Advertencia`, `Debe llenar los campos requeridos.`);
      return;
    }

    this.load = true;
    const request = {
      rolls: this.rollsInsert.map(x => ({ roll: x.numeroRollo_BagPro, process: x.proceso_Id })),
      fail: this.form.value.Falla,
      observation: this.form.value.Observacion,
      userAuthorize: this.form.value.user,
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
          this.svcMsjs.mensajeErrorDetallado(
            `Se eliminaron ${deleted.length} rollo(s), pero no se pudo registrar la observación en BagPro.`,
            this.errorDetail(bagProError, 'BagPro', 'Registrar observación de rollos eliminados', 'POST',
              this.rollsListing('Rollos eliminados sin observación en BagPro', deleted)),
            20000);
        } else if (notFound.length > 0) {
          const notFoundRolls = deleted.filter(x => notFound.includes(x.roll));
          this.svcMsjs.mensajeErrorDetallado(
            `Se eliminaron ${deleted.length} rollo(s), pero ${notFound.length} no se encontraron en BagPro.`,
            { api: 'BagPro', operacion: 'Registrar observación de rollos eliminados', statusText: 'Rollos no encontrados en BagPro',
              conInternet: navigator.onLine, fecha: moment().format('YYYY-MM-DD HH:mm:ss'),
              listado: this.rollsListing('Rollos no encontrados en BagPro', notFoundRolls) },
            20000);
        } else {
          this.svcMsjs.mensajeConfirmacion(`OK!`, `${deleted.length} rollo(s) eliminado(s) con éxito!`);
        }
        this.clearAll();
      },
      error: (error : HttpErrorResponse) => this.handleDeleteError(error, request.rolls),
    });
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
      this.svcMsjs.mensajeErrorDetallado(`No fue posible eliminar los rollos. No se eliminó ninguno.`, detail, 20000);
    }
  }

  //Arma el detalle técnico del error para la ventana "Ver detalles".
  private errorDetail(error : any, api : string, operacion : string, metodo : string, listado : ListadoDetalleError) : DetalleError {
    return { ...MensajesAplicacionService.detalleDeError(error, { api, operacion, metodo }), listado };
  }

  //Tabla de rollos (N° rollo, OT, proceso) para la ventana "Ver detalles". Toma la OT de la tabla de rollos a eliminar si no viene.
  private rollsListing(titulo : string, rolls : { roll : number, process : string, ot? : number }[]) : ListadoDetalleError {
    const byKey = new Map(this.rollsInsert.map(x => [x.key, x]));
    return {
      titulo,
      columnas: ['N° Rollo', 'OT', 'Proceso'],
      filas: rolls.map(x => {
        const row = byKey.get(rollKey({ numeroRollo_BagPro: x.roll, proceso_Id: x.process }));
        return [x.roll, x.ot ?? row?.ot, row?.proceso_Nombre ?? x.process];
      }),
    };
  }

  //TEMPORAL: reenvía a BagPro la observación de los rollos eliminados en el rango de fechas del formulario
  //(para los que quedaron sin observación por el error de BagPro). Es seguro repetirlo: solo vuelve a escribir el mismo texto.
  resendBagProObservation() {
    if (this.load || !this.isAdmin) return;
    const [start, end] = this.form.value.RangoFechas ?? [];
    const date1 = start ? moment(start).format('YYYY-MM-DD') : this.today;
    const date2 = end ? moment(end).format('YYYY-MM-DD') : date1;
    let pending : { roll : number, process : string, ot : number }[] = [];

    this.load = true;
    this.svDiscardRolls.getDeletedRollsForBagPro(date1, date2).pipe(
      switchMap(rolls => {
        pending = rolls;
        return rolls.length == 0 ? of(null) : this.svBagPro.putObservationDeletedRolls2(rolls.map(x => ({ roll: x.roll, process: x.process })));
      }),
      finalize(() => this.load = false),
    ).subscribe({
      next: result => {
        if (!result) return this.svcMsjs.mensajeInformacion(`Sin rollos`, `No hay rollos eliminados entre ${date1} y ${date2}.`, 6000);
        const updated = result.updatedExtrusion + result.updatedSellado;
        if (result.notFound.length > 0) {
          this.svcMsjs.mensajeErrorDetallado(
            `Se actualizó la observación de ${updated} rollo(s) en BagPro; ${result.notFound.length} no se encontraron.`,
            { api: 'BagPro', operacion: 'Reenviar observación de rollos eliminados', statusText: 'Rollos no encontrados en BagPro',
              conInternet: navigator.onLine, fecha: moment().format('YYYY-MM-DD HH:mm:ss'),
              listado: this.rollsListing('Rollos no encontrados en BagPro', pending.filter(x => result.notFound.includes(x.roll))) },
            20000);
        } else {
          this.svcMsjs.mensajeConfirmacion(`OK!`, `Se actualizó la observación de ${updated} rollo(s) en BagPro (${date1} a ${date2}).`, 6000);
        }
      },
      error: error => this.svcMsjs.mensajeErrorDetallado(
        `No fue posible reenviar la observación a BagPro.`,
        this.errorDetail(error, pending.length ? 'BagPro' : 'Plasticaribe', 'Reenviar observación de rollos eliminados', pending.length ? 'POST' : 'GET',
          this.rollsListing('Rollos pendientes de observación en BagPro', pending)),
        20000),
    });
  }

  //Función para filtrar la tabla de rollos consultados.
  applyFilter = ($event, campo : any, valorCampo : string) => this.dt1!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);

  //Función para filtrar la tabla de rollos a eliminar.
  applyFilter2 = ($event, campo : any, valorCampo : string) => this.dt2!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);

  //Función para limpiar los campos de filtros.
  clearLabels() {
    this.form.reset();
    this.loadRankDates();
  }

  //Función para limpiar todo
  clearAll() {
    this.form.reset();
    this.rolls = [];
    this.rollsInsert = [];
    this.rollsTableSelection = [];
    this.rollsInsertTableSelection = [];
    this.consolidatedInfo = [];
    this.consolidatedTotals = [];
    this.loadRankDates();
  }

  //Función para cerrar el dialogo de elección.
  onReject = (key : any) => this.svcMsg.clear(key);
}

//Llave única de un rollo: el número de BagPro se puede repetir entre ProcExtrusion y ProcSellado.
const rollKey = (x : { numeroRollo_BagPro : number, proceso_Id : string }) => `${x.numeroRollo_BagPro}|${x.proceso_Id}`;

const isUnits = (roll : rollRow) => ['Paquete', 'Und'].includes(roll.presentacion) && roll.proceso_Id == 'SELLA';

export interface rollsToDelete {
  roll : number;
  process : string;
}

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
  presentacion : string;
  peso_Neto : number;
  cantidad : number;
  [field : string] : any;
}

interface consolidatedRow {
  ot : number;
  prod_Id : number;
  prod_Nombre : string;
  unit : string;
  quantity : number;
  rolls : number;
}
