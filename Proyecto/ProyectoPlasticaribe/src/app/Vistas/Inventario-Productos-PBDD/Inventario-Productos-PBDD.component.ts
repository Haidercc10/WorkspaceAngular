import { Component, OnInit, ViewChild } from '@angular/core';
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';
import moment from 'moment';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { modelExistenciaProductos } from 'src/app/Modelo/modelExisteciaProductos';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { ExistenciasProductosService } from 'src/app/Servicios/ExistenciasProductos/existencias-productos.service';
import { ProductoService } from 'src/app/Servicios/Productos/producto.service';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-Inventario-Productos-PBDD',
  templateUrl: './Inventario-Productos-PBDD.component.html',
  styleUrls: ['./Inventario-Productos-PBDD.component.css']
})
export class InventarioProductosPBDDComponent implements OnInit {

  @ViewChild('dt') dt: Table | undefined;
  public arrayInventario = [];
  public datosCodigo : string;
  ArrayProductosBDNueva = [];
  public page : number;
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  fechaBusqueda : any = new Date(); // Variable que va a ayudar al momento de saber hasta que fecha se va a buscar
  public filtroNombre : any;
  public NombrePT = '';
  public load : boolean = false;
  public NombreCliente = '';
  numeroIdProd : number = 0;
  totalProductos : number = 0;
  PrecioPT : number = 0;
  opcionFiltroFechas : string [] = ['Elija el filtro', 'Semana(s)', 'Mes(es)', 'Año(s)'];
  filtroFechas : string;
  cantidadDias : number;
  modoSeleccionado : boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro

  constructor(private clienteOtItems : BagproService,
                private existencias_ProductosService : ExistenciasProductosService,
                  private productosService : ProductoService,
                    private messageService: MessageService,
                      private AppComponent : AppComponent) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
  }

  ngOnInit(): void {
    this.InventarioExistenciaBDNueva();
    setInterval(() => this.modoSeleccionado = this.AppComponent.temaSeleccionado, 1000);
  }

  // Funcion que calculará cual es la fecha segun los parametros especificados
  fechaBuscada(){
    if (this.filtroFechas == 'Semana(s)') this.fechaBusqueda = moment().subtract(this.cantidadDias, 'week').format('YYYY-MM-DD');
    else if (this.filtroFechas == 'Mes(es)') this.fechaBusqueda = moment().subtract(this.cantidadDias, 'month').format('YYYY-MM-DD');
    else if (this.filtroFechas == 'Año(s)') this.fechaBusqueda = moment().subtract(this.cantidadDias, 'years').format('YYYY-MM-DD');
  }

  // Funcion que buscará la ultima fecha en que se editó cada producto
  buscarPrecios(){
    if (this.cantidadDias > 0 && this.cantidadDias != undefined && this.filtroFechas != 'Elija el filtro') {
      this.load = false;
      this.fechaBuscada();
      for (let i = 0; i < this.ArrayProductosBDNueva.length; i++) {
        this.ArrayProductosBDNueva[i].fechaModificacion = '';
        this.clienteOtItems.srvObtenerListaConsultarItem(this.fechaBusqueda, this.today, this.ArrayProductosBDNueva[i].Item, this.ArrayProductosBDNueva[i].PrecioItem).subscribe(datos_item => {
          if (datos_item != null) this.ArrayProductosBDNueva[i].fechaModificacion = `${datos_item}`.replace('T00:00:00','');
        });
      }
      setTimeout(() => { this.ordenarItems(); }, 10000);
    }
  }

  //Funcion que ordenará por fecha de la antugua a la mas reciente, y enviará los espacios en blanco al final
  ordenarItems(){
    this.ArrayProductosBDNueva.sort();
    this.ArrayProductosBDNueva.sort((a,b) => {
      if (a.fechaModificacion == '' && b.fechaModificacion != '') return 1;
      else return -1;
    });
    this.load = true;
  }

  //Funcion que exportará a un documrnto excel los datos de los productos
  exportarExcel() : void {
    if (this.ArrayProductosBDNueva.length == 0) this.mostrarAdvertencia(`Advertencia`, "Para generar el archivo de Excel, debe haber productos en la tabla");
    else {
      this.load = false;
      setTimeout(() => {
        const title = `Inventario de Productos ${this.today}`;
        const header = ["Ítem", "Nombre", "Precio", "Existencias", "Presentación", "Subtotal", "Cantidad Mínima", "Ult. Modificación"]
        let datos : any =[];
        for (const item of this.ArrayProductosBDNueva) {
          const datos1  : any = [item.Item, item.NombreItem, item.PrecioItem, item.Stock, item.Presentacion, item.Subtotal, item.CantMinima, item.fechaModificacion];
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
        }, 500);
        this.mostrarConfirmacion(`Confirmación`,`Se ha generado el archivo de excel exitosamente!`);
      }, 500);
    }
  }

  /**Función para generar inventario de productos con más de 1.0 de existencias en Zeus y BagPro. */
  InventarioExistenciaBDNueva(){
    this.load = false;
    this.ArrayProductosBDNueva = [];
    this.numeroIdProd = 0;
    this.totalProductos = 0;

    this.existencias_ProductosService.srvObtenerInventarioExistencias().subscribe(registrosIPT => {
      for (let index = 0; index < registrosIPT.length; index++) {
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
        this.ArrayProductosBDNueva.sort((a,b) => Number(b.Stock < b.CantMinima) - Number(a.Stock < a.CantMinima));
        this.totalProductos += registrosIPT[index].exProd_Cantidad * registrosIPT[index].exProd_PrecioVenta;
        }
    });
    setTimeout(() => { this.load = true; }, 1000);
  }

  //Funcion que actualizará un producto
  actualizarExistenciasProducto(data : any){
    for (let i = 0; i < this.ArrayProductosBDNueva.length; i++) {
      if (data.Item == this.ArrayProductosBDNueva[i].Item && data.Presentacion == this.ArrayProductosBDNueva[i].Presentacion) {
        this.existencias_ProductosService.IdProductoPresentacionInventario(data.Item, data.Presentacion).subscribe(datos_existencias => {
          for (let j = 0; j < datos_existencias.length; j++) {
            const datosExistencias : modelExistenciaProductos = {
              Prod_Id: datos_existencias[j].prod_Id,
              exProd_Id : datos_existencias[j].exProd_Id,
              ExProd_Cantidad: this.ArrayProductosBDNueva[i].Stock,
              UndMed_Id: datos_existencias[j].undMed_Id,
              TpBod_Id: datos_existencias[j].tpBod_Id,
              ExProd_Precio: datos_existencias[j].exProd_Precio,
              ExProd_PrecioExistencia: this.ArrayProductosBDNueva[i].PrecioItem * this.ArrayProductosBDNueva[i].Stock,
              ExProd_PrecioSinInflacion: datos_existencias[j].exProd_PrecioSinInflacion,
              TpMoneda_Id: datos_existencias[j].tpMoneda_Id,
              ExProd_PrecioVenta: this.ArrayProductosBDNueva[i].PrecioItem,
              ExProd_CantMinima : this.ArrayProductosBDNueva[i].CantMinima,
              ExProd_Fecha : datos_existencias[j].exProd_Fecha,
              ExProd_Hora: datos_existencias[j].exProd_Hora,
            }
            this.existencias_ProductosService.srvActualizar(datos_existencias[j].exProd_Id, datosExistencias).subscribe(datos_actualizados => {
              this.mostrarConfirmacion(`Advertencia`, `¡Se actualizó la información del producto ${data.NombreItem}!</b>`);
              this.InventarioExistenciaBDNueva();
            }, error => { this.mostrarError(`Error`, `¡Error al actualizar la información del producto ${data.NombreItem}!`); });
          }
        }, error => { this.mostrarError(`Error`, `¡Error al buscar la información del producto ${data.NombreItem}!`); });
        break;
      }
    }
  }

  // Funcion que va a filtrar los registros de la tabla
  aplicarfiltroGlobal($event, valorCampo : string){
    this.dt!.filterGlobal(($event.target as HTMLInputElement).value, valorCampo);
  }

  // Funcion que va a actualizar el nombre de los productos
  actualizarNombreProducto(data : any){
    this.productosService.srvObtenerListaPorId(data.Item).subscribe(datos_producto => {
      let datos : any [] = [datos_producto];
      for (let i = 0; i < datos.length; i++) {
        const datosProducto = {
          Prod_Id : datos[i].prod_Id,
          Prod_Nombre: data.NombreItem,
          Prod_Descripcion: datos[i].prod_Descripcion,
          TpProd_Id: datos[i].tpProd_Id,
          Prod_Peso_Bruto: datos[i].prod_Peso_Bruto,
          Prod_Peso_Neto: datos[i].prod_Peso_Neto,
          UndMedPeso: datos[i].undMedPeso,
          Prod_Fuelle: datos[i].prod_Fuelle,
          Prod_Ancho: datos[i].prod_Ancho,
          Prod_Calibre: datos[i].prod_Calibre,
          UndMedACF: datos[i].undMedACF,
          Estado_Id: datos[i].estado_Id,
          Prod_Largo: datos[i].prod_Largo,
          Pigmt_Id: datos[i].pigmt_Id,
          Material_Id: datos[i].material_Id,
          Prod_Fecha : datos[i].prod_Fecha,
          Prod_Hora: datos[i].prod_Hora,
        }
        this.productosService.srvActualizar(datos[i].prod_Id, datosProducto).subscribe(datos_actualizados => {
          this.mostrarConfirmacion(`Confirmación`,`¡Se actualizó la información del producto ${data.NombreItem}!`);
          this.InventarioExistenciaBDNueva();
        }, error => { this.mostrarError(`Error`, `¡Error al actualizar la información del producto ${data.NombreItem}!`); });
      }
    }, error => { this.mostrarError(`Error`, `¡Error al buscar la información del producto ${data.NombreItem}!`); });
  }

  /** Mostrar mensaje de confirmación  */
  mostrarConfirmacion(mensaje : any, titulo?: any) {
   this.messageService.add({severity: 'success', summary: mensaje,  detail: titulo});
  }

  /** Mostrar mensaje de error  */
  mostrarError(mensaje : any, titulo?: any) {
   this.messageService.add({severity:'error', summary: mensaje, detail: titulo});
  }

  /** Mostrar mensaje de advertencia */
  mostrarAdvertencia(mensaje : any, titulo?: any) {
   this.messageService.add({severity:'warn', summary: mensaje, detail: titulo});
  }
}
