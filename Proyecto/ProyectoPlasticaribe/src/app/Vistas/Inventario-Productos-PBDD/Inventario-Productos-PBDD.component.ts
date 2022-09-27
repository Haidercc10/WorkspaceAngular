import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Workbook } from 'exceljs';
import moment from 'moment';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { BagproService } from 'src/app/Servicios/Bagpro.service';
import { ExistenciasProductosService } from 'src/app/Servicios/existencias-productos.service';
import { InventarioZeusService } from 'src/app/Servicios/inventario-zeus.service';
import { RolesService } from 'src/app/Servicios/roles.service';
import Swal from 'sweetalert2';
import * as fs from 'file-saver';

@Component({
  selector: 'app-Inventario-Productos-PBDD',
  templateUrl: './Inventario-Productos-PBDD.component.html',
  styleUrls: ['./Inventario-Productos-PBDD.component.css']
})
export class InventarioProductosPBDDComponent implements OnInit {

  public FormExistencias !: FormGroup;
  public titulosTabla : any = [];
  public arrayInventario = [];
  public datosCodigo : string;
  ArrayProductosBDNueva = [];
  public page : number;
  today : any = new Date(); //Variable que se usará para llenar la fecha actual
  fechaBusqueda : any = new Date(); // Variable que va a ayudar al momento de saber hasta que fecha se va a buscar
  mostrarColumna : boolean = false;
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
      cantidad : [0],
      filtroFechas : [''],
    });
    this.load = true;
  }

  ngOnInit(): void {
    this.lecturaStorage();
    this.ColumnasTabla();
    this.fecha();
    this.InventarioExistenciaBDNueva();
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

  // Funcion que calculará cual es la fecha segun los parametros especificados
  fechaBuscada(){
    let cantidad : number = this.FormExistencias.value.cantidad;
    let filtroFechas : any = this.FormExistencias.value.filtroFechas;

    if (filtroFechas == 1) this.fechaBusqueda = moment().subtract(cantidad, 'week').format('YYYY-MM-DD');
    else if (filtroFechas == 2) this.fechaBusqueda = moment().subtract(cantidad, 'month').format('YYYY-MM-DD');
    else if (filtroFechas == 3) this.fechaBusqueda = moment().subtract(cantidad, 'years').format('YYYY-MM-DD');
  }

  //
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

  // Funcion que buscará la ultima fecha en que se editó cada producto
  buscarPrecios(){
    this.load = false;
    this.fechaBuscada();
    for (let i = 0; i < this.ArrayProductosBDNueva.length; i++) {
      this.ArrayProductosBDNueva[i].fechaModificacion = '';
      this.clienteOtItems.srvObtenerListaConsultarItem(this.fechaBusqueda, this.today, this.ArrayProductosBDNueva[i].Item, this.ArrayProductosBDNueva[i].PrecioItem).subscribe(datos_item => {
        if (datos_item.length != 0){
          for (let j = 0; j < datos_item.length; j++) {
            this.mostrarColumna = true;
            this.ArrayProductosBDNueva[i].fechaModificacion = datos_item[j].fechaCrea.replace('T00:00:00', '');
          }
        }
      });
    }
    setTimeout(() => { this.ordenarItems(); }, 7000);
  }

  //Funcion que ordenará por fecha de la antugua a la mas reciente, y enviará los espacios en blanco al final
  ordenarItems(){
    this.ArrayProductosBDNueva.sort((a,b) => b.fechaModificacion.localeCompare(a.fechaModificacion));
    this.ArrayProductosBDNueva.sort((a,b) => {
      if (a.fechaModificacion == '' && b.fechaModificacion != '') return 1;
      else return -1;
    });
    setTimeout(() => { this.load = true; }, 1200);
  }

  //
  exportarExcel() : void {
    if (this.ArrayProductosBDNueva.length == 0) Swal.fire("Para generar el archivo de Excel, debe haber productos en la tabla");
    else {
      this.load = false;
      setTimeout(() => {
        const title = `Inventario de Productos ${this.today}`;
        const header = ["Item", /*"Cliente",*/ "Nombre", "Precio", "Existencias", "Presentación", "Subtotal", "Cantidad Minima", "Ult. Modificación"]
        let datos : any =[];
        for (const item of this.ArrayProductosBDNueva) {
          const datos1  : any = [item.Item, /*item.ClienteNombre,*/ item.NombreItem, item.PrecioItem, item.Stock, item.Presentacion, item.Subtotal, item.CantMinima, item.fechaModificacion];
          datos.push(datos1);
        }
        let workbook = new Workbook();
        let worksheet = workbook.addWorksheet(`Inventario de Productos ${this.today}`);
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
          let qty = row.getCell(4);
          let qty9 = row.getCell(7);
          let color = 'ADD8E6';
          if (+qty.value < d[7]) color = 'FF837B';
          qty.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: color }
          }
          row.getCell(3).numFmt = '"$"#,##0.00;[Red]\-"$"#,##0.00';
          row.getCell(4).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
          row.getCell(6).numFmt = '"$"#,##0.00;[Red]\-"$"#,##0.00';
          row.getCell(7).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
        });
        worksheet.getColumn(1).width = 10;
        worksheet.getColumn(2).width = 60;
        worksheet.getColumn(3).width = 20;
        worksheet.getColumn(4).width = 20;
        worksheet.getColumn(5).width = 20;
        worksheet.getColumn(6).width = 20;
        worksheet.getColumn(7).width = 20;
        worksheet.getColumn(8).width = 20;
        setTimeout(() => {
          workbook.xlsx.writeBuffer().then((data) => {
            let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            fs.saveAs(blob, `Inventario de Productos ${this.today}.xlsx`);
          });
          this.load = true;
        }, 1000);
      }, 3500);
    }
  }

  /**Función para generar inventario de productos con más de 1.0 de existencias en Zeus y BagPro. */
  InventarioExistenciaBDNueva(){
    this.load = false;
    this.ArrayProductosBDNueva = [];
    this.numeroIdProd = 0;

    this.existencias_ProductosService.srvObtenerInventarioExistencias().subscribe(registrosIPT => {
      for (let index = 0; index < registrosIPT.length; index++) {
        if(registrosIPT[index].exProd_Cantidad >= 1.00) {
          const dataInventario : any = {
            Item : registrosIPT[index].prod_Id,
            NombreItem : registrosIPT[index].prod_Nombre,
            PrecioItem : registrosIPT[index].exProd_PrecioVenta,
            Stock : registrosIPT[index].exProd_Cantidad,
            Presentacion : registrosIPT[index].undMed_Id,
            Subtotal : registrosIPT[index].exProd_Cantidad * registrosIPT[index].exProd_PrecioVenta,
            CantMinima : registrosIPT[index].exProd_CantMinima,
            fechaModificacion : '',
          }

          this.ArrayProductosBDNueva.push(dataInventario)
          this.ArrayProductosBDNueva.sort((a,b) => a.NombreItem.localeCompare(b.NombreItem));
          this.ArrayProductosBDNueva.sort((a,b) => Number(b.Stock <= b.CantMinima) - Number(a.Stock <= a.CantMinima));
          this.totalProductos += registrosIPT[index].exProd_Cantidad * registrosIPT[index].exProd_PrecioVenta;
        }
      }
    });
    setTimeout(() => {
      this.load = true;
    }, 5000);
  }

  //
  seleccionarProducto(item){
    this.numeroIdProd = item.Item;
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
          this.InventarioExistenciaBDNueva();

        });
      }
    });
  }

   //
  organizarProducto_A_Z(){
    this.ArrayProductosBDNueva.sort((a,b) => a.NombreItem.localeCompare(b.NombreItem));
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
    this.ArrayProductosBDNueva.sort((a,b) => b.NombreItem.localeCompare(a.NombreItem));
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
    this.ArrayProductosBDNueva.sort((a,b) => Number(b.Stock <= b.CantMinima) - Number(a.Stock <= a.CantMinima));
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
    this.ArrayProductosBDNueva.sort((a,b)=> Number(b.Stock) - Number(a.Stock));
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
    this.ArrayProductosBDNueva.sort((a,b)=> Number(a.Stock) - Number(b.Stock));
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
