import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { BagproService } from 'src/app/Servicios/Bagpro.service';
import { ClientesService } from 'src/app/Servicios/clientes.service';
import { MaterialProductoService } from 'src/app/Servicios/materialProducto.service';
import { ProductoService } from 'src/app/Servicios/producto.service';
import { SrvRollosEliminadosService } from 'src/app/Servicios/srvRollosEliminados.service';
import { TurnosService } from 'src/app/Servicios/Turnos.service';
import Swal from 'sweetalert2';
import { ProductService } from '../prueba-imagen-cat-insumo/productservice';

@Component({
  selector: 'app-Reporte_RollosDesechos',
  templateUrl: './Reporte_RollosDesechos.component.html',
  styleUrls: ['./Reporte_RollosDesechos.component.css']
})
export class Reporte_RollosDesechosComponent implements OnInit {

  public formConsultaRollos !: FormGroup; /** Formulario de rollos con filtros de busqueda */
  public today : any = moment().format('YYYY-MM-DD'); /** Obtener fecha de hoy */
  public fechaAnterior : any = '2020-11-03';
  public idCliente : string;
  public validarInputClientes : any = true;
  public arrayClientes = [];
  public arrayTurnos = [];
  public arrayMaterial = [];
  public arrayProductos = [];
  public validarInputNombresProductos : any = true;
  public idProducto : number = 0;
  public ArrayDocumento : any [] = [];
  public arrayOperarios = [];
  public load : boolean = true;
  //public Operario : string;
  _columnasSeleccionada : any [] = [];
  first = 0;
  rows = 10;
  columnas : any[] = [];
  columnas2 : any[] = [];

  constructor(private formbuilder : FormBuilder,
  private servicioTurno : TurnosService,
  private servicioMaterial : MaterialProductoService,
  private servicioProducto : ProductoService,
  private servicioBagPro : BagproService,
  private servicioRollos : SrvRollosEliminadosService) {

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
    this.obtenerTurno();
    this.obtenerMaterial();
    this.obtenerProductos();
    this.obtenerOperariosExtrusion();
    this.obtenerUltimosClientes();
    this.columnasTabla();
  }

  columnasTabla() {
    this.columnas = [
      { header: 'OT', field: 'Orden'},
      { header: 'Rollo', field: 'Rollo'},
      { header: 'Cliente', field: 'Cliente'},
      { header: 'Item', field: 'Item'},
      { header: 'Ancho', field: 'Ancho'},
      { header: 'Largo', field: 'Largo'},
      { header: 'Fuelle', field: 'Fuelle'},
      { header: 'Medida', field: 'Medida'},
      { header: 'Peso', field: 'Peso'},
      { header: 'Material', field: 'Material'},
      { header: 'Calibre', field: 'Calibre'},
      { header: 'Operario', field: 'Operario'},
      { header: 'Fecha', field: 'Fecha'},
      { header: 'Turno', field: 'Turno'},
    ];
  }

 /* columnasNoMostradas(){
    this.columnas2 = [
      { header: 'Calibre', field: 'Calibre'},
      { header: 'Operario', field: 'Operario'},
      { header: 'Fecha', field: 'Fecha'},
      { header: 'Turno', field: 'Turno'},
    ]
  } */

  /*selectEventProducto() {
    this.idProducto = this.formConsultaRollos.value.producto;
    this.servicioProducto.obtenerNombreProductos(this.formConsultaRollos.value.producto).subscribe(dataProducto => {
      this.formConsultaRollos = this.formbuilder.group({
        OT : this.formConsultaRollos.value.OT,
        fecha : this.formConsultaRollos.value.fecha,
        fechaFinal : this.formConsultaRollos.value.fechaFinal,
        turno : this.formConsultaRollos.value.turno,
        Cliente: this.formConsultaRollos.value.Cliente,
        producto: dataProducto.prod_Nombre,
        rollo : this.formConsultaRollos.value.rollo,
        operario: this.formConsultaRollos.value.operario,
        material : this.formConsultaRollos.value.material,
        });
        console.log(this.idProducto);
    });


    if (this.formConsultaRollos.value.producto != '') this.validarInputNombresProductos = false;
    else this.validarInputNombresProductos = true;
    // do something with selected item

  }*/

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

  buscarSegunFechaIngreso() {

  }

  LimpiarCampos() {
    this.formConsultaRollos.setValue({
      OT : null,
      fecha : null,
      fechaFinal : null,
      turno : null,
      cliente: null ,
      producto: null,
      rollo : null,
      //operario: null,
      material : null,
    });

  }

  validarConsulta() {
    this.load = false;
    this.ArrayDocumento = [];
    let ordenTrabajo : number = this.formConsultaRollos.value.OT
    let rolloEliminado : number = this.formConsultaRollos.value.rollo;
    let fecha1 : any = this.formConsultaRollos.value.fecha;
    let fecha2 : any  = this.formConsultaRollos.value.fechaFinal;
    let productoConsulta : number = this.formConsultaRollos.value.producto;

    if(fecha1 != null && fecha2 != null && rolloEliminado != null && productoConsulta != null) {
      this.servicioRollos.srvObtenerListaRollosxFechasxRolloxItem(fecha1, fecha2, rolloEliminado, productoConsulta).subscribe(dataRollos => {
        if(dataRollos.length == 0) Swal.fire(`No se encontró el rollo ${rolloEliminado} para el producto ${productoConsulta} entre las fechas consultadas`);
        else
        for (let index = 0; index < dataRollos.length; index++) {
          this.parametrosTablaRollos(
            dataRollos[index].rollo_OT,
            dataRollos[index].rollo_Id,
            dataRollos[index].rollo_Cliente,
            dataRollos[index].prod_Nombre,
            dataRollos[index].rollo_Ancho,
            dataRollos[index].rollo_Largo,
            dataRollos[index].rollo_Fuelle,
            dataRollos[index].undMed_Id,
            dataRollos[index].rollo_PesoNeto,
            dataRollos[index].material_Nombre,
            dataRollos[index].rollo_Calibre,
            dataRollos[index].rollo_Operario,
            dataRollos[index].rollo_FechaIngreso,
            dataRollos[index].turno_Id,
          )
        }
      });
    } else if(fecha1 != null && fecha2 != null && rolloEliminado != null && ordenTrabajo != null) {
      this.servicioRollos.srvObtenerListaRollosxFechasxRolloxItem(fecha1, fecha2, rolloEliminado, ordenTrabajo).subscribe(dataRollos => {
        if(dataRollos.length == 0) Swal.fire(`No se encontró el rollo ${rolloEliminado} en la OT ${ordenTrabajo} entre las fechas consultadas`);
        else
        for (let index = 0; index < dataRollos.length; index++) {
          this.parametrosTablaRollos(
            dataRollos[index].rollo_OT,
            dataRollos[index].rollo_Id,
            dataRollos[index].rollo_Cliente,
            dataRollos[index].prod_Nombre,
            dataRollos[index].rollo_Ancho,
            dataRollos[index].rollo_Largo,
            dataRollos[index].rollo_Fuelle,
            dataRollos[index].undMed_Id,
            dataRollos[index].rollo_PesoNeto,
            dataRollos[index].material_Nombre,
            dataRollos[index].rollo_Calibre,
            dataRollos[index].rollo_Operario,
            dataRollos[index].rollo_FechaIngreso,
            dataRollos[index].turno_Id,
          )
        }
      });
    } else if(fecha1 != null && fecha2 != null && productoConsulta != null && ordenTrabajo != null) {
      this.servicioRollos.srvObtenerListaRollosxFechasxItemxOT(fecha1, fecha2, productoConsulta, ordenTrabajo).subscribe(dataRollos => {
        if(dataRollos.length == 0) Swal.fire(`No se encontraron rollos del producto ${productoConsulta} en la OT ${ordenTrabajo} entre las fechas consultadas`);
        else
        for (let index = 0; index < dataRollos.length; index++) {
          this.parametrosTablaRollos(
            dataRollos[index].rollo_OT,
            dataRollos[index].rollo_Id,
            dataRollos[index].rollo_Cliente,
            dataRollos[index].prod_Nombre,
            dataRollos[index].rollo_Ancho,
            dataRollos[index].rollo_Largo,
            dataRollos[index].rollo_Fuelle,
            dataRollos[index].undMed_Id,
            dataRollos[index].rollo_PesoNeto,
            dataRollos[index].material_Nombre,
            dataRollos[index].rollo_Calibre,
            dataRollos[index].rollo_Operario,
            dataRollos[index].rollo_FechaIngreso,
            dataRollos[index].turno_Id,
          )
        }
      });
    } else if(fecha1 != null && fecha2 != null && rolloEliminado != null) {
      this.servicioRollos.srvObtenerListaRollosxFechasxRollo(fecha1, fecha2, rolloEliminado).subscribe(dataRollos => {
        if(dataRollos.length == 0) Swal.fire(`No se encontró el rollo ${rolloEliminado} entre las fechas consultadas`);
        else
        for (let index = 0; index < dataRollos.length; index++) {
          this.parametrosTablaRollos(
            dataRollos[index].rollo_OT,
            dataRollos[index].rollo_Id,
            dataRollos[index].rollo_Cliente,
            dataRollos[index].prod_Nombre,
            dataRollos[index].rollo_Ancho,
            dataRollos[index].rollo_Largo,
            dataRollos[index].rollo_Fuelle,
            dataRollos[index].undMed_Id,
            dataRollos[index].rollo_PesoNeto,
            dataRollos[index].material_Nombre,
            dataRollos[index].rollo_Calibre,
            dataRollos[index].rollo_Operario,
            dataRollos[index].rollo_FechaIngreso,
            dataRollos[index].turno_Id,
          )
        }
      });
    } else if(fecha1 != null && fecha2 != null && productoConsulta != null) {
      this.servicioRollos.srvObtenerListaRollosxFechasxItem(fecha1, fecha2, productoConsulta).subscribe(dataRollos => {
        if(dataRollos.length == 0) Swal.fire(`No se encontraron rollos eliminados entre las fechas consultadas para el producto ${productoConsulta}`);
        else
        for (let index = 0; index < dataRollos.length; index++) {
          this.parametrosTablaRollos(
            dataRollos[index].rollo_OT,
            dataRollos[index].rollo_Id,
            dataRollos[index].rollo_Cliente,
            dataRollos[index].prod_Nombre,
            dataRollos[index].rollo_Ancho,
            dataRollos[index].rollo_Largo,
            dataRollos[index].rollo_Fuelle,
            dataRollos[index].undMed_Id,
            dataRollos[index].rollo_PesoNeto,
            dataRollos[index].material_Nombre,
            dataRollos[index].rollo_Calibre,
            dataRollos[index].rollo_Operario,
            dataRollos[index].rollo_FechaIngreso,
            dataRollos[index].turno_Id,
          )
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
            dataRollos[index].prod_Nombre,
            dataRollos[index].rollo_Ancho,
            dataRollos[index].rollo_Largo,
            dataRollos[index].rollo_Fuelle,
            dataRollos[index].undMed_Id,
            dataRollos[index].rollo_PesoNeto,
            dataRollos[index].material_Nombre,
            dataRollos[index].rollo_Calibre,
            dataRollos[index].rollo_Operario,
            dataRollos[index].rollo_FechaIngreso,
            dataRollos[index].turno_Id,
          )
        }
      });

    } else if(fecha1 != null && fecha2 != null ) {
      this.servicioRollos.srvObtenerListaRollosxFechas(fecha1, fecha2).subscribe(dataRollos => {
        if(dataRollos.length == 0) setTimeout(() => {Swal.fire('No se encontraron rollos eliminados entre las fechas consultadas');}, 3000);
        else
        for (let index = 0; index < dataRollos.length; index++) {
          this.parametrosTablaRollos(
            dataRollos[index].rollo_OT,
            dataRollos[index].rollo_Id,
            dataRollos[index].rollo_Cliente,
            dataRollos[index].prod_Nombre,
            dataRollos[index].rollo_Ancho,
            dataRollos[index].rollo_Largo,
            dataRollos[index].rollo_Fuelle,
            dataRollos[index].undMed_Id,
            dataRollos[index].rollo_PesoNeto,
            dataRollos[index].material_Nombre,
            dataRollos[index].rollo_Calibre,
            dataRollos[index].rollo_Operario,
            dataRollos[index].rollo_FechaIngreso,
            dataRollos[index].turno_Id,
          )
        }
      });
    } else if(fecha1 != null && ordenTrabajo != null) {
      this.servicioRollos.srvObtenerListaRollosxFechasxOT(fecha1, fecha1, ordenTrabajo).subscribe(dataRollos => {
        if(dataRollos.length == 0) setTimeout(() => {Swal.fire(`No se encontraron rollos eliminados entre las fechas consultadas para la OT ${ordenTrabajo}`);}, 3000);
        else
        for (let index = 0; index < dataRollos.length; index++) {
          this.parametrosTablaRollos(
            dataRollos[index].rollo_OT,
            dataRollos[index].rollo_Id,
            dataRollos[index].rollo_Cliente,
            dataRollos[index].prod_Nombre,
            dataRollos[index].rollo_Ancho,
            dataRollos[index].rollo_Largo,
            dataRollos[index].rollo_Fuelle,
            dataRollos[index].undMed_Id,
            dataRollos[index].rollo_PesoNeto,
            dataRollos[index].material_Nombre,
            dataRollos[index].rollo_Calibre,
            dataRollos[index].rollo_Operario,
            dataRollos[index].rollo_FechaIngreso,
            dataRollos[index].turno_Id,
          )
        }
      });
    } else if(fecha1 != null && rolloEliminado != null) {
      this.servicioRollos.srvObtenerListaRollosxFechasxRollo(fecha1, fecha1, rolloEliminado).subscribe(dataRollos => {
        if(dataRollos.length == 0) setTimeout(() => {Swal.fire(`No se encontraron rollos eliminados entre las fechas consultadas para la OT ${ordenTrabajo}`);}, 3000);
        else
        for (let index = 0; index < dataRollos.length; index++) {
          this.parametrosTablaRollos(
            dataRollos[index].rollo_OT,
            dataRollos[index].rollo_Id,
            dataRollos[index].rollo_Cliente,
            dataRollos[index].prod_Nombre,
            dataRollos[index].rollo_Ancho,
            dataRollos[index].rollo_Largo,
            dataRollos[index].rollo_Fuelle,
            dataRollos[index].undMed_Id,
            dataRollos[index].rollo_PesoNeto,
            dataRollos[index].material_Nombre,
            dataRollos[index].rollo_Calibre,
            dataRollos[index].rollo_Operario,
            dataRollos[index].rollo_FechaIngreso,
            dataRollos[index].turno_Id,
          )
        }
      });
    } else if(fecha1 != null && productoConsulta != null) {
      this.servicioRollos.srvObtenerListaRollosxFechasxItem(fecha1, fecha1, productoConsulta).subscribe(dataRollos => {
        if(dataRollos.length == 0) setTimeout(() => {Swal.fire(`No se encontraron rollos eliminados entre las fechas consultadas para la OT ${ordenTrabajo}`);}, 3000);
        else
        for (let index = 0; index < dataRollos.length; index++) {
          this.parametrosTablaRollos(
            dataRollos[index].rollo_OT,
            dataRollos[index].rollo_Id,
            dataRollos[index].rollo_Cliente,
            dataRollos[index].prod_Nombre,
            dataRollos[index].rollo_Ancho,
            dataRollos[index].rollo_Largo,
            dataRollos[index].rollo_Fuelle,
            dataRollos[index].undMed_Id,
            dataRollos[index].rollo_PesoNeto,
            dataRollos[index].material_Nombre,
            dataRollos[index].rollo_Calibre,
            dataRollos[index].rollo_Operario,
            dataRollos[index].rollo_FechaIngreso,
            dataRollos[index].turno_Id,
          )
        }
      });
    } else if(ordenTrabajo != null) {
      this.servicioRollos.srvObtenerListaRollosxOT(ordenTrabajo).subscribe(dataRollos => {
        if(dataRollos.length == 0) Swal.fire(`No se encontraron rollos eliminados con la OT ${ordenTrabajo}.`);
        else
        for (let index = 0; index < dataRollos.length; index++) {
          this.parametrosTablaRollos(
            dataRollos[index].rollo_OT,
            dataRollos[index].rollo_Id,
            dataRollos[index].rollo_Cliente,
            dataRollos[index].prod_Nombre,
            dataRollos[index].rollo_Ancho,
            dataRollos[index].rollo_Largo,
            dataRollos[index].rollo_Fuelle,
            dataRollos[index].undMed_Id,
            dataRollos[index].rollo_PesoNeto,
            dataRollos[index].material_Nombre,
            dataRollos[index].rollo_Calibre,
            dataRollos[index].rollo_Operario,
            dataRollos[index].rollo_FechaIngreso,
            dataRollos[index].turno_Id,
          )
        }
      });
    } else if(rolloEliminado != null) {
      this.servicioRollos.srvObtenerListaRollosxRollo(rolloEliminado).subscribe(dataRollos => {
        if(dataRollos.length == 0) Swal.fire(`No se encontró el rollo ${rolloEliminado}.`);
        else
        for (let index = 0; index < dataRollos.length; index++) {
          this.parametrosTablaRollos(
            dataRollos[index].rollo_OT,
            dataRollos[index].rollo_Id,
            dataRollos[index].rollo_Cliente,
            dataRollos[index].prod_Nombre,
            dataRollos[index].rollo_Ancho,
            dataRollos[index].rollo_Largo,
            dataRollos[index].rollo_Fuelle,
            dataRollos[index].undMed_Id,
            dataRollos[index].rollo_PesoNeto,
            dataRollos[index].material_Nombre,
            dataRollos[index].rollo_Calibre,
            dataRollos[index].rollo_Operario,
            dataRollos[index].rollo_FechaIngreso,
            dataRollos[index].turno_Id,
          )
        }
      });
    } else if(fecha1 != null) {
      this.servicioRollos.srvObtenerListaRollosxFecha(fecha1).subscribe(dataRollos => {
        if(dataRollos.length == 0) Swal.fire(`No se encontraron rollos eliminados de la fecha ${fecha1}`);
        else
        for (let index = 0; index < dataRollos.length; index++) {
          this.parametrosTablaRollos(
            dataRollos[index].rollo_OT,
            dataRollos[index].rollo_Id,
            dataRollos[index].rollo_Cliente,
            dataRollos[index].prod_Nombre,
            dataRollos[index].rollo_Ancho,
            dataRollos[index].rollo_Largo,
            dataRollos[index].rollo_Fuelle,
            dataRollos[index].undMed_Id,
            dataRollos[index].rollo_PesoNeto,
            dataRollos[index].material_Nombre,
            dataRollos[index].rollo_Calibre,
            dataRollos[index].rollo_Operario,
            dataRollos[index].rollo_FechaIngreso,
            dataRollos[index].turno_Id,
          )
        }
      });
    } else if(productoConsulta != null) {
      this.servicioRollos.srvObtenerListaRollosxItem(productoConsulta).subscribe(dataRollos => {
        if(dataRollos.length == 0) Swal.fire(`No se encontraron rollos eliminados del cliente ${productoConsulta}`);
        else
        for (let index = 0; index < dataRollos.length; index++) {
          this.parametrosTablaRollos(
            dataRollos[index].rollo_OT,
            dataRollos[index].rollo_Id,
            dataRollos[index].rollo_Cliente,
            dataRollos[index].prod_Nombre,
            dataRollos[index].rollo_Ancho,
            dataRollos[index].rollo_Largo,
            dataRollos[index].rollo_Fuelle,
            dataRollos[index].undMed_Id,
            dataRollos[index].rollo_PesoNeto,
            dataRollos[index].material_Nombre,
            dataRollos[index].rollo_Calibre,
            dataRollos[index].rollo_Operario,
            dataRollos[index].rollo_FechaIngreso,
            dataRollos[index].turno_Id,
          )
        }
      });
    } else {

    }

  }

  /** Función para cargar los turnos en el combobox de la vista */
  obtenerTurno(){
    this.servicioTurno.srvObtenerLista().subscribe(dataTurnos => {
      for (let index = 0; index < dataTurnos.length; index++) {
        this.arrayTurnos.push(dataTurnos[index]);
      }
    });
  }

  /** Función para cargar los materiales de mat. prima en el combobox de la vista */
  obtenerMaterial(){
    this.servicioMaterial.srvObtenerLista().subscribe(dataMaterial => {
      for (let index = 0; index < dataMaterial.length; index++) {
        this.arrayMaterial.push(dataMaterial[index]);
      }
    });
  }

   /** Función para cargar los productos en el datalist de la vista */
  obtenerProductos() {
    this.servicioProducto.obtenerProductos().subscribe(dataProducto => {
      for(let index = 0; index < dataProducto.length; index++) {
        this.arrayProductos.push(dataProducto[index]);
      }
    });

  }

  /** */
  parametrosTablaRollos(OT: any, rollo : any, cliente: any, item : any, ancho: any, largo : any, fuelle: any, und : any, peso : any, material : any, calibre: any, operario : any, fecha: any, turno : any) {
    let info : any = {
      Orden : OT,
      Rollo : rollo,
      Cliente : cliente,
      Item : item,
      Ancho : ancho,
      Largo : largo,
      Fuelle : fuelle,
      Medida : und,
      Peso: peso,
      Material : material,
      Calibre : calibre,
      Operario : operario,
      Fecha : fecha,
      Turno: turno
    }

    //this.columnasNoMostradas();
    this.ArrayDocumento.push(info);
  }

  buscarRollosEliminadosPorItem() {
    this.servicioBagPro.srvObtenerListaOperariosExtrusion().subscribe(dataRollos => {
      for (let index = 0; index < dataRollos.length; index++) {

        let info : any = {
          OT : dataRollos[index].rollo_OT,
          idRollo : dataRollos[index].rollo_OT,
          ancho : dataRollos[index].rollo_OT,
          largo : dataRollos[index].rollo_OT,
          fuelle : dataRollos[index].rollo_OT,
          unidad : dataRollos[index].rollo_OT,
          calibre : dataRollos[index].rollo_OT,
          operario : dataRollos[index].rollo_OT,
          producto : dataRollos[index].rollo_OT,
          cliente : dataRollos[index].rollo_OT,
          fecha : dataRollos[index].rollo_OT,
          hora : dataRollos[index].rollo_OT,
          bruto : dataRollos[index].rollo_OT,
          neto : dataRollos[index].rollo_OT,
          proceso : dataRollos[index].rollo_OT,
          turno : dataRollos[index].rollo_OT,

        }

        this.arrayOperarios.push(info);
        //console.log(this.arrayOperarios);
      }
    });
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

/** Obtener nombres de Ultimos Clientes con OT*/
  obtenerUltimosClientes() {
    this.servicioBagPro.srvObtenerListaUltimosClientes(this.fechaAnterior).subscribe(dataClientes => {
      for (let index = 0; index < dataClientes.length; index++) {
        this.arrayClientes.push(dataClientes[index]);
      }
    });
  }


  mostrarColumnas() {

  }

  exportarExcel() {

  }

  /** Prime NG */
  @Input() get columnasSeleccionada(): any[] {
    return this._columnasSeleccionada;
  }

  set columnasSeleccionada(val: any[]) {
    this._columnasSeleccionada = this.columnas2.filter(col => val.includes(col));
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
