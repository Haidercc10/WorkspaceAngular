import { Component, Inject, Injectable, OnInit } from '@angular/core';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { FiltrosProductosTerminadosZeusPipe } from 'src/app/Pipes/filtros-productos-terminados-zeus.pipe';
import { InventarioZeusService } from 'src/app/Servicios/inventario-zeus.service';
import { RolesService } from 'src/app/Servicios/roles.service';
import { BagproService } from 'src/app/Servicios/Bagpro.service';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';
import { ExistenciasProductosService } from 'src/app/Servicios/existencias-productos.service';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-modal-generar-inventario-zeus',
  templateUrl: './modal-generar-inventario-zeus.component.html',
  styleUrls: ['./modal-generar-inventario-zeus.component.css']
})

export class ModalGenerarInventarioZeusComponent implements OnInit {

  public FormExistencias !: FormGroup;
  public titulosTabla : any = [];
  public arrayInventario = [];
  public datosCodigo : string;
  ArrayProductoZeus = [];
  public page : number;
  today : any = new Date(); //Variable que se usará para llenar la fecha actual
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  public filtroNombre : any;
  public NombrePT = '';
  public load : boolean;
  public NombreCliente = '';
  numeroIdProd : number = 0;
  totalProductos : number = 0;

  constructor(private existenciasZeus : InventarioZeusService,
                private clienteOtItems : BagproService,
                  @Inject(SESSION_STORAGE) private storage: WebStorageService,
                    private rolService : RolesService,
                      private existencias_ProductosService : ExistenciasProductosService,
                        private frmBuilder : FormBuilder,) {

    this.FormExistencias = this.frmBuilder.group({
      cantMinima : [0],
    })
    this.load = true;
  }

  ngOnInit(): void {
    this.lecturaStorage();
    this.ColumnasTabla();
    this.fecha();
    this.InventarioExistenciaZeus();

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
  }

  lecturaStorage(){
    this.storage_Id = this.storage.get('Id');
    this.storage_Nombre = this.storage.get('Nombre');
    let rol = this.storage.get('Rol');
    setTimeout(() => {
      this.rolService.srvObtenerLista().subscribe(datos_roles => {
        for (let index = 0; index < datos_roles.length; index++) {
          if (datos_roles[index].rolUsu_Id == rol) {
            this.ValidarRol = rol;
            this.storage_Rol = datos_roles[index].rolUsu_Nombre;
          }
        }
      });
    }, 100);
  }

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number) => {
    const exp = /(\d)(?=(\d{3})+(?!\d))/g;
    const rep = '$1,';
    return number.toString().replace(exp,rep);
  }

  //
  ColumnasTabla(){
    this.titulosTabla = [{
      invItem : "Item",
      invNombre : "Nombre",
      invStock : "Existencias",
      presentacion : 'Presentación',
      invPrecio : "Precio",
      invSubtotal : "Subtotal",
      invCliente : "Cliente",
    }];
  }

  //
  exportarExcel() : void {
    if (this.ArrayProductoZeus.length == 0) Swal.fire("Para generar el archivo de Excel, debe haber productos en la tabla");
    else {
      this.load = false;
      setTimeout(() => {
        const title = `Inventario de Productos Terminados ${this.today}`;
        const header = ["Item", "Cliente", "Nombre", "Precio", "Existencias", "Presentación", "Subtotal", "Cantidad Minima"]
        let datos : any =[];
        for (const item of this.ArrayProductoZeus) {
          const datos1  : any = [item.codigoItem, item.ClienteNombre, item.nombreItem, item.PrecioItem, item.cantidadItem, item.presentacion, item.PrecioTotalItem, item.cantMinima];
          datos.push(datos1);
        }
        let workbook = new Workbook();
        let worksheet = workbook.addWorksheet(`Inventario de Productos Terminados ${this.today}`);
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
        worksheet.mergeCells('A1:H2');
        worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
        datos.forEach(d => {
          let row = worksheet.addRow(d);
          let qty = row.getCell(5);
          let color = 'ADD8E6';
          if (+qty.value < d[7]) {
            color = 'FF837B';
          }
          qty.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: color }
          }
          row.getCell(4).numFmt = '"$"#,##0.00;[Red]\-"$"#,##0.00';
          row.getCell(5).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
          row.getCell(7).numFmt = '"$"#,##0.00;[Red]\-"$"#,##0.00';
          row.getCell(8).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
        });
        worksheet.getColumn(1).width = 10;
        worksheet.getColumn(2).width = 60;
        worksheet.getColumn(3).width = 60;
        worksheet.getColumn(4).width = 20;
        worksheet.getColumn(5).width = 20;
        worksheet.getColumn(6).width = 10;
        worksheet.getColumn(7).width = 20;
        worksheet.getColumn(8).width = 20;
        setTimeout(() => {
          workbook.xlsx.writeBuffer().then((data) => {
            let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            fs.saveAs(blob, `Inventario de Productos Terminados ${this.today}.xlsx`);
          });
          this.load = true;
        }, 1000);
      }, 3500);
    }
  }

  /**Función para generar inventario de productos con más de 1.0 de existencias en Zeus y BagPro. */
  InventarioExistenciaZeus(){
    this.load = false;
    this.ArrayProductoZeus = [];
    this.numeroIdProd = 0;
    this.existenciasZeus.srvObtenerExistenciasArticulosZeus().subscribe(datosExistencias => {
      for (let exi = 0; exi < datosExistencias.length; exi++) {
        this.datosCodigo = datosExistencias[exi].codigo;
        this.clienteOtItems.srvObtenerItemsBagproXClienteItem(this.datosCodigo).subscribe(datosCLOTI => {
          for (let cl = 0; cl < datosCLOTI.length; cl++) {
            if(datosCLOTI[cl].clienteItems == datosExistencias[exi].codigo) {
              this.existencias_ProductosService.srvObtenerListaPorIdProducto(datosCLOTI[cl].clienteItems).subscribe(datos_existenciasProd => {
                for (let i = 0; i < datos_existenciasProd.length; i++) {
                  const datosInventario: any = {
                    codigoItem : datosCLOTI[cl].clienteItems,
                    nombreItem : datosCLOTI[cl].clienteItemsNom,
                    cantidadItem : datosExistencias[exi].existencias,
                    presentacion : datosExistencias[exi].presentacion,
                    PrecioItem : datosExistencias[exi].precioVenta,
                    PrecioTotalItem : datosExistencias[exi].precio_Total,
                    ClienteNombre : datosCLOTI[cl].clienteNom,
                    cantMinima : datos_existenciasProd[i].exProd_CantMinima,
                  }
                  this.ArrayProductoZeus.push(datosInventario);
                  this.ArrayProductoZeus.sort((a,b) => a.nombreItem.localeCompare(b.nombreItem));
                  this.ArrayProductoZeus.sort((a,b) => Number(b.cantidadItem <= b.cantMinima) - Number(a.cantidadItem <= a.cantMinima));
                  this.totalProductos += datosExistencias[exi].precio_Total;
                  break;
                }
              });
            }
          }
        });
      }
    });
    setTimeout(() => {
      this.load = true;
    }, 3500);
  }

  //
  seleccionarProducto(item){
    this.numeroIdProd = item.codigoItem;
    // const a : any = document.createElement("a");
    // document.body.appendChild(a);
    // a.href = "#FormExistencias";
    // a.click();
    // document.body.removeChild(a);
  }

  //
  actualizarCantMinima(){
    let cantidad : number = this.FormExistencias.value.cantMinima;
    this.existencias_ProductosService.srvObtenerListaPorIdProducto(this.numeroIdProd).subscribe(datos_existencias => {
      for (let i = 0; i < datos_existencias.length; i++) {
        const datosExistencias = {
          Prod_Id: this.numeroIdProd,
          exProd_Id: datos_existencias[i].exProd_Id,
          ExProd_Cantidad: datos_existencias[i].exProd_Cantidad,
          UndMed_Id: datos_existencias[i].undMed_Id,
          TpBod_Id: datos_existencias[i].tpBod_Id,
          ExProd_Precio: datos_existencias[i].exProd_Precio,
          ExProd_PrecioExistencia: datos_existencias[i].exProd_PrecioExistencia,
          ExProd_PrecioSinInflacion: datos_existencias[i].exProd_PrecioSinInflacion,
          ExProd_PrecioTotalFinal: datos_existencias[i].exProd_PrecioTotalFinal,
          TpMoneda_Id: datos_existencias[i].tpMoneda_Id,
          exProd_PrecioVenta : datos_existencias[i].exProd_PrecioVenta,
          ExProd_CantMinima : cantidad,
        }

        this.existencias_ProductosService.srvActualizarExistenciaCantidadMinima(this.numeroIdProd, datosExistencias).subscribe(datos_existencias => {
          this.InventarioExistenciaZeus();
        });
      }
    });
  }

  //
  organizarCliente_A_Z(){
    this.ArrayProductoZeus.sort((a,b) => a.ClienteNombre.localeCompare(b.ClienteNombre));
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
      }
    });
    Toast.fire({
      icon: 'warning',
      title: 'Ordenado por "Cliente" de la A a la Z.'
    });
  }

  //
  organizarCliente_Z_A(){
    this.ArrayProductoZeus.sort((a,b) => b.ClienteNombre.localeCompare(a.ClienteNombre));
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
      }
    });
    Toast.fire({
      icon: 'warning',
      title: 'Ordenado por "Cliente" de la Z a la A.'
    });
  }

   //
  organizarProducto_A_Z(){
    this.ArrayProductoZeus.sort((a,b) => a.nombreItem.localeCompare(b.nombreItem));
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
      }
    });
    Toast.fire({
      icon: 'warning',
      title: 'Ordenado por "Producto" de la A a la Z.'
    });
  }

  //
  organizarProducto_Z_A(){
    this.ArrayProductoZeus.sort((a,b) => b.nombreItem.localeCompare(a.nombreItem));
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
      }
    });
    Toast.fire({
      icon: 'warning',
      title: 'Ordenado por "Producto" de la Z a la A.'
    });
  }

  //
  organizarCantMinima(){
    this.ArrayProductoZeus.sort((a,b) => Number(b.cantidadItem <= b.cantMinima) - Number(a.cantidadItem <= a.cantMinima));
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
      }
    });
    Toast.fire({
      icon: 'warning',
      title: 'Ordenado por "Cantidad Minima".'
    });
  }

  /** Organiza el inventario de PT por existencias de mayor a menor. */
  organizarExistenciasDobleClick() {
    this.ArrayProductoZeus.sort((a,b)=> Number(b.cantidadItem) - Number(a.cantidadItem));
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
      }
    });
    Toast.fire({
      icon: 'warning',
      title: 'Ordenado por "Existencia" de mayor a menor.'
    });
  }

  /** Organiza el inventario de PT por existencias de menor a mayor. */
  organizarExistenciasUnClick() {
    this.ArrayProductoZeus.sort((a,b)=> Number(a.cantidadItem) - Number(b.cantidadItem));
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
      }
    });
    Toast.fire({
      icon: 'warning',
      title: 'Ordenado por "Existencia" de menor a mayor.'
    });
  }
}
