import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { Table } from 'primeng/table';
import { AppComponent } from 'src/app/app.component';
import { Detalles_PrecargueDespachoService } from 'src/app/Servicios/Detalles_PrecargueDespacho/Detalles_PrecargueDespacho.service';
import { EstadosService } from 'src/app/Servicios/Estados/estados.service';
import { InventarioZeusService } from 'src/app/Servicios/InventarioZeus/inventario-zeus.service';
import { Precargue_RollosDespachoComponent } from '../Precargue_RollosDespacho/Precargue_RollosDespacho.component';
import { UsuarioService } from 'src/app/Servicios/Usuarios/usuario.service';
import { UtileriaService } from 'src/app/Servicios/Utileria/utileria.service';

@Component({
  selector: 'app-Mov_PrecargueDespacho',
  templateUrl: './Mov_PrecargueDespacho.component.html',
  styleUrls: ['./Mov_PrecargueDespacho.component.css']
})
export class Mov_PrecargueDespachoComponent implements OnInit {

  form !: FormGroup;
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
    private cmpPreload: Precargue_RollosDespachoComponent,
    private svSales: UsuarioService,
    private svUtil: UtileriaService
  ) {
    this.formDialogPrecargue = this.frmBuilder.group({
      nroPrecargue: null,
      ofAsociada: null,
      cliente: null,
      asesor: null,
      fechaCreacion: null,
      fechaCierre: null,
      estado: null
    });

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
    this.form.patchValue({ 'startDate': initialDate, 'endDate': new Date() });
  }

  getStatuses = () => this.svStatuses.srvObtenerListaEstados().subscribe(data => { this.statuses = data.filter(x => [11, 5].includes(x.estado_Id)) }, error => { this.svUtil.Notificacion(`Error`, `Error al consultar los estados.`) });

  initForm() {
    this.form = this.frmBuilder.group({
      id: [null],
      startDate: [null, Validators.required],
      endDate: [null, Validators.required],
      idClient: [null],
      client: [null],
      status: [null],
      sales: [null]
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
  searchClientsByName(form: FormGroup, controlName: string) {
    const name = form.value[controlName];
    this.svZeus.getClientByName(name).subscribe(data => this.clients = data);
  }

  //*
  selectClient(form: FormGroup, controlName: string, idControlName?: string) {
    const client = this.clients.find(x => x.idcliente == form.value[controlName]);
    if (client) {
      const values = { [controlName]: client.razoncial };
      if (idControlName) {
        values[idControlName] = client.idcliente;
      }
      form.patchValue(values);
    }
  }

  //*
  clearFields() {
    this.form.reset();
    this.searchedData = [];
    this.loadRankDates();
  }

  //*
  searchData() {
    this.load = true;
    let date1: any = moment(this.form.value.startDate).format('YYYY-MM-DD');
    let date2: any = moment(this.form.value.endDate).format('YYYY-MM-DD');

    this.svDtlPreload.getMovementsPreload(date1, date2, this.validateUrl()).subscribe(data => {
      this.searchedData = data;
      this.load = false;
    }, error => {
      this.svUtil.Notificacion(`Error`, `Error al consultar los datos de Precargue | ${error.status} ${error.statusText}.`);
    });
  }

  //*
  validateUrl() {
    let id: any = this.form.value.id;
    let status: any = this.form.value.status;
    let client: any = this.form.value.idClient;
    let sales: any = this.form.value.sales;
    let url: string = ``;

    if (id != null) url += `id=${id}`;
    if (status != null) url.length > 0 ? url += `&status=${status}` : url += `status=${status}`;
    if (client != null) url.length > 0 ? url += `&client=${client}` : url += `client=${client}`;
    if (sales != null) url.length > 0 ? url += `&sales=${sales}` : url += `sales=${sales}`;

    if (url.length > 0) url = `?${url}`;
    return url;
  }

  createPDF(id: number) {
    this.cmpPreload.createPDF(id, `descargado`);
  }

  /*Funcion vacia que esta siendo utilizada en el frontend para descartar un precargue */
  discardPreload() {}

  cargarModalEditarPrecargue(item){
    console.log(item);
    this.dialogPrecargue = true;
    this.formDialogPrecargue.patchValue({
      nroPrecargue: item.movement,
      ofAsociada: item.of,
      cliente: item.client,
      asesor: item.sales,
      fechaCreacion: this.svUtil.formatearFechaYYYYMMDD(item.date1),
      fechaCierre: item.date1 == item.date2 ? '' : this.svUtil.formatearFechaYYYYMMDD(item.date2),
      estado: item.status
    });
  }

  editPrecargue() {
    this.dialogLoad = true;
    console.log(this.formDialogPrecargue.value);
    if (this.formDialogPrecargue.valid) {
      // llamar al metodo de api para editar el precargue

      // quitar la carga del modal
      this.dialogLoad = false;
      // luego quitar el modal y mostrar notificacion de exito
      this.dialogPrecargue = false;
      // mostrar notificacion de exito
      this.svUtil.Notificacion(`Confirmación`, `Precargue editado correctamente.`);
      this.searchData();
    }else{
      this.dialogPrecargue = false;
      this.dialogLoad = false;
      this.svUtil.Notificacion(`Error`, `Error al editar el precargue, por favor verifique los campos.`);
      this.searchData();
    }
  }
}
