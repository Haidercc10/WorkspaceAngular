import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { Table } from 'primeng/table';
import { AppComponent } from 'src/app/app.component';
import { Detalles_PrecargueDespachoService } from 'src/app/Servicios/Detalles_PrecargueDespacho/Detalles_PrecargueDespacho.service';
import { EstadosService } from 'src/app/Servicios/Estados/estados.service';
import { InventarioZeusService } from 'src/app/Servicios/InventarioZeus/inventario-zeus.service';
import { UsuarioService } from 'src/app/Servicios/Usuarios/usuario.service';
import { UtileriaService } from 'src/app/Servicios/Utileria/utileria.service';
import { CreacionPdfService } from 'src/app/Servicios/CreacionPDF/creacion-pdf.service';
import { Subject, Subscription, catchError, debounceTime, distinctUntilChanged, finalize, of, switchMap } from 'rxjs';
import { ConfirmationService } from 'primeng/api';
import { Precargue_DespachoService } from 'src/app/Servicios/Precargue_Despacho/Precargue_Despacho.service';
import { ESTADOS_PRECARGUE, OF_GENERICA_PRECARGUE } from './precargue-despacho.constants';
import { Router } from '@angular/router';

@Component({
  selector: 'app-Mov_PrecargueDespacho',
  templateUrl: './Mov_PrecargueDespacho.component.html',
  styleUrls: ['./Mov_PrecargueDespacho.component.css']
})
export class Mov_PrecargueDespachoComponent implements OnInit, OnDestroy {

  formBusquedaPrecargue !: FormGroup;
  /** Búsqueda de precargues en curso: muestra el overlay y oculta la tabla mientras llegan los datos. */
  load: boolean = false;
  /** Acción sobre una fila (PDF o anulación) en curso: muestra el overlay sin destruir la tabla ni sus filtros. */
  processing: boolean = false;
  dialogLoad: boolean = false;
  modoSeleccionado: boolean;
  ValidarRol: number;
  storage_Id: number;
  storage_Nombre: any;
  searchedData: any[] = [];
  @ViewChild('dt') dt: Table;
  dialogPrecargue: boolean = false;
  formDialogPrecargue !: FormGroup;
  sales: any = [];
  clients: any = [];
  statuses: any = [];
  /** Roles autorizados para cambiar el cliente de un precargue (la API valida la misma regla). */
  readonly rolesEditarCliente: number[] = [1, 97, 10, 6, 96];
  /** Estados del precargue, expuestos para la vista. */
  readonly ESTADOS = ESTADOS_PRECARGUE;
  /** OF genérica de los precargues sin orden de facturación real (no se muestra en la tabla). */
  readonly OF_GENERICA = OF_GENERICA_PRECARGUE;
  /** Estados que se muestran en el filtro de búsqueda. */
  private readonly estadosFiltro: number[] = [ESTADOS_PRECARGUE.PENDIENTE, ESTADOS_PRECARGUE.FINALIZADO, ESTADOS_PRECARGUE.ANULADO, ESTADOS_PRECARGUE.ACEPTADO, ESTADOS_PRECARGUE.EN_PROCESO];
  /** Estados en los que se permite anular un precargue. */
  readonly estadosAnulables: number[] = [ESTADOS_PRECARGUE.PENDIENTE, ESTADOS_PRECARGUE.EN_PROCESO];
  /** Longitud mínima del texto para consultar clientes en Zeus. */
  private readonly minLongitudBusquedaCliente: number = 3;
  /** Último texto escrito en un buscador de clientes; evita pintar resultados de una búsqueda ya obsoleta. */
  private textoBusquedaCliente: string = '';
  /** Textos escritos en los buscadores de clientes (filtro y diálogo de edición). */
  private readonly busquedaCliente$ = new Subject<string>();
  private busquedaClienteSub: Subscription;

  constructor(
    private appComponent: AppComponent,
    private frmBuilder: FormBuilder,
    private svStatuses: EstadosService,
    private svZeus: InventarioZeusService,
    private svDtlPreload: Detalles_PrecargueDespachoService,
    private svSales: UsuarioService,
    private util: UtileriaService,
    private PDFService: CreacionPdfService,
    private svPreload: Precargue_DespachoService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {
    this.initForm();
    this.modoSeleccionado = this.appComponent.temaSeleccionado;
  }

  ngOnInit() {
    this.readStorage();
    this.loadRankDates();
    this.getStatuses();
    this.initClientSearch();
  }

  /** Libera la suscripción del buscador de clientes al destruir el componente. */
  ngOnDestroy() {
    this.busquedaClienteSub?.unsubscribe();
    this.busquedaCliente$.complete();
  }

  /**
   * Configura la búsqueda de clientes en Zeus: espera 300 ms sin teclear, ignora textos repetidos,
   * cancela la petición anterior y consulta solo desde 3 caracteres. Si el texto es corto,
   * la consulta falla o no hay coincidencias, la lista queda vacía.
   */
  private initClientSearch() {
    this.busquedaClienteSub = this.busquedaCliente$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(name => name.length < this.minLongitudBusquedaCliente
        ? of([])
        : this.svZeus.getClientByName(name).pipe(catchError(() => of([]))))
    ).subscribe(data => {
      // Si mientras llegaba la respuesta el usuario borró hasta quedar por debajo del mínimo, no se pintan resultados.
      this.clients = this.textoBusquedaCliente.length >= this.minLongitudBusquedaCliente && Array.isArray(data) ? data : [];
    });
  }

  //*Función para cargar las fechas desde que inicia el modulo.
  loadRankDates() {
    let initialDate = new Date(moment().subtract(30, 'days').format('YYYY-MM-DD'));
    this.formBusquedaPrecargue.patchValue({ 'startDate': initialDate, 'endDate': new Date() });
  }

  // Función para obtener los estados disponibles.
  getStatuses = () => this.svStatuses.srvObtenerListaEstados().subscribe(data => { this.statuses = data.filter(x => this.estadosFiltro.includes(x.estado_Id)) }, error => { this.util.Notificacion(`Error`, `Error al consultar los estados.`) });

  // Función para inicializar los formularios.
  initForm() {
    this.formBusquedaPrecargue = this.frmBuilder.group({
      id: [null, Validators.pattern(/^\d+$/)],
      startDate: [null, Validators.required],
      endDate: [null, Validators.required],
      client: [null],
      idClient: [null],
      status: [null],
      sales: [null]
    });

    this.formDialogPrecargue = this.frmBuilder.group({
      nroPrecargue: [null],
      ofAsociada: [null],
      cliente: [null],
      idClient: [null],
      asesor: [null],
      idSales: [null],
      fechaCreacion: [null],
      fechaCierre: [null],
      estado: [null]
    });
  }

  // Funcion que se encargará de obtener los vendedores
  getSales() {
    let asesor: any = this.ValidarRol == 2 ? this.appComponent.storage_Id : null;
    this.svSales.GetVendedores().subscribe(resp => {
      this.sales = resp,
      this.sales = asesor ? this.sales.filter(x => x.usua_Id == asesor) : this.sales
    });
  }

  //*Leer storage del navegador.  
  readStorage() {
    this.storage_Id = this.appComponent.storage_Id;
    this.ValidarRol = this.appComponent.storage_Rol;
    this.storage_Nombre = this.appComponent.storage_Nombre;
    this.getSales();
  }

  /**
   * Envía el texto del control de cliente al buscador con retraso (ver `initClientSearch`).
   * Lo usan el filtro de búsqueda y el diálogo de edición (lista `clients` compartida).
   * @param formulario Formulario que contiene el control del cliente.
   * @param controlName Nombre del control de texto del cliente.
   */
  searchClientsByName(formulario: FormGroup, controlName: string) {
    const name: string = `${formulario.getRawValue()[controlName] ?? ''}`.trim();
    this.textoBusquedaCliente = name;
    this.busquedaCliente$.next(name);
  }

  /**
   * Limpia la selección del cliente (y del vendedor asociado, si el formulario lo maneja) mientras el usuario escribe.
   * @param formulario Formulario que contiene el control del cliente.
   * @param controlName Nombre del control de texto del cliente.
   */
  clearClientSelection(formulario: FormGroup, controlName: string) {
    const clienteControl = formulario.get(controlName);
    if (!clienteControl?.value?.trim()) {
      clienteControl?.setValue(null, { emitEvent: false });
    }
    formulario.get('idClient')?.setValue(null);
    formulario.get('idSales')?.setValue(null);
  }

  /**
   * Asigna el cliente seleccionado de la lista de Zeus. En el diálogo de edición también asigna
   * el vendedor del cliente (`idvende`) y muestra su nombre; si no está en la lista de vendedores, muestra el ID.
   * @param formulario Formulario que contiene el control del cliente.
   * @param controlName Nombre del control de texto del cliente.
   */
  selectClient(formulario: FormGroup, controlName: string) {
    const clienteObtenido = this.clients.find(x => x.idcliente == formulario.value[controlName]);
    if (!clienteObtenido) return;

    formulario.patchValue({
      [controlName]: clienteObtenido.razoncial,
      idClient: clienteObtenido.idcliente
    });

    if (formulario === this.formDialogPrecargue) {
      const idSales = clienteObtenido.idvende;
      const vendedor = this.sales.find(x => x.usua_Id == idSales);
      formulario.patchValue({ idSales: idSales, asesor: vendedor ? vendedor.usua_Nombre : idSales });
    }
  }

  // Función para limpiar los campos del formulario de búsqueda.
  clearFields() {
    this.formBusquedaPrecargue.reset();
    this.searchedData = [];
    this.loadRankDates();
  }

  //* Función para buscar los datos de los precargues.
  searchData() {
    const { startDate, endDate } = this.formBusquedaPrecargue.value;
    if (this.formBusquedaPrecargue.get('id')?.invalid) return this.util.Notificacion(`Advertencia`, `El N° Doc. debe ser numérico.`);
    if (!startDate || !endDate) return this.util.Notificacion(`Advertencia`, `Debe seleccionar la fecha inicial y final.`);
    if (moment(startDate).isAfter(endDate, 'day')) return this.util.Notificacion(`Advertencia`, `La fecha inicial no puede ser mayor que la fecha final.`);

    this.load = true;
    let date1: any = moment(startDate).format('YYYY-MM-DD');
    let date2: any = moment(endDate).format('YYYY-MM-DD');

    this.svDtlPreload.getMovementsPreload(date1, date2, this.validateUrl()).pipe(finalize(() => this.load = false)).subscribe({
      next: data => {
        this.searchedData = data;
        if (data.length == 0) this.util.Notificacion(`Advertencia`, `No se encontraron precargues con los filtros seleccionados.`);
      },
      error: error => {
        // si la API devuelve un mensaje de validación (texto) se muestra, sino el error genérico.
        let message: string = typeof error.error == 'string' ? error.error : `Error al consultar los datos de Precargue | ${error.status} ${error.statusText}.`;
        this.util.Notificacion(`Error`, message);
      }
    });
  }

  // Función para validar y construir la URL de búsqueda.
  validateUrl() {
    let id: any = this.formBusquedaPrecargue.value.id;
    let status: any = this.formBusquedaPrecargue.value.status;
    let client: any = this.formBusquedaPrecargue.value.idClient;
    let sales: any = this.formBusquedaPrecargue.value.sales;
    let url: string = ``;
    const hasValue = (value: any) => value != null && value !== '';

    if (hasValue(id)) url += `id=${id}`;
    if (hasValue(status)) url.length > 0 ? url += `&status=${status}` : url += `status=${status}`;
    if (hasValue(client)) url.length > 0 ? url += `&client=${client}` : url += `client=${client}`;
    if (hasValue(sales)) url.length > 0 ? url += `&sales=${sales}` : url += `sales=${sales}`;

    if (url.length > 0) url = `?${url}`;
    return url;
  }

  /**
   * Consulta el precargue y genera su PDF. Usa `processing` (no `load`) para que la tabla y sus filtros se conserven.
   * @param id Número del precargue.
   */
  createPDF(id: number) {
    this.processing = true;
    // Obtenemos la info completa del precargue
    this.svDtlPreload.getPreloadIdAsync(id).pipe(finalize (() => this.processing = false)).subscribe({
      next: data => {
        // generamos el contenido del PDF con la info obtenida
        let content: any[] = this.PDFService.contentPDFPrecargue(data);
        // finalmente creamos el PDF con el titulo y contenido generado
        this.PDFService.formatoPDF(`Orden de Precargue N° ${id}`, content); // si se demora 2 segundos siempre, es por este metodo, tiene un timeout.
        // notificamos la confirmacion de la generacion y su posterior muestra en una nueva pestaña.
        this.util.Notificacion(`Confirmación`, `Orden de precargue N° ${id} generado exitosamente!. A continuación se abrirá el PDF en una nueva pestaña.`);
      },
      error: error => {
        this.util.Notificacion(`Error`, `Error al consultar la orden de precargue N° ${id} | ${error.status} ${error.statusText}`);
      }
    });
  }

  /**
   * Solicita confirmación y anula un precargue pendiente (11) o en proceso (2); sus rollos vuelven a estado 19.
   * Usa `processing` durante la anulación; la recarga posterior la controla `searchData` con `load`.
   * @param data Fila del precargue seleccionado en la tabla.
   */
  discardPreload(data: any) {
    this.confirmationService.confirm({
      key: 'anularPrecargue',
      header: 'Anular Precargue',
      message: `¿Seguro que desea anular el precargue N° ${data.movement}? Los rollos quedarán disponibles nuevamente.`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      accept: () => {
        this.processing = true;
        this.svPreload.anular(data.movement).pipe(finalize(() => this.processing = false)).subscribe({
          next: resp => {
            this.util.Notificacion(`Confirmación`, `Precargue N° ${data.movement} anulado. Rollos liberados: ${resp?.rollosLiberados ?? 0}.`);
            this.searchData();
          },
          error: error => {
            let message: string = typeof error.error == 'string' ? error.error : `Error al anular el precargue | ${error.status} ${error.statusText}.`;
            this.util.Notificacion(`Error`, message);
          }
        });
      }
    });
  }

  /**
   * Abre el módulo de precargue de despacho con el precargue en proceso (estado 2) para continuarlo.
   * Se ignora en otros estados y cuando el doble clic se hace sobre un botón de la fila.
   * @param data Fila del precargue seleccionado en la tabla.
   * @param event Evento de doble clic.
   */
  resumePreload(data: any, event: MouseEvent) {
    if (data.statusId != this.ESTADOS.EN_PROCESO) return;
    if ((event.target as HTMLElement)?.closest('button')) return;
    this.router.navigate(['/precargue-rollos-despacho'], { queryParams: { preload: data.movement } });
  }

  // Función que se encarga de cargar el modal para editar un precargue. El form group solo es para pegar la info del precargue seleccionado en el modal.
  cargarModalEditarPrecargue(item){
    this.formDialogPrecargue.patchValue({
      nroPrecargue: item.movement,
      ofAsociada: item.of,
      idClient: item.idClient,
      cliente: item.client,
      asesor: item.sales,
      idSales: item.salesId,
      fechaCreacion: this.util.formatearFechaYYYYMMDD(item.date1),
      fechaCierre: (item.date1 == item.date2 && item.hour1 == item.hour2) ? '-' : this.util.formatearFechaYYYYMMDD(item.date2),
      estado: item.status
    });
    
    this.formDialogPrecargue.disable();
    this.formDialogPrecargue.get('idClient')?.enable();
    this.formDialogPrecargue.get('cliente')?.enable();
    this.dialogPrecargue = true;
  }

  /**
   * Cambia el cliente del precargue abierto en el diálogo y actualiza su vendedor al asesor del cliente nuevo.
   * Requiere un cliente seleccionado de la lista y su vendedor.
   */
  editPrecargue() {
    // getRawValue incluye los controles deshabilitados (nroPrecargue, idSales) sin tener que habilitarlos.
    const raw = this.formDialogPrecargue.getRawValue();
    let idCliente : string = raw.idClient;
    const cliente = raw.cliente;
    const idSales : number = raw.idSales;
    let nroPrecargue : string = raw.nroPrecargue;
    if (!cliente?.trim() || !idCliente) {
      this.util.Notificacion('Error', 'Debe seleccionar o ingresar un cliente válido.');
      return;
    }
    if (!idSales) {
      this.util.Notificacion('Error', 'El cliente seleccionado no tiene un vendedor asociado.');
      return;
    }

    this.dialogLoad = true;
    // llamar al metodo de api para editar el precargue
    this.svDtlPreload.EditPreloadClientName(nroPrecargue, idCliente, idSales).pipe(finalize(() => this.dialogLoad = false)).subscribe({
      next: () => {
        this.util.Notificacion('Confirmación', `Precargue N° ${nroPrecargue} editado correctamente.`);
        this.dialogPrecargue = false;
        this.formDialogPrecargue.reset();
        this.searchData();
      },
      error: (error) => {
        let message: string = typeof error.error == 'string' ? error.error : `Error al editar el precargue | ${error.status} ${error.statusText}.`;
        this.util.Notificacion(`Error`, message);
      }
    });
  }
}
