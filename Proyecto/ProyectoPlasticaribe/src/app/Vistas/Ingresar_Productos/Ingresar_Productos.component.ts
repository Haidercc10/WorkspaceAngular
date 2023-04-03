import { Component, Inject, Injectable, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import pdfMake from 'pdfmake/build/pdfmake';
import { MessageService } from 'primeng/api';
import { DetallesEntradaRollosService } from 'src/app/Servicios/DetallesEntradasRollosDespacho/DetallesEntradaRollos.service';
import { DtPreEntregaRollosService } from 'src/app/Servicios/DetallesPreIngresoRollosDespacho/DtPreEntregaRollos.service';
import { ExistenciasProductosService } from 'src/app/Servicios/ExistenciasProductos/existencias-productos.service';
import { EntradaRollosService } from 'src/app/Servicios/IngresoRollosDespacho/EntradaRollos.service';
import { ProductoService } from 'src/app/Servicios/Productos/producto.service';
import { logoParaPdf } from 'src/app/logoPlasticaribe_Base64';

@Component({
  selector: 'app-Ingresar_Productos',
  templateUrl: './Ingresar_Productos.component.html',
  styleUrls: ['./Ingresar_Productos.component.css']
})

@Injectable({
  providedIn: 'root'
})

export class Ingresar_ProductosComponent implements OnInit {

  public FormConsultarRollos !: FormGroup; //formulario para consultar y crear un ingreso de rollos
  cargando : boolean = true; //Variable para validar que salga o no la imagen de carga
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  hora : any = moment().format("H:mm:ss"); //Variable que almacenará la hora
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  checked : boolean = false; //Variable para saber si el checkbox está seleccionado o no
  rollos : any [] = []; //Variable que almacenará los difrentes rollos que se hicieron en la orden de trabajo
  rollosInsertar : any [] = []; //Variable que va a amacenar los diferentes rollos que se van a insertar
  validarRollo : any [] = []; //Variable para validará que el rollo no esté en la tabla
  idProducto : any = 0; //Variable que va a almacenar el id del producto que fue hecho en la ot consultada
  presentacionProducto : string = ''; //Variable que almacenará la presentacion del producto de la orden de trabajo consultada
  cantidadOT : number = 0; //
  rollosAsignados : any = [];
  Total : number = 0; //Variable que va a almacenar la cantidad total de kg de los rollos asignados
  grupoProductos : any [] = []; //Variable que guardará de manera descriminada a cada producto
  cantPage : number = 25;
  rollosSinIngresar : number = 0; // variable para calcular la cantidad de rollos que no se han ingresado
  rollosIngresados : number = 0; //variable para calcular la cantidad de rollos que se han ingresado
  public page : number;
  fechaBusqueda : any = moment().subtract(4, 'day').format('YYYY-MM-DD'); // Variable que va a ayudar al momento de saber hasta que fecha se va a buscar
  procesos : any [] = [{Id : 'EMP', Nombre: 'Empaque'}, {Id : 'EXT', Nombre: 'Extrusión'}, {Id : 'SELLA', Nombre: 'Sellado'}]; //Variable que va a guardar los diferentes procesos de donde vienen los rollos
  minDate: Date = new Date(); //Variable que validará la fecha minima para los campos Date en el HTML

  constructor(private frmBuilderPedExterno : FormBuilder,
                @Inject(SESSION_STORAGE) private storage: WebStorageService,
                  private ExistenciasProdService : ExistenciasProductosService,
                    private entradaRolloService : EntradaRollosService,
                      private dtEntradaRollosService : DetallesEntradaRollosService,
                        private productosService : ProductoService,
                          private dtPreEntregaService : DtPreEntregaRollosService,
                            private messageService: MessageService,) {

    this.FormConsultarRollos = this.frmBuilderPedExterno.group({
      OT_Id: [null],
      IdRollo : [null],
      fechaDoc : [null],
      fechaFinalDoc: [null],
      Proceso : [null, Validators.required],
      Observacion : [''],
    });
  }

  ngOnInit() {
    this.lecturaStorage();
    this.minDate.setMonth(8);
    this.minDate.setFullYear(2022);
  }

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number) => {
    const exp = /(\d)(?=(\d{3})+(?!\d))/g;
    const rep = '$1,';
    return number.toString().replace(exp,rep);
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.storage.get('Id');
    this.storage_Nombre = this.storage.get('Nombre');
    this.ValidarRol = this.storage.get('Rol');
  }

  // Funcion para limpiar los campos de la vista
  limpiarCampos(){
    this.FormConsultarRollos.patchValue({
      OT_Id: null,
      IdRollo: null,
      fechaDoc : null,
      fechaFinalDoc: null,
      Observacion : '',
      Proceso : null,
    });
    this.rollos = [];
    this.rollosInsertar = [];
    this.validarRollo = [];
    this.grupoProductos = [];
    this.cargando = true;
    this.Total = 0;
    this.rollosAsignados = [];
  }

  // funcion que va a limpiar los campos del formulario
  limpiarForm(){
    this.FormConsultarRollos.patchValue({
      OT_Id: null,
      IdRollo: null,
      fechaDoc : null,
      fechaFinalDoc: null,
      Observacion : '',
      Proceso : null,
    });
  }

  //Funcion que traerá los diferentes rollos que se hicieron en la orden de trabajo
  consultarOTbagPro(){
    let ProcConsulta : any = this.FormConsultarRollos.value.Proceso;
    let ot : number = this.FormConsultarRollos.value.OT_Id;
    let fechaInicial : any = moment(this.FormConsultarRollos.value.fechaDoc).format('YYYY-MM-DD');
    let fechaFinal : any = moment(this.FormConsultarRollos.value.fechaFinalDoc).format('YYYY-MM-DD');
    let rollo : number = this.FormConsultarRollos.value.IdRollo;
    let proceso = this.FormConsultarRollos.value.Proceso;
    this.rollosSinIngresar = 0;
    this.rollosIngresados = 0;

    if (fechaInicial == 'Invalid date') fechaInicial = null;
    if (fechaFinal == 'Invalid date') fechaFinal = null;

    let rollos : any = [];

    if (ProcConsulta != null) {
      if (!moment(fechaInicial).isBefore('2022-09-23', 'days') && !moment(fechaFinal).isBefore('2022-09-23', 'days')) {
        this.rollos = [];
        let RollosConsultados : any [] = [];
        let otTemporral : number = 0;
        this.cargando = false;
        this.cantidadOT = 0;

        this.dtEntradaRollosService.getRollosProceso(proceso).subscribe(datos_rollos => { rollos = datos_rollos; });

        setTimeout(() => {
          if (ot != null && fechaInicial != null && fechaFinal != null) {
            this.dtPreEntregaService.getRollosPreEntregadosOT(ot, proceso).subscribe(datos_ot => {
              setTimeout(() => {
                if (datos_ot.length <= 0) this.mensajeAdvertencia(`No hay rollos por ingresar`);
                this.cargando = true;
              }, 1000);
              for (let i = 0; i < datos_ot.length; i++) {
                if (!rollos.includes(datos_ot[i].rollo_Id) && !RollosConsultados.includes(datos_ot[i].rollo_Id) && moment(datos_ot[i].preEntRollo_Fecha.replace('T00:00:00', '')).isBetween(fechaInicial, fechaFinal)) {
                  let info : any = {
                    Ot : datos_ot[i].dtlPreEntRollo_OT,
                    Id : datos_ot[i].rollo_Id,
                    IdProducto : datos_ot[i].prod_Id,
                    Producto : datos_ot[i].prod_Nombre,
                    Cantidad : datos_ot[i].dtlPreEntRollo_Cantidad,
                    Presentacion : datos_ot[i].undMed_Rollo,
                    Estatus : datos_ot[i].proceso_Nombre,
                    exits : false,
                    Fecha : datos_ot[i].preEntRollo_Fecha.replace('T00:00:00', ''),
                  }
                  this.rollosSinIngresar += 1;
                  if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
                  otTemporral = datos_ot[i].ot;
                  this.rollos.push(info);
                  RollosConsultados.push(datos_ot[i].item);
                  this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
                  this.rollos.sort((a,b) => Number(a.exits) - Number(b.exits) );
                } else if (rollos.includes(datos_ot[i].rollo_Id) && !RollosConsultados.includes(datos_ot[i].rollo_Id) && moment(datos_ot[i].preEntRollo_Fecha.replace('T00:00:00', '')).isBetween(fechaInicial, fechaFinal)) {
                  let info : any = {
                    Ot : datos_ot[i].dtlPreEntRollo_OT,
                    Id : datos_ot[i].rollo_Id,
                    IdProducto : datos_ot[i].prod_Id,
                    Producto : datos_ot[i].prod_Nombre,
                    Cantidad : datos_ot[i].dtlPreEntRollo_Cantidad,
                    Presentacion : datos_ot[i].undMed_Rollo,
                    Estatus : datos_ot[i].proceso_Nombre,
                    exits : true,
                    Fecha : datos_ot[i].preEntRollo_Fecha.replace('T00:00:00', ''),
                  }
                  this.rollosIngresados += 1;
                  if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
                  otTemporral = datos_ot[i].ot;
                  this.rollos.push(info);
                  RollosConsultados.push(datos_ot[i].item);
                  this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
                  this.rollos.sort((a,b) => Number(a.exits) - Number(b.exits) );
                }
              }
            });
          } else if (fechaInicial != null &&  fechaFinal != null) {
            this.dtPreEntregaService.getRollosPreEntregadosFechas(fechaInicial, fechaFinal, proceso).subscribe(datos_ot => {
              setTimeout(() => {
                if (datos_ot.length <= 0) this.mensajeAdvertencia(`No hay rollos por ingresar`);
                this.cargando = true;
              }, 1000);
              for (let i = 0; i < datos_ot.length; i++) {
                if (!rollos.includes(datos_ot[i].rollo_Id) && !RollosConsultados.includes(datos_ot[i].rollo_Id)) {
                  let info : any = {
                    Ot : datos_ot[i].dtlPreEntRollo_OT,
                    Id : datos_ot[i].rollo_Id,
                    IdProducto : datos_ot[i].prod_Id,
                    Producto : datos_ot[i].prod_Nombre,
                    Cantidad : datos_ot[i].dtlPreEntRollo_Cantidad,
                    Presentacion : datos_ot[i].undMed_Rollo,
                    Estatus : datos_ot[i].proceso_Nombre,
                    exits : false,
                    Fecha : datos_ot[i].preEntRollo_Fecha.replace('T00:00:00', ''),
                  }
                  this.rollosSinIngresar += 1;
                  if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
                  otTemporral = datos_ot[i].ot;
                  this.rollos.push(info);
                  RollosConsultados.push(datos_ot[i].item);
                  this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
                  this.rollos.sort((a,b) => Number(a.exits) - Number(b.exits) );
                } else if (rollos.includes(datos_ot[i].rollo_Id) && !RollosConsultados.includes(datos_ot[i].rollo_Id)) {
                  let info : any = {
                    Ot : datos_ot[i].dtlPreEntRollo_OT,
                    Id : datos_ot[i].rollo_Id,
                    IdProducto : datos_ot[i].prod_Id,
                    Producto : datos_ot[i].prod_Nombre,
                    Cantidad : datos_ot[i].dtlPreEntRollo_Cantidad,
                    Presentacion : datos_ot[i].undMed_Rollo,
                    Estatus : datos_ot[i].proceso_Nombre,
                    exits : true,
                    Fecha : datos_ot[i].preEntRollo_Fecha.replace('T00:00:00', ''),
                  }
                  this.rollosIngresados += 1;
                  if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
                  otTemporral = datos_ot[i].ot;
                  this.rollos.push(info);
                  RollosConsultados.push(datos_ot[i].item);
                  this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
                  this.rollos.sort((a,b) => Number(a.exits) - Number(b.exits) );
                }
              }
            });
          } else if (ot != null && fechaInicial != null) {
            this.dtPreEntregaService.getRollosPreEntregadosOT(ot, proceso).subscribe(datos_ot => {
              setTimeout(() => {
                if (datos_ot.length <= 0) this.mensajeAdvertencia(`No hay rollos por ingresar`);
                this.cargando = true;
              }, 1000);
              for (let i = 0; i < datos_ot.length; i++) {
                if (!rollos.includes(datos_ot[i].rollo_Id) && !RollosConsultados.includes(datos_ot[i].rollo_Id) && fechaInicial == datos_ot[i].preEntRollo_Fecha.replace('T00:00:00', '')) {
                  let info : any = {
                    Ot : datos_ot[i].dtlPreEntRollo_OT,
                    Id : datos_ot[i].rollo_Id,
                    IdProducto : datos_ot[i].prod_Id,
                    Producto : datos_ot[i].prod_Nombre,
                    Cantidad : datos_ot[i].dtlPreEntRollo_Cantidad,
                    Presentacion : datos_ot[i].undMed_Rollo,
                    Estatus : datos_ot[i].proceso_Nombre,
                    exits : false,
                    Fecha : datos_ot[i].preEntRollo_Fecha.replace('T00:00:00', ''),
                  }
                  this.rollosSinIngresar += 1;
                  if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
                  otTemporral = datos_ot[i].ot;
                  this.rollos.push(info);
                  RollosConsultados.push(datos_ot[i].item);
                  this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
                  this.rollos.sort((a,b) => Number(a.exits) - Number(b.exits) );
                } else if (rollos.includes(datos_ot[i].rollo_Id) && !RollosConsultados.includes(datos_ot[i].rollo_Id) && fechaInicial == datos_ot[i].preEntRollo_Fecha.replace('T00:00:00', '')) {
                  let info : any = {
                    Ot : datos_ot[i].dtlPreEntRollo_OT,
                    Id : datos_ot[i].rollo_Id,
                    IdProducto : datos_ot[i].prod_Id,
                    Producto : datos_ot[i].prod_Nombre,
                    Cantidad : datos_ot[i].dtlPreEntRollo_Cantidad,
                    Presentacion : datos_ot[i].undMed_Rollo,
                    Estatus : datos_ot[i].proceso_Nombre,
                    exits : true,
                    Fecha : datos_ot[i].preEntRollo_Fecha.replace('T00:00:00', ''),
                  }
                  this.rollosIngresados += 1;
                  if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
                  otTemporral = datos_ot[i].ot;
                  this.rollos.push(info);
                  RollosConsultados.push(datos_ot[i].item);
                  this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
                  this.rollos.sort((a,b) => Number(a.exits) - Number(b.exits) );
                }
              }
            });
          } else if (fechaInicial != null) {
            this.dtPreEntregaService.getRollosPreEntregadosFechas(fechaInicial, fechaInicial, proceso).subscribe(datos_ot => {
              setTimeout(() => {
                if (datos_ot.length <= 0) this.mensajeAdvertencia(`No hay rollos por ingresar`);
                this.cargando = true;
              }, 1000);
              for (let i = 0; i < datos_ot.length; i++) {
                if (!rollos.includes(datos_ot[i].rollo_Id) && !RollosConsultados.includes(datos_ot[i].rollo_Id)) {
                  let info : any = {
                    Ot : datos_ot[i].dtlPreEntRollo_OT,
                    Id : datos_ot[i].rollo_Id,
                    IdProducto : datos_ot[i].prod_Id,
                    Producto : datos_ot[i].prod_Nombre,
                    Cantidad : datos_ot[i].dtlPreEntRollo_Cantidad,
                    Presentacion : datos_ot[i].undMed_Rollo,
                    Estatus : datos_ot[i].proceso_Nombre,
                    exits : false,
                    Fecha : datos_ot[i].preEntRollo_Fecha.replace('T00:00:00', ''),
                  }
                  this.rollosSinIngresar += 1;
                  if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
                  otTemporral = datos_ot[i].ot;
                  this.rollos.push(info);
                  RollosConsultados.push(datos_ot[i].item);
                  this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
                  this.rollos.sort((a,b) => Number(a.exits) - Number(b.exits) );
                } else if (rollos.includes(datos_ot[i].rollo_Id) && !RollosConsultados.includes(datos_ot[i].rollo_Id)) {
                  let info : any = {
                    Ot : datos_ot[i].dtlPreEntRollo_OT,
                    Id : datos_ot[i].rollo_Id,
                    IdProducto : datos_ot[i].prod_Id,
                    Producto : datos_ot[i].prod_Nombre,
                    Cantidad : datos_ot[i].dtlPreEntRollo_Cantidad,
                    Presentacion : datos_ot[i].undMed_Rollo,
                    Estatus : datos_ot[i].proceso_Nombre,
                    exits : true,
                    Fecha : datos_ot[i].preEntRollo_Fecha.replace('T00:00:00', ''),
                  }
                  this.rollosIngresados += 1;
                  if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
                  otTemporral = datos_ot[i].ot;
                  this.rollos.push(info);
                  RollosConsultados.push(datos_ot[i].item);
                  this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
                  this.rollos.sort((a,b) => Number(a.exits) - Number(b.exits) );
                }
              }
            });
          } else if (ot != null) {
            this.dtPreEntregaService.getRollosPreEntregadosOT(ot, proceso).subscribe(datos_ot => {
              setTimeout(() => {
                if (datos_ot.length <= 0) this.mensajeAdvertencia(`No hay rollos por ingresar`);
                this.cargando = true;
              }, 1000);
              for (let i = 0; i < datos_ot.length; i++) {
                if (!rollos.includes(datos_ot[i].rollo_Id) && !RollosConsultados.includes(datos_ot[i].rollo_Id)) {
                  let info : any = {
                    Ot : datos_ot[i].dtlPreEntRollo_OT,
                    Id : datos_ot[i].rollo_Id,
                    IdProducto : datos_ot[i].prod_Id,
                    Producto : datos_ot[i].prod_Nombre,
                    Cantidad : datos_ot[i].dtlPreEntRollo_Cantidad,
                    Presentacion : datos_ot[i].undMed_Rollo,
                    Estatus : datos_ot[i].proceso_Nombre,
                    exits : false,
                    Fecha : datos_ot[i].preEntRollo_Fecha.replace('T00:00:00', ''),
                  }
                  this.rollosSinIngresar += 1;
                  if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
                  otTemporral = datos_ot[i].ot;
                  this.rollos.push(info);
                  RollosConsultados.push(datos_ot[i].item);
                  this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
                  this.rollos.sort((a,b) => Number(a.exits) - Number(b.exits) );
                } else if (rollos.includes(datos_ot[i].rollo_Id) && !RollosConsultados.includes(datos_ot[i].rollo_Id)) {
                  let info : any = {
                    Ot : datos_ot[i].dtlPreEntRollo_OT,
                    Id : datos_ot[i].rollo_Id,
                    IdProducto : datos_ot[i].prod_Id,
                    Producto : datos_ot[i].prod_Nombre,
                    Cantidad : datos_ot[i].dtlPreEntRollo_Cantidad,
                    Presentacion : datos_ot[i].undMed_Rollo,
                    Estatus : datos_ot[i].proceso_Nombre,
                    exits : true,
                    Fecha : datos_ot[i].preEntRollo_Fecha.replace('T00:00:00', ''),
                  }
                  this.rollosIngresados += 1;
                  if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
                  otTemporral = datos_ot[i].ot;
                  this.rollos.push(info);
                  RollosConsultados.push(datos_ot[i].item);
                  this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
                  this.rollos.sort((a,b) => Number(a.exits) - Number(b.exits) );
                }
              }
            });
          } else if (rollo != null) {
            this.dtPreEntregaService.getRollosPreEntregadosRollo(rollo, proceso).subscribe(datos_ot => {
              setTimeout(() => {
                if (datos_ot.length <= 0) this.mensajeAdvertencia(`No hay rollos por ingresar`);
                this.cargando = true;
              }, 1000);
              for (let i = 0; i < datos_ot.length; i++) {
                if (!rollos.includes(datos_ot[i].rollo_Id) && !RollosConsultados.includes(datos_ot[i].rollo_Id)) {
                  let info : any = {
                    Ot : datos_ot[i].dtlPreEntRollo_OT,
                    Id : datos_ot[i].rollo_Id,
                    IdProducto : datos_ot[i].prod_Id,
                    Producto : datos_ot[i].prod_Nombre,
                    Cantidad : datos_ot[i].dtlPreEntRollo_Cantidad,
                    Presentacion : datos_ot[i].undMed_Rollo,
                    Estatus : datos_ot[i].proceso_Nombre,
                    exits : false,
                    Fecha : datos_ot[i].preEntRollo_Fecha.replace('T00:00:00', ''),
                  }
                  this.rollosSinIngresar += 1;
                  if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
                  otTemporral = datos_ot[i].ot;
                  this.rollos.push(info);
                  RollosConsultados.push(datos_ot[i].item);
                  this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
                  this.rollos.sort((a,b) => Number(a.exits) - Number(b.exits) );
                } else if (rollos.includes(datos_ot[i].rollo_Id) && !RollosConsultados.includes(datos_ot[i].rollo_Id)) {
                  let info : any = {
                    Ot : datos_ot[i].dtlPreEntRollo_OT,
                    Id : datos_ot[i].rollo_Id,
                    IdProducto : datos_ot[i].prod_Id,
                    Producto : datos_ot[i].prod_Nombre,
                    Cantidad : datos_ot[i].dtlPreEntRollo_Cantidad,
                    Presentacion : datos_ot[i].undMed_Rollo,
                    Estatus : datos_ot[i].proceso_Nombre,
                    exits : true,
                    Fecha : datos_ot[i].preEntRollo_Fecha.replace('T00:00:00', ''),
                  }
                  this.rollosIngresados += 1;
                  if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
                  otTemporral = datos_ot[i].ot;
                  this.rollos.push(info);
                  RollosConsultados.push(datos_ot[i].item);
                  this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
                  this.rollos.sort((a,b) => Number(a.exits) - Number(b.exits) );
                }
              }
            });
          } else {
            this.dtPreEntregaService.getRollosPreEntregadosFechas(this.fechaBusqueda, this.today, proceso).subscribe(datos_ot => {
              setTimeout(() => {
                if (datos_ot.length <= 0) this.mensajeAdvertencia(`No hay rollos por ingresar`);
                this.cargando = true;
              }, 1000);
              for (let i = 0; i < datos_ot.length; i++) {
                if (!rollos.includes(datos_ot[i].rollo_Id) && !RollosConsultados.includes(datos_ot[i].rollo_Id)) {
                  let info : any = {
                    Ot : datos_ot[i].dtlPreEntRollo_OT,
                    Id : datos_ot[i].rollo_Id,
                    IdProducto : datos_ot[i].prod_Id,
                    Producto : datos_ot[i].prod_Nombre,
                    Cantidad : datos_ot[i].dtlPreEntRollo_Cantidad,
                    Presentacion : datos_ot[i].undMed_Rollo,
                    Estatus : datos_ot[i].proceso_Nombre,
                    exits : false,
                    Fecha : datos_ot[i].preEntRollo_Fecha.replace('T00:00:00', ''),
                  }
                  this.rollosSinIngresar += 1;
                  if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
                  otTemporral = datos_ot[i].ot;
                  this.rollos.push(info);
                  RollosConsultados.push(datos_ot[i].item);
                  this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
                  this.rollos.sort((a,b) => Number(a.exits) - Number(b.exits) );
                } else if (rollos.includes(datos_ot[i].rollo_Id) && !RollosConsultados.includes(datos_ot[i].rollo_Id)) {
                  let info : any = {
                    Ot : datos_ot[i].dtlPreEntRollo_OT,
                    Id : datos_ot[i].rollo_Id,
                    IdProducto : datos_ot[i].prod_Id,
                    Producto : datos_ot[i].prod_Nombre,
                    Cantidad : datos_ot[i].dtlPreEntRollo_Cantidad,
                    Presentacion : datos_ot[i].undMed_Rollo,
                    Estatus : datos_ot[i].proceso_Nombre,
                    exits : true,
                    Fecha : datos_ot[i].preEntRollo_Fecha.replace('T00:00:00', ''),
                  }
                  this.rollosIngresados += 1;
                  if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
                  otTemporral = datos_ot[i].ot;
                  this.rollos.push(info);
                  RollosConsultados.push(datos_ot[i].item);
                  this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
                  this.rollos.sort((a,b) => Number(a.exits) - Number(b.exits) );
                }
              }
            });
          }
        }, 4000);
      } else this.mensajeAdvertencia("¡La fecha seleccionada no es valida!");
    } else this.mensajeAdvertencia("¡Seleccione un proceso!");
  }

  //Funcion que va a agregar Productos en la tabla
  cargarProducto(item : any){
    this.cargando = false;
    if (this.rollosInsertar.length == 0) {
      this.validarRollo.push(item.Id);
      this.Total += item.Cantidad;
    } else {
      if (!this.validarRollo.includes(item.Id)) {
        this.validarRollo.push(item.Id);
        this.Total += item.Cantidad;
      } else if (this.validarRollo.includes(item.Id)) {
        for (let i = 0; i < this.rollosInsertar.length; i++) {
          if (this.rollosInsertar[i].Id == item.Id) this.rollosInsertar.splice(i,1);
        }
        for (let i = 0; i < this.validarRollo.length; i++) {
          if (this.validarRollo[i] == item.Id) this.validarRollo.splice(i,1);
        }
      }
    }
    for (let i = 0; i < this.rollos.length; i++) {
      if (this.rollos[i].Id == item.Id) this.rollos.splice(i,1);
    }
    setTimeout(() => { this.GrupoProductos(); }, 100);
  }

  // Funcion que va a seleccionar todo lo que hay en la tabla
  selccionarTodo(){
    this.cargando = false;
    this.Total = 0;
    let nuevo : any = this.rollos.filter((item) => item.exits === true);
    this.rollos = [];
    this.rollos = nuevo;
    setTimeout(() => { this.GrupoProductos(); }, 100);
  }

  // Funcion que va a quitar todo lo que hay en la tabla
  quitarTodo(){
    this.cargando = false;
    for (const item of this.rollosInsertar) {
      this.Total -= item.Cantidad;
      this.rollos.sort((a,b) => Number(a.Ot) - Number(b.Ot) );
      this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
      this.rollos.sort((a,b) => Number(a.IdProducto) - Number(b.IdProducto) );
      this.rollos.sort((a,b) => Number(a.exits) - Number(b.exits) );
    }
    setTimeout(() => {
      this.rollosInsertar = [];
      this.validarRollo = [];
    }, 500);
    setTimeout(() => { this.GrupoProductos(); }, 100);
  }

  // Funcion que se va a encargar de quitar rollos de la tabla inferior
  quitarRollo(item : any){
    this.cargando = false;
    this.Total -= item.Cantidad;
    this.rollos.sort((a,b) => Number(a.Ot) - Number(b.Ot) );
    this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
    this.rollos.sort((a,b) => Number(a.IdProducto) - Number(b.IdProducto) );
    this.rollos.sort((a,b) => Number(a.exits) - Number(b.exits) );
    for (let i = 0; i < this.rollosInsertar.length; i++) {
      if (this.rollosInsertar[i].Id == item.Id) this.rollosInsertar.splice(i,1);
    }
    for (let i = 0; i < this.validarRollo.length; i++) {
      if (this.validarRollo[i] == item.Id) this.validarRollo.splice(i,1);
    }
    setTimeout(() => { this.GrupoProductos(); }, 100);
  }

  // Funcion que permitirá ver el total de lo escogido para cada producto
  GrupoProductos(){
    let producto : any = [];
    this.grupoProductos = [];
    for (let i = 0; i < this.rollosInsertar.length; i++) {
      if (!producto.includes(this.rollosInsertar[i].IdProducto)) {
        let cantidad : number = 0;
        let cantRollo : number = 0;
        for (let j = 0; j < this.rollosInsertar.length; j++) {
          if (this.rollosInsertar[i].IdProducto == this.rollosInsertar[j].IdProducto) {
            cantidad += this.rollosInsertar[j].Cantidad;
            cantRollo += 1;
          }
        }
        producto.push(this.rollosInsertar[i].IdProducto);
        let info : any = {
          Id : this.rollosInsertar[i].IdProducto,
          Nombre : this.rollosInsertar[i].Producto,
          Cantidad : this.formatonumeros(cantidad.toFixed(2)),
          Cantidad2 : cantidad,
          Rollos: this.formatonumeros(cantRollo.toFixed(2)),
          Presentacion : this.rollosInsertar[i].Presentacion,
        }
        this.grupoProductos.push(info);
      }
    }
    this.cargando = true;
  }

  //Funcion para meter el encabezado de la entrada
  IngresarInfoRollos(){
    if (this.rollosInsertar.length == 0) this.mensajeAdvertencia("¡Debe tener minimo un rollo seleccionado!");
    else {
      this.cargando = false;
      let info : any = {
        EntRolloProd_Fecha : this.today,
        EntRolloProd_Observacion : this.FormConsultarRollos.value.Observacion,
        Usua_Id : this.storage_Id,
        EntRolloProd_Hora : moment().format('H:mm:ss'),
      }
      this.entradaRolloService.srvGuardar(info).subscribe(datos_entradaRollo => {
        this.entradaRolloService.srvObtenerUltimoId().subscribe(datos_ultEntrada => {
          this.ingresarRollos(datos_entradaRollo.entRolloProd_Id);
        });
      }, error => { this.mensajeError('¡Rollos No Ingresados!', `¡Error al ingresar los rollos!`); });
    }
  }

  // Funcion par ingresar los rollos
  ingresarRollos(idEntrada : number){
    for (let i = 0; i < this.rollosInsertar.length; i++) {
      let proceso = this.rollosInsertar[i].Estatus;
      if (proceso == 'Empaque') proceso = 'EMP';
      if (proceso == 'Extrusion') proceso = 'EXT';
      if (proceso == 'Sellado') proceso = 'SELLA';
      this.productosService.srvObtenerListaPorId(parseInt(this.rollosInsertar[i].IdProducto)).subscribe(datos_producto => {
        let productos : any = [];
        productos.push(datos_producto);
        for (const item of productos) {
          if(this.rollosInsertar[i].Presentacion == 'Paquete') {
            let info : any = {
              EntRolloProd_Id : idEntrada,
              Rollo_Id : this.rollosInsertar[i].Id,
              DtEntRolloProd_Cantidad : this.rollosInsertar[i].Cantidad,
              UndMed_Rollo : this.rollosInsertar[i].Presentacion,
              Estado_Id : 19,
              DtEntRolloProd_OT : parseInt(this.rollosInsertar[i].Ot),
              Prod_Id : parseInt(this.rollosInsertar[i].IdProducto),
              UndMed_Prod : this.rollosInsertar[i].Presentacion,
              Prod_CantPaquetesRestantes : this.rollosInsertar[i].Cantidad,
              Prod_CantBolsasPaquete : item.prod_CantBolsasPaquete,
              Prod_CantBolsasBulto : item.prod_CantBolsasBulto,
              Prod_CantBolsasRestates : (this.rollosInsertar[i].Cantidad * item.prod_CantBolsasPaquete),
              Prod_CantBolsasFacturadas : 0,
              Proceso_Id : proceso,
            }
            this.dtEntradaRollosService.srvGuardar(info).subscribe(datos_entrada => { }, error => {
              this.mensajeError('¡Rollos No Ingresados!', `¡No se pudo ingresar la información de cada rollo ingresado!`);
            });
          } else {
            let info : any = {
              EntRolloProd_Id : idEntrada,
              Rollo_Id : this.rollosInsertar[i].Id,
              DtEntRolloProd_Cantidad : this.rollosInsertar[i].Cantidad,
              UndMed_Rollo : this.rollosInsertar[i].Presentacion,
              Estado_Id : 19,
              DtEntRolloProd_OT : parseInt(this.rollosInsertar[i].Ot),
              Prod_Id : parseInt(this.rollosInsertar[i].IdProducto),
              UndMed_Prod : this.rollosInsertar[i].Presentacion,
              Prod_CantPaquetesRestantes : this.rollosInsertar[i].Cantidad,
              Prod_CantBolsasPaquete : item.prod_CantBolsasPaquete,
              Prod_CantBolsasBulto : item.prod_CantBolsasBulto,
              Prod_CantBolsasRestates : this.rollosInsertar[i].Cantidad,
              Prod_CantBolsasFacturadas : 0,
              Proceso_Id : proceso,
            }
            this.dtEntradaRollosService.srvGuardar(info).subscribe(datos_entrada => { }, error => {
              this.mensajeError('¡Rollos No Ingresados!', `¡No se pudo ingresar la información de cada rollo ingresado!`);
            });
          }
        }
      });
    }
    setTimeout(() => { this.InventarioProductos(idEntrada); }, (50 * this.rollosInsertar.length));
  }

  // Funcion para mover el inventario de los productos
  InventarioProductos(idEntrada : any){
    for (let i = 0; i < this.grupoProductos.length; i++) {
      this.ExistenciasProdService.srvObtenerListaPorIdProductoPresentacion(this.grupoProductos[i].Id, this.grupoProductos[i].Presentacion).subscribe(datos_productos => {
        for (let j = 0; j < datos_productos.length; j++) {
          let info : any = {
            Prod_Id: datos_productos[j].prod_Id,
            exProd_Id : datos_productos[j].exProd_Id,
            ExProd_Cantidad: (datos_productos[j].exProd_Cantidad + this.grupoProductos[i].Cantidad2),
            UndMed_Id: datos_productos[j].undMed_Id,
            TpBod_Id: datos_productos[j].tpBod_Id,
            ExProd_Precio: datos_productos[j].exProd_Precio,
            ExProd_PrecioExistencia: (datos_productos[j].exProd_Cantidad + this.grupoProductos[i].Cantidad2) * datos_productos[j].exProd_PrecioVenta,
            ExProd_PrecioSinInflacion: datos_productos[j].exProd_PrecioSinInflacion,
            TpMoneda_Id: datos_productos[j].tpMoneda_Id,
            ExProd_PrecioVenta: datos_productos[j].exProd_PrecioVenta,
          }
          this.ExistenciasProdService.srvActualizar(datos_productos[j].exProd_Id, info).subscribe(datos_existenciaActualizada => {
            this.mensajeConfirmacion('¡Rollos Ingresados!', `¡Entrada de Rollos registrada con exito!`);;
          }, error => {
            this.mensajeError('¡Rollos Ingresados con Er!', `¡Error al mover el inventario del Producto ${datos_productos[j].prod_Id}, mover el inventario manualmente!`);
            this.limpiarCampos();
          });
        }
      });
    }
    if (this.grupoProductos.length > 10) setTimeout(() => { this.buscarRolloPDF(idEntrada); }, 3000);
    else setTimeout(() => { this.buscarRolloPDF(idEntrada); }, 1000);
  }

  // Funcion que creará un pdf a base de la informacion ingresada en las asignacion de rollos a facturas
  crearPDF(id : number){
    let nombre : string = this.storage.get('Nombre');
    this.dtEntradaRollosService.srvCrearPDFUltimoId(id).subscribe(datos_factura => {
      for (let i = 0; i < datos_factura.length; i++) {
        for (let j = 0; j < this.rollosAsignados.length; j++) {
          const pdfDefinicion : any = {
            info: {
              title: `${id}`
            },
            pageSize: {
              width: 630,
              height: 760
            },
            footer: function(currentPage : any, pageCount : any) {
              return [
                {
                  columns: [
                    { text: `Reporte generado por ${nombre}`, alignment: ' left', fontSize: 8, margin: [30, 0, 0, 0] },
                    { text: `Fecha Expedición Documento ${moment().format('YYYY-MM-DD')} - ${moment().format('H:mm:ss')}`, alignment: 'right', fontSize: 8 },
                    { text: `${currentPage.toString() + ' de ' + pageCount}`, alignment: 'right', fontSize: 8, margin: [0, 0, 30, 0] },
                  ]
                }
              ]
            },
            content : [
              {
                columns: [
                  {
                    image : logoParaPdf,
                    width : 220,
                    height : 50
                  },
                  {
                    text: `Cargue de Rollos`,
                    alignment: 'right',
                    style: 'titulo',
                    margin: 30
                  }
                ]
              },
              '\n \n',
              {
                style: 'tablaEmpresa',
                table: {
                  widths: [90, '*', 90, '*'],
                  style: 'header',
                  body: [
                    [
                      {
                        border: [false, false, false, false],
                        text: `Nombre Empresa`
                      },
                      {
                        border: [false, false, false, true],
                        text: `Plasticaribe S.A.S`
                      },
                      {
                        border: [false, false, false, false],
                        text: `Fecha`
                      },
                      {
                        border: [false, false, false, true],
                        text: `${datos_factura[i].entRolloProd_Fecha.replace('T00:00:00', '')}`
                      },
                    ],
                    [
                      {
                        border: [false, false, false, false],
                        text: `Dirección`
                      },
                      {
                        border: [false, false, false, true],
                        text: `${datos_factura[i].empresa_Direccion}`
                      },
                      {
                        border: [false, false, false, false],
                        text: `Ciudad`
                      },
                      {
                        border: [false, false, false, true],
                        text: `${datos_factura[i].empresa_Ciudad}`
                      },
                    ],
                  ]
                },
                layout: {
                  defaultBorder: false,
                },
                fontSize: 9,
              },
              '\n \n',
              {
                text: `Ingresado Por: ${datos_factura[i].nombreCreador}\n`,
                alignment: 'left',
                style: 'header',
              },
              {
                text: `\n\n Consolidado de producto(s) \n `,
                alignment: 'center',
                style: 'header'
              },
              this.table2(this.grupoProductos, ['Id', 'Nombre', 'Cantidad', 'Rollos', 'Presentacion']),
              {
                text: `\n\n Información detallada de los Rollos \n `,
                alignment: 'center',
                style: 'header'
              },

              this.table(this.rollosAsignados, ['Rollo', 'Producto', 'Nombre', 'Cantidad', 'Presentacion']),
              {
                text: `\nCant. Total: ${this.formatonumeros(this.Total.toFixed(2))}\n`,
                alignment: 'right',
                style: 'header',
              },
            ],
            styles: {
              header: {
                fontSize: 10,
                bold: true
              },
              titulo: {
                fontSize: 20,
                bold: true
              }
            }
          }
          const pdf = pdfMake.createPdf(pdfDefinicion);
          pdf.open();
          setTimeout(() => { (this.limpiarCampos()); }, 1200);
          break;
        }
        break;
      }
    });
  }

  // Funcion que traerá los rollos que fueron asignados a la factura creada
  buscarRolloPDF(id : number){
    this.dtEntradaRollosService.srvCrearPDFUltimoId(id).subscribe(datos_factura => {
      for (let i = 0; i < datos_factura.length; i++) {
        let info : any = {
          Rollo : datos_factura[i].rollo_Id,
          Producto : datos_factura[i].prod_Id,
          Nombre : datos_factura[i].prod_Nombre,
          Cantidad : this.formatonumeros(datos_factura[i].dtEntRolloProd_Cantidad),
          Presentacion : datos_factura[i].undMed_Rollo,
        }
        this.rollosAsignados.push(info);
        this.rollosAsignados.sort((a,b) => Number(a.Rollo) - Number(b.Rollo));
      }
    });
    setTimeout(() => { this.crearPDF(id); }, 2000);
  }

  // funcion que se encagará de llenar la tabla de los productos en el pdf
  buildTableBody(data, columns) {
    var body = [];
    body.push(columns);
    data.forEach(function(row) {
      var dataRow = [];
      columns.forEach(function(column) {
        dataRow.push(row[column].toString());
      });
      body.push(dataRow);
    });

    return body;
  }

  // Funcion que genera la tabla donde se mostrará la información de los productos pedidos
  table(data, columns) {
    return {
        table: {
          headerRows: 1,
          widths: [40, 50, 310, 50, 60],
          body: this.buildTableBody(data, columns),
        },
        fontSize: 7,
        layout: {
          fillColor: function (rowIndex, node, columnIndex) {
            return (rowIndex == 0) ? '#CCCCCC' : null;
          }
        }
    };
  }

  // Funcion que genera la tabla donde se mostrará la información de los productos pedidos
  table2(data, columns) {
    return {
        table: {
          headerRows: 1,
          widths: [60, 260, 70, 40, 80],
          body: this.buildTableBody(data, columns),
        },
        fontSize: 7,
        layout: {
          fillColor: function (rowIndex, node, columnIndex) {
            return (rowIndex == 0) ? '#CCCCCC' : null;
          }
        }
    };
  }

  // Funcion que devolverá un mensaje de satisfactorio
  mensajeConfirmacion(titulo : string, mensaje : any) {
    this.messageService.add({severity:'success', summary: titulo, detail: mensaje, life: 2000});
    this.cargando = true;
  }

  // Funcion que va a devolver un mensaje de error
  mensajeError(titulo : string, mensaje : any) {
    this.messageService.add({severity:'error', summary: titulo, detail: mensaje, life: 2000});
    this.cargando = true;
  }

  // Funcion que va a devolver un mensaje de advertencia
  mensajeAdvertencia(mensaje : any) {
    this.messageService.add({severity:'warn', summary: '¡Advertencia!', detail: mensaje, life: 1500});
    this.cargando = true;
  }
}
