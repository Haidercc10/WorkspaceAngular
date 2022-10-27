import { Component, Inject, Injectable, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { table } from 'console';
import moment from 'moment';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import pdfMake from 'pdfmake/build/pdfmake';
import { BagproService } from 'src/app/Servicios/Bagpro.service';
import { ClientesProductosService } from 'src/app/Servicios/ClientesProductos.service';
import { DetallesEntradaRollosService } from 'src/app/Servicios/DetallesEntradaRollos.service';
import { EntradaRollosService } from 'src/app/Servicios/EntradaRollos.service';
import { ExistenciasProductosService } from 'src/app/Servicios/existencias-productos.service';
import { ProductoService } from 'src/app/Servicios/producto.service';
import { RolesService } from 'src/app/Servicios/roles.service';
import Swal from 'sweetalert2';

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
  today : any = new Date(); //Variable que se usará para llenar la fecha actual
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
  fechaBusqueda : any = new Date(); // Variable que va a ayudar al momento de saber hasta que fecha se va a buscar

  constructor(private frmBuilderPedExterno : FormBuilder,
                private rolService : RolesService,
                  @Inject(SESSION_STORAGE) private storage: WebStorageService,
                    private bagProService : BagproService,
                      private ExistenciasProdService : ExistenciasProductosService,
                        private entradaRolloService : EntradaRollosService,
                          private dtEntradaRollosService : DetallesEntradaRollosService,
                            private cliProdService : ClientesProductosService,
                              private productosService : ProductoService,) {

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
    this.fecha();
    this.lecturaStorage();
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

  //Funcion que colocará la fecha actual y la colocará en el campo de fecha de pedido
  fecha(){
    this.today = new Date();
    var dd : any = this.today.getDate();
    var mm : any = this.today.getMonth() + 1;
    var yyyy : any = this.today.getFullYear();
    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;
    this.today = yyyy + '-' + mm + '-' + dd;

    this.FormConsultarRollos.setValue({
      OT_Id: null,
      IdRollo : null,
      fechaDoc : null,
      fechaFinalDoc: null,
      Observacion : null,
      Proceso : null,
    });
    this.fechaBusqueda = moment().subtract(4, 'day').format('YYYY-MM-DD');
  }

  // Funcion para limpiar los campos de la vista
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
    this.Total = 0;
    this.rollosAsignados = [];
    // window.location.href = "./ingresar-productos";
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

  //Funcion que traerá los diferentes rollos que se hicieron en la orden de trabajo
  consultarOTbagPro(){
    let ProcConsulta : any = this.FormConsultarRollos.value.Proceso;
    let ot : number = this.FormConsultarRollos.value.OT_Id;
    let fechaInicial : any = this.FormConsultarRollos.value.fechaDoc;
    let fechaFinal : any = this.FormConsultarRollos.value.fechaFinalDoc;
    let rollo : number = this.FormConsultarRollos.value.IdRollo;
    this.rollosSinIngresar = 0;
    this.rollosIngresados = 0;
    let totalRollos = 0;
    let rollos : any = [];

    if (ProcConsulta != null) {
      if (!moment(fechaInicial).isBefore('2022-09-23', 'days') && !moment(fechaFinal).isBefore('2022-09-23', 'days')) {
        this.rollos = [];
        let RollosConsultados : any [] = [];
        let otTemporral : number = 0;
        this.cargando = false;
        this.cantidadOT = 0;
        let proceso : string = '';

        this.dtEntradaRollosService.srvObtenerLista().subscribe(datos_rollos => {
          for (let i = 0; i < datos_rollos.length; i++) {
            rollos.push(datos_rollos[i].rollo_Id);
          }
        });

        setTimeout(() => {
          if (ot != null && fechaInicial != null && fechaFinal != null) {
            if (ProcConsulta == "1"){
              this.bagProService.srvObtenerListaProcExtrusionFechasOT(fechaInicial, fechaFinal, ot).subscribe(datos_ot => {
                for (let i = 0; i < datos_ot.length; i++) {
                  if (!rollos.includes(datos_ot[i].item) && !RollosConsultados.includes(datos_ot[i].item) && datos_ot[i].nomStatus == 'EMPAQUE') {
                    if (datos_ot[i].nomStatus == 'EMPAQUE') proceso = 'EMP'
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
                    if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
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
                  } else if (rollos.includes(datos_ot[i].item) && !RollosConsultados.includes(datos_ot[i].item) && datos_ot[i].nomStatus == 'EMPAQUE') {
                    if (datos_ot[i].nomStatus == 'EMPAQUE') proceso = 'EMP'
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
                    if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
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
              // this.bagProService.srvObtenerListaProcExtrusionFechasOT(fechaInicial, fechaFinal, ot).subscribe(datos_ot => {
              //   for (let i = 0; i < datos_ot.length; i++) {
              //     this.dtEntradaRollosService.srvObtenerVerificarRollo(datos_ot[i].item).subscribe(datos_rollos => {
              //       if (datos_rollos.length == 0 && datos_ot[i].nomStatus == 'EMPAQUE') {
              //         if (!RollosConsultados.includes(datos_ot[i].item)){
              //           if (datos_ot[i].nomStatus == 'EMPAQUE') proceso = 'EMP'
              //           let info : any = {
              //             Ot : datos_ot[i].ot,
              //             Id : datos_ot[i].item,
              //             IdCliente : datos_ot[i].identNro,
              //             Cliente : datos_ot[i].nombreComercial,
              //             IdProducto : datos_ot[i].clienteItem,
              //             Producto : datos_ot[i].clienteItemNombre,
              //             Cantidad : datos_ot[i].extnetokg,
              //             Presentacion : datos_ot[i].unidad,
              //             Estatus : datos_ot[i].nomStatus,
              //             Proceso : proceso,
              //             exits : false,
              //             Fecha : datos_ot[i].fecha.replace('T00:00:00', ''),
              //           }
              //           this.rollosSinIngresar += 1;
              //           if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
              //           otTemporral = datos_ot[i].ot;
              //           this.rollos.push(info);
              //           RollosConsultados.push(datos_ot[i].item);
              //           this.rollos.sort((a,b) => Number(a.exits) - Number(b.exits) );
              //           this.rollos.sort((a,b) => Number(a.Ot) - Number(b.Ot) );
              //           this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
              //           this.rollos.sort((a,b) => Number(a.IdProducto) - Number(b.IdProducto) );
              //           this.rollos.sort((a,b) => Number(a.exits) - Number(b.exits) );
              //           this.FormConsultarRollos.setValue({
              //             OT_Id: this.FormConsultarRollos.value.OT_Id,
              //             IdRollo : this.FormConsultarRollos.value.IdRollo,
              //             fechaDoc : this.FormConsultarRollos.value.fechaDoc,
              //             fechaFinalDoc: this.FormConsultarRollos.value.fechaFinalDoc,
              //             Observacion : this.FormConsultarRollos.value.Observacion,
              //             Proceso : this.FormConsultarRollos.value.Proceso,
              //           });
              //         }
              //       } else if (datos_rollos.length != 0 && datos_ot[i].nomStatus == 'EMPAQUE') {
              //         if (!RollosConsultados.includes(datos_ot[i].item)){
              //           if (datos_ot[i].nomStatus == 'EMPAQUE') proceso = 'EMP'
              //           let info : any = {
              //             Ot : datos_ot[i].ot,
              //             Id : datos_ot[i].item,
              //             IdCliente : datos_ot[i].identNro,
              //             Cliente : datos_ot[i].nombreComercial,
              //             IdProducto : datos_ot[i].clienteItem,
              //             Producto : datos_ot[i].clienteItemNombre,
              //             Cantidad : datos_ot[i].extnetokg,
              //             Presentacion : datos_ot[i].unidad,
              //             Estatus : datos_ot[i].nomStatus,
              //             Proceso : proceso,
              //             exits : true,
              //             Fecha : datos_ot[i].fecha.replace('T00:00:00', ''),
              //           }
              //           this.rollosIngresados += 1;
              //           if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
              //           otTemporral = datos_ot[i].ot;
              //           this.rollos.push(info);
              //           RollosConsultados.push(datos_ot[i].item);
              //           this.rollos.sort((a,b) => Number(a.Ot) - Number(b.Ot) );
              //           this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
              //           this.rollos.sort((a,b) => Number(a.IdProducto) - Number(b.IdProducto) );
              //           this.rollos.sort((a,b) => Number(a.exits) - Number(b.exits) );
              //           this.FormConsultarRollos.setValue({
              //             OT_Id: this.FormConsultarRollos.value.OT_Id,
              //             IdRollo : this.FormConsultarRollos.value.IdRollo,
              //             fechaDoc : this.FormConsultarRollos.value.fechaDoc,
              //             fechaFinalDoc: this.FormConsultarRollos.value.fechaFinalDoc,
              //             Observacion : this.FormConsultarRollos.value.Observacion,
              //             Proceso : this.FormConsultarRollos.value.Proceso,
              //           });
              //         }
              //       }
              //     });
              //   }
              // });
            } else if (ProcConsulta == "2") {
              this.bagProService.srvObtenerListaProcExtrusionFechasOT(fechaInicial, fechaFinal, ot).subscribe(datos_ot => {
                for (let i = 0; i < datos_ot.length; i++) {
                  if (!rollos.includes(datos_ot[i].item) && !RollosConsultados.includes(datos_ot[i].item) && datos_ot[i].nomStatus == 'EXTRUSION') {
                    if (datos_ot[i].nomStatus == 'EXTRUSION') proceso = 'EXT'
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
                    if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
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
                    if (datos_ot[i].nomStatus == 'EXTRUSION') proceso = 'EXT'
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
                    if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
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
              // this.bagProService.srvObtenerListaProcExtrusionFechasOT(fechaInicial, fechaFinal, ot).subscribe(datos_ot => {
              //   for (let i = 0; i < datos_ot.length; i++) {
              //     this.dtEntradaRollosService.srvObtenerVerificarRollo(datos_ot[i].item).subscribe(datos_rollos => {
              //       if (datos_rollos.length == 0 && datos_ot[i].nomStatus == 'EXTRUSION') {
              //         if (!RollosConsultados.includes(datos_ot[i].item)){
              //           if (datos_ot[i].nomStatus == 'EXTRUSION') proceso = 'EXT'
              //           let info : any = {
              //             Ot : datos_ot[i].ot,
              //             Id : datos_ot[i].item,
              //             IdCliente : datos_ot[i].identNro,
              //             Cliente : datos_ot[i].nombreComercial,
              //             IdProducto : datos_ot[i].clienteItem,
              //             Producto : datos_ot[i].clienteItemNombre,
              //             Cantidad : datos_ot[i].extnetokg,
              //             Presentacion : datos_ot[i].unidad,
              //             Estatus : datos_ot[i].nomStatus,
              //             Proceso : proceso,
              //             exits : false,
              //             Fecha : datos_ot[i].fecha.replace('T00:00:00', ''),
              //           }
              //           if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
              //           otTemporral = datos_ot[i].ot;
              //           this.rollos.push(info);
              //           RollosConsultados.push(datos_ot[i].item);
              //           this.rollos.sort((a,b) => Number(a.Ot) - Number(b.Ot) );
              //           this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
              //           this.rollos.sort((a,b) => Number(a.IdProducto) - Number(b.IdProducto) );
              //           this.rollos.sort((a,b) => Number(a.exits) - Number(b.exits) );
              //           this.FormConsultarRollos.setValue({
              //             OT_Id: this.FormConsultarRollos.value.OT_Id,
              //             IdRollo : this.FormConsultarRollos.value.IdRollo,
              //             fechaDoc : this.FormConsultarRollos.value.fechaDoc,
              //             fechaFinalDoc: this.FormConsultarRollos.value.fechaFinalDoc,
              //             Observacion : this.FormConsultarRollos.value.Observacion,
              //             Proceso : this.FormConsultarRollos.value.Proceso,
              //           });
              //         }
              //       } else if (datos_rollos.length == 0 && datos_ot[i].nomStatus == 'EXTRUSION') {
              //         if (!RollosConsultados.includes(datos_ot[i].item)){
              //           if (datos_ot[i].nomStatus == 'EXTRUSION') proceso = 'EXT'
              //           let info : any = {
              //             Ot : datos_ot[i].ot,
              //             Id : datos_ot[i].item,
              //             IdCliente : datos_ot[i].identNro,
              //             Cliente : datos_ot[i].nombreComercial,
              //             IdProducto : datos_ot[i].clienteItem,
              //             Producto : datos_ot[i].clienteItemNombre,
              //             Cantidad : datos_ot[i].extnetokg,
              //             Presentacion : datos_ot[i].unidad,
              //             Estatus : datos_ot[i].nomStatus,
              //             Proceso : proceso,
              //             exits : true,
              //             Fecha : datos_ot[i].fecha.replace('T00:00:00', ''),
              //           }
              //           this.rollosIngresados += 1;
              //           if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
              //           otTemporral = datos_ot[i].ot;
              //           this.rollos.push(info);
              //           RollosConsultados.push(datos_ot[i].item);
              //           this.rollos.sort((a,b) => Number(a.Ot) - Number(b.Ot) );
              //           this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
              //           this.rollos.sort((a,b) => Number(a.IdProducto) - Number(b.IdProducto) );
              //           this.rollos.sort((a,b) => Number(a.exits) - Number(b.exits) );
              //           this.FormConsultarRollos.setValue({
              //             OT_Id: this.FormConsultarRollos.value.OT_Id,
              //             IdRollo : this.FormConsultarRollos.value.IdRollo,
              //             fechaDoc : this.FormConsultarRollos.value.fechaDoc,
              //             fechaFinalDoc: this.FormConsultarRollos.value.fechaFinalDoc,
              //             Observacion : this.FormConsultarRollos.value.Observacion,
              //             Proceso : this.FormConsultarRollos.value.Proceso,
              //           });
              //         }
              //       }
              //     });
              //   }
              // });
            } else if (ProcConsulta == "3") {
              this.bagProService.srvObtenerListaProcSelladoFechasOT(fechaInicial, fechaFinal, ot).subscribe(datos_ot => {
                for (let i = 0; i < datos_ot.length; i++) {
                  if (!rollos.includes(datos_ot[i].item) && !RollosConsultados.includes(datos_ot[i].item) && datos_ot[i].nomStatus == 'SELLADO') {
                    this.idProducto = datos_ot[i].referencia;
                    if (datos_ot[i].unidad == 'UND') this.presentacionProducto = 'Und';
                    if (datos_ot[i].unidad == 'PAQ') this.presentacionProducto = 'Paquete';
                    if (datos_ot[i].unidad == 'KLS') this.presentacionProducto = 'Kg';
                    if (datos_ot[i].nomStatus == 'SELLADO') proceso = 'SELLA'
                    if (datos_ot[i].nomStatus == 'Wiketiado') proceso = 'WIKE'
                    let info : any = {
                      Ot : datos_ot[i].ot,
                      Id : datos_ot[i].item,
                      IdCliente : datos_ot[i].identNro,
                      Cliente : datos_ot[i].nombreComercial,
                      IdProducto : datos_ot[i].referencia,
                      Producto : datos_ot[i].nomReferencia,
                      Cantidad : datos_ot[i].qty,
                      Presentacion : this.presentacionProducto,
                      Estatus : datos_ot[i].nomStatus,
                      Proceso : proceso,
                      exits : false,
                      Fecha : datos_ot[i].fechaEntrada.replace('T00:00:00', ''),
                    }
                    this.rollosSinIngresar += 1;
                    if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
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
                  } else if (rollos.includes(datos_ot[i].item) && !RollosConsultados.includes(datos_ot[i].item) && datos_ot[i].nomStatus == 'SELLADO'){
                    this.idProducto = datos_ot[i].referencia;
                    if (datos_ot[i].unidad == 'UND') this.presentacionProducto = 'Und';
                    if (datos_ot[i].unidad == 'PAQ') this.presentacionProducto = 'Paquete';
                    if (datos_ot[i].unidad == 'KLS') this.presentacionProducto = 'Kg';
                    if (datos_ot[i].nomStatus == 'SELLADO') proceso = 'SELLA'
                    if (datos_ot[i].nomStatus == 'Wiketiado') proceso = 'WIKE'
                    let info : any = {
                      Ot : datos_ot[i].ot,
                      Id : datos_ot[i].item,
                      IdCliente : datos_ot[i].identNro,
                      Cliente : datos_ot[i].nombreComercial,
                      IdProducto : datos_ot[i].referencia,
                      Producto : datos_ot[i].nomReferencia,
                      Cantidad : datos_ot[i].qty,
                      Presentacion : this.presentacionProducto,
                      Estatus : datos_ot[i].nomStatus,
                      Proceso : proceso,
                      exits : true,
                      Fecha : datos_ot[i].fechaEntrada.replace('T00:00:00', ''),
                    }
                    this.rollosIngresados += 1;
                    if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
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
              // this.bagProService.srvObtenerListaProcSelladoFechasOT(fechaInicial, fechaFinal, ot).subscribe(datos_ot => {
              //   for (let i = 0; i < datos_ot.length; i++) {
              //     this.dtEntradaRollosService.srvObtenerVerificarRollo(datos_ot[i].item).subscribe(datos_rollos => {
              //       if (datos_rollos.length == 0) {
              //         if (!RollosConsultados.includes(datos_ot[i].item)){
              //           this.idProducto = datos_ot[i].referencia;
              //           if (datos_ot[i].unidad == 'UND') this.presentacionProducto = 'Und';
              //           if (datos_ot[i].unidad == 'PAQ') this.presentacionProducto = 'Paquete';
              //           if (datos_ot[i].unidad == 'KLS') this.presentacionProducto = 'Kg';
              //           if (datos_ot[i].nomStatus == 'EXTRUSION') proceso = 'EXT'
              //           if (datos_ot[i].nomStatus == 'IMPRESION') proceso = 'IMP'
              //           if (datos_ot[i].nomStatus == 'ROTOGRABADO') proceso = 'ROT'
              //           if (datos_ot[i].nomStatus == 'DOBLADO') proceso = 'DBLD'
              //           if (datos_ot[i].nomStatus == 'LAMINADO') proceso = 'LAM'
              //           if (datos_ot[i].nomStatus == 'CORTE') proceso = 'CORTE'
              //           if (datos_ot[i].nomStatus == 'EMPAQUE') proceso = 'EMP'
              //           if (datos_ot[i].nomStatus == 'SELLADO') proceso = 'SELLA'
              //           if (datos_ot[i].nomStatus == 'Wiketiado') proceso = 'WIKE'
              //           let info : any = {
              //             Ot : datos_ot[i].ot,
              //             Id : datos_ot[i].item,
              //             IdCliente : datos_ot[i].identNro,
              //             Cliente : datos_ot[i].nombreComercial,
              //             IdProducto : datos_ot[i].referencia,
              //             Producto : datos_ot[i].nomReferencia,
              //             Cantidad : datos_ot[i].qty,
              //             Presentacion : this.presentacionProducto,
              //             Estatus : datos_ot[i].nomStatus,
              //             Proceso : proceso,
              //             exits : false,
              //             Fecha : datos_ot[i].fechaEntrada.replace('T00:00:00', ''),
              //           }
              //           this.rollosSinIngresar += 1;
              //           if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
              //           otTemporral = datos_ot[i].ot;
              //           this.rollos.push(info);
              //           RollosConsultados.push(datos_ot[i].item);
              //           this.rollos.sort((a,b) => Number(a.Ot) - Number(b.Ot) );
              //           this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
              //           this.rollos.sort((a,b) => Number(a.IdProducto) - Number(b.IdProducto) );
              //           this.rollos.sort((a,b) => Number(a.exits) - Number(b.exits) );
              //           this.FormConsultarRollos.setValue({
              //             OT_Id: this.FormConsultarRollos.value.OT_Id,
              //             IdRollo : this.FormConsultarRollos.value.IdRollo,
              //             fechaDoc : this.FormConsultarRollos.value.fechaDoc,
              //             fechaFinalDoc: this.FormConsultarRollos.value.fechaFinalDoc,
              //             Observacion : this.FormConsultarRollos.value.Observacion,
              //             Proceso : this.FormConsultarRollos.value.Proceso,
              //           });
              //         }
              //       } else {
              //         if (!RollosConsultados.includes(datos_ot[i].item)){
              //           this.idProducto = datos_ot[i].referencia;
              //           if (datos_ot[i].unidad == 'UND') this.presentacionProducto = 'Und';
              //           if (datos_ot[i].unidad == 'PAQ') this.presentacionProducto = 'Paquete';
              //           if (datos_ot[i].unidad == 'KLS') this.presentacionProducto = 'Kg';
              //           if (datos_ot[i].nomStatus == 'EXTRUSION') proceso = 'EXT'
              //           if (datos_ot[i].nomStatus == 'IMPRESION') proceso = 'IMP'
              //           if (datos_ot[i].nomStatus == 'ROTOGRABADO') proceso = 'ROT'
              //           if (datos_ot[i].nomStatus == 'DOBLADO') proceso = 'DBLD'
              //           if (datos_ot[i].nomStatus == 'LAMINADO') proceso = 'LAM'
              //           if (datos_ot[i].nomStatus == 'CORTE') proceso = 'CORTE'
              //           if (datos_ot[i].nomStatus == 'EMPAQUE') proceso = 'EMP'
              //           if (datos_ot[i].nomStatus == 'SELLADO') proceso = 'SELLA'
              //           if (datos_ot[i].nomStatus == 'Wiketiado') proceso = 'WIKE'
              //           let info : any = {
              //             Ot : datos_ot[i].ot,
              //             Id : datos_ot[i].item,
              //             IdCliente : datos_ot[i].identNro,
              //             Cliente : datos_ot[i].nombreComercial,
              //             IdProducto : datos_ot[i].referencia,
              //             Producto : datos_ot[i].nomReferencia,
              //             Cantidad : datos_ot[i].qty,
              //             Presentacion : this.presentacionProducto,
              //             Estatus : datos_ot[i].nomStatus,
              //             Proceso : proceso,
              //             exits : true,
              //             Fecha : datos_ot[i].fechaEntrada.replace('T00:00:00', ''),
              //           }
              //           this.rollosIngresados += 1;
              //           if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
              //           otTemporral = datos_ot[i].ot;
              //           this.rollos.push(info);
              //           RollosConsultados.push(datos_ot[i].item);
              //           this.rollos.sort((a,b) => Number(a.Ot) - Number(b.Ot) );
              //           this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
              //           this.rollos.sort((a,b) => Number(a.IdProducto) - Number(b.IdProducto) );
              //           this.rollos.sort((a,b) => Number(a.exits) - Number(b.exits) );
              //           this.FormConsultarRollos.setValue({
              //             OT_Id: this.FormConsultarRollos.value.OT_Id,
              //             IdRollo : this.FormConsultarRollos.value.IdRollo,
              //             fechaDoc : this.FormConsultarRollos.value.fechaDoc,
              //             fechaFinalDoc: this.FormConsultarRollos.value.fechaFinalDoc,
              //             Observacion : this.FormConsultarRollos.value.Observacion,
              //             Proceso : this.FormConsultarRollos.value.Proceso,
              //           });
              //         }
              //       }
              //     });
              //   }
              // });
            }
          } else if (fechaInicial != null &&  fechaFinal != null) {
            if (ProcConsulta == "1"){
              this.bagProService.srvObtenerListaProcExtrusionFechas(fechaInicial, fechaFinal).subscribe(datos_ot => {
                for (let i = 0; i < datos_ot.length; i++) {
                  if (!rollos.includes(datos_ot[i].item) && !RollosConsultados.includes(datos_ot[i].item) && datos_ot[i].nomStatus == 'EMPAQUE') {
                    if (datos_ot[i].nomStatus == 'EMPAQUE') proceso = 'EMP'
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
                    if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
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
                  } else if (rollos.includes(datos_ot[i].item) && !RollosConsultados.includes(datos_ot[i].item) && datos_ot[i].nomStatus == 'EMPAQUE') {
                    if (datos_ot[i].nomStatus == 'EMPAQUE') proceso = 'EMP'
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
                    if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
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
              // this.bagProService.srvObtenerListaProcExtrusionFechas(fechaInicial, fechaFinal).subscribe(datos_ot => {
              //   for (let i = 0; i < datos_ot.length; i++) {
              //     this.dtEntradaRollosService.srvObtenerVerificarRollo(datos_ot[i].item).subscribe(datos_rollos => {
              //       if (datos_rollos.length == 0 && datos_ot[i].nomStatus == 'EMPAQUE') {
              //         if (!RollosConsultados.includes(datos_ot[i].item)){
              //           if (datos_ot[i].nomStatus == 'EMPAQUE') proceso = 'EMP'
              //           let info : any = {
              //             Ot : datos_ot[i].ot,
              //             Id : datos_ot[i].item,
              //             IdCliente : datos_ot[i].identNro,
              //             Cliente : datos_ot[i].nombreComercial,
              //             IdProducto : datos_ot[i].clienteItem,
              //             Producto : datos_ot[i].clienteItemNombre,
              //             Cantidad : datos_ot[i].extnetokg,
              //             Presentacion : datos_ot[i].unidad,
              //             Estatus : datos_ot[i].nomStatus,
              //             Proceso : proceso,
              //             exits : false,
              //             Fecha : datos_ot[i].fecha.replace('T00:00:00', ''),
              //           }
              //           this.rollosSinIngresar += 1;
              //           if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
              //           otTemporral = datos_ot[i].ot;
              //           this.rollos.push(info);
              //           RollosConsultados.push(datos_ot[i].item);
              //           this.rollos.sort((a,b) => Number(a.Ot) - Number(b.Ot) );
              //           this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
              //           this.rollos.sort((a,b) => Number(a.IdProducto) - Number(b.IdProducto) );
              //           this.rollos.sort((a,b) => Number(a.exits) - Number(b.exits) );
              //           this.FormConsultarRollos.setValue({
              //             OT_Id: this.FormConsultarRollos.value.OT_Id,
              //             IdRollo : this.FormConsultarRollos.value.IdRollo,
              //             fechaDoc : this.FormConsultarRollos.value.fechaDoc,
              //             fechaFinalDoc: this.FormConsultarRollos.value.fechaFinalDoc,
              //             Observacion : this.FormConsultarRollos.value.Observacion,
              //             Proceso : this.FormConsultarRollos.value.Proceso,
              //           });
              //         }
              //       } else if (datos_rollos.length != 0 && datos_ot[i].nomStatus == 'EMPAQUE') {
              //         if (!RollosConsultados.includes(datos_ot[i].item)){
              //           if (datos_ot[i].nomStatus == 'EMPAQUE') proceso = 'EMP'
              //           let info : any = {
              //             Ot : datos_ot[i].ot,
              //             Id : datos_ot[i].item,
              //             IdCliente : datos_ot[i].identNro,
              //             Cliente : datos_ot[i].nombreComercial,
              //             IdProducto : datos_ot[i].clienteItem,
              //             Producto : datos_ot[i].clienteItemNombre,
              //             Cantidad : datos_ot[i].extnetokg,
              //             Presentacion : datos_ot[i].unidad,
              //             Estatus : datos_ot[i].nomStatus,
              //             Proceso : proceso,
              //             exits : true,
              //             Fecha : datos_ot[i].fecha.replace('T00:00:00', ''),
              //           }
              //           this.rollosIngresados += 1;
              //           if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
              //           otTemporral = datos_ot[i].ot;
              //           this.rollos.push(info);
              //           RollosConsultados.push(datos_ot[i].item);
              //           this.rollos.sort((a,b) => Number(a.Ot) - Number(b.Ot) );
              //           this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
              //           this.rollos.sort((a,b) => Number(a.IdProducto) - Number(b.IdProducto) );
              //           this.rollos.sort((a,b) => Number(a.exits) - Number(b.exits) );
              //           this.FormConsultarRollos.setValue({
              //             OT_Id: this.FormConsultarRollos.value.OT_Id,
              //             IdRollo : this.FormConsultarRollos.value.IdRollo,
              //             fechaDoc : this.FormConsultarRollos.value.fechaDoc,
              //             fechaFinalDoc: this.FormConsultarRollos.value.fechaFinalDoc,
              //             Observacion : this.FormConsultarRollos.value.Observacion,
              //             Proceso : this.FormConsultarRollos.value.Proceso,
              //           });
              //         }
              //       }
              //     });
              //   }
              // });
            } else if (ProcConsulta == "2") {
              this.bagProService.srvObtenerListaProcExtrusionFechas(fechaInicial, fechaFinal).subscribe(datos_ot => {
                for (let i = 0; i < datos_ot.length; i++) {
                  if (!rollos.includes(datos_ot[i].item) && !RollosConsultados.includes(datos_ot[i].item) && datos_ot[i].nomStatus == 'EXTRUSION') {
                    if (datos_ot[i].nomStatus == 'EXTRUSION') proceso = 'EXT'
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
                    if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
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
                    if (datos_ot[i].nomStatus == 'EXTRUSION') proceso = 'EXT'
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
                    if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
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
              // this.bagProService.srvObtenerListaProcExtrusionFechas(fechaInicial, fechaFinal).subscribe(datos_ot => {
              //   for (let i = 0; i < datos_ot.length; i++) {
              //     this.dtEntradaRollosService.srvObtenerVerificarRollo(datos_ot[i].item).subscribe(datos_rollos => {
              //       if (datos_rollos.length == 0 && datos_ot[i].nomStatus == 'EXTRUSION') {
              //         if (!RollosConsultados.includes(datos_ot[i].item)){
              //           if (datos_ot[i].nomStatus == 'EXTRUSION') proceso = 'EXT'
              //           let info : any = {
              //             Ot : datos_ot[i].ot,
              //             Id : datos_ot[i].item,
              //             IdCliente : datos_ot[i].identNro,
              //             Cliente : datos_ot[i].nombreComercial,
              //             IdProducto : datos_ot[i].clienteItem,
              //             Producto : datos_ot[i].clienteItemNombre,
              //             Cantidad : datos_ot[i].extnetokg,
              //             Presentacion : datos_ot[i].unidad,
              //             Estatus : datos_ot[i].nomStatus,
              //             Proceso : proceso,
              //             exits : false,
              //             Fecha : datos_ot[i].fecha.replace('T00:00:00', ''),
              //           }
              //           if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
              //           otTemporral = datos_ot[i].ot;
              //           this.rollos.push(info);
              //           RollosConsultados.push(datos_ot[i].item);
              //           this.rollos.sort((a,b) => Number(a.Ot) - Number(b.Ot) );
              //           this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
              //           this.rollos.sort((a,b) => Number(a.IdProducto) - Number(b.IdProducto) );
              //           this.rollos.sort((a,b) => Number(a.exits) - Number(b.exits) );
              //           this.FormConsultarRollos.setValue({
              //             OT_Id: this.FormConsultarRollos.value.OT_Id,
              //             IdRollo : this.FormConsultarRollos.value.IdRollo,
              //             fechaDoc : this.FormConsultarRollos.value.fechaDoc,
              //             fechaFinalDoc: this.FormConsultarRollos.value.fechaFinalDoc,
              //             Observacion : this.FormConsultarRollos.value.Observacion,
              //             Proceso : this.FormConsultarRollos.value.Proceso,
              //           });
              //         }
              //       } else if (datos_rollos.length == 0 && datos_ot[i].nomStatus == 'EXTRUSION') {
              //         if (!RollosConsultados.includes(datos_ot[i].item)){
              //           if (datos_ot[i].nomStatus == 'EXTRUSION') proceso = 'EXT'
              //           let info : any = {
              //             Ot : datos_ot[i].ot,
              //             Id : datos_ot[i].item,
              //             IdCliente : datos_ot[i].identNro,
              //             Cliente : datos_ot[i].nombreComercial,
              //             IdProducto : datos_ot[i].clienteItem,
              //             Producto : datos_ot[i].clienteItemNombre,
              //             Cantidad : datos_ot[i].extnetokg,
              //             Presentacion : datos_ot[i].unidad,
              //             Estatus : datos_ot[i].nomStatus,
              //             Proceso : proceso,
              //             exits : true,
              //             Fecha : datos_ot[i].fecha.replace('T00:00:00', ''),
              //           }
              //           this.rollosIngresados += 1;
              //           if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
              //           otTemporral = datos_ot[i].ot;
              //           this.rollos.push(info);
              //           RollosConsultados.push(datos_ot[i].item);
              //           this.rollos.sort((a,b) => Number(a.Ot) - Number(b.Ot) );
              //           this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
              //           this.rollos.sort((a,b) => Number(a.IdProducto) - Number(b.IdProducto) );
              //           this.rollos.sort((a,b) => Number(a.exits) - Number(b.exits) );
              //           this.FormConsultarRollos.setValue({
              //             OT_Id: this.FormConsultarRollos.value.OT_Id,
              //             IdRollo : this.FormConsultarRollos.value.IdRollo,
              //             fechaDoc : this.FormConsultarRollos.value.fechaDoc,
              //             fechaFinalDoc: this.FormConsultarRollos.value.fechaFinalDoc,
              //             Observacion : this.FormConsultarRollos.value.Observacion,
              //             Proceso : this.FormConsultarRollos.value.Proceso,
              //           });
              //         }
              //       }
              //     });
              //   }
              // });
            } else if (ProcConsulta == "3") {
              this.bagProService.srvObtenerListaProcSelladoFechas(fechaInicial, fechaFinal).subscribe(datos_ot => {
                for (let i = 0; i < datos_ot.length; i++) {
                  if (!rollos.includes(datos_ot[i].item) && !RollosConsultados.includes(datos_ot[i].item) && datos_ot[i].nomStatus == 'SELLADO') {
                    this.idProducto = datos_ot[i].referencia;
                    if (datos_ot[i].unidad == 'UND') this.presentacionProducto = 'Und';
                    if (datos_ot[i].unidad == 'PAQ') this.presentacionProducto = 'Paquete';
                    if (datos_ot[i].unidad == 'KLS') this.presentacionProducto = 'Kg';
                    if (datos_ot[i].nomStatus == 'SELLADO') proceso = 'SELLA'
                    if (datos_ot[i].nomStatus == 'Wiketiado') proceso = 'WIKE'
                    let info : any = {
                      Ot : datos_ot[i].ot,
                      Id : datos_ot[i].item,
                      IdCliente : datos_ot[i].identNro,
                      Cliente : datos_ot[i].nombreComercial,
                      IdProducto : datos_ot[i].referencia,
                      Producto : datos_ot[i].nomReferencia,
                      Cantidad : datos_ot[i].qty,
                      Presentacion : this.presentacionProducto,
                      Estatus : datos_ot[i].nomStatus,
                      Proceso : proceso,
                      exits : false,
                      Fecha : datos_ot[i].fechaEntrada.replace('T00:00:00', ''),
                    }
                    this.rollosSinIngresar += 1;
                    if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
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
                  } else if (rollos.includes(datos_ot[i].item) && !RollosConsultados.includes(datos_ot[i].item) && datos_ot[i].nomStatus == 'SELLADO'){
                    this.idProducto = datos_ot[i].referencia;
                    if (datos_ot[i].unidad == 'UND') this.presentacionProducto = 'Und';
                    if (datos_ot[i].unidad == 'PAQ') this.presentacionProducto = 'Paquete';
                    if (datos_ot[i].unidad == 'KLS') this.presentacionProducto = 'Kg';
                    if (datos_ot[i].nomStatus == 'SELLADO') proceso = 'SELLA'
                    if (datos_ot[i].nomStatus == 'Wiketiado') proceso = 'WIKE'
                    let info : any = {
                      Ot : datos_ot[i].ot,
                      Id : datos_ot[i].item,
                      IdCliente : datos_ot[i].identNro,
                      Cliente : datos_ot[i].nombreComercial,
                      IdProducto : datos_ot[i].referencia,
                      Producto : datos_ot[i].nomReferencia,
                      Cantidad : datos_ot[i].qty,
                      Presentacion : this.presentacionProducto,
                      Estatus : datos_ot[i].nomStatus,
                      Proceso : proceso,
                      exits : true,
                      Fecha : datos_ot[i].fechaEntrada.replace('T00:00:00', ''),
                    }
                    this.rollosIngresados += 1;
                    if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
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
              // this.bagProService.srvObtenerListaProcSelladoFechas(fechaInicial, fechaFinal).subscribe(datos_ot => {
              //   for (let i = 0; i < datos_ot.length; i++) {
              //     setTimeout(() => {
              //       this.dtEntradaRollosService.srvObtenerVerificarRollo(parseInt(datos_ot[i].item)).subscribe(datos_rollos => {
              //         if (datos_rollos.length == 0) {
              //           if (!RollosConsultados.includes(datos_ot[i].item)){
              //             this.idProducto = datos_ot[i].referencia;
              //             if (datos_ot[i].unidad == 'UND') this.presentacionProducto = 'Und';
              //             if (datos_ot[i].unidad == 'PAQ') this.presentacionProducto = 'Paquete';
              //             if (datos_ot[i].unidad == 'KLS') this.presentacionProducto = 'Kg';
              //             if (datos_ot[i].nomStatus == 'SELLADO') proceso = 'SELLA'
              //             if (datos_ot[i].nomStatus == 'Wiketiado') proceso = 'WIKE'
              //             let info : any = {
              //               Ot : datos_ot[i].ot,
              //               Id : datos_ot[i].item,
              //               IdCliente : datos_ot[i].identNro,
              //               Cliente : datos_ot[i].nombreComercial,
              //               IdProducto : datos_ot[i].referencia,
              //               Producto : datos_ot[i].nomReferencia,
              //               Cantidad : datos_ot[i].qty,
              //               Presentacion : this.presentacionProducto,
              //               Estatus : datos_ot[i].nomStatus,
              //               Proceso : proceso,
              //               exits : false,
              //               Fecha : datos_ot[i].fechaEntrada.replace('T00:00:00', ''),
              //             }
              //             this.rollosSinIngresar += 1;
              //             if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
              //             otTemporral = datos_ot[i].ot;
              //             this.rollos.push(info);
              //             RollosConsultados.push(datos_ot[i].item);
              //             this.rollos.sort((a,b) => Number(a.Ot) - Number(b.Ot) );
              //             this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
              //             this.rollos.sort((a,b) => Number(a.IdProducto) - Number(b.IdProducto) );
              //             this.rollos.sort((a,b) => Number(a.exits) - Number(b.exits) );
              //             this.FormConsultarRollos.setValue({
              //               OT_Id: this.FormConsultarRollos.value.OT_Id,
              //               IdRollo : this.FormConsultarRollos.value.IdRollo,
              //               fechaDoc : this.FormConsultarRollos.value.fechaDoc,
              //               fechaFinalDoc: this.FormConsultarRollos.value.fechaFinalDoc,
              //               Observacion : this.FormConsultarRollos.value.Observacion,
              //               Proceso : this.FormConsultarRollos.value.Proceso,
              //             });
              //           }
              //         } else {
              //           if (!RollosConsultados.includes(datos_ot[i].item)){
              //             this.idProducto = datos_ot[i].referencia;
              //             if (datos_ot[i].unidad == 'UND') this.presentacionProducto = 'Und';
              //             if (datos_ot[i].unidad == 'PAQ') this.presentacionProducto = 'Paquete';
              //             if (datos_ot[i].unidad == 'KLS') this.presentacionProducto = 'Kg';
              //             if (datos_ot[i].nomStatus == 'SELLADO') proceso = 'SELLA'
              //             if (datos_ot[i].nomStatus == 'Wiketiado') proceso = 'WIKE'
              //             let info : any = {
              //               Ot : datos_ot[i].ot,
              //               Id : datos_ot[i].item,
              //               IdCliente : datos_ot[i].identNro,
              //               Cliente : datos_ot[i].nombreComercial,
              //               IdProducto : datos_ot[i].referencia,
              //               Producto : datos_ot[i].nomReferencia,
              //               Cantidad : datos_ot[i].qty,
              //               Presentacion : this.presentacionProducto,
              //               Estatus : datos_ot[i].nomStatus,
              //               Proceso : proceso,
              //               exits : true,
              //               Fecha : datos_ot[i].fechaEntrada.replace('T00:00:00', ''),
              //             }
              //             this.rollosIngresados += 1;
              //             if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
              //             otTemporral = datos_ot[i].ot;
              //             this.rollos.push(info);
              //             RollosConsultados.push(datos_ot[i].item);
              //             this.rollos.sort((a,b) => Number(a.Ot) - Number(b.Ot) );
              //             this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
              //             this.rollos.sort((a,b) => Number(a.IdProducto) - Number(b.IdProducto) );
              //             this.rollos.sort((a,b) => Number(a.exits) - Number(b.exits) );
              //             this.FormConsultarRollos.setValue({
              //               OT_Id: this.FormConsultarRollos.value.OT_Id,
              //               IdRollo : this.FormConsultarRollos.value.IdRollo,
              //               fechaDoc : this.FormConsultarRollos.value.fechaDoc,
              //               fechaFinalDoc: this.FormConsultarRollos.value.fechaFinalDoc,
              //               Observacion : this.FormConsultarRollos.value.Observacion,
              //               Proceso : this.FormConsultarRollos.value.Proceso,
              //             });
              //           }
              //         }
              //       });
              //     }, 1000);
              //   }
              // });
            }
          } else if (ot != null && fechaInicial != null) {
            if (ProcConsulta == "1"){
              this.bagProService.srvObtenerListaProcExtrusionFechasOT(fechaInicial, fechaInicial, ot).subscribe(datos_ot => {
                for (let i = 0; i < datos_ot.length; i++) {
                  if (!rollos.includes(datos_ot[i].item) && !RollosConsultados.includes(datos_ot[i].item) && datos_ot[i].nomStatus == 'EMPAQUE') {
                    if (datos_ot[i].nomStatus == 'EMPAQUE') proceso = 'EMP'
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
                    if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
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
                  } else if (rollos.includes(datos_ot[i].item) && !RollosConsultados.includes(datos_ot[i].item) && datos_ot[i].nomStatus == 'EMPAQUE') {
                    if (datos_ot[i].nomStatus == 'EMPAQUE') proceso = 'EMP'
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
                    if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
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
              // this.bagProService.srvObtenerListaProcExtrusionFechasOT(fechaInicial, fechaInicial, ot).subscribe(datos_ot => {
              //   for (let i = 0; i < datos_ot.length; i++) {
              //     this.dtEntradaRollosService.srvObtenerVerificarRollo(datos_ot[i].item).subscribe(datos_rollos => {
              //       if (datos_rollos.length == 0 && datos_ot[i].nomStatus == 'EMPAQUE') {
              //         if (!RollosConsultados.includes(datos_ot[i].item)){
              //           if (datos_ot[i].nomStatus == 'EMPAQUE') proceso = 'EMP'
              //           let info : any = {
              //             Ot : datos_ot[i].ot,
              //             Id : datos_ot[i].item,
              //             IdCliente : datos_ot[i].identNro,
              //             Cliente : datos_ot[i].nombreComercial,
              //             IdProducto : datos_ot[i].clienteItem,
              //             Producto : datos_ot[i].clienteItemNombre,
              //             Cantidad : datos_ot[i].extnetokg,
              //             Presentacion : datos_ot[i].unidad,
              //             Estatus : datos_ot[i].nomStatus,
              //             Proceso : proceso,
              //             exits : false,
              //             Fecha : datos_ot[i].fecha.replace('T00:00:00', ''),
              //           }
              //           this.rollosSinIngresar += 1;
              //           if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
              //           otTemporral = datos_ot[i].ot;
              //           this.rollos.push(info);
              //           RollosConsultados.push(datos_ot[i].item);
              //           this.rollos.sort((a,b) => Number(a.Ot) - Number(b.Ot) );
              //           this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
              //           this.rollos.sort((a,b) => Number(a.IdProducto) - Number(b.IdProducto) );
              //           this.rollos.sort((a,b) => Number(a.exits) - Number(b.exits) );
              //           this.FormConsultarRollos.setValue({
              //             OT_Id: this.FormConsultarRollos.value.OT_Id,
              //             IdRollo : this.FormConsultarRollos.value.IdRollo,
              //             fechaDoc : this.FormConsultarRollos.value.fechaDoc,
              //             fechaFinalDoc: this.FormConsultarRollos.value.fechaFinalDoc,
              //             Observacion : this.FormConsultarRollos.value.Observacion,
              //             Proceso : this.FormConsultarRollos.value.Proceso,
              //           });
              //         }
              //       } else if (datos_rollos.length != 0 && datos_ot[i].nomStatus == 'EMPAQUE') {
              //         if (!RollosConsultados.includes(datos_ot[i].item)){
              //           if (datos_ot[i].nomStatus == 'EMPAQUE') proceso = 'EMP'
              //           let info : any = {
              //             Ot : datos_ot[i].ot,
              //             Id : datos_ot[i].item,
              //             IdCliente : datos_ot[i].identNro,
              //             Cliente : datos_ot[i].nombreComercial,
              //             IdProducto : datos_ot[i].clienteItem,
              //             Producto : datos_ot[i].clienteItemNombre,
              //             Cantidad : datos_ot[i].extnetokg,
              //             Presentacion : datos_ot[i].unidad,
              //             Estatus : datos_ot[i].nomStatus,
              //             Proceso : proceso,
              //             exits : true,
              //             Fecha : datos_ot[i].fecha.replace('T00:00:00', ''),
              //           }
              //           this.rollosIngresados += 1;
              //           if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
              //           otTemporral = datos_ot[i].ot;
              //           this.rollos.push(info);
              //           RollosConsultados.push(datos_ot[i].item);
              //           this.rollos.sort((a,b) => Number(a.Ot) - Number(b.Ot) );
              //           this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
              //           this.rollos.sort((a,b) => Number(a.IdProducto) - Number(b.IdProducto) );
              //           this.rollos.sort((a,b) => Number(a.exits) - Number(b.exits) );
              //           this.FormConsultarRollos.setValue({
              //             OT_Id: this.FormConsultarRollos.value.OT_Id,
              //             IdRollo : this.FormConsultarRollos.value.IdRollo,
              //             fechaDoc : this.FormConsultarRollos.value.fechaDoc,
              //             fechaFinalDoc: this.FormConsultarRollos.value.fechaFinalDoc,
              //             Observacion : this.FormConsultarRollos.value.Observacion,
              //             Proceso : this.FormConsultarRollos.value.Proceso,
              //           });
              //         }
              //       }
              //     });
              //   }
              // });
            } else if (ProcConsulta == "2") {
              this.bagProService.srvObtenerListaProcExtrusionFechasOT(fechaInicial, fechaInicial, ot).subscribe(datos_ot => {
                for (let i = 0; i < datos_ot.length; i++) {
                  if (!rollos.includes(datos_ot[i].item) && !RollosConsultados.includes(datos_ot[i].item) && datos_ot[i].nomStatus == 'EXTRUSION') {
                    if (datos_ot[i].nomStatus == 'EXTRUSION') proceso = 'EXT'
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
                    if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
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
                    if (datos_ot[i].nomStatus == 'EXTRUSION') proceso = 'EXT'
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
                    if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
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
              // this.bagProService.srvObtenerListaProcExtrusionFechasOT(fechaInicial, fechaInicial, ot).subscribe(datos_ot => {
              //   for (let i = 0; i < datos_ot.length; i++) {
              //     this.dtEntradaRollosService.srvObtenerVerificarRollo(datos_ot[i].item).subscribe(datos_rollos => {
              //       if (datos_rollos.length == 0 && datos_ot[i].nomStatus == 'EXTRUSION') {
              //         if (!RollosConsultados.includes(datos_ot[i].item)){
              //           if (datos_ot[i].nomStatus == 'EXTRUSION') proceso = 'EXT'
              //           let info : any = {
              //             Ot : datos_ot[i].ot,
              //             Id : datos_ot[i].item,
              //             IdCliente : datos_ot[i].identNro,
              //             Cliente : datos_ot[i].nombreComercial,
              //             IdProducto : datos_ot[i].clienteItem,
              //             Producto : datos_ot[i].clienteItemNombre,
              //             Cantidad : datos_ot[i].extnetokg,
              //             Presentacion : datos_ot[i].unidad,
              //             Estatus : datos_ot[i].nomStatus,
              //             Proceso : proceso,
              //             exits : false,
              //             Fecha : datos_ot[i].fecha.replace('T00:00:00', ''),
              //           }
              //           if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
              //           otTemporral = datos_ot[i].ot;
              //           this.rollos.push(info);
              //           RollosConsultados.push(datos_ot[i].item);
              //           this.rollos.sort((a,b) => Number(a.Ot) - Number(b.Ot) );
              //           this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
              //           this.rollos.sort((a,b) => Number(a.IdProducto) - Number(b.IdProducto) );
              //           this.rollos.sort((a,b) => Number(a.exits) - Number(b.exits) );
              //           this.FormConsultarRollos.setValue({
              //             OT_Id: this.FormConsultarRollos.value.OT_Id,
              //             IdRollo : this.FormConsultarRollos.value.IdRollo,
              //             fechaDoc : this.FormConsultarRollos.value.fechaDoc,
              //             fechaFinalDoc: this.FormConsultarRollos.value.fechaFinalDoc,
              //             Observacion : this.FormConsultarRollos.value.Observacion,
              //             Proceso : this.FormConsultarRollos.value.Proceso,
              //           });
              //         }
              //       } else if (datos_rollos.length == 0 && datos_ot[i].nomStatus == 'EXTRUSION') {
              //         if (!RollosConsultados.includes(datos_ot[i].item)){
              //           if (datos_ot[i].nomStatus == 'EXTRUSION') proceso = 'EXT'
              //           let info : any = {
              //             Ot : datos_ot[i].ot,
              //             Id : datos_ot[i].item,
              //             IdCliente : datos_ot[i].identNro,
              //             Cliente : datos_ot[i].nombreComercial,
              //             IdProducto : datos_ot[i].clienteItem,
              //             Producto : datos_ot[i].clienteItemNombre,
              //             Cantidad : datos_ot[i].extnetokg,
              //             Presentacion : datos_ot[i].unidad,
              //             Estatus : datos_ot[i].nomStatus,
              //             Proceso : proceso,
              //             exits : true,
              //             Fecha : datos_ot[i].fecha.replace('T00:00:00', ''),
              //           }
              //           this.rollosIngresados += 1;
              //           if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
              //           otTemporral = datos_ot[i].ot;
              //           this.rollos.push(info);
              //           RollosConsultados.push(datos_ot[i].item);
              //           this.rollos.sort((a,b) => Number(a.Ot) - Number(b.Ot) );
              //           this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
              //           this.rollos.sort((a,b) => Number(a.IdProducto) - Number(b.IdProducto) );
              //           this.rollos.sort((a,b) => Number(a.exits) - Number(b.exits) );
              //           this.FormConsultarRollos.setValue({
              //             OT_Id: this.FormConsultarRollos.value.OT_Id,
              //             IdRollo : this.FormConsultarRollos.value.IdRollo,
              //             fechaDoc : this.FormConsultarRollos.value.fechaDoc,
              //             fechaFinalDoc: this.FormConsultarRollos.value.fechaFinalDoc,
              //             Observacion : this.FormConsultarRollos.value.Observacion,
              //             Proceso : this.FormConsultarRollos.value.Proceso,
              //           });
              //         }
              //       }
              //     });
              //   }
              // });
            } else if (ProcConsulta == "3") {
              this.bagProService.srvObtenerListaProcSelladoFechasOT(fechaInicial, fechaInicial, ot).subscribe(datos_ot => {
                for (let i = 0; i < datos_ot.length; i++) {
                  if (!rollos.includes(datos_ot[i].item) && !RollosConsultados.includes(datos_ot[i].item) && datos_ot[i].nomStatus == 'SELLADO') {
                    this.idProducto = datos_ot[i].referencia;
                    if (datos_ot[i].unidad == 'UND') this.presentacionProducto = 'Und';
                    if (datos_ot[i].unidad == 'PAQ') this.presentacionProducto = 'Paquete';
                    if (datos_ot[i].unidad == 'KLS') this.presentacionProducto = 'Kg';
                    if (datos_ot[i].nomStatus == 'SELLADO') proceso = 'SELLA'
                    if (datos_ot[i].nomStatus == 'Wiketiado') proceso = 'WIKE'
                    let info : any = {
                      Ot : datos_ot[i].ot,
                      Id : datos_ot[i].item,
                      IdCliente : datos_ot[i].identNro,
                      Cliente : datos_ot[i].nombreComercial,
                      IdProducto : datos_ot[i].referencia,
                      Producto : datos_ot[i].nomReferencia,
                      Cantidad : datos_ot[i].qty,
                      Presentacion : this.presentacionProducto,
                      Estatus : datos_ot[i].nomStatus,
                      Proceso : proceso,
                      exits : false,
                      Fecha : datos_ot[i].fechaEntrada.replace('T00:00:00', ''),
                    }
                    this.rollosSinIngresar += 1;
                    if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
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
                  } else if (rollos.includes(datos_ot[i].item) && !RollosConsultados.includes(datos_ot[i].item) && datos_ot[i].nomStatus == 'SELLADO'){
                    this.idProducto = datos_ot[i].referencia;
                    if (datos_ot[i].unidad == 'UND') this.presentacionProducto = 'Und';
                    if (datos_ot[i].unidad == 'PAQ') this.presentacionProducto = 'Paquete';
                    if (datos_ot[i].unidad == 'KLS') this.presentacionProducto = 'Kg';
                    if (datos_ot[i].nomStatus == 'SELLADO') proceso = 'SELLA'
                    if (datos_ot[i].nomStatus == 'Wiketiado') proceso = 'WIKE'
                    let info : any = {
                      Ot : datos_ot[i].ot,
                      Id : datos_ot[i].item,
                      IdCliente : datos_ot[i].identNro,
                      Cliente : datos_ot[i].nombreComercial,
                      IdProducto : datos_ot[i].referencia,
                      Producto : datos_ot[i].nomReferencia,
                      Cantidad : datos_ot[i].qty,
                      Presentacion : this.presentacionProducto,
                      Estatus : datos_ot[i].nomStatus,
                      Proceso : proceso,
                      exits : true,
                      Fecha : datos_ot[i].fechaEntrada.replace('T00:00:00', ''),
                    }
                    this.rollosIngresados += 1;
                    if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
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
              // this.bagProService.srvObtenerListaProcSelladoFechasOT(fechaInicial, fechaInicial, ot).subscribe(datos_ot => {
              //   for (let i = 0; i < datos_ot.length; i++) {
              //     this.dtEntradaRollosService.srvObtenerVerificarRollo(datos_ot[i].item).subscribe(datos_rollos => {
              //       if (datos_rollos.length == 0) {
              //         if (!RollosConsultados.includes(datos_ot[i].item)){
              //           this.idProducto = datos_ot[i].referencia;
              //           if (datos_ot[i].unidad == 'UND') this.presentacionProducto = 'Und';
              //           if (datos_ot[i].unidad == 'PAQ') this.presentacionProducto = 'Paquete';
              //           if (datos_ot[i].unidad == 'KLS') this.presentacionProducto = 'Kg';
              //           if (datos_ot[i].nomStatus == 'SELLADO') proceso = 'SELLA'
              //           if (datos_ot[i].nomStatus == 'Wiketiado') proceso = 'WIKE'
              //           let info : any = {
              //             Ot : datos_ot[i].ot,
              //             Id : datos_ot[i].item,
              //             IdCliente : datos_ot[i].identNro,
              //             Cliente : datos_ot[i].nombreComercial,
              //             IdProducto : datos_ot[i].referencia,
              //             Producto : datos_ot[i].nomReferencia,
              //             Cantidad : datos_ot[i].qty,
              //             Presentacion : this.presentacionProducto,
              //             Estatus : datos_ot[i].nomStatus,
              //             Proceso : proceso,
              //             exits : false,
              //             Fecha : datos_ot[i].fechaEntrada.replace('T00:00:00', ''),
              //           }
              //           this.rollosSinIngresar += 1;
              //           if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
              //           otTemporral = datos_ot[i].ot;
              //           this.rollos.push(info);
              //           RollosConsultados.push(datos_ot[i].item);
              //           this.rollos.sort((a,b) => Number(a.Ot) - Number(b.Ot) );
              //           this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
              //           this.rollos.sort((a,b) => Number(a.IdProducto) - Number(b.IdProducto) );
              //           this.rollos.sort((a,b) => Number(a.exits) - Number(b.exits) );
              //           this.FormConsultarRollos.setValue({
              //             OT_Id: this.FormConsultarRollos.value.OT_Id,
              //             IdRollo : this.FormConsultarRollos.value.IdRollo,
              //             fechaDoc : this.FormConsultarRollos.value.fechaDoc,
              //             fechaFinalDoc: this.FormConsultarRollos.value.fechaFinalDoc,
              //             Observacion : this.FormConsultarRollos.value.Observacion,
              //             Proceso : this.FormConsultarRollos.value.Proceso,
              //           });
              //         }
              //       } else {
              //         if (!RollosConsultados.includes(datos_ot[i].item)){
              //           this.idProducto = datos_ot[i].referencia;
              //           if (datos_ot[i].unidad == 'UND') this.presentacionProducto = 'Und';
              //           if (datos_ot[i].unidad == 'PAQ') this.presentacionProducto = 'Paquete';
              //           if (datos_ot[i].unidad == 'KLS') this.presentacionProducto = 'Kg';
              //           if (datos_ot[i].nomStatus == 'SELLADO') proceso = 'SELLA'
              //           if (datos_ot[i].nomStatus == 'Wiketiado') proceso = 'WIKE'
              //           let info : any = {
              //             Ot : datos_ot[i].ot,
              //             Id : datos_ot[i].item,
              //             IdCliente : datos_ot[i].identNro,
              //             Cliente : datos_ot[i].nombreComercial,
              //             IdProducto : datos_ot[i].referencia,
              //             Producto : datos_ot[i].nomReferencia,
              //             Cantidad : datos_ot[i].qty,
              //             Presentacion : this.presentacionProducto,
              //             Estatus : datos_ot[i].nomStatus,
              //             Proceso : proceso,
              //             exits : true,
              //             Fecha : datos_ot[i].fechaEntrada.replace('T00:00:00', ''),
              //           }
              //           this.rollosIngresados += 1;
              //           if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
              //           otTemporral = datos_ot[i].ot;
              //           this.rollos.push(info);
              //           RollosConsultados.push(datos_ot[i].item);
              //           this.rollos.sort((a,b) => Number(a.Ot) - Number(b.Ot) );
              //           this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
              //           this.rollos.sort((a,b) => Number(a.IdProducto) - Number(b.IdProducto) );
              //           this.rollos.sort((a,b) => Number(a.exits) - Number(b.exits) );
              //           this.FormConsultarRollos.setValue({
              //             OT_Id: this.FormConsultarRollos.value.OT_Id,
              //             IdRollo : this.FormConsultarRollos.value.IdRollo,
              //             fechaDoc : this.FormConsultarRollos.value.fechaDoc,
              //             fechaFinalDoc: this.FormConsultarRollos.value.fechaFinalDoc,
              //             Observacion : this.FormConsultarRollos.value.Observacion,
              //             Proceso : this.FormConsultarRollos.value.Proceso,
              //           });
              //         }
              //       }
              //     });
              //   }
              // });
            }
          } else if (fechaInicial != null) {
            if (ProcConsulta == "1"){
              this.bagProService.srvObtenerListaProcExtrusionFechas(fechaInicial, fechaInicial).subscribe(datos_ot => {
                for (let i = 0; i < datos_ot.length; i++) {
                  if (!rollos.includes(datos_ot[i].item) && !RollosConsultados.includes(datos_ot[i].item) && datos_ot[i].nomStatus == 'EMPAQUE') {
                    if (datos_ot[i].nomStatus == 'EMPAQUE') proceso = 'EMP'
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
                    if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
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
                  } else if (rollos.includes(datos_ot[i].item) && !RollosConsultados.includes(datos_ot[i].item) && datos_ot[i].nomStatus == 'EMPAQUE') {
                    if (datos_ot[i].nomStatus == 'EMPAQUE') proceso = 'EMP'
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
                    if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
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
              // this.bagProService.srvObtenerListaProcExtrusionFechas(fechaInicial, fechaInicial).subscribe(datos_ot => {
              //   for (let i = 0; i < datos_ot.length; i++) {
              //     this.dtEntradaRollosService.srvObtenerVerificarRollo(datos_ot[i].item).subscribe(datos_rollos => {
              //       if (datos_rollos.length == 0 && datos_ot[i].nomStatus == 'EMPAQUE') {
              //         if (!RollosConsultados.includes(datos_ot[i].item)){
              //           if (datos_ot[i].nomStatus == 'EMPAQUE') proceso = 'EMP'
              //           let info : any = {
              //             Ot : datos_ot[i].ot,
              //             Id : datos_ot[i].item,
              //             IdCliente : datos_ot[i].identNro,
              //             Cliente : datos_ot[i].nombreComercial,
              //             IdProducto : datos_ot[i].clienteItem,
              //             Producto : datos_ot[i].clienteItemNombre,
              //             Cantidad : datos_ot[i].extnetokg,
              //             Presentacion : datos_ot[i].unidad,
              //             Estatus : datos_ot[i].nomStatus,
              //             Proceso : proceso,
              //             exits : false,
              //             Fecha : datos_ot[i].fecha.replace('T00:00:00', ''),
              //           }
              //           this.rollosSinIngresar += 1;
              //           if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
              //           otTemporral = datos_ot[i].ot;
              //           this.rollos.push(info);
              //           RollosConsultados.push(datos_ot[i].item);
              //           this.rollos.sort((a,b) => Number(a.Ot) - Number(b.Ot) );
              //           this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
              //           this.rollos.sort((a,b) => Number(a.IdProducto) - Number(b.IdProducto) );
              //           this.rollos.sort((a,b) => Number(a.exits) - Number(b.exits) );
              //           this.FormConsultarRollos.setValue({
              //             OT_Id: this.FormConsultarRollos.value.OT_Id,
              //             IdRollo : this.FormConsultarRollos.value.IdRollo,
              //             fechaDoc : this.FormConsultarRollos.value.fechaDoc,
              //             fechaFinalDoc: this.FormConsultarRollos.value.fechaFinalDoc,
              //             Observacion : this.FormConsultarRollos.value.Observacion,
              //             Proceso : this.FormConsultarRollos.value.Proceso,
              //           });
              //         }
              //       } else if (datos_rollos.length != 0 && datos_ot[i].nomStatus == 'EMPAQUE') {
              //         if (!RollosConsultados.includes(datos_ot[i].item)){
              //           if (datos_ot[i].nomStatus == 'EMPAQUE') proceso = 'EMP'
              //           let info : any = {
              //             Ot : datos_ot[i].ot,
              //             Id : datos_ot[i].item,
              //             IdCliente : datos_ot[i].identNro,
              //             Cliente : datos_ot[i].nombreComercial,
              //             IdProducto : datos_ot[i].clienteItem,
              //             Producto : datos_ot[i].clienteItemNombre,
              //             Cantidad : datos_ot[i].extnetokg,
              //             Presentacion : datos_ot[i].unidad,
              //             Estatus : datos_ot[i].nomStatus,
              //             Proceso : proceso,
              //             exits : true,
              //             Fecha : datos_ot[i].fecha.replace('T00:00:00', ''),
              //           }
              //           this.rollosIngresados += 1;
              //           if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
              //           otTemporral = datos_ot[i].ot;
              //           this.rollos.push(info);
              //           RollosConsultados.push(datos_ot[i].item);
              //           this.rollos.sort((a,b) => Number(a.Ot) - Number(b.Ot) );
              //           this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
              //           this.rollos.sort((a,b) => Number(a.IdProducto) - Number(b.IdProducto) );
              //           this.rollos.sort((a,b) => Number(a.exits) - Number(b.exits) );
              //           this.FormConsultarRollos.setValue({
              //             OT_Id: this.FormConsultarRollos.value.OT_Id,
              //             IdRollo : this.FormConsultarRollos.value.IdRollo,
              //             fechaDoc : this.FormConsultarRollos.value.fechaDoc,
              //             fechaFinalDoc: this.FormConsultarRollos.value.fechaFinalDoc,
              //             Observacion : this.FormConsultarRollos.value.Observacion,
              //             Proceso : this.FormConsultarRollos.value.Proceso,
              //           });
              //         }
              //       }
              //     });
              //   }
              // });
            } else if (ProcConsulta == "2"){
              this.bagProService.srvObtenerListaProcExtrusionFechas(fechaInicial, fechaInicial).subscribe(datos_ot => {
                for (let i = 0; i < datos_ot.length; i++) {
                  if (!rollos.includes(datos_ot[i].item) && !RollosConsultados.includes(datos_ot[i].item) && datos_ot[i].nomStatus == 'EXTRUSION') {
                    if (datos_ot[i].nomStatus == 'EXTRUSION') proceso = 'EXT'
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
                    if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
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
                    if (datos_ot[i].nomStatus == 'EXTRUSION') proceso = 'EXT'
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
                    if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
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

              // this.bagProService.srvObtenerListaProcExtrusionFechas(fechaInicial, fechaInicial).subscribe(datos_ot => {
              //   for (let i = 0; i < datos_ot.length; i++) {
              //     this.dtEntradaRollosService.srvObtenerVerificarRollo(datos_ot[i].item).subscribe(datos_rollos => {
              //       if (datos_rollos.length == 0 && datos_ot[i].nomStatus == 'EXTRUSION') {
              //         if (!RollosConsultados.includes(datos_ot[i].item)){
              //           if (datos_ot[i].nomStatus == 'EXTRUSION') proceso = 'EXT'
              //           let info : any = {
              //             Ot : datos_ot[i].ot,
              //             Id : datos_ot[i].item,
              //             IdCliente : datos_ot[i].identNro,
              //             Cliente : datos_ot[i].nombreComercial,
              //             IdProducto : datos_ot[i].clienteItem,
              //             Producto : datos_ot[i].clienteItemNombre,
              //             Cantidad : datos_ot[i].extnetokg,
              //             Presentacion : datos_ot[i].unidad,
              //             Estatus : datos_ot[i].nomStatus,
              //             Proceso : proceso,
              //             exits : false,
              //             Fecha : datos_ot[i].fecha.replace('T00:00:00', ''),
              //           }
              //           if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
              //           otTemporral = datos_ot[i].ot;
              //           this.rollos.push(info);
              //           RollosConsultados.push(datos_ot[i].item);
              //           this.rollos.sort((a,b) => Number(a.Ot) - Number(b.Ot) );
              //           this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
              //           this.rollos.sort((a,b) => Number(a.IdProducto) - Number(b.IdProducto) );
              //           this.rollos.sort((a,b) => Number(a.exits) - Number(b.exits) );
              //           this.FormConsultarRollos.setValue({
              //             OT_Id: this.FormConsultarRollos.value.OT_Id,
              //             IdRollo : this.FormConsultarRollos.value.IdRollo,
              //             fechaDoc : this.FormConsultarRollos.value.fechaDoc,
              //             fechaFinalDoc: this.FormConsultarRollos.value.fechaFinalDoc,
              //             Observacion : this.FormConsultarRollos.value.Observacion,
              //             Proceso : this.FormConsultarRollos.value.Proceso,
              //           });
              //         }
              //       } else if (datos_rollos.length == 0 && datos_ot[i].nomStatus == 'EXTRUSION') {
              //         if (!RollosConsultados.includes(datos_ot[i].item)){
              //           if (datos_ot[i].nomStatus == 'EXTRUSION') proceso = 'EXT'
              //           let info : any = {
              //             Ot : datos_ot[i].ot,
              //             Id : datos_ot[i].item,
              //             IdCliente : datos_ot[i].identNro,
              //             Cliente : datos_ot[i].nombreComercial,
              //             IdProducto : datos_ot[i].clienteItem,
              //             Producto : datos_ot[i].clienteItemNombre,
              //             Cantidad : datos_ot[i].extnetokg,
              //             Presentacion : datos_ot[i].unidad,
              //             Estatus : datos_ot[i].nomStatus,
              //             Proceso : proceso,
              //             exits : true,
              //             Fecha : datos_ot[i].fecha.replace('T00:00:00', ''),
              //           }
              //           this.rollosIngresados += 1;
              //           if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
              //           otTemporral = datos_ot[i].ot;
              //           this.rollos.push(info);
              //           RollosConsultados.push(datos_ot[i].item);
              //           this.rollos.sort((a,b) => Number(a.Ot) - Number(b.Ot) );
              //           this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
              //           this.rollos.sort((a,b) => Number(a.IdProducto) - Number(b.IdProducto) );
              //           this.rollos.sort((a,b) => Number(a.exits) - Number(b.exits) );
              //           this.FormConsultarRollos.setValue({
              //             OT_Id: this.FormConsultarRollos.value.OT_Id,
              //             IdRollo : this.FormConsultarRollos.value.IdRollo,
              //             fechaDoc : this.FormConsultarRollos.value.fechaDoc,
              //             fechaFinalDoc: this.FormConsultarRollos.value.fechaFinalDoc,
              //             Observacion : this.FormConsultarRollos.value.Observacion,
              //             Proceso : this.FormConsultarRollos.value.Proceso,
              //           });
              //         }
              //       }
              //     });
              //   }
              // });
            } else if (ProcConsulta == "3") {
              this.bagProService.srvObtenerListaProcSelladoFechas(fechaInicial, fechaInicial).subscribe(datos_ot => {
                for (let i = 0; i < datos_ot.length; i++) {
                  if (!rollos.includes(datos_ot[i].item) && !RollosConsultados.includes(datos_ot[i].item) && datos_ot[i].nomStatus == 'SELLADO') {
                    this.idProducto = datos_ot[i].referencia;
                    if (datos_ot[i].unidad == 'UND') this.presentacionProducto = 'Und';
                    if (datos_ot[i].unidad == 'PAQ') this.presentacionProducto = 'Paquete';
                    if (datos_ot[i].unidad == 'KLS') this.presentacionProducto = 'Kg';
                    if (datos_ot[i].nomStatus == 'SELLADO') proceso = 'SELLA'
                    if (datos_ot[i].nomStatus == 'Wiketiado') proceso = 'WIKE'
                    let info : any = {
                      Ot : datos_ot[i].ot,
                      Id : datos_ot[i].item,
                      IdCliente : datos_ot[i].identNro,
                      Cliente : datos_ot[i].nombreComercial,
                      IdProducto : datos_ot[i].referencia,
                      Producto : datos_ot[i].nomReferencia,
                      Cantidad : datos_ot[i].qty,
                      Presentacion : this.presentacionProducto,
                      Estatus : datos_ot[i].nomStatus,
                      Proceso : proceso,
                      exits : false,
                      Fecha : datos_ot[i].fechaEntrada.replace('T00:00:00', ''),
                    }
                    this.rollosSinIngresar += 1;
                    if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
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
                  } else if (rollos.includes(datos_ot[i].item) && !RollosConsultados.includes(datos_ot[i].item) && datos_ot[i].nomStatus == 'SELLADO'){
                    this.idProducto = datos_ot[i].referencia;
                    if (datos_ot[i].unidad == 'UND') this.presentacionProducto = 'Und';
                    if (datos_ot[i].unidad == 'PAQ') this.presentacionProducto = 'Paquete';
                    if (datos_ot[i].unidad == 'KLS') this.presentacionProducto = 'Kg';
                    if (datos_ot[i].nomStatus == 'SELLADO') proceso = 'SELLA'
                    if (datos_ot[i].nomStatus == 'Wiketiado') proceso = 'WIKE'
                    let info : any = {
                      Ot : datos_ot[i].ot,
                      Id : datos_ot[i].item,
                      IdCliente : datos_ot[i].identNro,
                      Cliente : datos_ot[i].nombreComercial,
                      IdProducto : datos_ot[i].referencia,
                      Producto : datos_ot[i].nomReferencia,
                      Cantidad : datos_ot[i].qty,
                      Presentacion : this.presentacionProducto,
                      Estatus : datos_ot[i].nomStatus,
                      Proceso : proceso,
                      exits : true,
                      Fecha : datos_ot[i].fechaEntrada.replace('T00:00:00', ''),
                    }
                    this.rollosIngresados += 1;
                    if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
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
              // this.bagProService.srvObtenerListaProcSelladoFechas(fechaInicial, fechaInicial).subscribe(datos_ot => {
              //   for (let i = 0; i < datos_ot.length; i++) {
              //     this.dtEntradaRollosService.srvObtenerVerificarRollo(datos_ot[i].item).subscribe(datos_rollos => {
              //       if (datos_rollos.length == 0) {
              //         if (!RollosConsultados.includes(datos_ot[i].item)){
              //           console.log(totalRollos += 1)
              //           this.idProducto = datos_ot[i].referencia;
              //           if (datos_ot[i].unidad == 'UND') this.presentacionProducto = 'Und';
              //           if (datos_ot[i].unidad == 'PAQ') this.presentacionProducto = 'Paquete';
              //           if (datos_ot[i].unidad == 'KLS') this.presentacionProducto = 'Kg';
              //           if (datos_ot[i].nomStatus == 'SELLADO') proceso = 'SELLA'
              //           if (datos_ot[i].nomStatus == 'Wiketiado') proceso = 'WIKE'
              //           let info : any = {
              //             Ot : datos_ot[i].ot,
              //             Id : datos_ot[i].item,
              //             IdCliente : datos_ot[i].identNro,
              //             Cliente : datos_ot[i].nombreComercial,
              //             IdProducto : datos_ot[i].referencia,
              //             Producto : datos_ot[i].nomReferencia,
              //             Cantidad : datos_ot[i].qty,
              //             Presentacion : this.presentacionProducto,
              //             Estatus : datos_ot[i].nomStatus,
              //             Proceso : proceso,
              //             exits : false,
              //             Fecha : datos_ot[i].fechaEntrada.replace('T00:00:00', ''),
              //           }
              //           this.rollosSinIngresar += 1;
              //           if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
              //           otTemporral = datos_ot[i].ot;
              //           this.rollos.push(info);
              //           RollosConsultados.push(datos_ot[i].item);
              //           this.rollos.sort((a,b) => Number(a.Ot) - Number(b.Ot) );
              //           this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
              //           this.rollos.sort((a,b) => Number(a.IdProducto) - Number(b.IdProducto) );
              //           this.rollos.sort((a,b) => Number(a.exits) - Number(b.exits) );
              //           this.FormConsultarRollos.setValue({
              //             OT_Id: this.FormConsultarRollos.value.OT_Id,
              //             IdRollo : this.FormConsultarRollos.value.IdRollo,
              //             fechaDoc : this.FormConsultarRollos.value.fechaDoc,
              //             fechaFinalDoc: this.FormConsultarRollos.value.fechaFinalDoc,
              //             Observacion : this.FormConsultarRollos.value.Observacion,
              //             Proceso : this.FormConsultarRollos.value.Proceso,
              //           });
              //         }
              //       } else {
              //         if (!RollosConsultados.includes(datos_ot[i].item)){
              //           console.log(totalRollos += 1)
              //           // console.log(rollosIngresados += 1)
              //           this.idProducto = datos_ot[i].referencia;
              //           if (datos_ot[i].unidad == 'UND') this.presentacionProducto = 'Und';
              //           if (datos_ot[i].unidad == 'PAQ') this.presentacionProducto = 'Paquete';
              //           if (datos_ot[i].unidad == 'KLS') this.presentacionProducto = 'Kg';
              //           if (datos_ot[i].nomStatus == 'SELLADO') proceso = 'SELLA'
              //           if (datos_ot[i].nomStatus == 'Wiketiado') proceso = 'WIKE'
              //           let info : any = {
              //             Ot : datos_ot[i].ot,
              //             Id : datos_ot[i].item,
              //             IdCliente : datos_ot[i].identNro,
              //             Cliente : datos_ot[i].nombreComercial,
              //             IdProducto : datos_ot[i].referencia,
              //             Producto : datos_ot[i].nomReferencia,
              //             Cantidad : datos_ot[i].qty,
              //             Presentacion : this.presentacionProducto,
              //             Estatus : datos_ot[i].nomStatus,
              //             Proceso : proceso,
              //             exits : true,
              //             Fecha : datos_ot[i].fechaEntrada.replace('T00:00:00', ''),
              //           }
              //           this.rollosIngresados += 1;
              //           if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
              //           otTemporral = datos_ot[i].ot;
              //           this.rollos.push(info);
              //           RollosConsultados.push(datos_ot[i].item);
              //           this.rollos.sort((a,b) => Number(a.Ot) - Number(b.Ot) );
              //           this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
              //           this.rollos.sort((a,b) => Number(a.IdProducto) - Number(b.IdProducto) );
              //           this.rollos.sort((a,b) => Number(a.exits) - Number(b.exits) );
              //           this.FormConsultarRollos.setValue({
              //             OT_Id: this.FormConsultarRollos.value.OT_Id,
              //             IdRollo : this.FormConsultarRollos.value.IdRollo,
              //             fechaDoc : this.FormConsultarRollos.value.fechaDoc,
              //             fechaFinalDoc: this.FormConsultarRollos.value.fechaFinalDoc,
              //             Observacion : this.FormConsultarRollos.value.Observacion,
              //             Proceso : this.FormConsultarRollos.value.Proceso,
              //           });
              //         }
              //       }
              //     });
              //   }
              // });
            }
          } else if (ot != null) {
            if (ProcConsulta == "1"){
              this.bagProService.srvObtenerListaProcExtrusionRollosOT(ot).subscribe(datos_ot => {
                for (let i = 0; i < datos_ot.length; i++) {
                  if (!rollos.includes(datos_ot[i].item) && !RollosConsultados.includes(datos_ot[i].item) && datos_ot[i].nomStatus == 'EMPAQUE') {
                    if (datos_ot[i].nomStatus == 'EMPAQUE') proceso = 'EMP'
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
                    if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
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
                  } else if (rollos.includes(datos_ot[i].item) && !RollosConsultados.includes(datos_ot[i].item) && datos_ot[i].nomStatus == 'EMPAQUE') {
                    if (datos_ot[i].nomStatus == 'EMPAQUE') proceso = 'EMP'
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
                    if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
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

              // this.bagProService.srvObtenerListaProcExtrusionRollosOT(ot).subscribe(datos_ot => {
              //   for (let i = 0; i < datos_ot.length; i++) {
              //     this.dtEntradaRollosService.srvObtenerVerificarRollo(datos_ot[i].item).subscribe(datos_rollos => {
              //       if (datos_rollos.length == 0 && datos_ot[i].nomStatus == 'EMPAQUE') {
              //         if (!RollosConsultados.includes(datos_ot[i].item)){
              //           if (datos_ot[i].nomStatus == 'EMPAQUE') proceso = 'EMP'
              //           let info : any = {
              //             Ot : datos_ot[i].ot,
              //             Id : datos_ot[i].item,
              //             IdCliente : datos_ot[i].identNro,
              //             Cliente : datos_ot[i].nombreComercial,
              //             IdProducto : datos_ot[i].clienteItem,
              //             Producto : datos_ot[i].clienteItemNombre,
              //             Cantidad : datos_ot[i].extnetokg,
              //             Presentacion : datos_ot[i].unidad,
              //             Estatus : datos_ot[i].nomStatus,
              //             Proceso : proceso,
              //             exits : false,
              //             Fecha : datos_ot[i].fecha.replace('T00:00:00', ''),
              //           }
              //           this.rollosSinIngresar += 1;
              //           if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
              //           otTemporral = datos_ot[i].ot;
              //           this.rollos.push(info);
              //           RollosConsultados.push(datos_ot[i].item);
              //           this.rollos.sort((a,b) => Number(a.Ot) - Number(b.Ot) );
              //           this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
              //           this.rollos.sort((a,b) => Number(a.IdProducto) - Number(b.IdProducto) );
              //           this.rollos.sort((a,b) => Number(a.exits) - Number(b.exits) );
              //           this.FormConsultarRollos.setValue({
              //             OT_Id: this.FormConsultarRollos.value.OT_Id,
              //             IdRollo : this.FormConsultarRollos.value.IdRollo,
              //             fechaDoc : this.FormConsultarRollos.value.fechaDoc,
              //             fechaFinalDoc: this.FormConsultarRollos.value.fechaFinalDoc,
              //             Observacion : this.FormConsultarRollos.value.Observacion,
              //             Proceso : this.FormConsultarRollos.value.Proceso,
              //           });
              //         }
              //       } else if (datos_rollos.length != 0 && datos_ot[i].nomStatus == 'EMPAQUE') {
              //         if (!RollosConsultados.includes(datos_ot[i].item)){
              //           if (datos_ot[i].nomStatus == 'EMPAQUE') proceso = 'EMP'
              //           let info : any = {
              //             Ot : datos_ot[i].ot,
              //             Id : datos_ot[i].item,
              //             IdCliente : datos_ot[i].identNro,
              //             Cliente : datos_ot[i].nombreComercial,
              //             IdProducto : datos_ot[i].clienteItem,
              //             Producto : datos_ot[i].clienteItemNombre,
              //             Cantidad : datos_ot[i].extnetokg,
              //             Presentacion : datos_ot[i].unidad,
              //             Estatus : datos_ot[i].nomStatus,
              //             Proceso : proceso,
              //             exits : true,
              //             Fecha : datos_ot[i].fecha.replace('T00:00:00', ''),
              //           }
              //           this.rollosIngresados += 1;
              //           if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
              //           otTemporral = datos_ot[i].ot;
              //           this.rollos.push(info);
              //           RollosConsultados.push(datos_ot[i].item);
              //           this.rollos.sort((a,b) => Number(a.Ot) - Number(b.Ot) );
              //           this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
              //           this.rollos.sort((a,b) => Number(a.IdProducto) - Number(b.IdProducto) );
              //           this.rollos.sort((a,b) => Number(a.exits) - Number(b.exits) );
              //           this.FormConsultarRollos.setValue({
              //             OT_Id: this.FormConsultarRollos.value.OT_Id,
              //             IdRollo : this.FormConsultarRollos.value.IdRollo,
              //             fechaDoc : this.FormConsultarRollos.value.fechaDoc,
              //             fechaFinalDoc: this.FormConsultarRollos.value.fechaFinalDoc,
              //             Observacion : this.FormConsultarRollos.value.Observacion,
              //             Proceso : this.FormConsultarRollos.value.Proceso,
              //           });
              //         }
              //       }
              //     });
              //   }
              // });
            } else if (ProcConsulta == "2") {
              this.bagProService.srvObtenerListaProcExtrusionRollosOT(ot).subscribe(datos_ot => {
                for (let i = 0; i < datos_ot.length; i++) {
                  if (!rollos.includes(datos_ot[i].item) && !RollosConsultados.includes(datos_ot[i].item) && datos_ot[i].nomStatus == 'EXTRUSION') {
                    if (datos_ot[i].nomStatus == 'EXTRUSION') proceso = 'EXT'
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
                    if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
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
                    if (datos_ot[i].nomStatus == 'EXTRUSION') proceso = 'EXT'
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
                    if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
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
              // this.bagProService.srvObtenerListaProcExtrusionRollosOT(ot).subscribe(datos_ot => {
              //   for (let i = 0; i < datos_ot.length; i++) {
              //     this.dtEntradaRollosService.srvObtenerVerificarRollo(datos_ot[i].item).subscribe(datos_rollos => {
              //       if (datos_rollos.length == 0 && datos_ot[i].nomStatus == 'EXTRUSION') {
              //         if (!RollosConsultados.includes(datos_ot[i].item)){
              //           if (datos_ot[i].nomStatus == 'EXTRUSION') proceso = 'EXT'
              //           let info : any = {
              //             Ot : datos_ot[i].ot,
              //             Id : datos_ot[i].item,
              //             IdCliente : datos_ot[i].identNro,
              //             Cliente : datos_ot[i].nombreComercial,
              //             IdProducto : datos_ot[i].clienteItem,
              //             Producto : datos_ot[i].clienteItemNombre,
              //             Cantidad : datos_ot[i].extnetokg,
              //             Presentacion : datos_ot[i].unidad,
              //             Estatus : datos_ot[i].nomStatus,
              //             Proceso : proceso,
              //             exits : false,
              //             Fecha : datos_ot[i].fecha.replace('T00:00:00', ''),
              //           }
              //           if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
              //           otTemporral = datos_ot[i].ot;
              //           this.rollos.push(info);
              //           RollosConsultados.push(datos_ot[i].item);
              //           this.rollos.sort((a,b) => Number(a.Ot) - Number(b.Ot) );
              //           this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
              //           this.rollos.sort((a,b) => Number(a.IdProducto) - Number(b.IdProducto) );
              //           this.rollos.sort((a,b) => Number(a.exits) - Number(b.exits) );
              //           this.FormConsultarRollos.setValue({
              //             OT_Id: this.FormConsultarRollos.value.OT_Id,
              //             IdRollo : this.FormConsultarRollos.value.IdRollo,
              //             fechaDoc : this.FormConsultarRollos.value.fechaDoc,
              //             fechaFinalDoc: this.FormConsultarRollos.value.fechaFinalDoc,
              //             Observacion : this.FormConsultarRollos.value.Observacion,
              //             Proceso : this.FormConsultarRollos.value.Proceso,
              //           });
              //         }
              //       } else if (datos_rollos.length == 0 && datos_ot[i].nomStatus == 'EXTRUSION') {
              //         if (!RollosConsultados.includes(datos_ot[i].item)){
              //           if (datos_ot[i].nomStatus == 'EXTRUSION') proceso = 'EXT'
              //           let info : any = {
              //             Ot : datos_ot[i].ot,
              //             Id : datos_ot[i].item,
              //             IdCliente : datos_ot[i].identNro,
              //             Cliente : datos_ot[i].nombreComercial,
              //             IdProducto : datos_ot[i].clienteItem,
              //             Producto : datos_ot[i].clienteItemNombre,
              //             Cantidad : datos_ot[i].extnetokg,
              //             Presentacion : datos_ot[i].unidad,
              //             Estatus : datos_ot[i].nomStatus,
              //             Proceso : proceso,
              //             exits : true,
              //             Fecha : datos_ot[i].fecha.replace('T00:00:00', ''),
              //           }
              //           this.rollosIngresados += 1;
              //           if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
              //           otTemporral = datos_ot[i].ot;
              //           this.rollos.push(info);
              //           RollosConsultados.push(datos_ot[i].item);
              //           this.rollos.sort((a,b) => Number(a.Ot) - Number(b.Ot) );
              //           this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
              //           this.rollos.sort((a,b) => Number(a.IdProducto) - Number(b.IdProducto) );
              //           this.rollos.sort((a,b) => Number(a.exits) - Number(b.exits) );
              //           this.FormConsultarRollos.setValue({
              //             OT_Id: this.FormConsultarRollos.value.OT_Id,
              //             IdRollo : this.FormConsultarRollos.value.IdRollo,
              //             fechaDoc : this.FormConsultarRollos.value.fechaDoc,
              //             fechaFinalDoc: this.FormConsultarRollos.value.fechaFinalDoc,
              //             Observacion : this.FormConsultarRollos.value.Observacion,
              //             Proceso : this.FormConsultarRollos.value.Proceso,
              //           });
              //         }
              //       }
              //     });
              //   }
              // });
            } else if (ProcConsulta == "3") {
              this.bagProService.srvObtenerListaProcSelladoRollosOT(ot).subscribe(datos_ot => {
                for (let i = 0; i < datos_ot.length; i++) {
                  if (!rollos.includes(datos_ot[i].item) && !RollosConsultados.includes(datos_ot[i].item) && datos_ot[i].nomStatus == 'SELLADO') {
                    this.idProducto = datos_ot[i].referencia;
                    if (datos_ot[i].unidad == 'UND') this.presentacionProducto = 'Und';
                    if (datos_ot[i].unidad == 'PAQ') this.presentacionProducto = 'Paquete';
                    if (datos_ot[i].unidad == 'KLS') this.presentacionProducto = 'Kg';
                    if (datos_ot[i].nomStatus == 'SELLADO') proceso = 'SELLA'
                    if (datos_ot[i].nomStatus == 'Wiketiado') proceso = 'WIKE'
                    let info : any = {
                      Ot : datos_ot[i].ot,
                      Id : datos_ot[i].item,
                      IdCliente : datos_ot[i].identNro,
                      Cliente : datos_ot[i].nombreComercial,
                      IdProducto : datos_ot[i].referencia,
                      Producto : datos_ot[i].nomReferencia,
                      Cantidad : datos_ot[i].qty,
                      Presentacion : this.presentacionProducto,
                      Estatus : datos_ot[i].nomStatus,
                      Proceso : proceso,
                      exits : false,
                      Fecha : datos_ot[i].fechaEntrada.replace('T00:00:00', ''),
                    }
                    this.rollosSinIngresar += 1;
                    if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
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
                  } else if (rollos.includes(datos_ot[i].item) && !RollosConsultados.includes(datos_ot[i].item) && datos_ot[i].nomStatus == 'SELLADO'){
                    this.idProducto = datos_ot[i].referencia;
                    if (datos_ot[i].unidad == 'UND') this.presentacionProducto = 'Und';
                    if (datos_ot[i].unidad == 'PAQ') this.presentacionProducto = 'Paquete';
                    if (datos_ot[i].unidad == 'KLS') this.presentacionProducto = 'Kg';
                    if (datos_ot[i].nomStatus == 'SELLADO') proceso = 'SELLA'
                    if (datos_ot[i].nomStatus == 'Wiketiado') proceso = 'WIKE'
                    let info : any = {
                      Ot : datos_ot[i].ot,
                      Id : datos_ot[i].item,
                      IdCliente : datos_ot[i].identNro,
                      Cliente : datos_ot[i].nombreComercial,
                      IdProducto : datos_ot[i].referencia,
                      Producto : datos_ot[i].nomReferencia,
                      Cantidad : datos_ot[i].qty,
                      Presentacion : this.presentacionProducto,
                      Estatus : datos_ot[i].nomStatus,
                      Proceso : proceso,
                      exits : true,
                      Fecha : datos_ot[i].fechaEntrada.replace('T00:00:00', ''),
                    }
                    this.rollosIngresados += 1;
                    if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
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

              // this.bagProService.srvObtenerListaProcSelladoRollosOT(ot).subscribe(datos_ot => {
              //   for (let i = 0; i < datos_ot.length; i++) {
              //     this.dtEntradaRollosService.srvObtenerVerificarRollo(datos_ot[i].item).subscribe(datos_rollos => {
              //       if (datos_rollos.length == 0) {
              //         if (!RollosConsultados.includes(datos_ot[i].item)){
              //           this.idProducto = datos_ot[i].referencia;
              //           if (datos_ot[i].unidad == 'UND') this.presentacionProducto = 'Und';
              //           if (datos_ot[i].unidad == 'PAQ') this.presentacionProducto = 'Paquete';
              //           if (datos_ot[i].unidad == 'KLS') this.presentacionProducto = 'Kg';
              //           if (datos_ot[i].nomStatus == 'EXTRUSION') proceso = 'EXT'
              //           if (datos_ot[i].nomStatus == 'IMPRESION') proceso = 'IMP'
              //           if (datos_ot[i].nomStatus == 'ROTOGRABADO') proceso = 'ROT'
              //           if (datos_ot[i].nomStatus == 'DOBLADO') proceso = 'DBLD'
              //           if (datos_ot[i].nomStatus == 'LAMINADO') proceso = 'LAM'
              //           if (datos_ot[i].nomStatus == 'CORTE') proceso = 'CORTE'
              //           if (datos_ot[i].nomStatus == 'EMPAQUE') proceso = 'EMP'
              //           if (datos_ot[i].nomStatus == 'SELLADO') proceso = 'SELLA'
              //           if (datos_ot[i].nomStatus == 'Wiketiado') proceso = 'WIKE'
              //           let info : any = {
              //             Ot : datos_ot[i].ot,
              //             Id : datos_ot[i].item,
              //             IdCliente : datos_ot[i].identNro,
              //             Cliente : datos_ot[i].nombreComercial,
              //             IdProducto : datos_ot[i].referencia,
              //             Producto : datos_ot[i].nomReferencia,
              //             Cantidad : datos_ot[i].qty,
              //             Presentacion : this.presentacionProducto,
              //             Estatus : datos_ot[i].nomStatus,
              //             Proceso : proceso,
              //             exits : false,
              //             Fecha : datos_ot[i].fechaEntrada.replace('T00:00:00', ''),
              //           }
              //           this.rollosSinIngresar += 1;
              //           if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
              //           otTemporral = datos_ot[i].ot;
              //           this.rollos.push(info);
              //           RollosConsultados.push(datos_ot[i].item);
              //           this.rollos.sort((a,b) => Number(a.Ot) - Number(b.Ot) );
              //           this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
              //           this.rollos.sort((a,b) => Number(a.IdProducto) - Number(b.IdProducto) );
              //           this.rollos.sort((a,b) => Number(a.exits) - Number(b.exits) );
              //           this.FormConsultarRollos.setValue({
              //             OT_Id: this.FormConsultarRollos.value.OT_Id,
              //             IdRollo : this.FormConsultarRollos.value.IdRollo,
              //             fechaDoc : this.FormConsultarRollos.value.fechaDoc,
              //             fechaFinalDoc: this.FormConsultarRollos.value.fechaFinalDoc,
              //             Observacion : this.FormConsultarRollos.value.Observacion,
              //             Proceso : this.FormConsultarRollos.value.Proceso,
              //           });
              //         }
              //       } else {
              //         if (!RollosConsultados.includes(datos_ot[i].item)){
              //           this.idProducto = datos_ot[i].referencia;
              //           if (datos_ot[i].unidad == 'UND') this.presentacionProducto = 'Und';
              //           if (datos_ot[i].unidad == 'PAQ') this.presentacionProducto = 'Paquete';
              //           if (datos_ot[i].unidad == 'KLS') this.presentacionProducto = 'Kg';
              //           if (datos_ot[i].nomStatus == 'SELLADO') proceso = 'SELLA'
              //           if (datos_ot[i].nomStatus == 'Wiketiado') proceso = 'WIKE'
              //           let info : any = {
              //             Ot : datos_ot[i].ot,
              //             Id : datos_ot[i].item,
              //             IdCliente : datos_ot[i].identNro,
              //             Cliente : datos_ot[i].nombreComercial,
              //             IdProducto : datos_ot[i].referencia,
              //             Producto : datos_ot[i].nomReferencia,
              //             Cantidad : datos_ot[i].qty,
              //             Presentacion : this.presentacionProducto,
              //             Estatus : datos_ot[i].nomStatus,
              //             Proceso : proceso,
              //             exits : true,
              //             Fecha : datos_ot[i].fechaEntrada.replace('T00:00:00', ''),
              //           }
              //           this.rollosIngresados += 1;
              //           if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
              //           otTemporral = datos_ot[i].ot;
              //           this.rollos.push(info);
              //           RollosConsultados.push(datos_ot[i].item);
              //           this.rollos.sort((a,b) => Number(a.Ot) - Number(b.Ot) );
              //           this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
              //           this.rollos.sort((a,b) => Number(a.IdProducto) - Number(b.IdProducto) );
              //           this.rollos.sort((a,b) => Number(a.exits) - Number(b.exits) );
              //           this.FormConsultarRollos.setValue({
              //             OT_Id: this.FormConsultarRollos.value.OT_Id,
              //             IdRollo : this.FormConsultarRollos.value.IdRollo,
              //             fechaDoc : this.FormConsultarRollos.value.fechaDoc,
              //             fechaFinalDoc: this.FormConsultarRollos.value.fechaFinalDoc,
              //             Observacion : this.FormConsultarRollos.value.Observacion,
              //             Proceso : this.FormConsultarRollos.value.Proceso,
              //           });
              //         }
              //       }
              //     });
              //   }
              // });
            }
          } else if (rollo != null) {
            if (ProcConsulta == "1"){
              this.bagProService.srvObtenerListaProcExtrusionRollos(rollo).subscribe(datos_ot => {
                for (let i = 0; i < datos_ot.length; i++) {
                  if (!rollos.includes(datos_ot[i].item) && !RollosConsultados.includes(datos_ot[i].item) && datos_ot[i].nomStatus == 'EMPAQUE') {
                    if (datos_ot[i].nomStatus == 'EMPAQUE') proceso = 'EMP'
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
                    if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
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
                  } else if (rollos.includes(datos_ot[i].item) && !RollosConsultados.includes(datos_ot[i].item) && datos_ot[i].nomStatus == 'EMPAQUE') {
                    if (datos_ot[i].nomStatus == 'EMPAQUE') proceso = 'EMP'
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
                    if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
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

              // this.bagProService.srvObtenerListaProcExtrusionRollos(rollo).subscribe(datos_ot => {
              //   for (let i = 0; i < datos_ot.length; i++) {
              //     this.dtEntradaRollosService.srvObtenerVerificarRollo(datos_ot[i].item).subscribe(datos_rollos => {
              //       if (datos_rollos.length == 0 && datos_ot[i].nomStatus == 'EMPAQUE') {
              //         if (!RollosConsultados.includes(datos_ot[i].item)){
              //           if (datos_ot[i].nomStatus == 'EMPAQUE') proceso = 'EMP'
              //           let info : any = {
              //             Ot : datos_ot[i].ot,
              //             Id : datos_ot[i].item,
              //             IdCliente : datos_ot[i].identNro,
              //             Cliente : datos_ot[i].nombreComercial,
              //             IdProducto : datos_ot[i].clienteItem,
              //             Producto : datos_ot[i].clienteItemNombre,
              //             Cantidad : datos_ot[i].extnetokg,
              //             Presentacion : datos_ot[i].unidad,
              //             Estatus : datos_ot[i].nomStatus,
              //             Proceso : proceso,
              //             exits : false,
              //           }
              //           this.rollosSinIngresar += 1;
              //           if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
              //           otTemporral = datos_ot[i].ot;
              //           this.rollos.push(info);
              //           RollosConsultados.push(datos_ot[i].item);
              //           this.rollos.sort((a,b) => Number(a.Ot) - Number(b.Ot) );
              //           this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
              //           this.rollos.sort((a,b) => Number(a.IdProducto) - Number(b.IdProducto) );
              //           this.rollos.sort((a,b) => Number(a.exits) - Number(b.exits) );
              //           this.FormConsultarRollos.setValue({
              //             OT_Id: ot,
              //             IdRollo : rollo,
              //             fechaDoc : this.FormConsultarRollos.value.fechaDoc,
              //             fechaFinalDoc: this.FormConsultarRollos.value.fechaFinalDoc,
              //             Observacion : this.FormConsultarRollos.value.Observacion,
              //             Proceso : this.FormConsultarRollos.value.Proceso,
              //           });
              //         }
              //       } else if (datos_rollos.length != 0 && datos_ot[i].nomStatus == 'EMPAQUE') {
              //         if (!RollosConsultados.includes(datos_ot[i].item)){
              //           if (datos_ot[i].nomStatus == 'EMPAQUE') proceso = 'EMP'
              //           let info : any = {
              //             Ot : datos_ot[i].ot,
              //             Id : datos_ot[i].item,
              //             IdCliente : datos_ot[i].identNro,
              //             Cliente : datos_ot[i].nombreComercial,
              //             IdProducto : datos_ot[i].clienteItem,
              //             Producto : datos_ot[i].clienteItemNombre,
              //             Cantidad : datos_ot[i].extnetokg,
              //             Presentacion : datos_ot[i].unidad,
              //             Estatus : datos_ot[i].nomStatus,
              //             Proceso : proceso,
              //             exits : true,
              //           }
              //           this.rollosIngresados += 1;
              //           if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
              //           otTemporral = datos_ot[i].ot;
              //           this.rollos.push(info);
              //           RollosConsultados.push(datos_ot[i].item);
              //           this.rollos.sort((a,b) => Number(a.Ot) - Number(b.Ot) );
              //           this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
              //           this.rollos.sort((a,b) => Number(a.IdProducto) - Number(b.IdProducto) );
              //           this.rollos.sort((a,b) => Number(a.exits) - Number(b.exits) );
              //           this.FormConsultarRollos.setValue({
              //             OT_Id: this.FormConsultarRollos.value.OT_Id,
              //             IdRollo : this.FormConsultarRollos.value.IdRollo,
              //             fechaDoc : this.FormConsultarRollos.value.fechaDoc,
              //             fechaFinalDoc: this.FormConsultarRollos.value.fechaFinalDoc,
              //             Observacion : this.FormConsultarRollos.value.Observacion,
              //             Proceso : this.FormConsultarRollos.value.Proceso,
              //           });
              //         }
              //       }
              //     });
              //     break;
              //   }
              // });
            } else if (ProcConsulta == "2") {
              this.bagProService.srvObtenerListaProcExtrusionRollos(rollo).subscribe(datos_ot => {
                for (let i = 0; i < datos_ot.length; i++) {
                  if (!rollos.includes(datos_ot[i].item) && !RollosConsultados.includes(datos_ot[i].item) && datos_ot[i].nomStatus == 'EXTRUSION') {
                    if (datos_ot[i].nomStatus == 'EXTRUSION') proceso = 'EXT'
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
                    if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
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
                    if (datos_ot[i].nomStatus == 'EXTRUSION') proceso = 'EXT'
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
                    if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
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

              // this.bagProService.srvObtenerListaProcExtrusionRollos(rollo).subscribe(datos_ot => {
              //   for (let i = 0; i < datos_ot.length; i++) {
              //     this.dtEntradaRollosService.srvObtenerVerificarRollo(datos_ot[i].item).subscribe(datos_rollos => {
              //       if (datos_rollos.length == 0 && datos_ot[i].nomStatus == 'EXTRUSION') {
              //         if (!RollosConsultados.includes(datos_ot[i].item)){
              //           if (datos_ot[i].nomStatus == 'EXTRUSION') proceso = 'EXT'
              //           let info : any = {
              //             Ot : datos_ot[i].ot,
              //             Id : datos_ot[i].item,
              //             IdCliente : datos_ot[i].identNro,
              //             Cliente : datos_ot[i].nombreComercial,
              //             IdProducto : datos_ot[i].clienteItem,
              //             Producto : datos_ot[i].clienteItemNombre,
              //             Cantidad : datos_ot[i].extnetokg,
              //             Presentacion : datos_ot[i].unidad,
              //             Estatus : datos_ot[i].nomStatus,
              //             Proceso : proceso,
              //             exits : false,
              //             Fecha : datos_ot[i].fecha.replace('T00:00:00', ''),
              //           }
              //           if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
              //           otTemporral = datos_ot[i].ot;
              //           this.rollos.push(info);
              //           RollosConsultados.push(datos_ot[i].item);
              //           this.rollos.sort((a,b) => Number(a.Ot) - Number(b.Ot) );
              //           this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
              //           this.rollos.sort((a,b) => Number(a.IdProducto) - Number(b.IdProducto) );
              //           this.rollos.sort((a,b) => Number(a.exits) - Number(b.exits) );
              //           this.FormConsultarRollos.setValue({
              //             OT_Id: this.FormConsultarRollos.value.OT_Id,
              //             IdRollo : this.FormConsultarRollos.value.IdRollo,
              //             fechaDoc : this.FormConsultarRollos.value.fechaDoc,
              //             fechaFinalDoc: this.FormConsultarRollos.value.fechaFinalDoc,
              //             Observacion : this.FormConsultarRollos.value.Observacion,
              //             Proceso : this.FormConsultarRollos.value.Proceso,
              //           });
              //         }
              //       } else if (datos_rollos.length == 0 && datos_ot[i].nomStatus == 'EXTRUSION') {
              //         if (!RollosConsultados.includes(datos_ot[i].item)){
              //           if (datos_ot[i].nomStatus == 'EXTRUSION') proceso = 'EXT'
              //           let info : any = {
              //             Ot : datos_ot[i].ot,
              //             Id : datos_ot[i].item,
              //             IdCliente : datos_ot[i].identNro,
              //             Cliente : datos_ot[i].nombreComercial,
              //             IdProducto : datos_ot[i].clienteItem,
              //             Producto : datos_ot[i].clienteItemNombre,
              //             Cantidad : datos_ot[i].extnetokg,
              //             Presentacion : datos_ot[i].unidad,
              //             Estatus : datos_ot[i].nomStatus,
              //             Proceso : proceso,
              //             exits : true,
              //             Fecha : datos_ot[i].fecha.replace('T00:00:00', ''),
              //           }
              //           this.rollosIngresados += 1;
              //           if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
              //           otTemporral = datos_ot[i].ot;
              //           this.rollos.push(info);
              //           RollosConsultados.push(datos_ot[i].item);
              //           this.rollos.sort((a,b) => Number(a.Ot) - Number(b.Ot) );
              //           this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
              //           this.rollos.sort((a,b) => Number(a.IdProducto) - Number(b.IdProducto) );
              //           this.rollos.sort((a,b) => Number(a.exits) - Number(b.exits) );
              //           this.FormConsultarRollos.setValue({
              //             OT_Id: this.FormConsultarRollos.value.OT_Id,
              //             IdRollo : this.FormConsultarRollos.value.IdRollo,
              //             fechaDoc : this.FormConsultarRollos.value.fechaDoc,
              //             fechaFinalDoc: this.FormConsultarRollos.value.fechaFinalDoc,
              //             Observacion : this.FormConsultarRollos.value.Observacion,
              //             Proceso : this.FormConsultarRollos.value.Proceso,
              //           });
              //         }
              //       }
              //     });
              //     break;
              //   }
              // });
            } else if (ProcConsulta == "3") {
              this.bagProService.srvObtenerListaProcSelladoRollo(rollo).subscribe(datos_ot => {
                for (let i = 0; i < datos_ot.length; i++) {
                  if (!rollos.includes(datos_ot[i].item) && !RollosConsultados.includes(datos_ot[i].item) && datos_ot[i].nomStatus == 'SELLADO') {
                    this.idProducto = datos_ot[i].referencia;
                    if (datos_ot[i].unidad == 'UND') this.presentacionProducto = 'Und';
                    if (datos_ot[i].unidad == 'PAQ') this.presentacionProducto = 'Paquete';
                    if (datos_ot[i].unidad == 'KLS') this.presentacionProducto = 'Kg';
                    if (datos_ot[i].nomStatus == 'SELLADO') proceso = 'SELLA'
                    if (datos_ot[i].nomStatus == 'Wiketiado') proceso = 'WIKE'
                    let info : any = {
                      Ot : datos_ot[i].ot,
                      Id : datos_ot[i].item,
                      IdCliente : datos_ot[i].identNro,
                      Cliente : datos_ot[i].nombreComercial,
                      IdProducto : datos_ot[i].referencia,
                      Producto : datos_ot[i].nomReferencia,
                      Cantidad : datos_ot[i].qty,
                      Presentacion : this.presentacionProducto,
                      Estatus : datos_ot[i].nomStatus,
                      Proceso : proceso,
                      exits : false,
                      Fecha : datos_ot[i].fechaEntrada.replace('T00:00:00', ''),
                    }
                    this.rollosSinIngresar += 1;
                    if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
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
                  } else if (rollos.includes(datos_ot[i].item) && !RollosConsultados.includes(datos_ot[i].item) && datos_ot[i].nomStatus == 'SELLADO'){
                    this.idProducto = datos_ot[i].referencia;
                    if (datos_ot[i].unidad == 'UND') this.presentacionProducto = 'Und';
                    if (datos_ot[i].unidad == 'PAQ') this.presentacionProducto = 'Paquete';
                    if (datos_ot[i].unidad == 'KLS') this.presentacionProducto = 'Kg';
                    if (datos_ot[i].nomStatus == 'SELLADO') proceso = 'SELLA'
                    if (datos_ot[i].nomStatus == 'Wiketiado') proceso = 'WIKE'
                    let info : any = {
                      Ot : datos_ot[i].ot,
                      Id : datos_ot[i].item,
                      IdCliente : datos_ot[i].identNro,
                      Cliente : datos_ot[i].nombreComercial,
                      IdProducto : datos_ot[i].referencia,
                      Producto : datos_ot[i].nomReferencia,
                      Cantidad : datos_ot[i].qty,
                      Presentacion : this.presentacionProducto,
                      Estatus : datos_ot[i].nomStatus,
                      Proceso : proceso,
                      exits : true,
                      Fecha : datos_ot[i].fechaEntrada.replace('T00:00:00', ''),
                    }
                    this.rollosIngresados += 1;
                    if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
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

              // this.bagProService.srvObtenerListaProcSelladoRollo(rollo).subscribe(datos_ot => {
              //   for (let i = 0; i < datos_ot.length; i++) {
              //     this.dtEntradaRollosService.srvObtenerVerificarRollo(datos_ot[i].item).subscribe(datos_rollos => {
              //       if (datos_rollos.length == 0) {
              //         if (!RollosConsultados.includes(datos_ot[i].item)){
              //           this.idProducto = datos_ot[i].referencia;
              //           if (datos_ot[i].unidad == 'UND') this.presentacionProducto = 'Und';
              //           if (datos_ot[i].unidad == 'PAQ') this.presentacionProducto = 'Paquete';
              //           if (datos_ot[i].unidad == 'KLS') this.presentacionProducto = 'Kg';
              //           if (datos_ot[i].nomStatus == 'EXTRUSION') proceso = 'EXT'
              //           if (datos_ot[i].nomStatus == 'IMPRESION') proceso = 'IMP'
              //           if (datos_ot[i].nomStatus == 'ROTOGRABADO') proceso = 'ROT'
              //           if (datos_ot[i].nomStatus == 'DOBLADO') proceso = 'DBLD'
              //           if (datos_ot[i].nomStatus == 'LAMINADO') proceso = 'LAM'
              //           if (datos_ot[i].nomStatus == 'CORTE') proceso = 'CORTE'
              //           if (datos_ot[i].nomStatus == 'EMPAQUE') proceso = 'EMP'
              //           if (datos_ot[i].nomStatus == 'SELLADO') proceso = 'SELLA'
              //           if (datos_ot[i].nomStatus == 'Wiketiado') proceso = 'WIKE'
              //           let info : any = {
              //             Ot : datos_ot[i].ot,
              //             Id : datos_ot[i].item,
              //             IdCliente : datos_ot[i].identNro,
              //             Cliente : datos_ot[i].nombreComercial,
              //             IdProducto : datos_ot[i].referencia,
              //             Producto : datos_ot[i].nomReferencia,
              //             Cantidad : datos_ot[i].qty,
              //             Presentacion : this.presentacionProducto,
              //             Estatus : datos_ot[i].nomStatus,
              //             Proceso : proceso,
              //             exits : false,
              //             Fecha : datos_ot[i].fechaEntrada.replace('T00:00:00', ''),
              //           }
              //           this.rollosSinIngresar += 1;
              //           if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
              //           otTemporral = datos_ot[i].ot;
              //           this.rollos.push(info);
              //           RollosConsultados.push(datos_ot[i].item);
              //           this.rollos.sort((a,b) => Number(a.Ot) - Number(b.Ot) );
              //           this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
              //           this.rollos.sort((a,b) => Number(a.IdProducto) - Number(b.IdProducto) );
              //           this.rollos.sort((a,b) => Number(a.exits) - Number(b.exits) );
              //           this.FormConsultarRollos.setValue({
              //             OT_Id: this.FormConsultarRollos.value.OT_Id,
              //             IdRollo : this.FormConsultarRollos.value.IdRollo,
              //             fechaDoc : this.FormConsultarRollos.value.fechaDoc,
              //             fechaFinalDoc: this.FormConsultarRollos.value.fechaFinalDoc,
              //             Observacion : this.FormConsultarRollos.value.Observacion,
              //             Proceso : this.FormConsultarRollos.value.Proceso,
              //           });
              //         }
              //       } else {
              //         if (!RollosConsultados.includes(datos_ot[i].item)){
              //           this.idProducto = datos_ot[i].referencia;
              //           if (datos_ot[i].unidad == 'UND') this.presentacionProducto = 'Und';
              //           if (datos_ot[i].unidad == 'PAQ') this.presentacionProducto = 'Paquete';
              //           if (datos_ot[i].unidad == 'KLS') this.presentacionProducto = 'Kg';
              //           if (datos_ot[i].nomStatus == 'SELLADO') proceso = 'SELLA'
              //           if (datos_ot[i].nomStatus == 'Wiketiado') proceso = 'WIKE'
              //           let info : any = {
              //             Ot : datos_ot[i].ot,
              //             Id : datos_ot[i].item,
              //             IdCliente : datos_ot[i].identNro,
              //             Cliente : datos_ot[i].nombreComercial,
              //             IdProducto : datos_ot[i].referencia,
              //             Producto : datos_ot[i].nomReferencia,
              //             Cantidad : datos_ot[i].qty,
              //             Presentacion : this.presentacionProducto,
              //             Estatus : datos_ot[i].nomStatus,
              //             Proceso : proceso,
              //             exits : true,
              //             Fecha : datos_ot[i].fechaEntrada.replace('T00:00:00', ''),
              //           }
              //           this.rollosIngresados += 1;
              //           if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
              //           otTemporral = datos_ot[i].ot;
              //           this.rollos.push(info);
              //           RollosConsultados.push(datos_ot[i].item);
              //           this.rollos.sort((a,b) => Number(a.Ot) - Number(b.Ot) );
              //           this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
              //           this.rollos.sort((a,b) => Number(a.IdProducto) - Number(b.IdProducto) );
              //           this.rollos.sort((a,b) => Number(a.exits) - Number(b.exits) );
              //           this.FormConsultarRollos.setValue({
              //             OT_Id: this.FormConsultarRollos.value.OT_Id,
              //             IdRollo : this.FormConsultarRollos.value.IdRollo,
              //             fechaDoc : this.FormConsultarRollos.value.fechaDoc,
              //             fechaFinalDoc: this.FormConsultarRollos.value.fechaFinalDoc,
              //             Observacion : this.FormConsultarRollos.value.Observacion,
              //             Proceso : this.FormConsultarRollos.value.Proceso,
              //           });
              //         }
              //       }
              //     });
              //     break;
              //   }
              // });
            }
          } else {
            if (ProcConsulta == "1"){
              this.bagProService.srvObtenerListaProcExtrusionFechas(this.fechaBusqueda, this.today).subscribe(datos_ot => {
                for (let i = 0; i < datos_ot.length; i++) {
                  if (!rollos.includes(datos_ot[i].item) && !RollosConsultados.includes(datos_ot[i].item) && datos_ot[i].nomStatus == 'EMPAQUE') {
                    if (datos_ot[i].nomStatus == 'EMPAQUE') proceso = 'EMP'
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
                    if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
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
                  } else if (rollos.includes(datos_ot[i].item) && !RollosConsultados.includes(datos_ot[i].item) && datos_ot[i].nomStatus == 'EMPAQUE') {
                    if (datos_ot[i].nomStatus == 'EMPAQUE') proceso = 'EMP'
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
                    this.rollosSinIngresar += 1;
                    if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
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
              // this.bagProService.srvObtenerListaProcExtrusionFechas(this.today, this.today).subscribe(datos_ot => {
              //   for (let i = 0; i < datos_ot.length; i++) {
              //     this.dtEntradaRollosService.srvObtenerVerificarRollo(datos_ot[i].item).subscribe(datos_rollos => {
              //       if (datos_rollos.length == 0 && datos_ot[i].nomStatus == 'EMPAQUE') {
              //         if (!RollosConsultados.includes(datos_ot[i].item)){
              //           if (datos_ot[i].nomStatus == 'EMPAQUE') proceso = 'EMP'
              //           let info : any = {
              //             Ot : datos_ot[i].ot,
              //             Id : datos_ot[i].item,
              //             IdCliente : datos_ot[i].identNro,
              //             Cliente : datos_ot[i].nombreComercial,
              //             IdProducto : datos_ot[i].clienteItem,
              //             Producto : datos_ot[i].clienteItemNombre,
              //             Cantidad : datos_ot[i].extnetokg,
              //             Presentacion : datos_ot[i].unidad,
              //             Estatus : datos_ot[i].nomStatus,
              //             Proceso : proceso,
              //             exits : false,
              //             Fecha : datos_ot[i].fecha.replace('T00:00:00', ''),
              //           }
              //           this.rollosSinIngresar += 1;
              //           if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
              //           otTemporral = datos_ot[i].ot;
              //           this.rollos.push(info);
              //           RollosConsultados.push(datos_ot[i].item);
              //           this.rollos.sort((a,b) => Number(a.Ot) - Number(b.Ot) );
              //           this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
              //           this.rollos.sort((a,b) => Number(a.IdProducto) - Number(b.IdProducto) );
              //           this.rollos.sort((a,b) => Number(a.exits) - Number(b.exits) );
              //           this.FormConsultarRollos.setValue({
              //             OT_Id: this.FormConsultarRollos.value.OT_Id,
              //             IdRollo : this.FormConsultarRollos.value.IdRollo,
              //             fechaDoc : this.FormConsultarRollos.value.fechaDoc,
              //             fechaFinalDoc: this.FormConsultarRollos.value.fechaFinalDoc,
              //             Observacion : this.FormConsultarRollos.value.Observacion,
              //             Proceso : this.FormConsultarRollos.value.Proceso,
              //           });
              //         }
              //       } else if (datos_rollos.length != 0 && datos_ot[i].nomStatus == 'EMPAQUE') {
              //         if (!RollosConsultados.includes(datos_ot[i].item)){
              //           if (datos_ot[i].nomStatus == 'EMPAQUE') proceso = 'EMP'
              //           let info : any = {
              //             Ot : datos_ot[i].ot,
              //             Id : datos_ot[i].item,
              //             IdCliente : datos_ot[i].identNro,
              //             Cliente : datos_ot[i].nombreComercial,
              //             IdProducto : datos_ot[i].clienteItem,
              //             Producto : datos_ot[i].clienteItemNombre,
              //             Cantidad : datos_ot[i].extnetokg,
              //             Presentacion : datos_ot[i].unidad,
              //             Estatus : datos_ot[i].nomStatus,
              //             Proceso : proceso,
              //             exits : true,
              //             Fecha : datos_ot[i].fecha.replace('T00:00:00', ''),
              //           }
              //           this.rollosIngresados += 1;
              //           if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
              //           otTemporral = datos_ot[i].ot;
              //           this.rollos.push(info);
              //           RollosConsultados.push(datos_ot[i].item);
              //           this.rollos.sort((a,b) => Number(a.Ot) - Number(b.Ot) );
              //           this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
              //           this.rollos.sort((a,b) => Number(a.IdProducto) - Number(b.IdProducto) );
              //           this.rollos.sort((a,b) => Number(a.exits) - Number(b.exits) );
              //           this.FormConsultarRollos.setValue({
              //             OT_Id: this.FormConsultarRollos.value.OT_Id,
              //             IdRollo : this.FormConsultarRollos.value.IdRollo,
              //             fechaDoc : this.FormConsultarRollos.value.fechaDoc,
              //             fechaFinalDoc: this.FormConsultarRollos.value.fechaFinalDoc,
              //             Observacion : this.FormConsultarRollos.value.Observacion,
              //             Proceso : this.FormConsultarRollos.value.Proceso,
              //           });
              //         }
              //       }
              //     });
              //   }
              // });
            } else if (ProcConsulta == "2") {
              this.bagProService.srvObtenerListaProcExtrusionFechas(this.fechaBusqueda, this.today).subscribe(datos_ot => {
                for (let i = 0; i < datos_ot.length; i++) {
                  if (!rollos.includes(datos_ot[i].item) && !RollosConsultados.includes(datos_ot[i].item) && datos_ot[i].nomStatus == 'EXTRUSION') {
                    if (datos_ot[i].nomStatus == 'EXTRUSION') proceso = 'EXT'
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
                    if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
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
                    if (datos_ot[i].nomStatus == 'EXTRUSION') proceso = 'EXT'
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
                    if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
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
              // this.bagProService.srvObtenerListaProcExtrusionFechas(this.today, this.today).subscribe(datos_ot => {
              //   for (let i = 0; i < datos_ot.length; i++) {
              //     this.dtEntradaRollosService.srvObtenerVerificarRollo(datos_ot[i].item).subscribe(datos_rollos => {
              //       if (datos_rollos.length == 0 && datos_ot[i].nomStatus == 'EXTRUSION') {
              //         if (!RollosConsultados.includes(datos_ot[i].item)){
              //           if (datos_ot[i].nomStatus == 'EXTRUSION') proceso = 'EXT'
              //           let info : any = {
              //             Ot : datos_ot[i].ot,
              //             Id : datos_ot[i].item,
              //             IdCliente : datos_ot[i].identNro,
              //             Cliente : datos_ot[i].nombreComercial,
              //             IdProducto : datos_ot[i].clienteItem,
              //             Producto : datos_ot[i].clienteItemNombre,
              //             Cantidad : datos_ot[i].extnetokg,
              //             Presentacion : datos_ot[i].unidad,
              //             Estatus : datos_ot[i].nomStatus,
              //             Proceso : proceso,
              //             exits : false,
              //             Fecha : datos_ot[i].fecha.replace('T00:00:00', ''),
              //           }
              //           if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
              //           otTemporral = datos_ot[i].ot;
              //           this.rollos.push(info);
              //           RollosConsultados.push(datos_ot[i].item);
              //           this.rollos.sort((a,b) => Number(a.Ot) - Number(b.Ot) );
              //           this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
              //           this.rollos.sort((a,b) => Number(a.IdProducto) - Number(b.IdProducto) );
              //           this.rollos.sort((a,b) => Number(a.exits) - Number(b.exits) );
              //           this.FormConsultarRollos.setValue({
              //             OT_Id: this.FormConsultarRollos.value.OT_Id,
              //             IdRollo : this.FormConsultarRollos.value.IdRollo,
              //             fechaDoc : this.FormConsultarRollos.value.fechaDoc,
              //             fechaFinalDoc: this.FormConsultarRollos.value.fechaFinalDoc,
              //             Observacion : this.FormConsultarRollos.value.Observacion,
              //             Proceso : this.FormConsultarRollos.value.Proceso,
              //           });
              //         }
              //       } else if (datos_rollos.length == 0 && datos_ot[i].nomStatus == 'EXTRUSION') {
              //         if (!RollosConsultados.includes(datos_ot[i].item)){
              //           if (datos_ot[i].nomStatus == 'EXTRUSION') proceso = 'EXT'
              //           let info : any = {
              //             Ot : datos_ot[i].ot,
              //             Id : datos_ot[i].item,
              //             IdCliente : datos_ot[i].identNro,
              //             Cliente : datos_ot[i].nombreComercial,
              //             IdProducto : datos_ot[i].clienteItem,
              //             Producto : datos_ot[i].clienteItemNombre,
              //             Cantidad : datos_ot[i].extnetokg,
              //             Presentacion : datos_ot[i].unidad,
              //             Estatus : datos_ot[i].nomStatus,
              //             Proceso : proceso,
              //             exits : true,
              //             Fecha : datos_ot[i].fecha.replace('T00:00:00', ''),
              //           }
              //           this.rollosIngresados += 1;
              //           if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
              //           otTemporral = datos_ot[i].ot;
              //           this.rollos.push(info);
              //           RollosConsultados.push(datos_ot[i].item);
              //           this.rollos.sort((a,b) => Number(a.Ot) - Number(b.Ot) );
              //           this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
              //           this.rollos.sort((a,b) => Number(a.IdProducto) - Number(b.IdProducto) );
              //           this.rollos.sort((a,b) => Number(a.exits) - Number(b.exits) );
              //           this.FormConsultarRollos.setValue({
              //             OT_Id: this.FormConsultarRollos.value.OT_Id,
              //             IdRollo : this.FormConsultarRollos.value.IdRollo,
              //             fechaDoc : this.FormConsultarRollos.value.fechaDoc,
              //             fechaFinalDoc: this.FormConsultarRollos.value.fechaFinalDoc,
              //             Observacion : this.FormConsultarRollos.value.Observacion,
              //             Proceso : this.FormConsultarRollos.value.Proceso,
              //           });
              //         }
              //       }
              //     });
              //   }
              // });
            } else if (ProcConsulta == "3") {
              this.bagProService.srvObtenerListaProcSelladoFechas(this.fechaBusqueda, this.today).subscribe(datos_ot => {
                for (let i = 0; i < datos_ot.length; i++) {
                  if (!rollos.includes(datos_ot[i].item) && !RollosConsultados.includes(datos_ot[i].item) && datos_ot[i].nomStatus == 'SELLADO') {
                    this.idProducto = datos_ot[i].referencia;
                    if (datos_ot[i].unidad == 'UND') this.presentacionProducto = 'Und';
                    if (datos_ot[i].unidad == 'PAQ') this.presentacionProducto = 'Paquete';
                    if (datos_ot[i].unidad == 'KLS') this.presentacionProducto = 'Kg';
                    if (datos_ot[i].nomStatus == 'SELLADO') proceso = 'SELLA'
                    if (datos_ot[i].nomStatus == 'Wiketiado') proceso = 'WIKE'
                    let info : any = {
                      Ot : datos_ot[i].ot,
                      Id : datos_ot[i].item,
                      IdCliente : datos_ot[i].identNro,
                      Cliente : datos_ot[i].nombreComercial,
                      IdProducto : datos_ot[i].referencia,
                      Producto : datos_ot[i].nomReferencia,
                      Cantidad : datos_ot[i].qty,
                      Presentacion : this.presentacionProducto,
                      Estatus : datos_ot[i].nomStatus,
                      Proceso : proceso,
                      exits : false,
                      Fecha : datos_ot[i].fechaEntrada.replace('T00:00:00', ''),
                    }
                    this.rollosSinIngresar += 1;
                    if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
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
                  } else if (rollos.includes(datos_ot[i].item) && !RollosConsultados.includes(datos_ot[i].item) && datos_ot[i].nomStatus == 'SELLADO'){
                    this.idProducto = datos_ot[i].referencia;
                    if (datos_ot[i].unidad == 'UND') this.presentacionProducto = 'Und';
                    if (datos_ot[i].unidad == 'PAQ') this.presentacionProducto = 'Paquete';
                    if (datos_ot[i].unidad == 'KLS') this.presentacionProducto = 'Kg';
                    if (datos_ot[i].nomStatus == 'SELLADO') proceso = 'SELLA'
                    if (datos_ot[i].nomStatus == 'Wiketiado') proceso = 'WIKE'
                    let info : any = {
                      Ot : datos_ot[i].ot,
                      Id : datos_ot[i].item,
                      IdCliente : datos_ot[i].identNro,
                      Cliente : datos_ot[i].nombreComercial,
                      IdProducto : datos_ot[i].referencia,
                      Producto : datos_ot[i].nomReferencia,
                      Cantidad : datos_ot[i].qty,
                      Presentacion : this.presentacionProducto,
                      Estatus : datos_ot[i].nomStatus,
                      Proceso : proceso,
                      exits : true,
                      Fecha : datos_ot[i].fechaEntrada.replace('T00:00:00', ''),
                    }
                    this.rollosIngresados += 1;
                    if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
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

              // this.bagProService.srvObtenerListaProcSelladoFechas(this.today, this.today).subscribe(datos_ot => {
              //   for (let i = 0; i < datos_ot.length; i++) {
              //     this.dtEntradaRollosService.srvObtenerVerificarRollo(datos_ot[i].item).subscribe(datos_rollos => {
              //       if (datos_rollos.length == 0) {
              //         if (!RollosConsultados.includes(datos_ot[i].item)){
              //           this.idProducto = datos_ot[i].referencia;
              //           if (datos_ot[i].unidad == 'UND') this.presentacionProducto = 'Und';
              //           if (datos_ot[i].unidad == 'PAQ') this.presentacionProducto = 'Paquete';
              //           if (datos_ot[i].unidad == 'KLS') this.presentacionProducto = 'Kg';
              //           if (datos_ot[i].nomStatus == 'SELLADO') proceso = 'SELLA'
              //           if (datos_ot[i].nomStatus == 'Wiketiado') proceso = 'WIKE'
              //           let info : any = {
              //             Ot : datos_ot[i].ot,
              //             Id : datos_ot[i].item,
              //             IdCliente : datos_ot[i].identNro,
              //             Cliente : datos_ot[i].nombreComercial,
              //             IdProducto : datos_ot[i].referencia,
              //             Producto : datos_ot[i].nomReferencia,
              //             Cantidad : datos_ot[i].qty,
              //             Presentacion : this.presentacionProducto,
              //             Estatus : datos_ot[i].nomStatus,
              //             Proceso : proceso,
              //             exits : false,
              //             Fecha : datos_ot[i].fechaEntrada.replace('T00:00:00', ''),
              //           }
              //           this.rollosSinIngresar += 1;
              //           if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
              //           otTemporral = datos_ot[i].ot;
              //           this.rollos.push(info);
              //           RollosConsultados.push(datos_ot[i].item);
              //           this.rollos.sort((a,b) => Number(a.Ot) - Number(b.Ot) );
              //           this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
              //           this.rollos.sort((a,b) => Number(a.IdProducto) - Number(b.IdProducto) );
              //           this.rollos.sort((a,b) => Number(a.exits) - Number(b.exits) );
              //           this.FormConsultarRollos.setValue({
              //             OT_Id: this.FormConsultarRollos.value.OT_Id,
              //             IdRollo : this.FormConsultarRollos.value.IdRollo,
              //             fechaDoc : this.FormConsultarRollos.value.fechaDoc,
              //             fechaFinalDoc: this.FormConsultarRollos.value.fechaFinalDoc,
              //             Observacion : this.FormConsultarRollos.value.Observacion,
              //             Proceso : this.FormConsultarRollos.value.Proceso,
              //           });
              //         }
              //       } else {
              //         if (!RollosConsultados.includes(datos_ot[i].item)){
              //           this.idProducto = datos_ot[i].referencia;
              //           if (datos_ot[i].unidad == 'UND') this.presentacionProducto = 'Und';
              //           if (datos_ot[i].unidad == 'PAQ') this.presentacionProducto = 'Paquete';
              //           if (datos_ot[i].unidad == 'KLS') this.presentacionProducto = 'Kg';
              //           if (datos_ot[i].nomStatus == 'SELLADO') proceso = 'SELLA'
              //           if (datos_ot[i].nomStatus == 'Wiketiado') proceso = 'WIKE'
              //           let info : any = {
              //             Ot : datos_ot[i].ot,
              //             Id : datos_ot[i].item,
              //             IdCliente : datos_ot[i].identNro,
              //             Cliente : datos_ot[i].nombreComercial,
              //             IdProducto : datos_ot[i].referencia,
              //             Producto : datos_ot[i].nomReferencia,
              //             Cantidad : datos_ot[i].qty,
              //             Presentacion : this.presentacionProducto,
              //             Estatus : datos_ot[i].nomStatus,
              //             Proceso : proceso,
              //             exits : true,
              //             Fecha : datos_ot[i].fechaEntrada.replace('T00:00:00', ''),
              //           }
              //           this.rollosIngresados += 1;
              //           if (otTemporral != datos_ot[i].ot) this.cantidadOT += 1;
              //           otTemporral = datos_ot[i].ot;
              //           this.rollos.push(info);
              //           RollosConsultados.push(datos_ot[i].item);
              //           this.rollos.sort((a,b) => Number(a.Ot) - Number(b.Ot) );
              //           this.rollos.sort((a,b) => Number(a.Id) - Number(b.Id) );
              //           this.rollos.sort((a,b) => Number(a.IdProducto) - Number(b.IdProducto) );
              //           this.rollos.sort((a,b) => Number(a.exits) - Number(b.exits) );
              //           this.FormConsultarRollos.setValue({
              //             OT_Id: this.FormConsultarRollos.value.OT_Id,
              //             IdRollo : this.FormConsultarRollos.value.IdRollo,
              //             fechaDoc : this.FormConsultarRollos.value.fechaDoc,
              //             fechaFinalDoc: this.FormConsultarRollos.value.fechaFinalDoc,
              //             Observacion : this.FormConsultarRollos.value.Observacion,
              //             Proceso : this.FormConsultarRollos.value.Proceso,
              //           });
              //         }
              //       }
              //     });
              //   }
              // });
            }
          }

          setTimeout(() => {
            if (this.rollos.length <= 0) Swal.fire(`No hay rollos por ingresar`);
            this.cargando = true;
          }, 5000);
        }, 4000);
      } else Swal.fire("¡La fecha seleccionada no es valida!");
    } else Swal.fire("¡Seleccione un proceso!");
  }

  //Funcion que va a agregar Productos en la tabla
  cargarProducto(item : any){
    if (this.rollosInsertar.length == 0) {
      let info : any = {
        Ot : item.Ot,
        Id : item.Id,
        IdCliente : item.IdCliente,
        Cliente : item.Cliente,
        IdProducto : item.IdProducto,
        Producto : item.Producto,
        Cantidad : item.Cantidad,
        Presentacion : item.Presentacion,
        Estatus : item.Estatus,
        Proceso : item.Proceso,
        Fecha : item.Fecha,
      }
      this.rollosInsertar.push(info);
      this.validarRollo.push(item.Id);
      this.Total += item.Cantidad;
    } else {
      if (!this.validarRollo.includes(item.Id)) {
        let info : any = {
          Ot : item.Ot,
          Id : item.Id,
          IdCliente : item.IdCliente,
          Cliente : item.Cliente,
          IdProducto : item.IdProducto,
          Producto : item.Producto,
          Cantidad : item.Cantidad,
          Presentacion : item.Presentacion,
          Estatus : item.Estatus,
          Proceso : item.Proceso,
          Fecha : item.Fecha,
        }
        this.rollosInsertar.push(info);
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
    setTimeout(() => { this.GrupoProductos(); }, 500);
  }

  // Funcion que va a seleccionar todo lo que hay en la tabla
  selccionarTodo(){
    this.Total = 0;
    for (const item of this.rollos) {
      if (!item.exits) {
        let info : any = {
          Ot : item.Ot,
          Id : item.Id,
          IdCliente : item.IdCliente,
          Cliente : item.Cliente,
          IdProducto : item.IdProducto,
          Producto : item.Producto,
          Cantidad : item.Cantidad,
          Presentacion : item.Presentacion,
          Estatus : item.Estatus,
          Proceso : item.Proceso,
          Fecha : item.Fecha,
        }
        this.rollosInsertar.push(info);
        this.validarRollo.push(item.Id);
        this.Total += item.Cantidad;
      }
    }
    setTimeout(() => {
      let nuevo : any = this.rollos.filter((item) => item.exits === true);
      this.rollos = [];
      this.rollos = nuevo;
    }, 500);
    setTimeout(() => { this.GrupoProductos(); }, 500);
  }

  // Funcion que va a quitar todo lo que hay en la tabla
  quitarTodo(){
    for (const item of this.rollosInsertar) {
      let info : any = {
        Ot : item.Ot,
        Id : item.Id,
        IdCliente : item.IdCliente,
        Cliente : item.Cliente,
        IdProducto : item.IdProducto,
        Producto : item.Producto,
        Cantidad : item.Cantidad,
        Presentacion : item.Presentacion,
        Estatus : item.Estatus,
        Proceso : item.Proceso,
        exits : false,
        Fecha : item.Fecha,
      }
      this.rollos.push(info);
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
    setTimeout(() => { this.GrupoProductos(); }, 500);
  }

  // Funcion que se va a encargar de quitar rollos de la tabla inferior
  quitarRollo(item : any){
    let info : any = {
      Ot : item.Ot,
      Id : item.Id,
      IdCliente : item.IdCliente,
      Cliente : item.Cliente,
      IdProducto : item.IdProducto,
      Producto : item.Producto,
      Cantidad : item.Cantidad,
      Presentacion : item.Presentacion,
      Estatus : item.Estatus,
      Proceso : item.Proceso,
      exits : false,
      Fecha : item.Fecha,
    }
    this.rollos.push(info);
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
    setTimeout(() => { this.GrupoProductos(); }, 500);
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

  //Funcion para meter el encabezado de la entrada
  IngresarInfoRollos(){
    if (this.rollosInsertar.length == 0) Swal.fire("¡Debe tener minimo un rollo seleccionado!");
    else {
      this.cargando = false;
      let info : any = {
        EntRolloProd_Fecha : this.today,
        EntRolloProd_Observacion : this.FormConsultarRollos.value.Observacion,
        Usua_Id : this.storage_Id,
        EntRolloProd_Hora : this.hora,
      }
      this.entradaRolloService.srvGuardar(info).subscribe(datos_entradaRollo => {
        this.entradaRolloService.srvObtenerUltimoId().subscribe(datos_ultEntrada => {
          this.ingresarRollos(datos_entradaRollo.entRolloProd_Id);
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

  // Funcion par ingresar los rollos
  ingresarRollos(idEntrada : number){
    for (let i = 0; i < this.rollosInsertar.length; i++) {
      this.productosService.srvObtenerListaPorId(parseInt(this.rollosInsertar[i].IdProducto.trim())).subscribe(datos_producto => {
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
              Prod_Id : parseInt(this.rollosInsertar[i].IdProducto.trim()),
              UndMed_Prod : this.rollosInsertar[i].Presentacion,
              Prod_CantPaquetesRestantes : this.rollosInsertar[i].Cantidad,
              Prod_CantBolsasPaquete : item.prod_CantBolsasPaquete,
              Prod_CantBolsasBulto : item.prod_CantBolsasBulto,
              Prod_CantBolsasRestates : (this.rollosInsertar[i].Cantidad * item.prod_CantBolsasPaquete),
              Prod_CantBolsasFacturadas : 0,
            }
            this.dtEntradaRollosService.srvGuardar(info).subscribe(datos_entrada => { }, error => {
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
          } else {
            let info : any = {
              EntRolloProd_Id : idEntrada,
              Rollo_Id : this.rollosInsertar[i].Id,
              DtEntRolloProd_Cantidad : this.rollosInsertar[i].Cantidad,
              UndMed_Rollo : this.rollosInsertar[i].Presentacion,
              Estado_Id : 19,
              DtEntRolloProd_OT : parseInt(this.rollosInsertar[i].Ot),
              Prod_Id : parseInt(this.rollosInsertar[i].IdProducto.trim()),
              UndMed_Prod : this.rollosInsertar[i].Presentacion,
              Prod_CantPaquetesRestantes : this.rollosInsertar[i].Cantidad,
              Prod_CantBolsasPaquete : item.prod_CantBolsasPaquete,
              Prod_CantBolsasBulto : item.prod_CantBolsasBulto,
              Prod_CantBolsasRestates : this.rollosInsertar[i].Cantidad,
              Prod_CantBolsasFacturadas : 0,
            }
            this.dtEntradaRollosService.srvGuardar(info).subscribe(datos_entrada => { }, error => {
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
      });
    }
    if (this.rollosInsertar.length > 500) setTimeout(() => { this.InventarioProductos(idEntrada); }, 40000);
    else if (this.rollosInsertar.length > 400) setTimeout(() => { this.InventarioProductos(idEntrada); }, 25000);
    else if (this.rollosInsertar.length > 300) setTimeout(() => { this.InventarioProductos(idEntrada); }, 17000);
    else if (this.rollosInsertar.length > 200) setTimeout(() => { this.InventarioProductos(idEntrada); }, 12000);
    else if (this.rollosInsertar.length > 100) setTimeout(() => { this.InventarioProductos(idEntrada); }, 8000);
    else setTimeout(() => { this.InventarioProductos(idEntrada); }, 5000);
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
              icon: 'success',
              title: '¡Entrada de Rollos registrada con exito!'
            });
          }, error => {
            Swal.fire(`¡Error al mover el inventario del Producto ${datos_productos[j].prod_Id}, mover el inventario manualmente!`);
            this.cargando = true;
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
            content : [
              {
                text: `Cargue de Rollos`,
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
    setTimeout(() => { this.crearPDF(id); }, 1200);
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

}
