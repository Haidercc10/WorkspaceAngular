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
import { InventarioProductosPBDDComponent } from '../Inventario-Productos-PBDD/Inventario-Productos-PBDD.component';

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
  @ViewChild(InventarioProductosPBDDComponent) invPlasticaribe: InventarioProductosPBDDComponent | undefined; 

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
    this.lecturaStorage();
    this.invetarioProductos();
    //setInterval(() => this.modoSeleccionado = this.AppComponent.temaSeleccionado, 1000);
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
    let count : number = 0;

    this.existenciasZeus.srvObtenerExistenciasArticulosZeus().subscribe(datos_Existencias => {
      this.clienteOtItems.srvObtenerItemsBagproXClienteItem(datos_Existencias.map(x => parseInt(x.codigo))).subscribe(datos_Cliente => {
        for (let j = 0; j < datos_Cliente.length; j++) {
          this.invMesProductoService.GetCantidadMes_Producto(datos_Cliente[j].clienteItems, datos_Cliente[j].ptPresentacionNom).subscribe(datos_Inventario => {
            for (let k = 0; k < datos_Inventario.length; k++) {
              let item = datos_Inventario[k].id;
              let und = datos_Inventario[k].und;
              let existencias : any = datos_Existencias.find(x => x.codigo == item && x.presentacion == und);
              this.llenarArrayProductos(0, datos_Inventario[k], existencias, datos_Cliente[j]);
              count++
              if(count == datos_Inventario.length) {
                this.load = true;
                this.invPlasticaribe.getStockInformation();
              }
            } 
          });
        }
      });
    });
  }

  llenarArrayProductos(i, inv, exi, cli) {
    let info : any = {
      'Numero': i + 1,
      'Id' : exi.codigo,
      'Nombre' : exi.nombre,
      'Cliente' : cli.clienteNom,
      'Precio' : exi.precioVenta,
      'Cantidad' : exi.existencias,
      'Presentacion' : exi.presentacion,
      'Precio_Total' : exi.precio_Total,
      'Cant_Minima' : inv.cant_Minima,
      'Vendedor' : cli.nombreCompleto,
      'Mes_Actual' : 0,//this.llenarMesActual(mes, inv),
      'Enero' : 0,//inv.enero,
      'Febrero' : 0,//inv.febrero,
      'Marzo' : 0,//inv.marzo,
      'Abril' : 0,//inv.abril,
      'Mayo' : 0,//inv.mayo,
      'Junio' : 0,//inv.junio,
      'Julio' : 0,//inv.julio,
      'Agosto' : 0,//inv.agosto,
      'Septiembre' : 0,//inv.septiembre,
      'Octubre' : 0,//inv.octubre,
      'Noviembre' : 0,//inv.noviembre,
      'Diciembre' : 0,//inv.diciembre,
      'ValidarCantMinima': exi.existencias <= inv.cant_Minima ? 1 : 0,
    }
    this.ArrayProductoZeus.push(info);
    this.ArrayProductoZeus.sort((a,b) => a.Nombre.localeCompare(b.Nombre));
    this.ArrayProductoZeus.sort((a,b) => Number(b.ValidarCantMinima) - Number(a.ValidarCantMinima)); 
  }

  /*llenarMesActual(mes: number, datos_Inventario: any): number {
    switch (mes) {
      case 0:
        this.mesActual = 'Enero';
        return datos_Inventario.enero;
      case 1:
        this.mesActual = 'Febrero';
        return datos_Inventario.febrero;
      case 2:
        this.mesActual = 'Marzo';
        return datos_Inventario.marzo;
      case 3:
        this.mesActual = 'Abril';
        return datos_Inventario.abril;
      case 4:
        this.mesActual = 'Mayo';
        return datos_Inventario.mayo;
      case 5:
        this.mesActual = 'Junio';
        return datos_Inventario.junio;
      case 6:
        this.mesActual = 'Julio';
        return datos_Inventario.julio;
      case 7:
        this.mesActual = 'Agosto';
        return datos_Inventario.agosto;
      case 8:
        this.mesActual = 'Septiembre';
        return datos_Inventario.septiembre;
      case 9:
        this.mesActual = 'Octubre';
        return datos_Inventario.Octubre;
      case 10:
        this.mesActual = 'Noviembre';
        return datos_Inventario.noviembre;
      case 11:
        this.mesActual = 'Diciembre';
        return datos_Inventario.diciembre;            
      default:
        return 0;
    }
  }*/

  /*llenarColumnas() {
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
  }*/

  //
  actualizarCantMinima(fila, $event){
    if ($event.key == 'Enter') {
      this.existencias_ProductosService.srvActualizarExistenciaCantidadMinima(fila.Id, fila.Cant_Minima).subscribe(() => {
        this.mensajeService.mensajeConfirmacion(`Confirmación`, `¡Cantidad minima del producto ${fila.nombreItem} actualizada con éxito!`);
        let i: number = this.ArrayProductoZeus.findIndex(x => x.Numero == fila.Numero);
        this.ArrayProductoZeus[i].ValidarCantMinima = fila.Cantidad <= fila.Cant_Minima ? 1 : 0;
        this.ArrayProductoZeus.sort((a,b) => a.Nombre.localeCompare(b.Nombre));
        this.ArrayProductoZeus.sort((a,b) => Number(b.ValidarCantMinima) - Number(a.ValidarCantMinima));
      }, () => this.mensajeService.mensajeError(`¡Ocurrió un error al actualizar la cantidad minima!`,``));
    }
  }

  precioTotalExistencia(): number {
    let total: number = 0;
    this.ArrayProductoZeus.forEach(d => ![6, 12].includes(this.ValidarRol) ? total += d.Precio_Total : total = 0);
    return total;
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
