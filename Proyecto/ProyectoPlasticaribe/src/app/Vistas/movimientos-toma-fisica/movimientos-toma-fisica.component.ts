import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import moment from 'moment';
import { Table } from 'primeng/table';
import { AppComponent } from 'src/app/app.component';
import { InventarioZeusService } from 'src/app/Servicios/InventarioZeus/inventario-zeus.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { ProductoService } from 'src/app/Servicios/Productos/producto.service';
import { TomaFisicaInventarioService } from 'src/app/Servicios/Toma_Fisica_Inventario/toma-fisica-inventario.service';
import { UsuarioService } from 'src/app/Servicios/Usuarios/usuario.service';
import { Movimientos_RollosComponent } from '../Movimientos_Rollos/Movimientos_Rollos.component';
import { CreacionExcelService } from 'src/app/Servicios/CreacionExcel/CreacionExcel.service';

@Component({
  selector: 'app-movimientos-toma-fisica',
  templateUrl: './movimientos-toma-fisica.component.html',
  styleUrls: ['./movimientos-toma-fisica.component.css']
})
export class MovimientosTomaFisicaComponent implements OnInit {
  form !: FormGroup;
  ValidarRol: number = 0;
  movements: any = [];
  users: any = [];
  storage_Id: number;
  storage_Name: string;
  validateRole: number;
  items: any = [];
  load: boolean = false;
  @ViewChild('table') table: Table | undefined;
  clients: any = [];
  @ViewChild(Movimientos_RollosComponent) cmpMovRolls: Movimientos_RollosComponent;

  constructor(private AppComponent: AppComponent,
    private svPhysicalCount: TomaFisicaInventarioService,
    private msj: MensajesAplicacionService,
    private fmBuild: FormBuilder,
    private svUsers: UsuarioService,
    private svProducts: ProductoService,
    private svZeus: InventarioZeusService,
    private svExcel: CreacionExcelService,
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.readStorage();
    this.loadDate();
    this.getUsers();
  }

  //Leer storage del navegador.
  readStorage() {
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Name = this.AppComponent.storage_Nombre;
    this.validateRole = this.AppComponent.storage_Rol;
  }

  //*FORMULARIO
  //Función para cargar las fechas automaticamente al iniciar el módulo
  loadDate = () => this.form.patchValue({ 'date1': new Date(moment().subtract(30, 'd').format('YYYY-MM-DD')), 'date2': new Date(), });

  //Función que inicializa el formulario
  initForm() {
    this.form = this.fmBuild.group({
      date1: [null],
      date2: [null],
      ot: [null],
      item: [null],
      reference: [null],
      idClient: [null],
      client: [null],
      location: [null],
      user: [null],
    });
  }

  //Función que construye la url con los parámetros de búsqueda
  url = () => {
    let url = `?`;
    if (this.form.value.ot != null) url += `&ot=${this.form.value.ot}`;
    if (this.form.value.item != null) url += `&item=${this.form.value.item}`;
    if (this.form.value.client != null) url += `&client=${this.form.value.client}`;
    if (this.form.value.user != null) url += `&user=${this.form.value.user}`;
    if (this.form.value.location != null) url += `&location=${this.form.value.location}`;
    return url;
  }

  //*CONSULTA
  //Función que obtiene los movimientos de la toma fisica
  getMovements() {
    this.load = true;
    let date1 = moment(this.form.value.date1).format('YYYY-MM-DD');
    let date2 = moment(this.form.value.date2).format('YYYY-MM-DD');
    this.svPhysicalCount.getMovPhysicalCount(date1, date2, this.url()).subscribe(res => {
      this.movements = res;
      this.load = false;
    }, err => {
      this.msj.mensajeError(`Error al obtener los movimientos de la toma fisica ${err.status}`);
      this.load = false;
    });
  }

  //*USUARIOS
  getUsers = () => this.svUsers.srvObtenerListaUsuario().subscribe(d => { this.users = d.filter(x => [100, 110, 9520, 117, 123456789, 115, 3142, 7676, 5673].includes(x.usua_Id)); });

  //*LIMPIEZA
  clearFields() {
    this.movements = [];
    this.items = [];
    this.clients = [];
    this.form.reset();
    this.load = false;
    this.loadDate();
  }


  //*PRODUCTOS
  //Función que busca los productos por medio del nombre
  searchProduct() {
    let nombre: string = this.form.value.reference;
    this.svProducts.obtenerItemsLike(nombre).subscribe(resp => this.items = resp);
  }

  //Función que selecciona un producto del listado
  selectedProduct() {
    let item: any = this.form.value.reference;
    this.form.patchValue({
      'item': item,
      'reference': this.items.find(x => x.prod_Id == item).prod_Nombre
    });
  }

  //CLIENTES
  //Función que busca clientes por medio del nombre
  searchClientsByName() {
    let name = this.form.value.client;
    this.svZeus.getClientByName(name).subscribe(data => this.clients = data);
  }

  //Función que selecciona un cliente del listado
  selectClient() {
    let client = this.clients.find(x => x.idcliente == this.form.value.client);
    this.form.patchValue({ 'idClient': client.idcliente, 'client': client.razoncial, });
  }

  //*FILTROS
  applyFilter = ($event, campo: any) => this.table!.filter(($event.target as HTMLInputElement).value, campo, 'contains');

  //Función que exportará un formato excel con los datos de los clientes
  exportExcel() {
    if (this.movements.length > 0) {
      setTimeout(() => { this.loadSheetAndStyles(this.movements); }, 500);
    } else this.msj.mensajeAdvertencia(`Advertencia`, `No hay datos para exportar.`);
  }

  //Función que cargará la hoja y los estilos. 
  loadSheetAndStyles(data: any) {
    let title: any = `Movimientos toma física`;
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
    let rowHeader: any = ['A5', 'B5', 'C5', 'D5', 'E5', 'F5', 'G5', 'H5', 'I5', 'J5', 'K5', 'L5', 'M5', 'N5'];
    //ws.addRow([]);
    ws.addRow(this.loadFieldsHeader());

    rowHeader.forEach(x => ws.getCell(x).fill = fill);
    rowHeader.forEach(x => ws.getCell(x).alignment = alignment);
    rowHeader.forEach(x => ws.getCell(x).border = border);
    rowHeader.forEach(x => ws.getCell(x).font = font);
    ws.mergeCells('A1:N3');

    this.loadSizeHeader(ws);
  }

  //Función para cargar el tamaño y el alto de las columnas del header.
  loadSizeHeader(ws: any) {
    [2,3,5,6,7,8,11,13,14].forEach(x => ws.getColumn(x).width = 12);
    [4].forEach(x => ws.getColumn(x).width = 50);
    [1].forEach(x => ws.getColumn(x).width = 8);
    [9,10].forEach(x => ws.getColumn(x).width = 20);
    [12].forEach(x => ws.getColumn(x).width = 30);
  }

  //Función para cargar los nombres de las columnas del header
  loadFieldsHeader() {
    let headerRow = [
      'N°',
      'OT',
      'Item',
      'Referencia',
      'Etiqueta',
      'Cant.',
      'Und',
      'Proceso',
      'Ubicación',
      'Estado',
      'Zeus',
      'Usuario',
      'Fecha',
      'Hora',
    ];
    return headerRow;
  }

  //Cargar información con los estilos al formato excel. 
  loadInfoExcel(ws: any, data: any, border: any, alignment: any) {
    let contador: any = 6;
    let row: any = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'];

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
        x.ot,
        x.item,
        x.reference,
        x.label,
        x.quantity,
        x.unit,
        x.process,
        x.location,
        x.state,
        x.zeus,
        x.user,
        x.date.replace('T00:00:00', ''),
        x.hour,
      ]);
    });
    return info;
  }
}
