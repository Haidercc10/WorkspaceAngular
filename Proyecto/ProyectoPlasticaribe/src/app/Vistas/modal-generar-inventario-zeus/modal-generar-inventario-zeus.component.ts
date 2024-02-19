import { Component, Injectable, Input, OnInit, ViewChild } from '@angular/core';
import { ShepherdService } from 'angular-shepherd';
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';
import moment from 'moment';
import { Table } from 'primeng/table';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { ExistenciasProductosService } from 'src/app/Servicios/ExistenciasProductos/existencias-productos.service';
import { InventarioZeusService } from 'src/app/Servicios/InventarioZeus/inventario-zeus.service';
import { Inventario_Mes_ProductosService } from 'src/app/Servicios/Inventario_Mes_Productos/Inventario_Mes_Productos.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { AppComponent } from 'src/app/app.component';
import { defaultStepOptions, stepsProductos as defaultSteps } from 'src/app/data';
import { Recetas_ProductosComponent } from '../Recetas_Productos/Recetas_Productos.component';

@Injectable({
  providedIn : 'root'
})

@Component({
  selector: 'app-modal-generar-inventario-zeus',
  templateUrl: './modal-generar-inventario-zeus.component.html',
  styleUrls: ['./modal-generar-inventario-zeus.component.css']
})

export class ModalGenerarInventarioZeusComponent implements OnInit {

  @Input() reporteConsolidado : boolean = false;
  @ViewChild('dt') dt: Table | undefined; //Variable identificadora de la tabla
  @ViewChild(Recetas_ProductosComponent) receta: Recetas_ProductosComponent | undefined; 
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
  recetaProducto : boolean = false;

  constructor(private existenciasZeus : InventarioZeusService,
                private clienteOtItems : BagproService,
                  private existencias_ProductosService : ExistenciasProductosService,
                    private invMesProductoService : Inventario_Mes_ProductosService,
                      private AppComponent : AppComponent,
                        private shepherdService: ShepherdService,
                          private mensajeService : MensajesAplicacionService,) {
   this.modoSeleccionado = this.AppComponent.temaSeleccionado;
  }

  ngOnInit(): void {
    this.invetarioProductos();
    this.lecturaStorage();
    setInterval(() => this.modoSeleccionado = this.AppComponent.temaSeleccionado, 1000);
  }

  tutorial(){
    this.shepherdService.defaultStepOptions = defaultStepOptions;
    this.shepherdService.modal = true;
    this.shepherdService.confirmCancel = false;
    this.shepherdService.addSteps(defaultSteps);
    this.shepherdService.start();
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  // Funcion que va a exportar la informacion de los productos a un archivo de tipo excel
  exportarExcel() : void {
    if (this.ArrayProductoZeus.length == 0) this.mensajeService.mensajeAdvertencia(`Advertencia`, "Para generar el archivo de Excel, debe haber productos en la tabla");
    else {
      this.load = false;
        const title = `Inventario de Productos Terminados ${this.today}`;
        const header = ["Item", "Cliente", "Nombre", "Existencias", "Precio", "Subtotal", "Presentación", "Cantidad Minima", "Vendedor", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
        let datos : any =[];
        if (this.dt.filteredValue != undefined) {
          for (const item of this.dt.filteredValue) {
            const datos1  : any = [item.Id, item.Cliente, item.Nombre, item.Cantidad, item.Precio, item.Precio_Total, item.Presentacion, item.Cant_Minima, item.Vendedor, item.Enero, item.Febrero, item.Marzo, item.Abril, item.Mayo, item.Junio, item.Julio, item.Agosto, item.Septiembre, item.Octubre, item.Noviembre, item.Diciembre];
            datos.push(datos1);
          }
        } else if (this.dt._value != undefined) {
          for (const item of this.dt._value) {
            const datos1  : any = [item.Id, item.Cliente, item.Nombre, item.Cantidad, item.Precio, item.Precio_Total, item.Presentacion, item.Cant_Minima, item.Vendedor, item.Enero, item.Febrero, item.Marzo, item.Abril, item.Mayo, item.Junio, item.Julio, item.Agosto, item.Septiembre, item.Octubre, item.Noviembre, item.Diciembre];
            datos.push(datos1);
          }
        }
        let workbook = new Workbook();
        let worksheet = workbook.addWorksheet(`Inventario de Productos Terminados ${this.today}`);
        let titleRow = worksheet.addRow([title]);
        titleRow.font = { name: 'Calibri', family: 4, size: 16, underline: 'double', bold: true };
        worksheet.addRow([]);
        worksheet.addRow([]);
        let headerRow = worksheet.addRow(header);
        headerRow.eachCell((cell) => {
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
          let formatNumber : number [] = [4, 5, 6, 8, 10, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];
          formatNumber.forEach(e => row.getCell(e).numFmt = '""#,##0.00;[Red]\-""#,##0.00');
        });
        let tamano60 : number [] = [2, 3, 9];
        let tamano20 : number [] = [4, 5, 6, 7, 8];
        let tamano15 : number [] = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];
        tamano60.forEach(e => worksheet.getColumn(e).width = 60);
        tamano20.forEach(e => worksheet.getColumn(e).width = 20);
        tamano15.forEach(e => worksheet.getColumn(e).width = 15);
        worksheet.getColumn(1).width = 10;
      setTimeout(() => {
        setTimeout(() => {
          workbook.xlsx.writeBuffer().then((data) => {
            let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            fs.saveAs(blob, `Inventario de Productos Terminados ${this.today}.xlsx`);
          });
          this.load = true;
          this.mensajeService.mensajeConfirmacion(`Confirmación`,`Archivo excel generado con éxito!`)
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

                switch (mes) {
                  case 0:
                    this.mesActual = 'Enero';
                    info.Mes_Actual = datos_Inventario[k].enero;
                    break;
                  case 1:
                    this.mesActual = 'Febrero';
                    info.Mes_Actual = datos_Inventario[k].febrero;
                    break;
                  case 2:
                    this.mesActual = 'Marzo';
                    info.Mes_Actual = datos_Inventario[k].marzo;
                    break;
                  case 3:
                    this.mesActual = 'Abril';
                    info.Mes_Actual = datos_Inventario[k].abril;
                    break;
                  case 4:
                    this.mesActual = 'Mayo';
                    info.Mes_Actual = datos_Inventario[k].mayo;
                    break;
                  case 5:
                    this.mesActual = 'Junio';
                    info.Mes_Actual = datos_Inventario[k].junio;
                    break;
                  case 6:
                    this.mesActual = 'Julio';
                    info.Mes_Actual = datos_Inventario[k].julio;
                    break;
                  case 7:
                    this.mesActual = 'Agosto';
                    info.Mes_Actual = datos_Inventario[k].agosto;
                    break;
                  case 8:
                    this.mesActual = 'Septiembre';
                    info.Mes_Actual = datos_Inventario[k].septiembre;
                    break;
                  case 9:
                    this.mesActual = 'Octubre';
                    info.Mes_Actual = datos_Inventario[k].Octubre;
                    break;
                  case 10:
                    this.mesActual = 'Noviembre';
                    info.Mes_Actual = datos_Inventario[k].noviembre;
                    break;
                  case 11:
                    this.mesActual = 'Diciembre';
                    info.Mes_Actual = datos_Inventario[k].diciembre;
                    break;                
                  default:
                    break;
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

                // for (let l = 0; l < this.columnas.length; l++) {
                //   if (this.columnas[l].header == this.mesActual) this.columnas.splice(l,1);
                // }

                this.ArrayProductoZeus.push(info);
                this.ArrayProductoZeus.sort((a,b) => a.Nombre.localeCompare(b.Nombre));
                this.totalProductos += datos_Existencias[i].precio_Total;
              }
            });
          }
        });
      }
    });
    setTimeout(() => this.load = true, 3000);
  }

  //
  actualizarCantMinima(fila, $event){
    if ($event.key == 'Enter') {
      this.existencias_ProductosService.srvActualizarExistenciaCantidadMinima(fila.Id, fila.Cant_Minima).subscribe(() => {
        this.mensajeService.mensajeConfirmacion(`Confirmación`, `¡Cantidad minima del producto ${fila.nombreItem} actualizada con éxito!`);
      }, error => this.mensajeService.mensajeError(`¡Ocurrió un error al actualizar la cantidad minima!`,``));
    }
  }

  // Funcion que permitirá filtrar la información de la tabla
  aplicarfiltro = ($event, campo : any, valorCampo : string) => this.dt!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);

  //
  aplicarfiltroGlobal = ($event, valorCampo : string) => this.dt!.filterGlobal(($event.target as HTMLInputElement).value, valorCampo);

  // Funcion que permitirá mostrar el modal de la creación y edición de la receta
  mostrarModalCrearEditar(data : any = "") {
    this.recetaProducto = true;
    this.receta.limpiarTodo();
    if (data != "") {
      this.receta.FormProductos.patchValue({ Nombre : data.Id, });
      this.receta.buscarProductos();
      setTimeout(() => this.receta.cambiarNombreProducto(), 500);
    }
  }
}
