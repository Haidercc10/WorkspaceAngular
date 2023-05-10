import { Component, OnInit, ViewChild } from '@angular/core';
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';
import moment from 'moment';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { ExistenciasProductosService } from 'src/app/Servicios/ExistenciasProductos/existencias-productos.service';
import { InventarioZeusService } from 'src/app/Servicios/InventarioZeus/inventario-zeus.service';
import { Inventario_Mes_ProductosService } from 'src/app/Servicios/Inventario_Mes_Productos/Inventario_Mes_Productos.service';
import { AppComponent } from 'src/app/app.component';
import { logoParaPdf } from 'src/app/logoPlasticaribe_Base64';

@Component({
  selector: 'app-modal-generar-inventario-zeus',
  templateUrl: './modal-generar-inventario-zeus.component.html',
  styleUrls: ['./modal-generar-inventario-zeus.component.css']
})

export class ModalGenerarInventarioZeusComponent implements OnInit {

  @ViewChild('dt') dt: Table | undefined; //Variable identificadora de la tabla
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  load : boolean = true; //Variable que servirá para validar cuando mostrar la animacion de carga
  totalProductos : number = 0; //Variable que almacenará la suma del valor total de todos los productos consultados
  columnas : any = []; //Variable que tendrá las posibles columnas que se pueden seleccionar para ver
  columnasSeleccionada : any [] = []; //Variable que almcanará las columnas que se han elegido para ver adicional a las iniciales
  ArrayProductoZeus = []; //Variable que almacenará la informacion de todos los productos consultados
  fechaBusqueda : any = new Date(); // Variable que va a ayudar al momento de saber hasta que fecha se va a buscar
  mesActual : string; //Variable que va a almacenar el nombre del mes actual
  public cantProductos : number = 0;
  opcionFiltroFechas : string [] = ['Elija el filtro', 'Semana(s)', 'Mes(es)', 'Año(s)'];
  filtroFechas : string;
  cantidadDias : number;
  numeroIdProd : number = 0;
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro

  constructor(private existenciasZeus : InventarioZeusService,
                private clienteOtItems : BagproService,
                  private existencias_ProductosService : ExistenciasProductosService,
                    private invMesProductoService : Inventario_Mes_ProductosService,
                      private messageService: MessageService,
                        private AppComponent : AppComponent,) {
   this.modoSeleccionado = this.AppComponent.temaSeleccionado;
  }

  ngOnInit(): void {
    this.invetarioProductos();
    this.lecturaStorage();
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  // Funcion que calculará cual es la fecha segun los parametros especificados
  fechaBuscada(){
    if (this.filtroFechas == 'Semana(s)') this.fechaBusqueda = moment().subtract(this.cantidadDias, 'week').format('YYYY-MM-DD');
    else if (this.filtroFechas == 'Mes(es)') this.fechaBusqueda = moment().subtract(this.cantidadDias, 'month').format('YYYY-MM-DD');
    else if (this.filtroFechas == 'Año(s)') this.fechaBusqueda = moment().subtract(this.cantidadDias, 'years').format('YYYY-MM-DD');
  }

  // Funcion que buscará la ultima fecha en que se editó cada producto
  buscarPrecios(){
    this.load = false;
    this.fechaBuscada();
    for (let i = 0; i < this.ArrayProductoZeus.length; i++) {
      this.ArrayProductoZeus[i].fechaModificacion = '';
      this.clienteOtItems.srvObtenerListaConsultarItem(this.fechaBusqueda, this.today, this.ArrayProductoZeus[i].codigoItem, this.ArrayProductoZeus[i].PrecioItem).subscribe(datos_item => {
        if(datos_item != null) this.ArrayProductoZeus[i].fechaModificacion = `${datos_item}`.replace('T00:00:00', '');
      });
    }
    setTimeout(() => { this.ordenarItems(); }, 7000);
  }

  //Funcion que ordenará por fecha de la antugua a la mas reciente, y enviará los espacios en blanco al final
  ordenarItems(){
    this.ArrayProductoZeus.sort();
    this.ArrayProductoZeus.sort((a,b) => {
      if (a.fechaModificacion == '' && b.fechaModificacion != '') return 1;
      else return -1;
    });
    this.load = true;
  }

  // Funcion que va a exportar la informacion de los productos a un archivo de tipo excel
  exportarExcel() : void {
    if (this.ArrayProductoZeus.length == 0) this.mostrarAdvertencia(`Advertencia`, "Para generar el archivo de Excel, debe haber productos en la tabla");
    else {
      this.load = false;
        const title = `Inventario de Productos Terminados ${this.today}`;
        const header = ["Item", "Cliente", "Nombre", "Precio", "Existencias", "Presentación", "Subtotal", "Cantidad Minima", "Vendedor", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
        let datos : any =[];
        if (this.dt.filteredValue != undefined) {
          for (const item of this.dt.filteredValue) {
            const datos1  : any = [item.Id, item.Cliente, item.Nombre, item.Precio, item.Cantidad, item.Presentacion, item.Precio_Total, item.Cant_Minima, item.Vendedor, item.Enero, item.Febrero, item.Marzo, item.Abril, item.Mayo, item.Junio, item.Julio, item.Agosto, item.Septiembre, item.Octubre, item.Noviembre, item.Diciembre];
            datos.push(datos1);
          }
        } else if (this.dt._value != undefined) {
          for (const item of this.dt._value) {
            const datos1  : any = [item.Id, item.Cliente, item.Nombre, item.Precio, item.Cantidad, item.Presentacion, item.Precio_Total, item.Cant_Minima, item.Vendedor, item.Enero, item.Febrero, item.Marzo, item.Abril, item.Mayo, item.Junio, item.Julio, item.Agosto, item.Septiembre, item.Octubre, item.Noviembre, item.Diciembre];
            datos.push(datos1);
          }
        }
        let workbook = new Workbook();
        const imageId1 = workbook.addImage({
          base64:  logoParaPdf,
          extension: 'png',
        });
        let worksheet = workbook.addWorksheet(`Inventario de Productos Terminados ${this.today}`);
        worksheet.addImage(imageId1, 'A1:B3');
        let titleRow = worksheet.addRow([title]);
        titleRow.font = { name: 'Calibri', family: 4, size: 16, underline: 'double', bold: true };
        worksheet.addRow([]);
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
        worksheet.mergeCells('A1:U3');
        worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
        datos.forEach(d => {
          let row = worksheet.addRow(d);
          let qty = row.getCell(5);
          let stock = row.getCell(6);
          let color2 = 'FFFFFF'

          if (+stock.value < +qty) color2 = 'FF837B';
          stock.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: color2 }
          }
          row.getCell(4).numFmt = '"$"#,##0.00;[Red]\-"$"#,##0.00';
          row.getCell(5).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
          row.getCell(7).numFmt = '"$"#,##0.00;[Red]\-"$"#,##0.00';
          row.getCell(8).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
          row.getCell(10).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
          row.getCell(11).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
          row.getCell(12).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
          row.getCell(13).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
          row.getCell(14).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
          row.getCell(15).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
          row.getCell(16).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
          row.getCell(17).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
          row.getCell(18).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
          row.getCell(19).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
          row.getCell(20).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
          row.getCell(21).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
        });
        worksheet.getColumn(1).width = 10;
        worksheet.getColumn(2).width = 60;
        worksheet.getColumn(3).width = 60;
        worksheet.getColumn(4).width = 20;
        worksheet.getColumn(5).width = 20;
        worksheet.getColumn(6).width = 20;
        worksheet.getColumn(7).width = 20;
        worksheet.getColumn(8).width = 20;
        worksheet.getColumn(9).width = 60;
        worksheet.getColumn(10).width = 15;
        worksheet.getColumn(11).width = 15;
        worksheet.getColumn(12).width = 15;
        worksheet.getColumn(13).width = 15;
        worksheet.getColumn(14).width = 15;
        worksheet.getColumn(15).width = 15;
        worksheet.getColumn(16).width = 15;
        worksheet.getColumn(17).width = 15;
        worksheet.getColumn(18).width = 15;
        worksheet.getColumn(19).width = 15;
        worksheet.getColumn(20).width = 15;
        worksheet.getColumn(21).width = 15;
      setTimeout(() => {
        setTimeout(() => {
          workbook.xlsx.writeBuffer().then((data) => {
            let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            fs.saveAs(blob, `Inventario de Productos Terminados ${this.today}.xlsx`);
          });
          this.load = true;
          this.mostrarConfirmacion(`Confirmación`,`Archivo excel generado con éxito!`)
        }, 500);
      }, 2000);
    }
  }

  // Funcion que va a consultar y guardar toda la informacio de los productos con existencias mayores a cero(0)
  invetarioProductos(){
    this.load = false;
    this.ArrayProductoZeus = [];
    this.totalProductos = 0;
    this.columnas = [];
    this.columnasSeleccionada = [];
    let presentacion : string;
    let mes : any = moment().month();

    this.existenciasZeus.srvObtenerExistenciasArticulosZeus().subscribe(datos_Existencias => {
      for (let i = 0; i < datos_Existencias.length; i++) {
        this.clienteOtItems.srvObtenerItemsBagproXClienteItem(datos_Existencias[i].codigo).subscribe(datos_Cliente => {
          for (let j = 0; j < datos_Cliente.length; j++) {
            if (datos_Existencias[i].presentacion == 'UND') presentacion = 'Und';
            if (datos_Existencias[i].presentacion == 'KLS') presentacion = 'Kg';
            if (datos_Existencias[i].presentacion == 'PAQ') presentacion = 'Paquete';
            this.invMesProductoService.GetCantidadMes_Producto(datos_Cliente[j].clienteItems, presentacion).subscribe(datos_Inventario => {
              for (let k = 0; k < datos_Inventario.length; k++) {
                let info : any = {
                  Id : datos_Inventario[k].id,
                  Nombre : datos_Inventario[k].nombre,
                  Cliente : datos_Cliente[j].clienteNom,
                  Precio : datos_Existencias[i].precioVenta,
                  Cantidad : datos_Existencias[i].existencias,
                  Presentacion : datos_Inventario[k].und,
                  Precio_Total : datos_Existencias[i].precio_Total,
                  Cant_Minima : datos_Inventario[k].cant_Minima,
                  Vendedor : datos_Cliente[j].nombreCompleto,
                  Mes_Actual : 0,
                  Enero : datos_Inventario[k].enero,
                  Febrero : datos_Inventario[k].febrero,
                  Marzo : datos_Inventario[k].marzo,
                  Abril : datos_Inventario[k].abril,
                  Mayo : datos_Inventario[k].mayo,
                  Junio : datos_Inventario[k].junio,
                  Julio : datos_Inventario[k].julio,
                  Agosto : datos_Inventario[k].agosto,
                  Septiembre : datos_Inventario[k].septiembre,
                  Octubre : datos_Inventario[k].octubre,
                  Noviembre : datos_Inventario[k].noviembre,
                  Diciembre : datos_Inventario[k].diciembre,
                }

                if (mes == 0) {
                  this.mesActual = 'Enero';
                  info.Mes_Actual = datos_Inventario[k].enero;
                } else if (mes == 1) {
                  this.mesActual = 'Febrero';
                  info.Mes_Actual = datos_Inventario[k].febrero;
                } else if (mes == 2) {
                  this.mesActual = 'Marzo';
                  info.Mes_Actual = datos_Inventario[k].marzo;
                } else if (mes == 3) {
                  this.mesActual = 'Abril';
                  info.Mes_Actual = datos_Inventario[k].abril;
                } else if (mes == 4) {
                  this.mesActual = 'Mayo';
                  info.Mes_Actual = datos_Inventario[k].mayo;
                } else if (mes == 5) {
                  this.mesActual = 'Junio';
                  info.Mes_Actual = datos_Inventario[k].junio;
                } else if (mes == 6) {
                  this.mesActual = 'Julio';
                  info.Mes_Actual = datos_Inventario[k].julio;
                } else if (mes == 7) {
                  this.mesActual = 'Agosto';
                  info.Mes_Actual = datos_Inventario[k].agosto;
                } else if (mes == 8) {
                  this.mesActual = 'Septiembre';
                  info.Mes_Actual = datos_Inventario[k].septiembre;
                } else if (mes == 9) {
                  this.mesActual = 'Octubre';
                  info.Mes_Actual = datos_Inventario[k].Octubre;
                } else if (mes == 10) {
                  this.mesActual = 'Noviembre';
                  info.Mes_Actual = datos_Inventario[k].noviembre;
                } else if (mes == 11) {
                  this.mesActual = 'Diciembre';
                  info.Mes_Actual = datos_Inventario[k].diciembre;
                }
                this.columnas = [
                  { header: 'Enero', field: 'Enero'},
                  { header: 'Febrero', field: 'Febrero'},
                  { header: 'Marzo', field: 'Marzo'},
                  { header: 'Abril', field: 'Abril'},
                  { header: 'Mayo', field: 'Mayo'},
                  { header: 'Junio', field: 'Junio'},
                  { header: 'Julio', field: 'Julio'},
                  { header: 'Agosto', field: 'Agosto'},
                  { header: 'Septiembre', field: 'Septiembre'},
                  { header: 'Octubre', field: 'Octubre'},
                  { header: 'Noviembre', field: 'Noviembre'},
                  { header: 'Diciembre', field: 'Diciembre'},
                ];

                for (let l = 0; l < this.columnas.length; l++) {
                  if (this.columnas[l].header == this.mesActual) this.columnas.splice(l,1);
                }

                this.ArrayProductoZeus.push(info);
                this.ArrayProductoZeus.sort((a,b) => a.Nombre.localeCompare(b.Nombre));
                this.totalProductos += datos_Existencias[i].precio_Total;
              }
            });
          }
        });
      }
    });
    setTimeout(() => { this.load = true; }, 3000);
  }

  /**Función para generar inventario de productos con más de 1.0 de existencias en Zeus y BagPro. */
  InventarioExistenciaZeus(){
    this.load = false;
    this.ArrayProductoZeus = [];
    this.numeroIdProd = 0;
    this.totalProductos = 0;
    this.cantProductos = 0;

    this.existenciasZeus.srvObtenerExistenciasArticulosZeus().subscribe(datosExistencias => {
      for (let exi = 0; exi < datosExistencias.length; exi++) {
        this.clienteOtItems.srvObtenerItemsBagproXClienteItem(datosExistencias[exi].codigo).subscribe(datosCLOTI => {
          for (let cl = 0; cl < datosCLOTI.length; cl++) {
            if(datosCLOTI[cl].clienteItems == datosExistencias[exi].codigo) {
              this.existencias_ProductosService.srvObtenerListaPorIdProducto2(datosCLOTI[cl].clienteItems).subscribe(datos_existenciasProd => {
                for (let i = 0; i < datos_existenciasProd.length; i++) {
                  const datosInventario: any = {
                    codigoItem : datosCLOTI[cl].clienteItems,
                    Cliente : datosCLOTI[cl].clienteNom,
                    nombreItem : datosCLOTI[cl].clienteItemsNom,
                    PrecioItem : datosExistencias[exi].precioVenta,
                    cantidadItem : datosExistencias[exi].existencias,
                    stock_real : datos_existenciasProd[i].exProd_Cantidad,
                    presentacion : datosExistencias[exi].presentacion,
                    PrecioTotalItem : datosExistencias[exi].precio_Total,
                    ClienteNombre : datosCLOTI[cl].clienteNom,
                    cantMinima : datos_existenciasProd[i].exProd_CantMinima,
                    fechaModificacion : '',
                    vendedor: datosCLOTI[cl].nombreCompleto,
                  }
                  this.ArrayProductoZeus.push(datosInventario);
                  this.ArrayProductoZeus.sort((a,b) => a.nombreItem.localeCompare(b.nombreItem));
                  this.ArrayProductoZeus.sort((a,b) => Number(b.cantidadItem < b.cantMinima) - Number(a.cantidadItem < a.cantMinima));
                  this.totalProductos += datosExistencias[exi].precio_Total;
                  this.cantProductos += 1;
                  break;
                }
              });
            }
          }
        });
      }
    });
    setTimeout(() => { this.load = true; }, 5000);
  }

  //
  seleccionarProducto(item){
    this.numeroIdProd = item.codigoItem;
  }

  //
  actualizarCantMinima(fila){
    for (let index = 0; index < this.ArrayProductoZeus.length; index++) {
      if(fila.codigoItem == this.ArrayProductoZeus[index].codigoItem) {
        this.existencias_ProductosService.srvObtenerListaPorIdProducto2(this.numeroIdProd).subscribe(datos_existencias => {
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
              ExProd_CantMinima : this.ArrayProductoZeus[index].cantMinima,
              ExProd_Fecha : this.ArrayProductoZeus[i].exProd_Fecha,
              ExProd_Hora : this.ArrayProductoZeus[i].exProd_Hora,
            }
            this.existencias_ProductosService.srvActualizarExistenciaCantidadMinima(this.numeroIdProd, datosExistencias).subscribe(datos_existencias => {
              this.InventarioExistenciaZeus();
              this.confirmUsuarioCreado(fila.nombreItem);
            });
          }
        });
      }
    }
  }

  // Funcion que permitirá filtrar la información de la tabla
  aplicarfiltro($event, campo : any, valorCampo : string){
    this.dt!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);
  }

  //
  aplicarfiltroGlobal($event, valorCampo : string){
    this.dt!.filterGlobal(($event.target as HTMLInputElement).value, valorCampo);
  }

  /** */
  confirmUsuarioCreado(nombre) {
    this.load = false
    setTimeout(() => {
      this.load = true;
      this.mostrarConfirmacion(`Confirmación`, `¡Cantidad minima del producto ${nombre} actualizada con éxito!`);
    }, 5500);
  }

  /** Mostrar mensaje de confirmación  */
  mostrarConfirmacion(mensaje : any, titulo?: any) {
   this.messageService.add({severity: 'success', summary: mensaje,  detail: titulo, life : 2000});
  }

  /** Mostrar mensaje de error  */
  mostrarError(mensaje : any, titulo?: any) {
   this.messageService.add({severity:'error', summary: mensaje, detail: titulo, life : 5000});
  }

  /** Mostrar mensaje de advertencia */
  mostrarAdvertencia(mensaje : any, titulo?: any) {
   this.messageService.add({severity:'warn', summary: mensaje, detail: titulo, life : 2000});
  }
}
