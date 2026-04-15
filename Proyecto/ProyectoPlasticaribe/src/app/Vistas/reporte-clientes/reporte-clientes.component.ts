import { HttpErrorResponse } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import moment from 'moment';
import { Table } from 'primeng/table';
import { AppComponent } from 'src/app/app.component';
import { CreacionExcelService } from 'src/app/Servicios/CreacionExcel/CreacionExcel.service';
import { InventarioZeusService } from 'src/app/Servicios/InventarioZeus/inventario-zeus.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { UsuarioService } from 'src/app/Servicios/Usuarios/usuario.service';

@Component({
  selector: 'app-reporte-clientes',
  templateUrl: './reporte-clientes.component.html',
  styleUrls: ['./reporte-clientes.component.css']
})
export class ReporteClientesComponent {
  load: boolean = false; //Variable para mostrar el spinner de carga mientras se realiza la consulta de los clientes.
  storage_Id: number | undefined; //Variable para almacenar el id del usuario que se encuentra en el storage.
  storage_Name: string | undefined; //Variable para almacenar el nombre del usuario que se encuentra en el storage.
  validateRole: number | undefined; //  Variable para almacenar el rol del usuario que se encuentra en el storage y así validar la información que se le mostrará al usuario dependiendo de su rol.
  form: FormGroup; //Variable para almacenar el formulario reactivo que se utiliza para realizar las consultas de los clientes.
  selectedMode: boolean = false; //Variable para almacenar el estado del tema seleccionado por el usuario y así mostrar el tema oscuro o claro en el formato excel dependiendo de su selección.
  clients: Array<any> = []; //Variable para almacenar la información de los clientes que se muestra en la tabla después de realizar la consulta por nombre del cliente.
  dataClients : any = []; //Variable para almacenar la información de los clientes que se muestra en la tabla después de realizar la consulta por el rango de fechas y el cliente seleccionado.
  @ViewChild('tableClients') tableClients : Table | undefined; //Variable para almacenar la referencia de la tabla de clientes y así poder aplicar los filtros a la tabla después de realizar la consulta por nombre del cliente.
  sales : any = []; //Variable para almacenar la información de los vendedores que se muestra en el formulario para filtrar por vendedor.

  constructor(private appComponent: AppComponent,
    private zeusInvService: InventarioZeusService,
    private frmBuilder: FormBuilder,
    private msg: MensajesAplicacionService,
    private svExcel : CreacionExcelService,
    private svUsers : UsuarioService,

  ) {
    this.selectedMode = this.appComponent.temaSeleccionado;
    this.initForm();
  }

  //Función que se ejecuta al iniciar el componente y que llama a la función para leer el storage y mostrar la información dependiendo del rol del usuario.
  ngOnInit(): void {
    this.readStorage();
  }

  //Función para inicializar el formulario reactivo de la consulta de clientes.
  initForm() {
    this.form = this.frmBuilder.group({
      idClient: [null],
      client: [null],
      start: [null],
      end: [null],
      sales : [null],
    });
  }

  //Función para leer la información del usuario que se encuentra en el storage y así mostrar la información dependiendo del rol del usuario.
  readStorage(){
    this.storage_Id = this.appComponent.storage_Id;
    this.storage_Name = this.appComponent.storage_Nombre;
    this.validateRole = this.appComponent.ValidarRol;
    this.getSales();
  }

  //Función para limpiar los campos del formulario y las variables.
  clearFields() {
    this.form.reset();
    this.load = false;
    this.clients = [];
  }

  //Función para mostrar el mensaje de error cuando no se pueda consultar la información de los clientes.
  errorMessage(message: string, error: HttpErrorResponse) {
    this.msg.mensajeError(message, `Error: ${error.error.title} | Status: ${error.status}`);
    this.load = false;
  }

  // Realiza la función getSales() que está en el modulo de movimientos de orden de facturación
  getSales(){
    let asesor: any = this.validateRole == 2 ? this.appComponent.storage_Id : null;
    this.svUsers.GetVendedores().subscribe(data => {
      this.sales = data;
      this.sales = asesor ? this.sales.filter(x => x.usua_Id == asesor) : this.sales
    })
  }

  //Función para aplicar el filtro a la tabla de clientes después de realizar la consulta por nombre del cliente.
  aplyFilter = ($event, campo: string, table: Table) => table!.filter(($event.target as HTMLInputElement).value, campo, 'contains');

  //Función para buscar un cliente por su id o por su nombre.
  searchClients() {
    let idClient = this.form.value.idClient;
    this.zeusInvService.getClientByIdThird(idClient).subscribe(data => {
      data.forEach(cli => { this.form.patchValue({ 'idClient': cli.idcliente, 'client': cli.razoncial, }); });
    }, error => this.errorMessage(`¡No se encontró información del cliente consultado!`, error));
  }

  //Función para buscar un cliente por su nombre.
  searchClientsByName() {
    let name = this.form.value.client;
    this.zeusInvService.getClientByName(name).subscribe(data => this.clients = data);
  }

  //Función para seleccionar un cliente de la tabla después de realizar la consulta por nombre del cliente.
  selectClient() {
    let client = this.clients.find(x => x.idcliente == this.form.value.client);
    this.form.patchValue({ 'idClient': client.idcliente, 'client': client.razoncial, });
  }

  //Función para consultar los clientes que han facturado en un rango de fechas determinado.
  findClients(){
    this.dataClients = [];
    this.load = true;
    let date1 : any = moment(this.form.value.start).format('YYYY-MM-DD');
    let date2 : any = moment(this.form.value.end).format('YYYY-MM-DD');
    let client : any = this.form.value.idClient;
    let sale : any = this.form.value.sales;
    let sales = this.validateRole == 2
      ? `${String(this.storage_Id).padStart(3, '0')}`
      : `${String(sale).padStart(3, '0')}`;

    let url : string = ``;

    if(client != null) url.length > 0 ? url += `&client=${client}` : url += `?client=${client}`;  
    if(sales != null) url.length > 0 ? url += `&sales=${sales}` : url += `?sales=${sales}`;
    
    if(date1 == 'Fecha inválida') date1 = moment().add(1, 'd').format('YYYY-MM-DD');
    if(date2 == 'Fecha inválida') date2 = moment().add(1, 'd').format('YYYY-MM-DD');

    this.zeusInvService.getClientsForLastFact(date1, date2, url).subscribe(data => {
      this.dataClients = data;
      this.load = false;
    }, error => {
      this.msg.mensajeError(`Error`, `Error consultando los clientes en el rango de fechas seleccionado`);
      this.load = false;
    }); 
  }

  //Función que exportará un formato excel con los datos de los clientes
  exportExcel(){
    if(this.dataClients.length > 0) {
      setTimeout(() => { this.loadSheetAndStyles(this.dataClients); }, 500);
    } else this.msg.mensajeAdvertencia(`Advertencia`, `No hay datos para exportar.`);
  }

  //Función que cargará la hoja y los estilos. 
  loadSheetAndStyles(data : any){  
    let title : any = `Reporte de Clientes`;  
    title += ` ${moment().format('DD-MM-YYYY')}`
    let fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'eeeeee' } };
    let border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }, };
    let font = { name: 'Calibri', family: 4, size: 11, bold: true };
    let alignment = { vertical: 'middle', horizontal: 'center', wrapText: true};
    let workbook = this.svExcel.formatoExcel(title, true);

    this.addNewSheet(workbook, title, fill, border, font, alignment, data);
    this.svExcel.creacionExcel(title, workbook);
  }

  //Función para agregar una nueva hoja de calculo.
  addNewSheet(wb : any, title : any, fill : any, border : any, font : any, alignment : any, data : any){
    let fontTitle = { name: 'Calibri', family: 4, size: 15, bold: true };
    let worksheet : any = wb.worksheets[0];
    this.loadStyleTitle(worksheet, title, fontTitle, alignment);
    this.loadHeader(worksheet, fill, border, font, alignment);
    this.loadInfoExcel(worksheet, this.dataExcel(data), border,  alignment);
  }

  //Cargar estilos del titulo de la hoja.
  loadStyleTitle(ws: any, title : any, fontTitle : any, alignment : any){
    ws.getCell('A1').alignment = alignment;
    ws.getCell('A1').font = fontTitle;
    ws.getCell('A1').value = title;
  }

  //Función para cargar los titulos de el header y los estilos.
  loadHeader(ws : any, fill : any, border : any, font : any, alignment : any){
    let rowHeader : any = ['A5','B5','C5','D5','E5','F5','G5','H5','I5','J5']; 
    //ws.addRow([]);
    ws.addRow(this.loadFieldsHeader());
    
    rowHeader.forEach(x => ws.getCell(x).fill = fill);
    rowHeader.forEach(x => ws.getCell(x).alignment = alignment);
    rowHeader.forEach(x => ws.getCell(x).border = border);
    rowHeader.forEach(x => ws.getCell(x).font = font);
    ws.mergeCells('A1:J3');

    this.loadSizeHeader(ws);
  }

  //Función para cargar el tamaño y el alto de las columnas del header.
  loadSizeHeader(ws : any){
    [3,5,7].forEach(x => ws.getColumn(x).width = 50);
    [4,9].forEach(x => ws.getColumn(x).width = 40);
    [1].forEach(x => ws.getColumn(x).width = 5);
    [2,6,10,].forEach(x => ws.getColumn(x).width = 15);
    [8].forEach(x => ws.getColumn(x).width = 10);
  }

 //Función para cargar los nombres de las columnas del header
  loadFieldsHeader(){
    let headerRow = [
      'N°',
      'NIT/CC',
      'Razón Social',
      'Ciudad', 
      'Dirección',
      'Teléfóno', 
      'Correo',
      'Id Asesor',
      'Asesor', 
      'Ult. Facturación',
    ];
    return headerRow;
  }

  //Cargar información con los estilos al formato excel. 
  loadInfoExcel(ws : any, data : any, border : any, alignment : any){
    let contador : any = 6;
    let row : any = ['A','B','C','D','E','F','G','H','I','J']; 
    
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
  dataExcel(data : any){
    let info : any = [];
    let count : number = 0;
    data.forEach(x => {
      info.push([
        count += 1,
        x.id_Client,
        x.client,
        x.city,
        x.address,
        x.phone,
        x.email,
        x.idSales,
        x.sales,
        x.date == '0001-01-01T00:00:00' ? '' : x.date.replace('T00:00:00', ''),
      ]);
    });
    return info;
  }

}
