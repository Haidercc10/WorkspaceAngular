import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { CookieService } from 'ngx-cookie-service';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import pdfMake from 'pdfmake/build/pdfmake';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { DtIngRollos_ExtrusionService } from 'src/app/Servicios/DetallesIngresoRollosExtrusion/DtIngRollos_Extrusion.service';
import { IngRollos_ExtrusuionService } from 'src/app/Servicios/IngresoRollosBodegaExtrusion/IngRollos_Extrusuion.service';
import { RolesService } from 'src/app/Servicios/Roles/roles.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-IngresoRollos_Extrusion',
  templateUrl: './IngresoRollos_Extrusion.component.html',
  styleUrls: ['./IngresoRollos_Extrusion.component.css']
})
export class IngresoRollos_ExtrusionComponent implements OnInit {

  public FormConsultarRollos !: FormGroup; //formulario para consultar y crear un ingreso de rollos
  cargando : boolean = true; //Variable para validar que salga o no la imagen de carga
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  grupoProductos : any [] = []; //Variable que guardará de manera descriminada a cada producto
  rollosSinIngresar : number = 0; // variable para calcular la cantidad de rollos que no se han ingresado
  rollosIngresados : number = 0; //variable para calcular la cantidad de rollos que se han ingresado
  rollos : any [] = []; //Variable que almacenará los difrentes rollos que se hicieron en la orden de trabajo
  rollosInsertar : any [] = []; //Variable que va a amacenar los diferentes rollos que se van a insertar
  validarRollo : any [] = []; //Variable para validará que el rollo no esté en la tabla
  first = 0;
  rows = 20;
  totalRollos : number = 0;
  totalCantidad : number = 0;
  rollosPDF : any [] = [];

  constructor(private frmBuilderPedExterno : FormBuilder,
                private rolService : RolesService,
                  private cookieServices : CookieService,
                    @Inject(SESSION_STORAGE) private storage: WebStorageService,
                      private bagProService : BagproService,
                        private IngRollosService : IngRollos_ExtrusuionService,
                          private dtIngRollosService : DtIngRollos_ExtrusionService,) {

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
  }

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number) => {
    const exp = /(\d)(?=(\d{3})+(?!\d))/g;
    const rep = '$1,';
    return number.toString().replace(exp,rep);
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador y leerá la información de las cookies
  lecturaStorage(){
    this.storage_Id = this.storage.get('Id');
    this.storage_Nombre = this.storage.get('Nombre');
    let rol = this.storage.get('Rol');
    this.rolService.srvObtenerLista().subscribe(datos_roles => {
      for (let index = 0; index < datos_roles.length; index++) {
        if (datos_roles[index].rolUsu_Id == rol) {
          this.ValidarRol = rol;
          this.storage_Rol = datos_roles[index].rolUsu_Nombre;
        }
      }
    });
  }

  // funcion que va a limpiar los campos del formulario
  limpiarForm(){
    this.FormConsultarRollos.setValue({
      OT_Id: null,
      IdRollo: null,
      fechaDoc : null,
      fechaFinalDoc: null,
      Observacion : '',
      Proceso : null,
    });
  }

  // Funcion que va a limpiar todos los campos
  limpiarCampos(){
    this.FormConsultarRollos.setValue({
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
    this.rollosIngresados = 0,
    this.rollosSinIngresar = 0,
    this,this.totalCantidad = 0;
    this.totalRollos = 0;
    this.cargando = true;
  }

  //Funcion que traerá los diferentes rollos que se hicieron en la orden de trabajo
  consultarOTbagPro(){
    let ot : number = this.FormConsultarRollos.value.OT_Id;
    let fechaInicial : any = this.FormConsultarRollos.value.fechaDoc;
    let fechaFinal : any = this.FormConsultarRollos.value.fechaFinalDoc;
    let rollo : number = this.FormConsultarRollos.value.IdRollo;
    let proceso = 'EXT';
    this.rollosSinIngresar = 0;
    this.rollosIngresados = 0;
    let rollos : any = [];
    let consulta : number;

    if (!moment(fechaInicial).isBefore('2022-09-23', 'days') && !moment(fechaFinal).isBefore('2022-09-23', 'days')) {
      this.rollos = [];
      this.rollosInsertar = [];
      this.grupoProductos = [];
      let RollosConsultados : any [] = [];
      let otTemporral : number = 0;
      this.cargando = false;

      this.dtIngRollosService.consultarRollos().subscribe(datos_rollos => {
        for (let i = 0; i < datos_rollos.length; i++) {
          rollos.push(datos_rollos[i]);
        }
      });

      setTimeout(() => {
        if (ot != null && fechaInicial != null && fechaFinal != null) {
          this.bagProService.srvObtenerListaProcExtrusionFechasOT(fechaInicial, fechaFinal, ot).subscribe(datos_ot => {
            consulta = datos_ot.length;
            for (let i = 0; i < datos_ot.length; i++) {
              if (moment(datos_ot[i].fecha.replace('T00:00:00', '')).isBetween('2022-09-23', undefined)) {
                if (!rollos.includes(datos_ot[i].item) && !RollosConsultados.includes(datos_ot[i].item) && datos_ot[i].nomStatus == 'EXTRUSION') {
                  let info : any = {
                    Ot : datos_ot[i].ot,
                    Id : datos_ot[i].item,
                    IdCliente : datos_ot[i].identNro,
                    Cliente : datos_ot[i].nombreComercial,
                    IdProducto : datos_ot[i].clienteItem,
                    Producto : datos_ot[i].clienteItemNombre,
                    Cantidad : datos_ot[i].extnetokg,
                    Presentacion : datos_ot[i].unidad,
                    Estatus : datos_ot[i].nomStatus,
                    Proceso : 'EXT',
                    exits : false,
                    Fecha : datos_ot[i].fecha.replace('T00:00:00', ''),
                  }
                  this.rollosSinIngresar += 1;
                  otTemporral = datos_ot[i].ot;
                  this.rollos.push(info);
                  RollosConsultados.push(datos_ot[i].item);
                  this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
                  this.rollos.sort((a,b) => Number(a.exits) - Number(b.exits) );
                  this.FormConsultarRollos.setValue({
                    OT_Id: this.FormConsultarRollos.value.OT_Id,
                    IdRollo : this.FormConsultarRollos.value.IdRollo,
                    fechaDoc : this.FormConsultarRollos.value.fechaDoc,
                    fechaFinalDoc: this.FormConsultarRollos.value.fechaFinalDoc,
                    Observacion : this.FormConsultarRollos.value.Observacion,
                    Proceso : this.FormConsultarRollos.value.Proceso,
                  });
                }else if (rollos.includes(datos_ot[i].item) && !RollosConsultados.includes(datos_ot[i].item) && datos_ot[i].nomStatus == 'EXTRUSION') {
                  let info : any = {
                    Ot : datos_ot[i].ot,
                    Id : datos_ot[i].item,
                    IdCliente : datos_ot[i].identNro,
                    Cliente : datos_ot[i].nombreComercial,
                    IdProducto : datos_ot[i].clienteItem,
                    Producto : datos_ot[i].clienteItemNombre,
                    Cantidad : datos_ot[i].extnetokg,
                    Presentacion : datos_ot[i].unidad,
                    Estatus : datos_ot[i].nomStatus,
                    Proceso : 'EXT',
                    exits : true,
                    Fecha : datos_ot[i].fecha.replace('T00:00:00', ''),
                  }
                  otTemporral = datos_ot[i].ot;
                  this.rollos.push(info);
                  RollosConsultados.push(datos_ot[i].item);
                  this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
                  this.rollos.sort((a,b) => Number(a.exits) - Number(b.exits) );
                  this.FormConsultarRollos.setValue({
                    OT_Id: this.FormConsultarRollos.value.OT_Id,
                    IdRollo : this.FormConsultarRollos.value.IdRollo,
                    fechaDoc : this.FormConsultarRollos.value.fechaDoc,
                    fechaFinalDoc: this.FormConsultarRollos.value.fechaFinalDoc,
                    Observacion : this.FormConsultarRollos.value.Observacion,
                    Proceso : this.FormConsultarRollos.value.Proceso,
                  });
                }
              }
            }
          });
        } else if (fechaInicial != null &&  fechaFinal != null) {
          this.bagProService.srvObtenerListaProcExtrusionFechas(fechaInicial, fechaFinal).subscribe(datos_ot => {
            consulta = datos_ot.length;
            for (let i = 0; i < datos_ot.length; i++) {
              if (moment(datos_ot[i].fecha.replace('T00:00:00', '')).isBetween('2022-09-23', undefined)) {
                if (!rollos.includes(datos_ot[i].item) && !RollosConsultados.includes(datos_ot[i].item) && datos_ot[i].nomStatus == 'EXTRUSION') {
                  let info : any = {
                    Ot : datos_ot[i].ot,
                    Id : datos_ot[i].item,
                    IdCliente : datos_ot[i].identNro,
                    Cliente : datos_ot[i].nombreComercial,
                    IdProducto : datos_ot[i].clienteItem,
                    Producto : datos_ot[i].clienteItemNombre,
                    Cantidad : datos_ot[i].extnetokg,
                    Presentacion : datos_ot[i].unidad,
                    Estatus : datos_ot[i].nomStatus,
                    Proceso : 'EXT',
                    exits : false,
                    Fecha : datos_ot[i].fecha.replace('T00:00:00', ''),
                  }
                  this.rollosSinIngresar += 1;
                  otTemporral = datos_ot[i].ot;
                  this.rollos.push(info);
                  RollosConsultados.push(datos_ot[i].item);
                  this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
                  this.rollos.sort((a,b) => Number(a.exits) - Number(b.exits) );
                  this.FormConsultarRollos.setValue({
                    OT_Id: this.FormConsultarRollos.value.OT_Id,
                    IdRollo : this.FormConsultarRollos.value.IdRollo,
                    fechaDoc : this.FormConsultarRollos.value.fechaDoc,
                    fechaFinalDoc: this.FormConsultarRollos.value.fechaFinalDoc,
                    Observacion : this.FormConsultarRollos.value.Observacion,
                    Proceso : this.FormConsultarRollos.value.Proceso,
                  });
                }else if (rollos.includes(datos_ot[i].item) && !RollosConsultados.includes(datos_ot[i].item) && datos_ot[i].nomStatus == 'EXTRUSION') {
                  let info : any = {
                    Ot : datos_ot[i].ot,
                    Id : datos_ot[i].item,
                    IdCliente : datos_ot[i].identNro,
                    Cliente : datos_ot[i].nombreComercial,
                    IdProducto : datos_ot[i].clienteItem,
                    Producto : datos_ot[i].clienteItemNombre,
                    Cantidad : datos_ot[i].extnetokg,
                    Presentacion : datos_ot[i].unidad,
                    Estatus : datos_ot[i].nomStatus,
                    Proceso : 'EXT',
                    exits : true,
                    Fecha : datos_ot[i].fecha.replace('T00:00:00', ''),
                  }
                  this.rollosIngresados += 1;
                  otTemporral = datos_ot[i].ot;
                  this.rollos.push(info);
                  RollosConsultados.push(datos_ot[i].item);
                  this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
                  this.rollos.sort((a,b) => Number(a.exits) - Number(b.exits) );
                  this.FormConsultarRollos.setValue({
                    OT_Id: this.FormConsultarRollos.value.OT_Id,
                    IdRollo : this.FormConsultarRollos.value.IdRollo,
                    fechaDoc : this.FormConsultarRollos.value.fechaDoc,
                    fechaFinalDoc: this.FormConsultarRollos.value.fechaFinalDoc,
                    Observacion : this.FormConsultarRollos.value.Observacion,
                    Proceso : this.FormConsultarRollos.value.Proceso,
                  });
                }
              }
            }
          });
        } else if (ot != null && fechaInicial != null) {
          this.bagProService.srvObtenerListaProcExtrusionFechasOT(fechaInicial, fechaInicial, ot).subscribe(datos_ot => {
            consulta = datos_ot.length;
            for (let i = 0; i < datos_ot.length; i++) {
              if (moment(datos_ot[i].fecha.replace('T00:00:00', '')).isBetween('2022-09-23', undefined)) {
                if (!rollos.includes(datos_ot[i].item) && !RollosConsultados.includes(datos_ot[i].item) && datos_ot[i].nomStatus == 'EXTRUSION') {
                  let info : any = {
                    Ot : datos_ot[i].ot,
                    Id : datos_ot[i].item,
                    IdCliente : datos_ot[i].identNro,
                    Cliente : datos_ot[i].nombreComercial,
                    IdProducto : datos_ot[i].clienteItem,
                    Producto : datos_ot[i].clienteItemNombre,
                    Cantidad : datos_ot[i].extnetokg,
                    Presentacion : datos_ot[i].unidad,
                    Estatus : datos_ot[i].nomStatus,
                    Proceso : 'EXT',
                    exits : false,
                    Fecha : datos_ot[i].fecha.replace('T00:00:00', ''),
                  }
                  this.rollosSinIngresar += 1;
                  otTemporral = datos_ot[i].ot;
                  this.rollos.push(info);
                  RollosConsultados.push(datos_ot[i].item);
                  this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
                  this.rollos.sort((a,b) => Number(a.exits) - Number(b.exits) );
                  this.FormConsultarRollos.setValue({
                    OT_Id: this.FormConsultarRollos.value.OT_Id,
                    IdRollo : this.FormConsultarRollos.value.IdRollo,
                    fechaDoc : this.FormConsultarRollos.value.fechaDoc,
                    fechaFinalDoc: this.FormConsultarRollos.value.fechaFinalDoc,
                    Observacion : this.FormConsultarRollos.value.Observacion,
                    Proceso : this.FormConsultarRollos.value.Proceso,
                  });
                }else if (rollos.includes(datos_ot[i].item) && !RollosConsultados.includes(datos_ot[i].item) && datos_ot[i].nomStatus == 'EXTRUSION') {
                  let info : any = {
                    Ot : datos_ot[i].ot,
                    Id : datos_ot[i].item,
                    IdCliente : datos_ot[i].identNro,
                    Cliente : datos_ot[i].nombreComercial,
                    IdProducto : datos_ot[i].clienteItem,
                    Producto : datos_ot[i].clienteItemNombre,
                    Cantidad : datos_ot[i].extnetokg,
                    Presentacion : datos_ot[i].unidad,
                    Estatus : datos_ot[i].nomStatus,
                    Proceso : 'EXT',
                    exits : true,
                    Fecha : datos_ot[i].fecha.replace('T00:00:00', ''),
                  }
                  this.rollosIngresados += 1;
                  otTemporral = datos_ot[i].ot;
                  this.rollos.push(info);
                  RollosConsultados.push(datos_ot[i].item);
                  this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
                  this.rollos.sort((a,b) => Number(a.exits) - Number(b.exits) );
                  this.FormConsultarRollos.setValue({
                    OT_Id: this.FormConsultarRollos.value.OT_Id,
                    IdRollo : this.FormConsultarRollos.value.IdRollo,
                    fechaDoc : this.FormConsultarRollos.value.fechaDoc,
                    fechaFinalDoc: this.FormConsultarRollos.value.fechaFinalDoc,
                    Observacion : this.FormConsultarRollos.value.Observacion,
                    Proceso : this.FormConsultarRollos.value.Proceso,
                  });
                }
              }
            }
          });
        } else if (fechaInicial != null) {
          this.bagProService.srvObtenerListaProcExtrusionFechas(fechaInicial, fechaInicial).subscribe(datos_ot => {
            consulta = datos_ot.length;
            for (let i = 0; i < datos_ot.length; i++) {
              if (moment(datos_ot[i].fecha.replace('T00:00:00', '')).isBetween('2022-09-23', undefined)) {
                if (!rollos.includes(datos_ot[i].item) && !RollosConsultados.includes(datos_ot[i].item) && datos_ot[i].nomStatus == 'EXTRUSION') {
                  let info : any = {
                    Ot : datos_ot[i].ot,
                    Id : datos_ot[i].item,
                    IdCliente : datos_ot[i].identNro,
                    Cliente : datos_ot[i].nombreComercial,
                    IdProducto : datos_ot[i].clienteItem,
                    Producto : datos_ot[i].clienteItemNombre,
                    Cantidad : datos_ot[i].extnetokg,
                    Presentacion : datos_ot[i].unidad,
                    Estatus : datos_ot[i].nomStatus,
                    Proceso : 'EXT',
                    exits : false,
                    Fecha : datos_ot[i].fecha.replace('T00:00:00', ''),
                  }
                  this.rollosSinIngresar += 1;
                  otTemporral = datos_ot[i].ot;
                  this.rollos.push(info);
                  RollosConsultados.push(datos_ot[i].item);
                  this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
                  this.rollos.sort((a,b) => Number(a.exits) - Number(b.exits) );
                  this.FormConsultarRollos.setValue({
                    OT_Id: this.FormConsultarRollos.value.OT_Id,
                    IdRollo : this.FormConsultarRollos.value.IdRollo,
                    fechaDoc : this.FormConsultarRollos.value.fechaDoc,
                    fechaFinalDoc: this.FormConsultarRollos.value.fechaFinalDoc,
                    Observacion : this.FormConsultarRollos.value.Observacion,
                    Proceso : this.FormConsultarRollos.value.Proceso,
                  });
                }else if (rollos.includes(datos_ot[i].item) && !RollosConsultados.includes(datos_ot[i].item) && datos_ot[i].nomStatus == 'EXTRUSION') {
                  let info : any = {
                    Ot : datos_ot[i].ot,
                    Id : datos_ot[i].item,
                    IdCliente : datos_ot[i].identNro,
                    Cliente : datos_ot[i].nombreComercial,
                    IdProducto : datos_ot[i].clienteItem,
                    Producto : datos_ot[i].clienteItemNombre,
                    Cantidad : datos_ot[i].extnetokg,
                    Presentacion : datos_ot[i].unidad,
                    Estatus : datos_ot[i].nomStatus,
                    Proceso : 'EXT',
                    exits : true,
                    Fecha : datos_ot[i].fecha.replace('T00:00:00', ''),
                  }
                  this.rollosIngresados += 1;
                  otTemporral = datos_ot[i].ot;
                  this.rollos.push(info);
                  RollosConsultados.push(datos_ot[i].item);
                  this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
                  this.rollos.sort((a,b) => Number(a.exits) - Number(b.exits) );
                  this.FormConsultarRollos.setValue({
                    OT_Id: this.FormConsultarRollos.value.OT_Id,
                    IdRollo : this.FormConsultarRollos.value.IdRollo,
                    fechaDoc : this.FormConsultarRollos.value.fechaDoc,
                    fechaFinalDoc: this.FormConsultarRollos.value.fechaFinalDoc,
                    Observacion : this.FormConsultarRollos.value.Observacion,
                    Proceso : this.FormConsultarRollos.value.Proceso,
                  });
                }
              }
            }
          });
        } else if (ot != null) {
          this.bagProService.srvObtenerListaProcExtrusionRollosOT(ot).subscribe(datos_ot => {
            consulta = datos_ot.length;
            for (let i = 0; i < datos_ot.length; i++) {
              if (moment(datos_ot[i].fecha.replace('T00:00:00', '')).isBetween('2022-09-23', undefined)) {
                if (!rollos.includes(datos_ot[i].item) && !RollosConsultados.includes(datos_ot[i].item) && datos_ot[i].nomStatus == 'EXTRUSION') {
                  let info : any = {
                    Ot : datos_ot[i].ot,
                    Id : datos_ot[i].item,
                    IdCliente : datos_ot[i].identNro,
                    Cliente : datos_ot[i].nombreComercial,
                    IdProducto : datos_ot[i].clienteItem,
                    Producto : datos_ot[i].clienteItemNombre,
                    Cantidad : datos_ot[i].extnetokg,
                    Presentacion : datos_ot[i].unidad,
                    Estatus : datos_ot[i].nomStatus,
                    Proceso : 'EXT',
                    exits : false,
                    Fecha : datos_ot[i].fecha.replace('T00:00:00', ''),
                  }
                  this.rollosSinIngresar += 1;
                  otTemporral = datos_ot[i].ot;
                  this.rollos.push(info);
                  RollosConsultados.push(datos_ot[i].item);
                  this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
                  this.rollos.sort((a,b) => Number(a.exits) - Number(b.exits) );
                  this.FormConsultarRollos.setValue({
                    OT_Id: this.FormConsultarRollos.value.OT_Id,
                    IdRollo : this.FormConsultarRollos.value.IdRollo,
                    fechaDoc : this.FormConsultarRollos.value.fechaDoc,
                    fechaFinalDoc: this.FormConsultarRollos.value.fechaFinalDoc,
                    Observacion : this.FormConsultarRollos.value.Observacion,
                    Proceso : this.FormConsultarRollos.value.Proceso,
                  });
                }else if (rollos.includes(datos_ot[i].item) && !RollosConsultados.includes(datos_ot[i].item) && datos_ot[i].nomStatus == 'EXTRUSION') {
                  let info : any = {
                    Ot : datos_ot[i].ot,
                    Id : datos_ot[i].item,
                    IdCliente : datos_ot[i].identNro,
                    Cliente : datos_ot[i].nombreComercial,
                    IdProducto : datos_ot[i].clienteItem,
                    Producto : datos_ot[i].clienteItemNombre,
                    Cantidad : datos_ot[i].extnetokg,
                    Presentacion : datos_ot[i].unidad,
                    Estatus : datos_ot[i].nomStatus,
                    Proceso : proceso,
                    exits : true,
                    Fecha : datos_ot[i].fecha.replace('T00:00:00', ''),
                  }
                  this.rollosIngresados += 1;
                  otTemporral = datos_ot[i].ot;
                  this.rollos.push(info);
                  RollosConsultados.push(datos_ot[i].item);
                  this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
                  this.rollos.sort((a,b) => Number(a.exits) - Number(b.exits) );
                  this.FormConsultarRollos.setValue({
                    OT_Id: this.FormConsultarRollos.value.OT_Id,
                    IdRollo : this.FormConsultarRollos.value.IdRollo,
                    fechaDoc : this.FormConsultarRollos.value.fechaDoc,
                    fechaFinalDoc: this.FormConsultarRollos.value.fechaFinalDoc,
                    Observacion : this.FormConsultarRollos.value.Observacion,
                    Proceso : this.FormConsultarRollos.value.Proceso,
                  });
                }
              }
            }
          });
        } else if (rollo != null) {
          this.bagProService.srvObtenerListaProcExtrusionRollos(rollo).subscribe(datos_ot => {
            consulta = datos_ot.length;
            for (let i = 0; i < datos_ot.length; i++) {
              if (moment(datos_ot[i].fecha.replace('T00:00:00', '')).isBetween('2022-09-23', undefined)) {
                if (!rollos.includes(datos_ot[i].item) && !RollosConsultados.includes(datos_ot[i].item) && datos_ot[i].nomStatus == 'EXTRUSION') {
                  let info : any = {
                    Ot : datos_ot[i].ot,
                    Id : datos_ot[i].item,
                    IdCliente : datos_ot[i].identNro,
                    Cliente : datos_ot[i].nombreComercial,
                    IdProducto : datos_ot[i].clienteItem,
                    Producto : datos_ot[i].clienteItemNombre,
                    Cantidad : datos_ot[i].extnetokg,
                    Presentacion : datos_ot[i].unidad,
                    Estatus : datos_ot[i].nomStatus,
                    Proceso : proceso,
                    exits : false,
                    Fecha : datos_ot[i].fecha.replace('T00:00:00', ''),
                  }
                  this.rollosSinIngresar += 1;
                  otTemporral = datos_ot[i].ot;
                  this.rollos.push(info);
                  RollosConsultados.push(datos_ot[i].item);
                  this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
                  this.rollos.sort((a,b) => Number(a.exits) - Number(b.exits) );
                  this.FormConsultarRollos.setValue({
                    OT_Id: this.FormConsultarRollos.value.OT_Id,
                    IdRollo : this.FormConsultarRollos.value.IdRollo,
                    fechaDoc : this.FormConsultarRollos.value.fechaDoc,
                    fechaFinalDoc: this.FormConsultarRollos.value.fechaFinalDoc,
                    Observacion : this.FormConsultarRollos.value.Observacion,
                    Proceso : this.FormConsultarRollos.value.Proceso,
                  });
                }else if (rollos.includes(datos_ot[i].item) && !RollosConsultados.includes(datos_ot[i].item) && datos_ot[i].nomStatus == 'EXTRUSION') {
                  let info : any = {
                    Ot : datos_ot[i].ot,
                    Id : datos_ot[i].item,
                    IdCliente : datos_ot[i].identNro,
                    Cliente : datos_ot[i].nombreComercial,
                    IdProducto : datos_ot[i].clienteItem,
                    Producto : datos_ot[i].clienteItemNombre,
                    Cantidad : datos_ot[i].extnetokg,
                    Presentacion : datos_ot[i].unidad,
                    Estatus : datos_ot[i].nomStatus,
                    Proceso : proceso,
                    exits : true,
                    Fecha : datos_ot[i].fecha.replace('T00:00:00', ''),
                  }
                  this.rollosIngresados += 1;
                  otTemporral = datos_ot[i].ot;
                  this.rollos.push(info);
                  RollosConsultados.push(datos_ot[i].item);
                  this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
                  this.rollos.sort((a,b) => Number(a.exits) - Number(b.exits) );
                  this.FormConsultarRollos.setValue({
                    OT_Id: this.FormConsultarRollos.value.OT_Id,
                    IdRollo : this.FormConsultarRollos.value.IdRollo,
                    fechaDoc : this.FormConsultarRollos.value.fechaDoc,
                    fechaFinalDoc: this.FormConsultarRollos.value.fechaFinalDoc,
                    Observacion : this.FormConsultarRollos.value.Observacion,
                    Proceso : this.FormConsultarRollos.value.Proceso,
                  });
                }
              }
            }
          });
        } else {
          this.bagProService.srvObtenerListaProcExtrusionFechas(this.today, this.today).subscribe(datos_ot => {
            consulta = datos_ot.length;
            for (let i = 0; i < datos_ot.length; i++) {
              if (!rollos.includes(datos_ot[i].item) && !RollosConsultados.includes(datos_ot[i].item) && datos_ot[i].nomStatus == 'EXTRUSION') {
                let info : any = {
                  Ot : datos_ot[i].ot,
                  Id : datos_ot[i].item,
                  IdCliente : datos_ot[i].identNro,
                  Cliente : datos_ot[i].nombreComercial,
                  IdProducto : datos_ot[i].clienteItem,
                  Producto : datos_ot[i].clienteItemNombre,
                  Cantidad : datos_ot[i].extnetokg,
                  Presentacion : datos_ot[i].unidad,
                  Estatus : datos_ot[i].nomStatus,
                  Proceso : proceso,
                  exits : false,
                  Fecha : datos_ot[i].fecha.replace('T00:00:00', ''),
                }
                this.rollosSinIngresar += 1;
                otTemporral = datos_ot[i].ot;
                this.rollos.push(info);
                RollosConsultados.push(datos_ot[i].item);
                this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
                this.rollos.sort((a,b) => Number(a.exits) - Number(b.exits) );
                this.FormConsultarRollos.setValue({
                  OT_Id: this.FormConsultarRollos.value.OT_Id,
                  IdRollo : this.FormConsultarRollos.value.IdRollo,
                  fechaDoc : this.FormConsultarRollos.value.fechaDoc,
                  fechaFinalDoc: this.FormConsultarRollos.value.fechaFinalDoc,
                  Observacion : this.FormConsultarRollos.value.Observacion,
                  Proceso : this.FormConsultarRollos.value.Proceso,
                });
              }else if (rollos.includes(datos_ot[i].item) && !RollosConsultados.includes(datos_ot[i].item) && datos_ot[i].nomStatus == 'EXTRUSION') {
                let info : any = {
                  Ot : datos_ot[i].ot,
                  Id : datos_ot[i].item,
                  IdCliente : datos_ot[i].identNro,
                  Cliente : datos_ot[i].nombreComercial,
                  IdProducto : datos_ot[i].clienteItem,
                  Producto : datos_ot[i].clienteItemNombre,
                  Cantidad : datos_ot[i].extnetokg,
                  Presentacion : datos_ot[i].unidad,
                  Estatus : datos_ot[i].nomStatus,
                  Proceso : proceso,
                  exits : true,
                  Fecha : datos_ot[i].fecha.replace('T00:00:00', ''),
                }
                this.rollosIngresados += 1;
                otTemporral = datos_ot[i].ot;
                this.rollos.push(info);
                RollosConsultados.push(datos_ot[i].item);
                this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
                this.rollos.sort((a,b) => Number(a.exits) - Number(b.exits) );
                this.FormConsultarRollos.setValue({
                  OT_Id: this.FormConsultarRollos.value.OT_Id,
                  IdRollo : this.FormConsultarRollos.value.IdRollo,
                  fechaDoc : this.FormConsultarRollos.value.fechaDoc,
                  fechaFinalDoc: this.FormConsultarRollos.value.fechaFinalDoc,
                  Observacion : this.FormConsultarRollos.value.Observacion,
                  Proceso : this.FormConsultarRollos.value.Proceso,
                });
              }
            }
          });
        }

        setTimeout(() => {
          if (consulta <= 0) Swal.fire(`No hay rollos por ingresar`);
          this.cargando = true;
        }, 4000);
      }, 3000);
    } else Swal.fire("¡La fecha seleccionada no es valida!");
  }

  // Funcion que colocará los rollos que se van a insertar
  llenarRollosAIngresar(item : any){
    for (let i = 0; i < this.rollos.length; i++) {
      if (this.rollos[i].Id == item.Id) this.rollos.splice(i, 1);
    }
    this.rollosInsertar.sort((a,b) => Number(a.Id) - Number(b.Id) );
    this.rollosInsertar.sort((a,b) => Number(a.exits) - Number(b.exits) );
    this.GrupoProductos();
  }

  // Funcion que seleccionará y colocará todos los rollos que se van a insertar
  seleccionarTodosRollos(item : any){
    this.rollos = [];
    for (let i = 0; i < item.length; i++) {
      if (item[i].exits == true) this.rollos.push(item[i]);
    }
    this.rollosInsertar.sort((a,b) => Number(a.Id) - Number(b.Id) );
    this.rollosInsertar.sort((a,b) => Number(a.exits) - Number(b.exits) );
    this.GrupoProductos();
  }

  //Funcion que va a quitar lo rollos que se van a insertar
  quitarRollosAIngresar(item : any){
    for (let i = 0; i < this.rollosInsertar.length; i++) {
      if (this.rollosInsertar[i].Id == item.Id) this.rollosInsertar.splice(i, 1);
    }
    this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
    this.rollos.sort((a,b) => Number(a.exits) - Number(b.exits) );
    this.GrupoProductos();
  }

  // Funcion que va a quitar todos los rollos que se van a insertar
  quitarTodosRollos(item : any){
    this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
    this.rollos.sort((a,b) => Number(a.exits) - Number(b.exits) );
    this.rollosInsertar = [];
    this.GrupoProductos();
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
          if (this.rollosInsertar[i].IdProducto == this.rollosInsertar[j].IdProducto && !this.rollosInsertar[j].exits && !this.rollosInsertar[j].exits) {
            cantidad += this.rollosInsertar[j].Cantidad;
            cantRollo += 1;
          }
        }
        if (cantRollo > 0){
          producto.push(this.rollosInsertar[i].IdProducto);
          let info : any = {
            Ot: this.rollosInsertar[i].Ot,
            Id : this.rollosInsertar[i].IdProducto,
            Nombre : this.rollosInsertar[i].Producto,
            Cantidad : this.formatonumeros(cantidad.toFixed(2)),
            Cantidad2 : cantidad,
            Rollos: this.formatonumeros(cantRollo),
            Rollos2: cantRollo,
            Presentacion : this.rollosInsertar[i].Presentacion,
          }
          this.grupoProductos.push(info);
        }
      }
    }
    setTimeout(() => {
      this.rollosInsertar.sort((a,b) => Number(a.Ot) - Number(b.Ot));
      this.grupoProductos.sort((a,b) => Number(a.Ot) - Number(b.Ot));
      this.calcularTotalRollos();
      this.calcularTotalCantidad();
    }, 500);
  }

  // Funcion que calculará el total de rollos que se están signanado
  calcularTotalRollos() {
    let total = 0;
    for(let sale of this.grupoProductos) {
        total += sale.Rollos2;
    }
    this.totalRollos = total;
  }

  // Funcion que calculará el total de la kg que se está ingresando
  calcularTotalCantidad() {
    let total = 0;
    for(let sale of this.grupoProductos) {
      total += sale.Cantidad2;
    }
    this.totalCantidad = total;
  }

  //Funcion que creará el ingreso de los rollos
  ingresaroRollos(){
    if (this.rollosInsertar.length == 0) Swal.fire(`¡Debe selecionar minimo un rollo para realizar el ingreso!`);
    else {
      let Observacion : string = this.FormConsultarRollos.value.Observacion;
      this.cargando = false;
      let info : any = {
        IngRollo_Observacion : Observacion,
        Usua_Id : this.storage_Id,
        IngRollo_Fecha : this.today,
        IngRollo_Hora : moment().format("H:mm:ss"),
      }
      this.IngRollosService.srvGuardar(info).subscribe(datos_rollos => {
        this.IngRollosService.obtenerUltimoId().subscribe(datos_ingreso => {
          this.DtIngresarRollos(datos_ingreso.ingRollo_Id);
        });
      }, error => {
        const Toast = Swal.mixin({
          toast: true,
          position: 'center',
          showConfirmButton: false,
          timer: 2500,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
          }
        });
        Toast.fire({
          icon: 'error',
          title: '¡Error al ingresar los rollos!'
        });
        this.cargando = true;
      });
    }
  }

  // Funcion que creará el ingreso de cada uno de los rollos a la base de datos
  DtIngresarRollos(id : number){
    for (let i = 0; i < this.rollosInsertar.length; i++) {
      if (!this.rollosInsertar[i].exits) {
        let info : any = {
          IngRollo_Id : id,
          Rollo_Id : this.rollosInsertar[i].Id,
          DtIngRollo_Cantidad : this.rollosInsertar[i].Cantidad,
          UndMed_Id : this.rollosInsertar[i].Presentacion,
          DtIngRollo_OT : this.rollosInsertar[i].Ot,
          Estado_Id : 19,
          Proceso_Id : 'EXT',
          Prod_Id : parseInt(this.rollosInsertar[i].IdProducto),
        }
        this.dtIngRollosService.srvGuardar(info).subscribe(datos_rollos => {

        }, error => {
          const Toast = Swal.mixin({
            toast: true,
            position: 'center',
            showConfirmButton: false,
            timer: 2500,
            timerProgressBar: true,
            didOpen: (toast) => {
              toast.addEventListener('mouseenter', Swal.stopTimer)
              toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
          });
          Toast.fire({
            icon: 'error',
            title: '¡Error al ingresar los rollos!'
          });
          this.cargando = true;
        });
      }
    }
    setTimeout(() => { this.finalizarInsercion(id); }, 5000);
  }

  //Funcion que se encargará de lenviar el mensaje de confirmación del envio y limpiará los campos
  finalizarInsercion(id : number){
    const Toast = Swal.mixin({
      toast: true,
      position: 'center',
      showConfirmButton: false,
      timer: 4000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
      }
    });
    Toast.fire({
      icon: 'success',
      title: `¡${this.totalRollos} rollos han sido ingresados correctamente!`
    });
    this.buscarRolloPDF(id);
  }

  // Funcion que creará un pdf a base de la informacion ingresada en las asignacion de rollos a facturas
  crearPDF(id : number){
    this.dtIngRollosService.crearPdf(id).subscribe(datos_ingreso => {
      for (let i = 0; i < datos_ingreso.length; i++) {
        for (let j = 0; j < this.rollosPDF.length; j++) {
          const pdfDefinicion : any = {
            info: {
              title: `${id}`
            },
            pageSize: {
              width: 630,
              height: 760
            },
            content : [
              {
                text: `Ingreso de Rollos a Bodega de Extrusión`,
                alignment: 'right',
                style: 'titulo',
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
                        text: `${datos_ingreso[i].ingRollo_Fecha.replace('T00:00:00', '')} ${datos_ingreso[i].ingRollo_Hora}`
                      },
                    ],
                    [
                      {
                        border: [false, false, false, false],
                        text: `Dirección`
                      },
                      {
                        border: [false, false, false, true],
                        text: `${datos_ingreso[i].empresa_Direccion}`
                      },
                      {
                        border: [false, false, false, false],
                        text: `Ciudad`
                      },
                      {
                        border: [false, false, false, true],
                        text: `${datos_ingreso[i].empresa_Ciudad}`
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
                text: `Ingresado Por: ${datos_ingreso[i].nombreCreador}\n`,
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

              this.table(this.rollosPDF, ['OT', 'Rollo', 'Producto', 'Nombre', 'Cantidad', 'Presentacion']),
              {
                text: `\nCant. Total: ${this.formatonumeros(this.totalCantidad.toFixed(2))}\n Rollos Totales: ${this.formatonumeros(this.totalRollos.toFixed(2))}`,
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

  // Funcion que traerá los rollos que fueron ingresados
  buscarRolloPDF(id : number){
    this.rollosPDF = [];
    this.dtIngRollosService.crearPdf(id).subscribe(datos_ingreso => {
      for (let i = 0; i < datos_ingreso.length; i++) {
        let info : any = {
          OT : datos_ingreso[i].dtIngRollo_OT,
          Producto : datos_ingreso[i].prod_Id,
          Nombre : datos_ingreso[i].prod_Nombre,
          Rollo : datos_ingreso[i].rollo_Id,
          Cantidad : this.formatonumeros(datos_ingreso[i].dtIngRollo_Cantidad),
          Presentacion : datos_ingreso[i].undMed_Id,
        }
        this.rollosPDF.push(info);
        this.rollosPDF.sort((a,b) => Number(a.Rollo) - Number(b.Rollo));
      }
    });
    setTimeout(() => { this.crearPDF(id); }, 1200);
  }

  // funcion que se encagará de llenar la tabla de los rollos en el pdf
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

  // Funcion que genera la tabla donde se mostrará la información de los rollos
  table(data, columns) {
    return {
        table: {
          headerRows: 1,
          widths: [60, 60, 60, 228, 40, 50],
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

  // Funcion que genera la tabla donde se mostrará la información de los rollos
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
}
