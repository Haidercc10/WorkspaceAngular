import { throwDialogContentAlreadyAttachedError } from '@angular/cdk/dialog';
import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Workbook } from 'exceljs';
import moment from 'moment';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import pdfMake from 'pdfmake/build/pdfmake';
import { BagproService } from 'src/app/Servicios/Bagpro.service';
import { ClientesService } from 'src/app/Servicios/clientes.service';
import { MaterialProductoService } from 'src/app/Servicios/materialProducto.service';
import { ProductoService } from 'src/app/Servicios/producto.service';
import { RolesService } from 'src/app/Servicios/roles.service';
import { SrvRollosEliminadosService } from 'src/app/Servicios/srvRollosEliminados.service';
import { TurnosService } from 'src/app/Servicios/Turnos.service';
import Swal from 'sweetalert2';
import { ProductService } from '../prueba-imagen-cat-insumo/productservice';
import * as fs from 'file-saver';

@Component({
  selector: 'app-Reporte_RollosDesechos',
  templateUrl: './Reporte_RollosDesechos.component.html',
  styleUrls: ['./Reporte_RollosDesechos.component.css']
})
export class Reporte_RollosDesechosComponent implements OnInit {

  public formConsultaRollos !: FormGroup; /** Formulario de rollos con filtros de busqueda */
  public today : any = moment().format('YYYY-MM-DD'); /** Obtener fecha de hoy */
  public fechaAnterior : any = '2020-11-03'; /** Fecha de hoy */
  public idCliente : string;
  public validarInputClientes : any = true;
  public arrayClientes = []; /** Array que contendrá la info del cliente */
  public arrayTurnos = []; /** Array que contendrá la info de los turnos */
  public arrayMaterial = []; /** Array que contendrá la info de los materiales mat. prima */
  public arrayProductos = []; /** Array que contendrá la info de los productos */
  public validarInputNombresProductos : any = true;
  idProducto : any = 0;
  public ArrayDocumento : any [] = []; /** Array que contendrá la info cargada en la tabla de consultar un filtro */
  public arrayOperarios = []; /** Array que contendrá la info cargada en la tabla de operarios */
  public load : boolean = true; /** Carga la imagen de carga al momento de realizar una busqueda */
  //public Operario : string;
  _columnasSeleccionada : any [] = []; /**  */
  first = 0; /** Cantidad de Items mostrados en la tabla. */
  rows = 10;
  columnas : any[] = [];
  columnas2 : any[] = [];
  public storage_Id : number; /** Guarda el ID de la persona logueada */
  public storage_Nombre: any; /** Guarda el nombre de la persona logueada */
  public ValidarRol: number; /** valida el tipo de rol de la persona logueada */
  public storage_Rol: any; /** Guarda el rol de la persona logueada */
  public cantidadOTs : number; /** Cantidad de rollos consultados en cualquiera de los filtros */
  public arrayDataConsolidada : any = [];  /** Array que guardará la data consolidada para mostrarla en el PDF */
  public PesoTotalKg : number = 0; /** Peso total en Kg de rollos eliminados para mostrarlos en el PDF */
  public Item : any = null; /** variable ngModel que servirá para la consulta de tipo LIKE para traer nombres de productos */

  constructor(private formbuilder : FormBuilder,
  private servicioTurno : TurnosService,
  private servicioMaterial : MaterialProductoService,
  private servicioProducto : ProductoService,
  private servicioBagPro : BagproService,
  private servicioRollos : SrvRollosEliminadosService,
  @Inject(SESSION_STORAGE) private storage: WebStorageService,
  private rolService : RolesService) {

    this.formConsultaRollos = this.formbuilder.group({
      OT : [null],
      fecha : [null],
      fechaFinal : [null],
      //turno : [null],
      //cliente: [null, Validators.required],
      producto: [null, Validators.required],
      rollo : [null],
      /*operario: [null],*/
      //material : [null],
    });

  }

  ngOnInit() {
    //this.obtenerTurno();
    //this.obtenerMaterial();
    //this.obtenerProductos();
    this.lecturaStorage();
  }


    /**Leer storage para validar su rol y mostrar el usuario. */
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

    /** Seleccionar el id del producto luego de seleccionar su nombre */
  selectEventProducto() {
    let expresion : any = /^[0-9]*(\.?)[ 0-9]+$/;
    this.idProducto = this.formConsultaRollos.value.producto;

    if(this.idProducto.match(expresion) != null) {
      this.servicioProducto.obtenerNombreProductos(this.formConsultaRollos.value.producto).subscribe(dataProducto => {
        this.formConsultaRollos = this.formbuilder.group({
          OT : this.formConsultaRollos.value.OT,
          fecha : this.formConsultaRollos.value.fecha,
          fechaFinal : this.formConsultaRollos.value.fechaFinal,
          producto: dataProducto,
          rollo : this.formConsultaRollos.value.rollo,
        });
          //
      });
    } else {
      Swal.fire('Debe cargar un item válido');
      this.idProducto = 0;
    }
    //console.log(this.idProducto);
    // do something with selected item
  }

  onChangeSearchNombreProductos(val: string) {
    if (val != '') this.validarInputNombresProductos = false;
    else this.validarInputNombresProductos = true;
    // fetch remote data from here
    // And reassign the 'data' which is binded to 'data' property.
  }

  onFocusedNombreProductos(e){
    if (!e.isTrusted) this.validarInputNombresProductos = false;
    else this.validarInputNombresProductos = true;
    // do something when input is focused
  }

  selectEventCliente() {
    this.idCliente = this.formConsultaRollos.value.cliente;
    this.servicioBagPro.srvObtenerListaUltimosClientes2(this.fechaAnterior, this.idCliente).subscribe(dataCliente => {
      this.formConsultaRollos = this.formbuilder.group({
        cliente: dataCliente.nombreComercial
      });
    });

    // do something with selected item
  }

  /*selectEventOperario() {
    this.Operario = this.formConsultaRollos.value.operario;
    this.servicioBagPro.srvObtenerListaOperariosExtrusion2(this.formConsultaRollos.value.operario).subscribe(dataOperario => {

    });

    // do something with selected item
  }*/

  onChangeSearchClientes(val: string) {
    if (val != '') this.validarInputClientes = false;
    else this.validarInputClientes = true;
    // fetch remote data from here
    // And reassign the 'data' which is binded to 'data' property.
  }

  onFocusedNombreClientes(e){
    if (!e.isTrusted) this.validarInputClientes = false;
    else this.validarInputClientes = true;
    // do something when input is focused
  }

  /** Limpiar campos de la vista */
  LimpiarCampos() {
    this.formConsultaRollos.setValue({
      OT : null,
      fecha : null,
      fechaFinal : null,
      //turno : null,
      //cliente: null ,
      producto: null,
      rollo : null,
      //operario: null,
      //material : null,
    });

  }

  /** Filtros de consulta que cargarán información en la tabla. */
  validarConsulta() {
    this.load = false;
    this.cantidadOTs = 0;
    this.ArrayDocumento = [];
    let ordenTrabajo : number = this.formConsultaRollos.value.OT
    let rolloEliminado : number = this.formConsultaRollos.value.rollo;
    let fecha1 : any = this.formConsultaRollos.value.fecha;
    let fecha2 : any  = this.formConsultaRollos.value.fechaFinal;
    let productoConsulta : any = this.formConsultaRollos.value.producto;
    if (this.idProducto == 0) productoConsulta = null;

    if(fecha1 != null && fecha2 != null && rolloEliminado != null && productoConsulta != null && ordenTrabajo != null) {
      this.servicioRollos.srvObtenerListaRollosxFechasxRolloxItemxOT(fecha1, fecha2, rolloEliminado, this.idProducto, ordenTrabajo).subscribe(dataRollos => {
        if(dataRollos.length == 0) setTimeout(() => { Swal.fire(`No se encontró el rollo ${rolloEliminado} para el producto ${productoConsulta} y la OT ${ordenTrabajo} entre las fechas consultadas`); }, 1900);
        else
        for (let index = 0; index < dataRollos.length; index++) {
          this.parametrosTablaRollos(
            dataRollos[index].rollo_OT,
            dataRollos[index].rollo_Id,
            dataRollos[index].rollo_Cliente,
            dataRollos[index].prod_Id,
            dataRollos[index].prod_Nombre,
            dataRollos[index].rollo_Ancho,
            dataRollos[index].rollo_Largo,
            dataRollos[index].rollo_Fuelle,
            dataRollos[index].undMed_Id,
            dataRollos[index].rollo_PesoNeto,
            'Kg',
            dataRollos[index].material_Nombre,
            dataRollos[index].rollo_Calibre,
            dataRollos[index].rollo_Operario,
            dataRollos[index].rollo_FechaIngreso,
            dataRollos[index].turno_Nombre,
          )
          this.cantidadOTs += 1
        }
      });
    } else if(fecha1 != null && fecha2 != null && rolloEliminado != null && productoConsulta != null) {
      this.servicioRollos.srvObtenerListaRollosxFechasxRolloxItem(fecha1, fecha2, rolloEliminado, this.idProducto).subscribe(dataRollos => {
        if(dataRollos.length == 0) setTimeout(() => { Swal.fire(`No se encontró el rollo ${rolloEliminado} para el producto ${productoConsulta} entre las fechas consultadas`); }, 1900);
        else
        for (let index = 0; index < dataRollos.length; index++) {
          this.parametrosTablaRollos(
            dataRollos[index].rollo_OT,
            dataRollos[index].rollo_Id,
            dataRollos[index].rollo_Cliente,
            dataRollos[index].prod_Id,
            dataRollos[index].prod_Nombre,
            dataRollos[index].rollo_Ancho,
            dataRollos[index].rollo_Largo,
            dataRollos[index].rollo_Fuelle,
            dataRollos[index].undMed_Id,
            dataRollos[index].rollo_PesoNeto,
            'Kg',
            dataRollos[index].material_Nombre,
            dataRollos[index].rollo_Calibre,
            dataRollos[index].rollo_Operario,
            dataRollos[index].rollo_FechaIngreso,
            dataRollos[index].turno_Nombre,
          )
          this.cantidadOTs += 1
        }
      });
    } else if(fecha1 != null && fecha2 != null && rolloEliminado != null && ordenTrabajo != null) {
      this.servicioRollos.srvObtenerListaRollosxFechasxRolloxOT(fecha1, fecha2, rolloEliminado, ordenTrabajo).subscribe(dataRollos => {
        if(dataRollos.length == 0) setTimeout(() => { Swal.fire(`No se encontró el rollo ${rolloEliminado} en la OT ${ordenTrabajo} entre las fechas consultadas`);}, 1900);
        else
        for (let index = 0; index < dataRollos.length; index++) {
          this.parametrosTablaRollos(
            dataRollos[index].rollo_OT,
            dataRollos[index].rollo_Id,
            dataRollos[index].rollo_Cliente,
            dataRollos[index].prod_Id,
            dataRollos[index].prod_Nombre,
            dataRollos[index].rollo_Ancho,
            dataRollos[index].rollo_Largo,
            dataRollos[index].rollo_Fuelle,
            dataRollos[index].undMed_Id,
            dataRollos[index].rollo_PesoNeto,
            'Kg',
            dataRollos[index].material_Nombre,
            dataRollos[index].rollo_Calibre,
            dataRollos[index].rollo_Operario,
            dataRollos[index].rollo_FechaIngreso,
            dataRollos[index].turno_Nombre,
          )
          this.cantidadOTs += 1
        }
      });
    } else if(fecha1 != null && fecha2 != null && productoConsulta != null && ordenTrabajo != null) {
      this.servicioRollos.srvObtenerListaRollosxFechasxItemxOT(fecha1, fecha2, this.idProducto, ordenTrabajo).subscribe(dataRollos => {
        if(dataRollos.length == 0) setTimeout(() => { Swal.fire(`No se encontraron rollos del producto ${productoConsulta} en la OT ${ordenTrabajo} entre las fechas consultadas`); }, 1900);
        else
        for (let index = 0; index < dataRollos.length; index++) {
          this.parametrosTablaRollos(
            dataRollos[index].rollo_OT,
            dataRollos[index].rollo_Id,
            dataRollos[index].rollo_Cliente,
            dataRollos[index].prod_Id,
            dataRollos[index].prod_Nombre,
            dataRollos[index].rollo_Ancho,
            dataRollos[index].rollo_Largo,
            dataRollos[index].rollo_Fuelle,
            dataRollos[index].undMed_Id,
            dataRollos[index].rollo_PesoNeto,
            'Kg',
            dataRollos[index].material_Nombre,
            dataRollos[index].rollo_Calibre,
            dataRollos[index].rollo_Operario,
            dataRollos[index].rollo_FechaIngreso,
            dataRollos[index].turno_Nombre,
          )
          this.cantidadOTs += 1
        }
      });
    } else if(fecha1 != null && fecha2 != null && rolloEliminado != null) {
      this.servicioRollos.srvObtenerListaRollosxFechasxRollo(fecha1, fecha2, rolloEliminado).subscribe(dataRollos => {
        if(dataRollos.length == 0) setTimeout(() => { Swal.fire(`No se encontró el rollo ${rolloEliminado} entre las fechas consultadas`); }, 1900);
        else
        for (let index = 0; index < dataRollos.length; index++) {
          this.parametrosTablaRollos(
            dataRollos[index].rollo_OT,
            dataRollos[index].rollo_Id,
            dataRollos[index].rollo_Cliente,
            dataRollos[index].prod_Id,
            dataRollos[index].prod_Nombre,
            dataRollos[index].rollo_Ancho,
            dataRollos[index].rollo_Largo,
            dataRollos[index].rollo_Fuelle,
            dataRollos[index].undMed_Id,
            dataRollos[index].rollo_PesoNeto,
            'Kg',
            dataRollos[index].material_Nombre,
            dataRollos[index].rollo_Calibre,
            dataRollos[index].rollo_Operario,
            dataRollos[index].rollo_FechaIngreso,
            dataRollos[index].turno_Nombre,
          )
          this.cantidadOTs += 1
        }
      });
    } else if(fecha1 != null && fecha2 != null && productoConsulta != null) {
      this.servicioRollos.srvObtenerListaRollosxFechasxItem(fecha1, fecha2, this.idProducto).subscribe(dataRollos => {
        if(dataRollos.length == 0) setTimeout(() => { Swal.fire(`No se encontraron rollos eliminados entre las fechas consultadas para el producto ${productoConsulta}`); }, 1900);
        else
        for (let index = 0; index < dataRollos.length; index++) {
          this.parametrosTablaRollos(
            dataRollos[index].rollo_OT,
            dataRollos[index].rollo_Id,
            dataRollos[index].rollo_Cliente,
            dataRollos[index].prod_Id,
            dataRollos[index].prod_Nombre,
            dataRollos[index].rollo_Ancho,
            dataRollos[index].rollo_Largo,
            dataRollos[index].rollo_Fuelle,
            dataRollos[index].undMed_Id,
            dataRollos[index].rollo_PesoNeto,
            'Kg',
            dataRollos[index].material_Nombre,
            dataRollos[index].rollo_Calibre,
            dataRollos[index].rollo_Operario,
            dataRollos[index].rollo_FechaIngreso,
            dataRollos[index].turno_Nombre,
          )
          this.cantidadOTs += 1
        }
      });
    } else if(fecha1 != null && fecha2 != null && ordenTrabajo != null) {
      this.servicioRollos.srvObtenerListaRollosxFechasxOT(fecha1, fecha2, ordenTrabajo).subscribe(dataRollos => {
        if(dataRollos.length == 0) setTimeout(() => {Swal.fire(`No se encontraron rollos eliminados entre las fechas consultadas para la OT ${ordenTrabajo}`);}, 3000);
        else
        for (let index = 0; index < dataRollos.length; index++) {
          this.parametrosTablaRollos(
            dataRollos[index].rollo_OT,
            dataRollos[index].rollo_Id,
            dataRollos[index].rollo_Cliente,
            dataRollos[index].prod_Id,
            dataRollos[index].prod_Nombre,
            dataRollos[index].rollo_Ancho,
            dataRollos[index].rollo_Largo,
            dataRollos[index].rollo_Fuelle,
            dataRollos[index].undMed_Id,
            dataRollos[index].rollo_PesoNeto,
            'Kg',
            dataRollos[index].material_Nombre,
            dataRollos[index].rollo_Calibre,
            dataRollos[index].rollo_Operario,
            dataRollos[index].rollo_FechaIngreso,
            dataRollos[index].turno_Nombre,
          )
          this.cantidadOTs += 1
        }
      });

    } else if(fecha1 != null && fecha2 != null ) {
      this.servicioRollos.srvObtenerListaRollosxFechas(fecha1, fecha2).subscribe(dataRollos => {
        if(dataRollos.length == 0) setTimeout(() => { Swal.fire('No se encontraron rollos eliminados entre las fechas consultadas'); }, 1900);
        else
        for (let index = 0; index < dataRollos.length; index++) {
          this.parametrosTablaRollos(
            dataRollos[index].rollo_OT,
            dataRollos[index].rollo_Id,
            dataRollos[index].rollo_Cliente,
            dataRollos[index].prod_Id,
            dataRollos[index].prod_Nombre,
            dataRollos[index].rollo_Ancho,
            dataRollos[index].rollo_Largo,
            dataRollos[index].rollo_Fuelle,
            dataRollos[index].undMed_Id,
            dataRollos[index].rollo_PesoNeto,
            'Kg',
            dataRollos[index].material_Nombre,
            dataRollos[index].rollo_Calibre,
            dataRollos[index].rollo_Operario,
            dataRollos[index].rollo_FechaIngreso,
            dataRollos[index].turno_Nombre,
          )
          this.cantidadOTs += 1
        }
      });
    } else if(fecha1 != null && ordenTrabajo != null) {
      this.servicioRollos.srvObtenerListaRollosxFechasxOT(fecha1, fecha1, ordenTrabajo).subscribe(dataRollos => {
        if(dataRollos.length == 0) setTimeout(() => {Swal.fire(`No se encontraron rollos eliminados en la fecha consultada para la OT ${ordenTrabajo}`);}, 1900);
        else
        for (let index = 0; index < dataRollos.length; index++) {
          this.parametrosTablaRollos(
            dataRollos[index].rollo_OT,
            dataRollos[index].rollo_Id,
            dataRollos[index].rollo_Cliente,
            dataRollos[index].prod_Id,
            dataRollos[index].prod_Nombre,
            dataRollos[index].rollo_Ancho,
            dataRollos[index].rollo_Largo,
            dataRollos[index].rollo_Fuelle,
            dataRollos[index].undMed_Id,
            dataRollos[index].rollo_PesoNeto,
            'Kg',
            dataRollos[index].material_Nombre,
            dataRollos[index].rollo_Calibre,
            dataRollos[index].rollo_Operario,
            dataRollos[index].rollo_FechaIngreso,
            dataRollos[index].turno_Nombre,
          )
          this.cantidadOTs += 1
        }
      });
    } else if(fecha1 != null && rolloEliminado != null) {
      this.servicioRollos.srvObtenerListaRollosxFechasxRollo(fecha1, fecha1, rolloEliminado).subscribe(dataRollos => {
        if(dataRollos.length == 0) setTimeout(() => {Swal.fire(`No se encontró el rollo ${rolloEliminado} en la fecha consultada`);}, 1900);
        else
        for (let index = 0; index < dataRollos.length; index++) {
          this.parametrosTablaRollos(
            dataRollos[index].rollo_OT,
            dataRollos[index].rollo_Id,
            dataRollos[index].rollo_Cliente,
            dataRollos[index].prod_Id,
            dataRollos[index].prod_Nombre,
            dataRollos[index].rollo_Ancho,
            dataRollos[index].rollo_Largo,
            dataRollos[index].rollo_Fuelle,
            dataRollos[index].undMed_Id,
            dataRollos[index].rollo_PesoNeto,
            'Kg',
            dataRollos[index].material_Nombre,
            dataRollos[index].rollo_Calibre,
            dataRollos[index].rollo_Operario,
            dataRollos[index].rollo_FechaIngreso,
            dataRollos[index].turno_Nombre,
          )
          this.cantidadOTs += 1
        }
      });
    } else if(fecha1 != null && productoConsulta != null) {
      this.servicioRollos.srvObtenerListaRollosxFechasxItem(fecha1, fecha1, this.idProducto).subscribe(dataRollos => {
        if(dataRollos.length == 0) setTimeout(() => {  Swal.fire(`No se encontraron rollos eliminados en la fecha consultada para el item ${productoConsulta}`);}, 1900);
        else
        for (let index = 0; index < dataRollos.length; index++) {
          this.parametrosTablaRollos(
            dataRollos[index].rollo_OT,
            dataRollos[index].rollo_Id,
            dataRollos[index].rollo_Cliente,
            dataRollos[index].prod_Id,
            dataRollos[index].prod_Nombre,
            dataRollos[index].rollo_Ancho,
            dataRollos[index].rollo_Largo,
            dataRollos[index].rollo_Fuelle,
            dataRollos[index].undMed_Id,
            dataRollos[index].rollo_PesoNeto,
            'Kg',
            dataRollos[index].material_Nombre,
            dataRollos[index].rollo_Calibre,
            dataRollos[index].rollo_Operario,
            dataRollos[index].rollo_FechaIngreso,
            dataRollos[index].turno_Nombre,
          )
          this.cantidadOTs += 1
        }
      });
    } else if(ordenTrabajo != null && rolloEliminado != null) {
      this.servicioRollos.srvObtenerListaRollosxOTxRollo(ordenTrabajo, rolloEliminado).subscribe(dataRollos => {
        if(dataRollos.length == 0) setTimeout(() => { Swal.fire(`No se encontró el rollo ${rolloEliminado} con la OT ${ordenTrabajo}.`); }, 1900);
        else
        for (let index = 0; index < dataRollos.length; index++) {
            this.parametrosTablaRollos(
            dataRollos[index].rollo_OT,
            dataRollos[index].rollo_Id,
            dataRollos[index].rollo_Cliente,
            dataRollos[index].prod_Id,
            dataRollos[index].prod_Nombre,
            dataRollos[index].rollo_Ancho,
            dataRollos[index].rollo_Largo,
            dataRollos[index].rollo_Fuelle,
            dataRollos[index].undMed_Id,
            dataRollos[index].rollo_PesoNeto,
            'Kg',
            dataRollos[index].material_Nombre,
            dataRollos[index].rollo_Calibre,
            dataRollos[index].rollo_Operario,
            dataRollos[index].rollo_FechaIngreso,
            dataRollos[index].turno_Nombre,
            )
            this.cantidadOTs += 1
        }
      });
    } else if(ordenTrabajo != null && productoConsulta != null) {
      this.servicioRollos.srvObtenerListaRollosxOT(ordenTrabajo).subscribe(dataRollos => {
        if(dataRollos.length == 0) setTimeout(() => { Swal.fire(`No se encontraron rollos eliminados con la OT ${ordenTrabajo}.`); }, 1900);
        else
        for (let index = 0; index < dataRollos.length; index++) {
          if(this.idProducto == dataRollos[index].prod_Id) {
            this.parametrosTablaRollos(
            dataRollos[index].rollo_OT,
            dataRollos[index].rollo_Id,
            dataRollos[index].rollo_Cliente,
            dataRollos[index].prod_Id,
            dataRollos[index].prod_Nombre,
            dataRollos[index].rollo_Ancho,
            dataRollos[index].rollo_Largo,
            dataRollos[index].rollo_Fuelle,
            dataRollos[index].undMed_Id,
            dataRollos[index].rollo_PesoNeto,
            'Kg',
            dataRollos[index].material_Nombre,
            dataRollos[index].rollo_Calibre,
            dataRollos[index].rollo_Operario,
            dataRollos[index].rollo_FechaIngreso,
            dataRollos[index].turno_Nombre,
            )
          } else Swal.fire(`No se encontraron rollos eliminados de la OT ${ordenTrabajo} para el producto ${productoConsulta}.`);
          this.cantidadOTs += 1;
        }
      });
    } else if(rolloEliminado != null && productoConsulta != null) {
      this.servicioRollos.srvObtenerListaRollosxRollo(rolloEliminado).subscribe(dataRollos => {
        if(dataRollos.length == 0) setTimeout(() => { Swal.fire(`No se encontró el rollo ${rolloEliminado}.`); }, 1900);
        else
        for (let index = 0; index < dataRollos.length; index++) {
          if(this.idProducto == dataRollos[index].prod_Id) {
            this.parametrosTablaRollos(
            dataRollos[index].rollo_OT,
            dataRollos[index].rollo_Id,
            dataRollos[index].rollo_Cliente,
            dataRollos[index].prod_Id,
            dataRollos[index].prod_Nombre,
            dataRollos[index].rollo_Ancho,
            dataRollos[index].rollo_Largo,
            dataRollos[index].rollo_Fuelle,
            dataRollos[index].undMed_Id,
            dataRollos[index].rollo_PesoNeto,
            'Kg',
            dataRollos[index].material_Nombre,
            dataRollos[index].rollo_Calibre,
            dataRollos[index].rollo_Operario,
            dataRollos[index].rollo_FechaIngreso,
            dataRollos[index].turno_Nombre,
            )
            this.cantidadOTs += 1;
          } else Swal.fire(`No se encontraron rollos eliminados del producto ${productoConsulta}`);
        }
      });
    } else if(ordenTrabajo != null) {
      this.servicioRollos.srvObtenerListaRollosxOT(ordenTrabajo).subscribe(dataRollos => {
        if(dataRollos.length == 0) setTimeout(() => { Swal.fire(`No se encontraron rollos eliminados con la OT ${ordenTrabajo}.`); }, 1900);
        else
        for (let index = 0; index < dataRollos.length; index++) {
          this.parametrosTablaRollos(
            dataRollos[index].rollo_OT,
            dataRollos[index].rollo_Id,
            dataRollos[index].rollo_Cliente,
            dataRollos[index].prod_Id,
            dataRollos[index].prod_Nombre,
            dataRollos[index].rollo_Ancho,
            dataRollos[index].rollo_Largo,
            dataRollos[index].rollo_Fuelle,
            dataRollos[index].undMed_Id,
            dataRollos[index].rollo_PesoNeto,
            'Kg',
            dataRollos[index].material_Nombre,
            dataRollos[index].rollo_Calibre,
            dataRollos[index].rollo_Operario,
            dataRollos[index].rollo_FechaIngreso,
            dataRollos[index].turno_Nombre,
          )
          this.cantidadOTs += 1
        }
      });
    } else if(rolloEliminado != null) {
      this.servicioRollos.srvObtenerListaRollosxRollo(rolloEliminado).subscribe(dataRollos => {
        if(dataRollos.length == 0) setTimeout(() => { Swal.fire(`No se encontró el rollo ${rolloEliminado}.`); }, 1900);
        else
        for (let index = 0; index < dataRollos.length; index++) {
          this.parametrosTablaRollos(
            dataRollos[index].rollo_OT,
            dataRollos[index].rollo_Id,
            dataRollos[index].rollo_Cliente,
            dataRollos[index].prod_Id,
            dataRollos[index].prod_Nombre,
            dataRollos[index].rollo_Ancho,
            dataRollos[index].rollo_Largo,
            dataRollos[index].rollo_Fuelle,
            dataRollos[index].undMed_Id,
            dataRollos[index].rollo_PesoNeto,
            'Kg',
            dataRollos[index].material_Nombre,
            dataRollos[index].rollo_Calibre,
            dataRollos[index].rollo_Operario,
            dataRollos[index].rollo_FechaIngreso,
            dataRollos[index].turno_Nombre,
          )
          this.cantidadOTs += 1;
        }
      });
    } else if(fecha1 != null) {
      this.servicioRollos.srvObtenerListaRollosxFecha(fecha1).subscribe(dataRollos => {
        if(dataRollos.length == 0) setTimeout(() => { Swal.fire(`No se encontraron rollos eliminados de la fecha ${fecha1}`); }, 1900);
        else
        for (let index = 0; index < dataRollos.length; index++) {
          this.parametrosTablaRollos(
            dataRollos[index].rollo_OT,
            dataRollos[index].rollo_Id,
            dataRollos[index].rollo_Cliente,
            dataRollos[index].prod_Id,
            dataRollos[index].prod_Nombre,
            dataRollos[index].rollo_Ancho,
            dataRollos[index].rollo_Largo,
            dataRollos[index].rollo_Fuelle,
            dataRollos[index].undMed_Id,
            dataRollos[index].rollo_PesoNeto,
            'Kg',
            dataRollos[index].material_Nombre,
            dataRollos[index].rollo_Calibre,
            dataRollos[index].rollo_Operario,
            dataRollos[index].rollo_FechaIngreso,
            dataRollos[index].turno_Nombre,
          )
          this.cantidadOTs += 1;
        }
      });
    } else if(productoConsulta != null) {
        this.servicioRollos.srvObtenerListaRollosxItem(this.idProducto).subscribe(dataRollos => {
          if(dataRollos.length == 0) setTimeout(() => { Swal.fire(`No se encontraron rollos eliminados del producto ${productoConsulta}`); }, 1900);
          else
          for (let index = 0; index < dataRollos.length; index++) {
            this.parametrosTablaRollos(
              dataRollos[index].rollo_OT,
              dataRollos[index].rollo_Id,
              dataRollos[index].rollo_Cliente,
              dataRollos[index].prod_Id,
              dataRollos[index].prod_Nombre,
              dataRollos[index].rollo_Ancho,
              dataRollos[index].rollo_Largo,
              dataRollos[index].rollo_Fuelle,
              dataRollos[index].undMed_Id,
              dataRollos[index].rollo_PesoNeto,
              'Kg',
              dataRollos[index].material_Nombre,
              dataRollos[index].rollo_Calibre,
              dataRollos[index].rollo_Operario,
              dataRollos[index].rollo_FechaIngreso,
              dataRollos[index].turno_Nombre,
            )
            this.cantidadOTs += 1;
          }
        });


    } else {
      this.servicioRollos.srvObtenerListaRollosxFecha(this.today).subscribe(dataRollos => {
        if(dataRollos.length == 0) setTimeout(() => { Swal.fire(`No se encontraron rollos eliminados el día de hoy`);  }, 1900);
        else
        for (let index = 0; index < dataRollos.length; index++) {
          this.parametrosTablaRollos(
            dataRollos[index].rollo_OT,
            dataRollos[index].rollo_Id,
            dataRollos[index].rollo_Cliente,
            dataRollos[index].prod_Id,
            dataRollos[index].prod_Nombre,
            dataRollos[index].rollo_Ancho,
            dataRollos[index].rollo_Largo,
            dataRollos[index].rollo_Fuelle,
            dataRollos[index].undMed_Id,
            dataRollos[index].rollo_PesoNeto,
            'Kg',
            dataRollos[index].material_Nombre,
            dataRollos[index].rollo_Calibre,
            dataRollos[index].rollo_Operario,
            dataRollos[index].rollo_FechaIngreso,
            dataRollos[index].turno_Nombre,
          )
          this.cantidadOTs += 1;
        }
      });
    }
    setTimeout(() => { this.load = true; }, 2000);
  }


  /** NO USADA: Función para cargar los turnos en el combobox de la vista */
  obtenerTurno(){
    this.servicioTurno.srvObtenerLista().subscribe(dataTurnos => {
      for (let index = 0; index < dataTurnos.length; index++) {
        this.arrayTurnos.push(dataTurnos[index]);
      }
    });
  }

  /** NO USADA: Función para cargar los materiales de mat. prima en el combobox de la vista */
  obtenerMaterial(){
    this.servicioMaterial.srvObtenerLista().subscribe(dataMaterial => {
      for (let index = 0; index < dataMaterial.length; index++) {
        this.arrayMaterial.push(dataMaterial[index]);
      }
    });
  }

   /** Función para cargar los productos en el datalist de la vista */
  obtenerProductos() {
    this.arrayProductos = [];
    let campoItem : string = this.formConsultaRollos.value.producto

    if (campoItem.length > 2) {
      this.servicioProducto.obtenerItemsLike(this.Item.trim()).subscribe(dataProducto => {
        for(let index = 0; index < dataProducto.length; index++) {
          this.arrayProductos.push(dataProducto[index]);
          //console.log(this.arrayProductos);
        }
      });
    }
  }

  /** Campos que saldrán en la tabla al momento de consultar los filtros. */
  parametrosTablaRollos(OT: any, rollo : any, cliente: any, itemId : any, item : any, ancho: any, largo : any, fuelle: any, und : any, peso : any, kg : any, material : any, calibre: any, operario : any, fecha: any, turno : any) {
    let info : any = {
      Orden : OT,
      Rollo : rollo,
      Cliente : cliente,
      ItemId : itemId,
      Item : item,
      Ancho : ancho,
      Largo : largo,
      Fuelle : fuelle,
      Medida : und,
      Peso: parseFloat(peso),
      Kg: kg,
      Material : material,
      Calibre : calibre,
      Operario : operario,
      Fecha : fecha,
      Turno: turno
    }
    this.mostrarColumnas();
    this.ArrayDocumento.push(info);
    this.consolidarRollosEliminados();
  }

  /** Consolida la información de los rollos eliminados y la carga en el PDF */
  consolidarRollosEliminados(){
    let Ordenes : any = [];
    this.arrayDataConsolidada = [];
    this.PesoTotalKg = 0;

    for (let index = 0; index < this.ArrayDocumento.length; index++) {
      if(!Ordenes.includes(this.ArrayDocumento[index].Orden)){
        let cantidadPesos: number = 0;
        let cantRollos: number = 0;

        for (let indx = 0; indx < this.ArrayDocumento.length; indx++) {
          if(this.ArrayDocumento[indx].Orden == this.ArrayDocumento[index].Orden) {
            cantidadPesos += this.ArrayDocumento[indx].Peso;
            cantRollos += 1;
          }
        }
        Ordenes.push(this.ArrayDocumento[index].Orden);
        let infoConsolidada : any = {
          OT : this.ArrayDocumento[index].Orden,
          Cliente : this.ArrayDocumento[index].Cliente,
          Item : this.ArrayDocumento[index].ItemId,
          Nombre : this.ArrayDocumento[index].Item,
          Peso : cantidadPesos,
          NoRollos : cantRollos,
        }
        this.arrayDataConsolidada.push(infoConsolidada);
        this.PesoTotalKg += infoConsolidada.Peso;
        console.log(this.PesoTotalKg);
    }

  }
}

  /** Función que cargará los nombres de los operarios */
  obtenerOperariosExtrusion() {
    this.servicioBagPro.srvObtenerListaOperariosExtrusion().subscribe(dataOperarios => {
      for (let index = 0; index < dataOperarios.length; index++) {
        if (dataOperarios[index].nombre != 0) this.arrayOperarios.push(dataOperarios[index]);
        //console.log(this.arrayOperarios);
      }
    });
  }

/** NO USADA: Obtener nombres de Ultimos Clientes con OT*/
  obtenerUltimosClientes() {
    this.servicioBagPro.srvObtenerListaUltimosClientes(this.fechaAnterior).subscribe(dataClientes => {
      for (let index = 0; index < dataClientes.length; index++) {
        this.arrayClientes.push(dataClientes[index]);
      }
    });
  }

  /** Mostrar en la tabla las columnas elegidas en el Input-Select que se encuentra en la parte superior de la tabla. */
  mostrarColumnas() {
    this.columnas = [
      { header: 'Calibre', field: 'Calibre'},
      { header: 'Material', field: 'Material'},
      { header: 'Operario', field: 'Operario'},
      { header: 'Turno', field: 'Turno'},
    ];
  }

    // funcion que se encagará de llenar la tabla de los productos en el pdf
    buildTableBody(data, columns) {
      var body = [];
      body.push(columns);
      data.forEach(function(row) {
        var dataRow = [];
        columns.forEach(function(column) {
          dataRow.push(row[column]);
        });
        body.push(dataRow);
      });
      return body;
    }

    // Funcion que genera la tabla donde se mostrará la información detallada de los rollos consultados en el PDF
    table(data, columns) {
      return {
          table: {
            headerRows: 1,
            widths: [35, 35, '*', 35, '*', 30, 45, '*'],
            body: this.buildTableBody(data, columns),
          },
          fontSize: 8,
          layout: {
            fillColor: function (rowIndex, node, columnIndex) {
              return (rowIndex == 0) ? '#CCCCCC' : null;
            }
          }
      };
    }

     // Funcion que genera la tabla donde se mostrará la información consolidada de los rollos consultados en el PDF
    table2(data, columns) {
      return {
          table: {
            headerRows: 1,
            widths: [35, '*', 35, '*', 35, 30],
            body: this.buildTableBody(data, columns),
          },
          fontSize: 8,
          layout: {
            fillColor: function (rowIndex, node, columnIndex) {
              return (rowIndex == 0) ? '#CCCCCC' : null;
            }
          }
      };
    }

  /** Exportar reporte de rollos en PDF */
  exportarPdf() {
      const pdfDefinicion : any = {
        info: {
          title: `Rollos eliminados`
        },
        content : [
          {
            text: `Plasticaribe S.A.S ---- Reporte rollos eliminados (Extrusión)`,
            alignment: 'center',
            style: 'titulo',
          },
          '\n \n',
          {
            text: `Fecha de creación: ${this.today}`,
            style: 'header',
            alignment: 'right',
          },
          {
            text: `Creado por: ${this.storage_Nombre}\n\n`,
            alignment: 'right',
            style: 'header',
          },
          {
            text: `\n Información consolidada de los rollos eliminados \n `,
            alignment: 'center',
            style: 'header'
          },

          this.table2(this.arrayDataConsolidada, ['OT', 'Cliente', 'Item', 'Nombre', 'Peso', 'NoRollos']),

          {
            text: `\n\n Información detallada de los rollos eliminados \n `,
            alignment: 'center',
            style: 'header'
          },

          this.table(this.ArrayDocumento, ['Orden', 'Rollo', 'Cliente', 'ItemId', 'Item', 'Peso', 'Fecha', 'Operario']),

          {
            text: `\n\nCantidad de rollos: ${this.cantidadOTs}`,
            alignment: 'right',
            style: 'header',
          },
          {
            text: `\nCantidad Total Kg: ${this.PesoTotalKg}`,
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
            fontSize: 15,
            bold: true
          }
        }
      }
      const pdf = pdfMake.createPdf(pdfDefinicion);
      pdf.open();
      //break;
  }

  /** Exportar reporte de rollos en excel */
  exportarExcel(){
      this.load = false;
      setTimeout(() => {
        const title = `Reporte de rollos eliminados (Extrusión)`;
        const header = ["OT", "Rollo", "Cliente", "Nro. Item", "Nombre Item", "Peso", "Presentación", "Ancho", "Largo", "Fuelle", "Medida", "Material", "Calibre", "Operario", "Fecha", "Turno"]
        let datos : any =[];
        for (const item of this.ArrayDocumento) {
          const datos1  : any = [item.Orden, item.Rollo, item.Cliente, item.ItemId, item.Item, item.Peso, item.Kg, item.Ancho, item.Largo, item.Fuelle, item.Medida, item.Material, item.Calibre, item.Operario, item.Fecha, item.Turno];
          datos.push(datos1);
        }
        let workbook = new Workbook();
        let worksheet = workbook.addWorksheet(`Reporte de rollos eliminados`);
        let titleRow = worksheet.addRow([title]);
        titleRow.font = { name: 'Calibri', family: 4, size: 16, underline: 'double', bold: true };
        worksheet.addRow([]);
        let headerRow = worksheet.addRow(header);
        headerRow.eachCell((cell, number) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'eeeeee' }
          }
          cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
        });
        worksheet.mergeCells('A1:P2');
        worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
        datos.forEach(d => {
          let row = worksheet.addRow(d);
          let peso = row.getCell(6);
          let color = 'F1948A';

          peso.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: color }
          }

        });
        worksheet.getColumn(1).width = 10;
        worksheet.getColumn(2).width = 10;
        worksheet.getColumn(3).width = 50;
        worksheet.getColumn(4).width = 10;
        worksheet.getColumn(5).width = 50;
        worksheet.getColumn(6).width = 10;
        worksheet.getColumn(7).width = 15;
        worksheet.getColumn(8).width = 10;
        worksheet.getColumn(9).width = 10;
        worksheet.getColumn(10).width = 10;
        worksheet.getColumn(11).width = 10;
        worksheet.getColumn(12).width = 10;
        worksheet.getColumn(13).width = 10;
        worksheet.getColumn(14).width = 30;
        worksheet.getColumn(15).width = 12;
        worksheet.getColumn(16).width = 20;
        setTimeout(() => {
          workbook.xlsx.writeBuffer().then((data) => {
            let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            fs.saveAs(blob, `Reporte de rollos eliminados ${this.today}.xlsx`);
          });
          this.load = true;
        }, 1000);
       }, 3500);
      setTimeout(() => {Swal.fire('Archivo generado con éxito!') }, 4000);
  }

  /** Elegir formato en el que desea exportar el documento. */
  elegirFormatoExportacion(){
    if (this.ArrayDocumento.length > 0) {
      Swal.fire({
        title: '¿En que formato desea exportar la información?',
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: 'Formato PDF',
        denyButtonText: `Formato Excel`,
      }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isDenied) this.exportarExcel();
        else if (result.isConfirmed) this.exportarPdf();
      });
    } else Swal.fire('Debe cargar al menos un registro en la tabla.')
  }

  /** Prime NG */
  @Input() get columnasSeleccionada(): any[] {
    return this._columnasSeleccionada;
  }

  set columnasSeleccionada(val: any[]) {
    this._columnasSeleccionada = this.columnas.filter(col => val.includes(col));
  }

    // Pasa a la siguiente pagina de la tabla
    next() {
      this.first = this.first + this.rows;
    }

    // Pasa a la pagina anterior de la tabla
    prev() {
      this.first = this.first - this.rows;
    }

    // Reinicia el paginado y te devuelve a la pagina numero 1
    reset() {
      this.first = 0;
    }

    // Pasa a la ultima pagina de la tabla
    isLastPage(): boolean {
      return this.ArrayDocumento ? this.first === (this.ArrayDocumento.length - this.rows): true;
    }

    // Pasa a la primera pagina de la tabla
    isFirstPage(): boolean {
      return this.ArrayDocumento ? this.first === 0 : true;
    }


}
