import { Component, Injectable, OnInit, ViewChild } from '@angular/core';
import moment from 'moment';
import { Table } from 'primeng/table';
import { forkJoin } from 'rxjs';
import { AppComponent } from 'src/app/app.component';
import { CreacionExcelService } from 'src/app/Servicios/CreacionExcel/CreacionExcel.service';
import { InventarioSnapshotService } from 'src/app/Servicios/Inventario_Snapshot/inventario-snapshot.service';
import { InventariosService } from 'src/app/Servicios/Inventarios/inventarios.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { TomaFisicaInventarioService } from 'src/app/Servicios/Toma_Fisica_Inventario/toma-fisica-inventario.service';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-inventario-vs-toma-fisica',
  templateUrl: './inventario-vs-toma-fisica.component.html',
  styleUrls: ['./inventario-vs-toma-fisica.component.css']
})
export class InventarioVsTomaFisicaComponent implements OnInit {
  modoSeleccionado: boolean = false;
  @ViewChild('table') table: Table | undefined;
  @ViewChild('tableSystem') tableSystem: Table | undefined;
  @ViewChild('tableCount') tableCount: Table | undefined;
  inventory: any = [];
  inventorySystem: any = [];
  inventoryCount: any = [];
  load: boolean = false;
  storage_Id: number;
  storage_Nombre: string;
  ValidarRol: number;
  loading: boolean;
  modal: boolean = false;
  itemSelected: item = { item: 0, ref: '', unit: '' };
  inventories: any = [];
  countInventory: any;


  constructor(private AppComponent: AppComponent,
    private svInvSnapshot: InventariosService,
    private svPhysicalCount: TomaFisicaInventarioService,
    private msj: MensajesAplicacionService,
    private svExcel: CreacionExcelService,
    private svSnapshot: InventarioSnapshotService,
  ) {
    this.modoSeleccionado = this.AppComponent.temaSeleccionado;
  }

  ngOnInit(): void {
    this.lecturaStorage();
    //this.getInventory();
    this.getInventoriesAdd();
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage() {
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  //Función que se encarga de filtrar la información de la tabla
  applyFilter = ($event, campo: any, datos: Table) => datos!.filter(($event.target as HTMLInputElement).value, campo, 'contains');

  //Función que obtiene el inventario en snapshot
  getInventory() {
    if (this.countInventory) {
    this.loading = true;
      this.svInvSnapshot.getInventorySnapshot(this.countInventory).subscribe(res => {
        this.inventory = res;
        this.loading = false;
      }, error => {
        console.log(error);
        this.loading = false;
      })
    }

  }

  getInventoriesAdd() {
    this.svSnapshot.getInventoriesSnapshot().subscribe(data => {
      this.inventories = data;
    }, error => {
      console.log(error);
    })
  }

  //Función que carga los detalles del inventario seleccionado
  loadDetailsInventory(item: any) {
    this.modal = true;
    this.load = true;
    this.itemSelected = { item: item.item, ref: item.reference, unit: item.unit };

    forkJoin({
      system: this.svInvSnapshot.getInventorySnapshotForItem(item.item, item.unit),
      physical: this.svPhysicalCount.getPhysicalCountForItem(item.item, item.unit)
    })
      .subscribe({
        next: ({ system, physical }) => {
          this.inventorySystem = system;
          this.inventoryCount = physical;
        },
        error: err => {
          console.error(err);
        },
        complete: () => {
          this.load = false;
        }
      });
  }

  //Función que calcula el total del inventario
  totalInventory = () => this.inventory.reduce((a, b) => a + b.subtotal, 0);

  //Funcion que calculan el total del sistema
  totalSystemInventoryForItem = (item: number, unit: string) => this.inventorySystem.filter(x => item == item && x.unit == unit).reduce((a, b) => a + b.quantity, 0);

  //Función que calcula el total de la toma fisica
  totalCountInventoryForItem = (item: number, unit: string) => this.inventoryCount.filter(x => item == item && x.unit == unit).reduce((a, b) => a + b.quantity, 0);

  //Funcion que calculan el total en pesos del inventario del sistema
  valueSystemInventoryForItem = (item: number, unit: string) => this.inventorySystem.filter(x => item == item && x.unit == unit).reduce((a, b) => a + b.subTotal, 0);

  //Función que calcula el total en pesos de la toma fisica
  valueCountInventoryForItem = (item: number, unit: string) => this.inventoryCount.filter(x => item == item && x.unit == unit).reduce((a, b) => a + b.subTotal, 0);

  //Función que exportará un formato excel con los datos de los clientes
  exportExcel() {
    if (this.inventory.length > 0) {
      setTimeout(() => { this.loadSheetAndStyles(this.inventory); }, 500);
    } else this.msj.mensajeAdvertencia(`Advertencia`, `No hay datos para exportar.`);
  }

  //Función que cargará la hoja y los estilos. 
  loadSheetAndStyles(data: any) {
    let title: any = `Inventario vs Toma Fisica`;
    title += ` ${moment().format('DD-MM-YYYY')}`
    let fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'eeeeee' } };
    let border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }, };
    let font = { name: 'Calibri', family: 4, size: 11, bold: true };
    let alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    let workbook = this.svExcel.formatoExcel(title, true);

    this.addNewSheet(workbook, title, fill, border, font, alignment, data);
    this.svExcel.creacionExcel(title, workbook);
  }

  //Función para agregar una nueva hoja de calculo.
  addNewSheet(wb: any, title: any, fill: any, border: any, font: any, alignment: any, data: any) {
    let fontTitle = { name: 'Calibri', family: 4, size: 15, bold: true };
    let worksheet: any = wb.worksheets[0];
    this.loadStyleTitle(worksheet, title, fontTitle, alignment);
    this.loadHeader(worksheet, fill, border, font, alignment);
    this.loadInfoExcel(worksheet, this.dataExcel(data), border, alignment);
  }

  //Cargar estilos del titulo de la hoja.
  loadStyleTitle(ws: any, title: any, fontTitle: any, alignment: any) {
    ws.getCell('A1').alignment = alignment;
    ws.getCell('A1').font = fontTitle;
    ws.getCell('A1').value = title;
  }

  //Función para cargar los titulos de el header y los estilos.
  loadHeader(ws: any, fill: any, border: any, font: any, alignment: any) {
    let rowHeader: any = ['A5', 'B5', 'C5', 'D5', 'E5', 'F5', 'G5', 'H5', 'I5', 'J5', 'K5', 'L5', 'M5', 'N5', 'O5', 'P5', 'Q5', 'R5'];
    //ws.addRow([]);
    ws.addRow(this.loadFieldsHeader());

    rowHeader.forEach(x => ws.getCell(x).fill = fill);
    rowHeader.forEach(x => ws.getCell(x).alignment = alignment);
    rowHeader.forEach(x => ws.getCell(x).border = border);
    rowHeader.forEach(x => ws.getCell(x).font = font);
    ws.mergeCells('A1:R3');

    this.loadSizeHeader(ws);
  }

  //Función para cargar el tamaño y el alto de las columnas del header.
  loadSizeHeader(ws: any) {
    [11, 2,].forEach(x => ws.getColumn(x).width = 10);
    [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].forEach(x => ws.getColumn(x).width = 20);
    [16, 17, 18].forEach(x => ws.getColumn(x).width = 25);
    //[].forEach(x => ws.getColumn(x).width = 40);
    [3].forEach(x => ws.getColumn(x).width = 50);
  }

  //Función para cargar los nombres de las columnas del header
  loadFieldsHeader() {
    let headerRow = [
      'N°',
      'Item',
      'Referencia',
      'Sistema',
      'Fisico',
      'Diferencia',
      'Und',
      'Precio Venta',
      'Subtotal',
      'Cant. Detallada',
      'Físico',
      'Diferencia',
      'Unds Detalladas',
      'Unds Fisicas',
      'Dif. Unidades',
      'Sistema',
      'Cant. Detallada',
      'Diferencia',
    ];
    return headerRow;
  }

  //Cargar información con los estilos al formato excel. 
  loadInfoExcel(ws: any, data: any, border: any, alignment: any) {
    let contador: any = 6;
    let formatNumber: Array<number> = [4, 5, 6, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
    formatNumber.forEach(i => ws.getColumn(i).numFmt = '""#,##0.00;[Red]\-""#,##0.00');
    let row: any = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R'];

    data.forEach(x => {
      ws.addRow(x);
      row.forEach(r => {
        ws.getCell(`${r}${contador}`).border = border;
        ws.getCell(`${r}${contador}`).font = { name: 'Calibri', family: 4, size: 10 };
        ws.getCell(`${r}${contador}`).alignment = alignment;
      });
      contador++
    });
  }

  //.Función que contendrá la info al documento excel. 
  dataExcel(data: any) {
    let info: any = [];
    let count: number = 0;
    data.forEach(x => {
      info.push([
        count += 1,
        x.item,
        x.reference,
        x.stock,
        x.physicalQty,
        x.diference,
        x.unit,
        x.price,
        x.subtotal,
        x.quantity,
        x.physicalQty,
        x.diference2,
        x.count,
        x.physicalRollos,
        x.diferenceUnits,
        x.stock,
        x.quantity,
        x.diference3,
      ]);
    });
    return info;
  }
}

export interface item {
  item: number,
  ref: string,
  unit: string,
}