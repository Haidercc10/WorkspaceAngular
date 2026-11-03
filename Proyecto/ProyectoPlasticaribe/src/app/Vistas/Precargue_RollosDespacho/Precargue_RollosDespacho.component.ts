import { HttpErrorResponse } from '@angular/common/http';
import { Component, Injectable, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { TabView } from 'primeng/tabview';
import { finalize } from 'rxjs';
import { AppComponent } from 'src/app/app.component';
import { CreacionPdfService } from 'src/app/Servicios/CreacionPDF/creacion-pdf.service';
import { Detalles_PrecargueDespachoService } from 'src/app/Servicios/Detalles_PrecargueDespacho/Detalles_PrecargueDespacho.service';
import { InventarioZeusService } from 'src/app/Servicios/InventarioZeus/inventario-zeus.service';
import { Precargue_DespachoService } from 'src/app/Servicios/Precargue_Despacho/Precargue_Despacho.service';
import { ProductoService } from 'src/app/Servicios/Productos/producto.service';
import { UtileriaService } from 'src/app/Servicios/Utileria/utileria.service';

// Cada pestaña gestiona un precargue independiente. pcdId es null hasta que se escanea el primer rollo.
interface PreloadTab {
  key: number;
  form: FormGroup;
  pcdId: number | null;
  rolls: any[];
  consolidated: any[];
  clients: any[];
  products: any[];
  busy: boolean;
}

const STATUS_IN_PROCESS: number = 2;
const STATUS_ROLL_PRELOADED: number = 50;

@Injectable({
  providedIn: `root`
})

@Component({
  selector: 'app-Precargue_RollosDespacho',
  templateUrl: './Precargue_RollosDespacho.component.html',
  styleUrls: ['./Precargue_RollosDespacho.component.css']
})

export class Precargue_RollosDespachoComponent implements OnInit, OnDestroy {

  load: boolean = false;
  modoSeleccionado: boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro
  tabs: PreloadTab[] = [];
  activeIndex: number = 0;
  @ViewChild('tabView') tabView: TabView;
  storage_Id: number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre: any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  ValidarRol: number; //Variable que se usará en la vista para validar el tipo de rol
  message: string = '';
  confirmTab: PreloadTab | null = null;
  confirmAction: 'finish' | 'cancel' | null = null;
  private nextKey: number = 1;
  private focusTimer: any;

  constructor(private AppComponent: AppComponent,
    private fmBuild: FormBuilder,
    private svZeus: InventarioZeusService,
    private svProducts: ProductoService,
    private svPreload: Precargue_DespachoService,
    private svDetailsPreload: Detalles_PrecargueDespachoService,
    private PDFService: CreacionPdfService,
    private msg: MessageService,
    private util: UtileriaService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
  }

  ngOnInit() {
    this.lecturaStorage();
    this.loadPreloadsInProcess();
    this.focusTimer = setInterval(() => this.focusRoll(), 30000);
  }

  ngOnDestroy(): void {
    clearInterval(this.focusTimer);
  }

  // Función para mantener el puntero del mouse en el campo rollo de la pestaña activa.
  focusRoll(tab: PreloadTab | undefined = this.activeTab) {
    if (tab) document.getElementById(`roll-${tab.key}`)?.focus();
  }

  // Función que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage() {
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  get activeTab(): PreloadTab | undefined {
    return this.tabs[this.activeIndex];
  }

  trackTab = (_: number, tab: PreloadTab) => tab.key;

  //#region Pestañas
  createTab(): PreloadTab {
    let tab: PreloadTab = {
      key: this.nextKey++,
      form: this.fmBuild.group({
        doc: [null],
        roll: [null],
        clientStock: [false,],
        asesor: [null],
        item: [null,],
        reference: [null,],
        idClient: [null, Validators.required],
        client: [null, Validators.required],
        observation: [null,],
      }),
      pcdId: null,
      rolls: [],
      consolidated: [],
      clients: [],
      products: [],
      busy: false,
    };
    this.tabs.push(tab);
    return tab;
  }

  addTab = () => this.selectTab(this.createTab());

  // Se espera a que la pestaña se renderice para seleccionarla; se asigna también al TabView porque la pestaña "+" queda seleccionada al pulsarla.
  selectTab(tab: PreloadTab) {
    setTimeout(() => {
      let index: number = this.tabs.indexOf(tab);
      if (index < 0) return;
      this.activeIndex = index;
      if (this.tabView) this.tabView.activeIndex = index;
      setTimeout(() => this.focusRoll(tab));
    });
  }

  onTabChange(index: number) {
    if (index == this.tabs.length) this.addTab();
    else this.focusRoll(this.tabs[index]);
  }

  closeTab = (index: number) => this.removeTab(this.tabs[index]);

  removeTab(tab: PreloadTab) {
    let index: number = this.tabs.indexOf(tab);
    if (index < 0) return;
    this.tabs.splice(index, 1);
    if (this.tabs.length == 0) this.createTab();
    this.selectTab(this.tabs[Math.min(index, this.tabs.length - 1)]);
  }

  // Abre una pestaña por cada precargue en proceso del usuario y por el que llegue en la url (?preload=) desde movimientos de precargue.
  loadPreloadsInProcess() {
    let requestedId: number = Number(this.route.snapshot.queryParamMap.get('preload')) || 0;
    if (requestedId) this.clearPreloadParam();
    this.load = true;
    this.svPreload.getPreloadsInProcess(this.storage_Id).pipe(finalize(() => this.load = false)).subscribe({
      next: (data: any[]) => {
        let ids: number[] = data.map(x => x.pcd_Id);
        if (requestedId && !ids.includes(requestedId)) ids.push(requestedId);
        if (ids.length == 0) {
          this.createTab();
          return;
        }
        ids.forEach(id => this.loadPreloadInTab(this.createTab(), id, id == requestedId));
        if (data.length > 0) this.util.Notificacion(`Advertencia`, `Tienes ${data.length} precargue(s) en proceso. Se abrieron en pestañas para que puedas continuarlos.`);
      },
      error: (error: HttpErrorResponse) => {
        if (requestedId) this.loadPreloadInTab(this.createTab(), requestedId, true);
        else this.createTab();
        this.util.Notificacion(`Error`, `Error consultando los precargues en proceso | ${error.status} ${error.statusText}`);
      }
    });
  }

  /** Quita el query param `preload` para que recargar la página no vuelva a pedir ese precargue. */
  clearPreloadParam = () => this.router.navigate([], { relativeTo: this.route, queryParams: {}, replaceUrl: true });

  loadPreloadInTab(tab: PreloadTab, id: number, activate: boolean) {
    tab.busy = true;
    this.svPreload.getPreloadRolls(id).pipe(finalize(() => tab.busy = false)).subscribe({
      next: data => {
        if (data.statusId != STATUS_IN_PROCESS) {
          this.util.Notificacion(`Advertencia`, `El precargue N° ${id} está en estado ${data.status} y no se puede continuar.`);
          this.removeTab(tab);
          return;
        }
        tab.pcdId = data.pcd_Id;
        tab.form.patchValue({ doc: data.pcd_Id, idClient: data.idClient, client: data.client, asesor: data.salesId, observation: data.observation });
        tab.form.get('client')?.disable();
        tab.rolls = data.rolls;
        this.consolidateItems(tab);
        let unavailable: any[] = this.unavailableRolls(tab);
        if (unavailable.length > 0) this.util.Notificacion(`Advertencia`, `Los rollos/bultos N° ${unavailable.map(x => x.roll).join(', ')} del precargue N° ${id} ya no están disponibles. Quítalos de la tabla para poder generar el precargue.`);
        if (activate) this.selectTab(tab);
      },
      error: (error: HttpErrorResponse) => {
        this.notifyHttpError(error, `Error consultando el precargue N° ${id}`);
        this.removeTab(tab);
      }
    });
  }
  //#endregion

  searchClientsByName(tab: PreloadTab) {
    let name: string = tab.form.value.client;
    if (name) this.svZeus.getClientByName(name).subscribe(data => tab.clients = data);
  }

  selectClient(tab: PreloadTab) {
    let client = tab.clients.find(x => x.idcliente == tab.form.value.client);
    if (!client) return;
    tab.form.patchValue({ 'idClient': client.idcliente, 'client': client.razoncial, 'asesor': client.idvende, });
  }

  searchProduct(tab: PreloadTab) {
    let nombre: string = tab.form.value.reference;
    this.svProducts.obtenerItemsLike(nombre).subscribe(resp => tab.products = resp);
  }

  selectedProduct(tab: PreloadTab) {
    let product: any = tab.form.value.reference;
    tab.form.patchValue({
      'item': product,
      'reference': tab.products.find(x => x.prod_Id == product)?.prod_Nombre
    });
  }

  getItem(tab: PreloadTab) {
    let item: any = tab.form.value.item;
    if (item) {
      this.load = true;
      this.svProducts.GetProductsById(item).pipe(finalize(() => this.load = false)).subscribe(data => {
        tab.form.patchValue({ 'item': item, 'reference': data[0].prod.prod_Nombre, });
      }, error => {
        this.util.Notificacion(`Error`, `No se encontró el item N°: ${item}.`);
        tab.form.patchValue({ 'item': null, 'reference': null, });
      });
    } else this.util.Notificacion(`Advertencia`, `Debe llenar el campo ITEM.`);
  }

  // Guarda el rollo escaneado en el precargue de la pestaña; el primer rollo crea el precargue en estado En proceso.
  searchRolls(tab: PreloadTab) {
    let value: any = tab.form.getRawValue();
    let roll: number = Number(value.roll);
    if (!roll || tab.busy) return;
    if (!value.idClient) {
      this.util.Notificacion(`Advertencia`, `Debe seleccionar el cliente antes de escanear rollos/bultos!`);
      tab.form.patchValue({ roll: null });
      return;
    }

    let request: any = {
      pcd_Id: tab.pcdId,
      cli_Id: Number(value.idClient),
      clienteStock: !!value.clientStock,
      rollo: roll,
      usuario: this.storage_Id,
      vendedor: parseInt(value.asesor) || null,
      observacion: value.observation,
    };

    this.setBusy(tab, true);
    this.svPreload.addRollToPreload(request).pipe(finalize(() => this.setBusy(tab, false))).subscribe({
      next: data => {
        if (!tab.rolls.some(x => x.roll == data.rollo.roll && x.item == data.rollo.item)) {
          tab.rolls.unshift(data.rollo);
          this.consolidateItems(tab);
        }

        if (!tab.pcdId) {
          tab.pcdId = data.pcd_Id;
          tab.form.patchValue({ doc: data.pcd_Id });
          tab.form.get('client')?.disable();
          this.util.Notificacion(`Confirmación`, `Se creó el precargue N° ${data.pcd_Id} con el rollo/bulto N° ${roll}. Cada rollo que escanees quedará guardado.`);
        } else if (data.rolloYaRegistrado) this.util.Notificacion(`Advertencia`, `El rollo/bulto N° ${roll} ya se encuentra en el precargue!`);
        else this.util.Notificacion(`Confirmación`, `El rollo/bulto N° ${roll} ha sido agregado al precargue!`);
      },
      error: (error: HttpErrorResponse) => this.notifyHttpError(error, `Error agregando el rollo/bulto N° ${roll}`),
    });
  }

  setBusy(tab: PreloadTab, busy: boolean) {
    tab.busy = busy;
    let roll = tab.form.get('roll');
    if (busy) roll?.disable();
    else {
      roll?.enable();
      roll?.setValue(null);
      setTimeout(() => this.focusRoll(tab));
    }
  }

  // Los 404/409 de la API traen en el cuerpo un mensaje para el usuario.
  notifyHttpError(error: HttpErrorResponse, fallback: string) {
    if ([404, 409].includes(error.status) && typeof error.error == 'string' && error.error) this.util.Notificacion(`Advertencia`, error.error);
    else this.util.Notificacion(`Error`, `${fallback} | ${error.status} ${error.statusText}`);
  }

  consolidateItems(tab: PreloadTab) {
    tab.consolidated = tab.rolls.reduce((acc, value) => {
      let find = acc.find(x => x.item == value.item);
      if (!find) acc.push(value);
      return acc;
    }, []);
  }

  // Rollos del precargue que otro proceso sacó del estado precargado (50); impiden generar el precargue hasta quitarlos.
  isUnavailable = (roll: any) => roll.currentStatus != STATUS_ROLL_PRELOADED;

  unavailableRolls = (tab: PreloadTab) => tab.rolls.filter(x => this.isUnavailable(x));

  qtyRollsItem = (tab: PreloadTab, data: any) => tab.rolls.filter(x => x.item == data.item).length;

  qtyTotalItem = (tab: PreloadTab, data: any) => tab.rolls.filter(x => x.item == data.item).reduce((a, b) => a += b.qty, 0);

  weightTotalItem = (tab: PreloadTab, data: any) => tab.rolls.filter(x => x.item == data.item).reduce((a, b) => a += b.weight, 0);

  // Quita el rollo del precargue en base de datos y lo devuelve a disponible.
  quitRoll(tab: PreloadTab, data: any) {
    if (!tab.pcdId) return;
    this.setBusy(tab, true);
    this.svPreload.removeRollFromPreload(tab.pcdId, data.roll, data.item).pipe(finalize(() => this.setBusy(tab, false))).subscribe({
      next: () => {
        let index: number = tab.rolls.findIndex(x => x.roll == data.roll && x.item == data.item);
        if (index >= 0) tab.rolls.splice(index, 1);
        this.consolidateItems(tab);
        this.util.Notificacion(`Confirmación`, `Se quitó el rollo N° ${data.roll} del precargue!`);
      },
      error: (error: HttpErrorResponse) => this.notifyHttpError(error, `Error quitando el rollo N° ${data.roll}`),
    });
  }

  applyFilter = ($event, campo: any, table: any) => table!.filter(($event.target as HTMLInputElement).value, campo, 'contains');

  clearFields(tab: PreloadTab) {
    tab.form.reset({ clientStock: false });
    tab.clients = [];
    this.focusRoll(tab);
  }

  clearAll(tab: PreloadTab) {
    this.clearFields(tab);
    tab.rolls = [];
    tab.consolidated = [];
  }

  // Deja la pestaña lista para un nuevo precargue conservando los datos del formulario.
  resetTab(tab: PreloadTab) {
    tab.pcdId = null;
    tab.rolls = [];
    tab.consolidated = [];
    tab.form.patchValue({ doc: null, roll: null });
    tab.form.get('client')?.enable();
  }

  // Mostrar mensaje de confirmación para generar o cancelar el precargue de la pestaña.
  viewConfirmMessage(tab: PreloadTab, action: 'finish' | 'cancel') {
    this.confirmTab = tab;
    this.confirmAction = action;
    let client: string = tab.form.getRawValue().client;
    this.message = action == 'finish'
      ? `¿Está seguro que desea generar el precargue N° ${tab.pcdId} para el cliente ${client}?`
      : `¿Está seguro que desea cancelar el precargue N° ${tab.pcdId}? Se anulará y sus ${tab.rolls.length} rollo(s)/bulto(s) volverán a estar disponibles.`;
    setTimeout(() => {
      this.msg.add({ severity: 'warn', key: 'confirm', summary: action == 'finish' ? 'Confirmación' : 'Cancelar precargue', detail: this.message, sticky: true });
    }, 200);
  }

  onConfirm() {
    let tab = this.confirmTab;
    let action = this.confirmAction;
    this.onReject();
    if (!tab) return;
    if (action == 'finish') this.finishPreload(tab);
    else if (action == 'cancel') this.cancelPreload(tab);
  }

  // Función para quitar mensaje confirmación.
  onReject() {
    this.msg.clear('confirm');
    this.confirmTab = null;
    this.confirmAction = null;
  }

  // Pasa el precargue de En proceso a Pendiente, genera el PDF y cierra la pestaña.
  finishPreload(tab: PreloadTab) {
    let id: number = tab.pcdId!;
    tab.busy = true;
    this.svPreload.finishPreload(id, { usuario: this.storage_Id, observacion: tab.form.getRawValue().observation }).subscribe({
      next: () => this.createPDF(id, `creada`, () => {
        tab.busy = false;
        this.removeTab(tab);
      }),
      error: (error: HttpErrorResponse) => {
        this.setBusy(tab, false);
        this.notifyHttpError(error, `Error generando el precargue N° ${id}`);
      }
    });
  }

  // Anula el precargue, devuelve sus rollos a disponible y deja la pestaña editable para empezar de nuevo.
  cancelPreload(tab: PreloadTab) {
    let id: number = tab.pcdId!;
    this.setBusy(tab, true);
    this.svPreload.cancelPreload(id, { usuario: this.storage_Id, observacion: `Precargue cancelado desde la página de precargue de rollos.` })
      .pipe(finalize(() => this.setBusy(tab, false))).subscribe({
        next: data => {
          this.resetTab(tab);
          this.util.Notificacion(`Confirmación`, `Se canceló el precargue N° ${id}. ${data.rollosLiberados} rollo(s)/bulto(s) volvieron a estar disponibles.`);
        },
        error: (error: HttpErrorResponse) => this.notifyHttpError(error, `Error cancelando el precargue N° ${id}`),
      });
  }

  createPDF(id: number, action: string, onComplete?: () => void) {
    this.svDetailsPreload.getPreloadIdAsync(id).subscribe(data => {
      let title: string = `Orden de Precargue N° ${id}`;
      let content: any[] = this.PDFService.contentPDFPrecargue(data);
      this.PDFService.formatoPDF(title, content);
      this.util.Notificacion(`Confirmación`, `Orden de precargue N° ${id} ${action} exitosamente!. A continuación se abrirá el PDF en una nueva pestaña.`);
      onComplete?.();
    }, error => {
      this.util.Notificacion(`Error`, `La orden de precargue N° ${id} fue ${action}, pero no se pudo generar el PDF. Puedes consultarlo en movimientos de precargue | ${error.status} ${error.statusText}`);
      onComplete?.();
    });
  }
}
