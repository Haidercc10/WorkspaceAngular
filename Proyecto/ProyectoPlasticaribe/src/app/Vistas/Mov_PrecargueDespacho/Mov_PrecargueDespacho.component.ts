import { Component, OnInit, ViewChild } from '@angular/core';
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

@Component({
  selector: 'app-Mov_PrecargueDespacho',
  templateUrl: './Mov_PrecargueDespacho.component.html',
  styleUrls: ['./Mov_PrecargueDespacho.component.css']
})
export class Mov_PrecargueDespachoComponent implements OnInit {

  formBusquedaPrecargue !: FormGroup;
  load: boolean = false;
  dialogLoad: boolean = false;
  modoSeleccionado: boolean;
  ValidarRol: number;
  storage_Id: number;
  storage_Nombre: any;
  searchedData: any[] = [];
  @ViewChild('dt') dt: Table;
  modal: boolean = false;
  dialogPrecargue: boolean = false;
  formDialogPrecargue !: FormGroup;
  sales: any = [];

  clients: any = [];
  statuses: any = [];

  constructor(
    private appComponent: AppComponent,
    private frmBuilder: FormBuilder,
    private svStatuses: EstadosService,
    private svZeus: InventarioZeusService,
    private svDtlPreload: Detalles_PrecargueDespachoService,
    private svSales: UsuarioService,
    private utileria: UtileriaService,
    private PDFService: CreacionPdfService
  ) {
    this.initForm();
    this.modoSeleccionado = this.appComponent.temaSeleccionado;
  }

  ngOnInit() {
    this.readStorage();
    this.loadRankDates();
    this.getStatuses();
  }

  //*Función para cargar las fechas desde que inicia el modulo.
  loadRankDates() {
    let initialDate = new Date(moment().subtract(30, 'days').format('YYYY-MM-DD'));
    this.formBusquedaPrecargue.patchValue({ 'startDate': initialDate, 'endDate': new Date() });
  }

  getStatuses = () => this.svStatuses.srvObtenerListaEstados().subscribe(data => { this.statuses = data.filter(x => [11, 5].includes(x.estado_Id)) }, error => { this.utileria.Notificacion(`Error`, `Error al consultar los estados.`) });

  initForm() {
    this.formBusquedaPrecargue = this.frmBuilder.group({
      id: [null],
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

  //*
  searchClientsByName(formulario: FormGroup, controlName: string) {
    const name = formulario.value[controlName];
    this.svZeus.getClientByName(name).subscribe(data => this.clients = data);
  }

  //*
  selectClient(formulario: FormGroup, controlName: string) {
    const clienteObtenido = this.clients.find(x => x.idcliente == formulario.value[controlName]);
    if (!clienteObtenido) return;

    formulario.patchValue({
      [controlName]: clienteObtenido.razoncial,
      idClient: clienteObtenido.idcliente
    });
  }

  //*
  clearFields() {
    this.formBusquedaPrecargue.reset();
    this.searchedData = [];
    this.loadRankDates();
  }

  //*
  searchData() {
    this.load = true;
    let date1: any = moment(this.formBusquedaPrecargue.value.startDate).format('YYYY-MM-DD');
    let date2: any = moment(this.formBusquedaPrecargue.value.endDate).format('YYYY-MM-DD');

    this.svDtlPreload.getMovementsPreload(date1, date2, this.validateUrl()).subscribe(data => {
      this.searchedData = data;
    }, error => {
      this.utileria.Notificacion(`Error`, `Error al consultar los datos de Precargue | ${error.status} ${error.statusText}.`);
      this.load = false; // se pone aqui ya que cuando entra en error no se ejecuta el complete y se queda cargando la tabla de precargues
    }, () => {
      this.load = false;
    });
  }

  //*
  validateUrl() {
    let id: any = this.formBusquedaPrecargue.value.id;
    let status: any = this.formBusquedaPrecargue.value.status;
    let client: any = this.formBusquedaPrecargue.value.idClient;
    let sales: any = this.formBusquedaPrecargue.value.sales;
    let url: string = ``;

    if (id != null) url += `id=${id}`;
    if (status != null) url.length > 0 ? url += `&status=${status}` : url += `status=${status}`;
    if (client != null) url.length > 0 ? url += `&client=${client}` : url += `client=${client}`;
    if (sales != null) url.length > 0 ? url += `&sales=${sales}` : url += `sales=${sales}`;

    if (url.length > 0) url = `?${url}`;
    return url;
  }

  createPDF(id: number) {
    this.load = true;
    // Obtenemos la info completa del precargue
    this.svDtlPreload.getPreloadId(id).subscribe(data => {
      let title: string = `Orden de Precargue N° ${id}`;
      // generamos el contenido del PDF con la info obtenida
      let content: any[] = this.PDFService.contentPDFPrecargue(data);
      // finalmente creamos el PDF con el titulo y contenido generado
      this.PDFService.formatoPDF(title, content);
      // notificamos la confirmacion de la generacion y su posterior muestra en una nueva pestaña.
      this.utileria.Notificacion(`Confirmación`, `Orden de precargue N° ${id} descargada exitosamente!. A continuación se abrirá el PDF en una nueva pestaña.`);
    }, error => {
      this.utileria.Notificacion(`Error`, `Error al consultar la orden de precargue N° ${id} | ${error.status} ${error.statusText}`);
      this.load = false;
    }, () => {
      this.load = false;
    });
  }

  /*Funcion vacia que esta siendo utilizada en el frontend para descartar un precargue */
  discardPreload() {}

  //funcion que se encarga de cargar el modal para editar un precargue. El form group solo es para pegar la info del precargue seleccionado en el modal.
  cargarModalEditarPrecargue(item){
    this.dialogPrecargue = true;
    this.formDialogPrecargue.patchValue({
      nroPrecargue: item.movement,
      ofAsociada: item.of,
      cliente: item.client,
      asesor: item.sales,
      fechaCreacion: this.utileria.formatearFechaYYYYMMDD(item.date1),
      fechaCierre: item.date1 == item.date2 ? '' : this.utileria.formatearFechaYYYYMMDD(item.date2),
      estado: item.status
    });
  }

  editPrecargue() {
    this.dialogLoad = true;
    // llamar al metodo de api para editar el precargue
    let idCliente : string = this.formDialogPrecargue.value.idClient;
    let nroPrecargue : string = this.formDialogPrecargue.value.nroPrecargue;
    this.svDtlPreload.EditPreloadClientName(nroPrecargue, idCliente).subscribe(data => {
      this.utileria.Notificacion(`Confirmación`, `Precargue editado correctamente.`);
    }, error => {
      this.utileria.Notificacion(`Error`, `Error al editar el precargue | ${error.status} ${error.statusText}.`);
      this.dialogLoad = false;
      this.dialogPrecargue = false;
      this.formDialogPrecargue.reset();
    }, () => {
      // quitar la carga del modal
      this.dialogLoad = false;
      // luego quitar el modal y mostrar notificacion de exito
      this.dialogPrecargue = false;
      // resetear el form y recargar la tabla de precargues
      this.formDialogPrecargue.reset();
      this.searchData();
    });
  }
}
