import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { BagproService } from 'src/app/Servicios/Bagpro.service';
import { DtIngRollos_ExtrusionService } from 'src/app/Servicios/DtIngRollos_Extrusion.service';
import { IngRollos_ExtrusuionService } from 'src/app/Servicios/IngRollos_Extrusuion.service';
import { RolesService } from 'src/app/Servicios/roles.service';
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
  hora : any = moment().format("H:mm:ss"); //Variable que almacenará la hora
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

  constructor(private frmBuilderPedExterno : FormBuilder,
                private rolService : RolesService,
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
          });
        } else if (fechaInicial != null &&  fechaFinal != null) {
          this.bagProService.srvObtenerListaProcExtrusionFechas(fechaInicial, fechaFinal).subscribe(datos_ot => {
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
                  Proceso : 'EXT',
                  exits : false,
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
          });
        } else if (ot != null && fechaInicial != null) {
          this.bagProService.srvObtenerListaProcExtrusionFechasOT(fechaInicial, fechaInicial, ot).subscribe(datos_ot => {
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
                  Proceso : 'EXT',
                  exits : false,
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
          });
        } else if (fechaInicial != null) {
          this.bagProService.srvObtenerListaProcExtrusionFechas(fechaInicial, fechaInicial).subscribe(datos_ot => {
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
                  Proceso : 'EXT',
                  exits : false,
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
          });
        } else if (ot != null) {
          this.bagProService.srvObtenerListaProcExtrusionRollosOT(ot).subscribe(datos_ot => {
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
          });
        } else if (rollo != null) {
          this.bagProService.srvObtenerListaProcExtrusionRollos(rollo).subscribe(datos_ot => {
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
        }, 3000);
      }, 4000);
    } else Swal.fire("¡La fecha seleccionada no es valida!");
  }

  // Funcion que colocará los rollos que se van a insertar
  llenarRollosAIngresar(item : any){
    this.rollosInsertar.push(item);
    for (let i = 0; i < this.rollos.length; i++) {
      if (this.rollos[i].Id == item.Id) this.rollos.splice(i, 1);
    }
    this.GrupoProductos();
  }

  // Funcion que seleccionará y colocará todos los rollos que se van a insertar
  seleccionarTodosRollos(item : any){
    for (let i = 0; i < item.length; i++) {
      this.rollosInsertar.push(item[i]);
    }
    this.rollos = [];
    this.GrupoProductos();
  }

  //Funcion que va a quitar lo rollos que se van a insertar
  quitarRollosAIngresar(item : any){
    this.rollos.push(item);
    for (let i = 0; i < this.rollosInsertar.length; i++) {
      if (this.rollosInsertar[i].Id == item.Id) this.rollosInsertar.splice(i, 1);
    }
    this.GrupoProductos();
  }

  // Funcion que va a quitar todos los rollos que se van a insertar
  quitarTodosRollos(item : any){
    for (let i = 0; i < item.length; i++) {
      this.rollos.push(item[i]);
    }
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
  }

  //Funcion que creará el ingreso de los rollos
  ingresaroRollos(){

  }
}
