import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Table } from 'primeng/table';
import { AppComponent } from '../../app.component';
import { InventarioZeusService } from '../../Servicios/InventarioZeus/inventario-zeus.service';
import { UsuarioService } from 'src/app/Servicios/Usuarios/usuario.service';
import moment from 'moment';
import { ClientesService } from 'src/app/Servicios/Clientes/clientes.service';
import { forkJoin, map, switchMap, tap } from 'rxjs';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { CreacionExcelService } from 'src/app/Servicios/CreacionExcel/CreacionExcel.service';

@Component({
  selector: 'app-informacion-ventas',
  templateUrl: './informacion-ventas.component.html',
  styleUrls: ['./informacion-ventas.component.css']
})
export class InformacionVentasComponent implements OnInit {
  @ViewChild('dt1') dt1: Table | undefined;
  @ViewChild('dt2') dt2: Table | undefined;
  sales: any = [];
  clients: any = [];
  form !: FormGroup;
  load: boolean = false; // Variable para indicar la espera en la carga de un proceso. 
  modoSeleccionado: boolean; //Variable que servirá para cambiar estilos en el modo oscuro/claro
  storage_Id: number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre: any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol: any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol: number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  years: any[] = [2019];
  monthNames: any[] = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  dataAsesors: any = [];
  dataClients: any = [];
  dataSales: any = [];
  dataSalesClients: any = [];
  asesors: any = [];
  salesInformation: any = [];
  dataKg: any = [];
  dataKgClients: any = [];
  tab: number = 0;

  constructor(
    private frmBuilder: FormBuilder,
    private appComponent: AppComponent,
    private svInvZeus: InventarioZeusService,
    private svAsesors: UsuarioService,
    private svClients: ClientesService,
    private svBagpro: BagproService,
    private svMsj: MensajesAplicacionService,
    private svExcel: CreacionExcelService,
  ) {
    this.loadForm();
  }


  ngOnInit(): void {
    this.lecturaStorage();
    this.loadYears();
    //this.getClientsInformation();
    this.getSalesInformationAndKg();
    /*setTimeout(() => {
      this.convertDataKg();
    }, 10000);*/

    //this.getAsesors();
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage() {
    this.storage_Id = this.appComponent.storage_Id;
    this.storage_Nombre = this.appComponent.storage_Nombre;
    this.ValidarRol = this.appComponent.storage_Rol;
  }

  loadForm() {
    this.form = this.frmBuilder.group({
      client: [null,],
      clientId: [null,],
      asesor: [null,],
      asesorId: [null,],
      year: [null,],
      month: [null, Validators.required],
    });
  }

  //* FUNCIONES DE CONVERSION
  // Funcion que colocará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number) => number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');


  //* LIMPIAR DATOS
  //Funcion que va a limpiar todo
  clearAll() {
    this.form.reset();
    this.sales = [];
    this.clients = [];
    this.load = false;
  }

  //*FECHAS
  //Funcion que cargará lo años desde 2019
  loadYears() {
    for (let i = 0; i < this.years.length; i++) {
      let num_Mayor: number = Math.max(...this.years);
      if (num_Mayor == moment().year()) break;
      this.years.push(num_Mayor + 1);
    }
  }

  //*ASESORES Y CLIENTES
  //Funcion que cargará lo asesores
  getAsesors() {
    this.load = true;
    let count: number = 0;
    this.svAsesors.GetVendedores().subscribe(data => {
      data.forEach(x => {
        count++;
        if (x.usua_Id.toString().length == 1) this.asesors.push({ asesor: x.usua_Nombre, code: `00${x.usua_Id}` });
        else if (x.usua_Id.toString().length == 2) this.asesors.push({ asesor: x.usua_Nombre, code: `0${x.usua_Id}` });
        else this.asesors.push({ asesor: x.usua_Nombre, code: `${x.usua_Id}` });
        if (count == data.length) this.load = false;
      });
    }, error => console.log(error));
  }

  // Función pa 
  loadAsesor() {
    let name = this.form.value.sales;
    let sale = this.sales.find(x => x.usua_Nombre == name);
    let codeSales: string = `${sale.usua_Id}`;
    if (codeSales.length == 1) codeSales = `00${codeSales}`;
    else if (codeSales.length == 2) codeSales = `0${codeSales}`;
    this.form.patchValue({
      'sales': sale.usua_Nombre,
      'salesId': sale.usua_Id,
    });
  }

  // Funcion que va a consultar los clientes
  getClients() {
    this.svClients.srvObtenerLista().subscribe(data => this.clients = data);
  }

  // Funcion que va a colocar a llenar los campos correspondientes del cliente
  loadClients() {
    let name = this.form.value.client;
    let cliente = this.clients.find(x => x.idcliente == name);
    this.form.patchValue({
      'client': cliente.usua_Id,
      'clientId': cliente.usua_Nombre,
    });
  }

  //*CONSULTAR INFORMACION
  getSalesInformation() {
    this.dataAsesors = [];
    this.load = true;
    [2025].forEach(x => {
      this.svInvZeus.getBillingAnnual(x).subscribe(data => {
        this.dataSales = data;
        data.forEach(y => {
          if (this.dataAsesors.filter(z => z.asesorId == y.asesorId && z.year == y.year).length == 0) {
            this.dataAsesors.push(y);
          }
        });
        this.load = false;
      }, error => {
        this.load = false;
        console.log(error);
      });
    })
  }

  convertDataKg() {
    this.dataSales.forEach(x => {
      this.svBagpro.CalcularKilosItem(x.items).subscribe(data => {
        data.forEach(y => {
          if (y != null) {
            this.dataKg.push({
              'year': x.year,
              'month': x.month,
              'asesorId': x.asesorId,
              'kg': y.weight,
            });
          }
        });
      });
    });
  }

  getSalesInformationAndKg() {
    this.dataAsesors = [];
    this.dataSales = [];
    this.load = true;

    // 1. Llamar a la API (forkJoin si fueran varios años)
    forkJoin([this.svInvZeus.getBillingAnnual(2025)])
      .pipe(
        tap((responses: any[]) => {
          const data = responses[0];
          this.dataSales = data;

          // Rellenar dataAsesors sin duplicados
          data.forEach(y => {
            if (!this.dataAsesors.some(z => z.asesorId === y.asesorId && z.year === y.year)) {
              this.dataAsesors.push(y);
            }
          });
        }),

        // 2. Cuando termine lo anterior ▶ Ejecutar convertDataKg
        switchMap(() => this.convertDataKgRx())
      )
      .subscribe({
        next: () => {
          this.load = false;
        },
        error: err => {
          this.load = false;
          console.log(err);
        }
      });
  }

  convertDataKgRx() {
    const requests = this.dataSales.map(x =>
      this.svBagpro.CalcularKilosItem(x.items).pipe(
        tap(response => {
          response.forEach(y => {
            if (y != null) {
              this.dataKg.push({
                year: x.year,
                month: x.month,
                asesorId: x.asesorId,
                kg: y.weight,
              });
            }
          });
        })
      )
    );

    // Esperar todos los CalcularKilosItem y devolver cuando terminen
    return forkJoin(requests);
  }

  //Función que colocará la información como lo solicita la tabla 
  getClientsInformation() {
    this.dataClients = [];
    this.dataSalesClients = [];
    this.load = true;
    this.svInvZeus.getBillingClientsAnnual(2025).subscribe(data => {
      this.dataSalesClients = data;
      data.forEach(x => {
        if (this.dataClients.filter(y => y.clienteId == x.clienteId && y.year == x.year).length == 0) {
          this.dataClients.push(x);
        }
      });
      this.load = false;
    }, error => {
      console.log(error);
      this.load = false;
    });
  }

  cambioTab($event) {
    this.tab = $event.index;
    if ($event.index == 0) this.getSalesInformation();
    else if ($event.index == 1) this.getClientsInformation();
  }

  //*CALCULOS ASESOR
  //* Nuevo
  getFactAsesor(year: number, month: string, code: string) {
    let total = 0;
    for (const item of this.dataSales) {
      if (item.year === year && item.month === month && item.asesorId === code) {
        total += item.value;
      }
    }
    return total;
  }

  //* Nuevo
  getKgAsesor(year: number, month: string, code: string) {
    let total = 0;
    for (const item of this.dataKg) {
      if (item.year === year && item.month === month && item.asesorId === code) {
        total += item.kg;
      }
    }
    return total;
  }

  //*Nuevo
  getTotalFactAsesor = (year: string, code: string) => this.dataSales.filter(x => x.year == year && x.asesorId == code).reduce((a, b) => a + b.value, 0);

  //*Nuevo
  getTotalKgAsesor = (year: string, code: string) => this.dataKg.filter(x => x.year == year && x.asesorId == code).reduce((a, b) => a + b.kg, 0);

  //*Nuevo
  getFactMonthAsesor = (year: string, month: string) => this.dataSales.filter(x => x.year == year && x.month == month).reduce((a, b) => a + b.value, 0);

  //*Nuevo
  getKgMonthAsesor = (year: string, month: string) => this.dataKg.filter(x => x.year == year && x.month == month).reduce((a, b) => a + b.kg, 0);

  //*Nuevo
  totalFactYear(year) {
    let total: number = 0;
    this.dataSales.filter(x => x.year == year).forEach(x => {
      total += x.value;
    });
    return total;
  }

  //*Nuevo
  totalKgYear(year) {
    let total: number = 0;
    this.dataKg.filter(x => x.year == year).forEach(x => {
      total += x.kg;
    });
    return total;
  }

  //*** CALCULOS CLIENTE */
  getFactClient(year: string, month: string, code: string, client: string) {
    let total = 0;
    for (const item of this.dataSalesClients) {
      if (item.year === year && item.month === month && item.asesorId === code && item.clienteId === client) {
        total += item.value;
      }
    }
    return total;
  }

  //*
  getSubtotalFactClient = (year: string, code : string, client: string) => this.dataSalesClients.filter(x => x.year == year && x.asesorId == code && x.clienteId == client).reduce((a, b) => a + b.value, 0);

  //
  getTotalFactMonth = (year: string, month : string) => this.dataSalesClients.filter(x => x.year == year && x.month == month).reduce((a, b) => a + b.value, 0);

  //*** FILTROS */ 
  aplicarfiltro2 = ($event, campo: any, valorCampo: string) => this.dt2!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);

  //* EXPORTAR DOCUMENTOS
  exportExcel() {
    if (this.tab == 0) this.exportExcel1();
    else if (this.tab == 1) this.exportExcel2();
  }
  
  //* EXCEL TAB 1
  exportExcel1() {
    if (this.dataAsesors.length > 0) {
      setTimeout(() => { this.loadSheetAndStyles(this.dataAsesors); }, 500);
    } else this.svMsj.mensajeAdvertencia(`Advertencia`, `No hay datos para exportar.`);
  }

  //Función que cargará la hoja y los estilos. 
  loadSheetAndStyles(data: any) {
    let title: any = `Información consolidada de asesores`;
    let fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'eeeeee' } };
    let border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }, };
    let font = { name: 'Calibri', family: 4, size: 10, bold: true };
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
    let rowHeader: any = ['A5', 'B5', 'C5', 'D5', 'E5', 'F5', 'G5', 'H5', 'I5', 'J5', 'K5', 'L5', 'M5', 'N5',
      'O5', 'P5', 'Q5', 'R5', 'S5', 'T5', 'U5', 'V5', 'W5', 'X5', 'Y5', 'Z5', 'AA5', 'AB5', 'AC5', 'AD5'];
    //ws.addRow([]);
    ws.addRow(this.loadFieldsHeader());

    rowHeader.forEach(x => ws.getCell(x).fill = fill);
    rowHeader.forEach(x => ws.getCell(x).alignment = alignment);
    rowHeader.forEach(x => ws.getCell(x).border = border);
    rowHeader.forEach(x => ws.getCell(x).font = font);
    ws.mergeCells('A1:AD3');

    this.loadSizeHeader(ws);
  }

  //Función para cargar el tamaño y el alto de las columnas del header.
  loadSizeHeader(ws: any) {
    [5].forEach(x => ws.getColumn(x).width = 15);
    [6].forEach(x => ws.getColumn(x).width = 20);
    [1].forEach(x => ws.getColumn(x).width = 5);
    [2,3].forEach(x => ws.getColumn(x).width = 10);
    [4,].forEach(x => ws.getColumn(x).width = 40);
    [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30].forEach(x => ws.getColumn(x).width = 15);
  }

  //Función para cargar los nombres de las columnas del header
  loadFieldsHeader() {
    let headerRow = [
      'N°',
      'Año',
      'Codigo',
      'Asesor',
      'Fact. Enero',
      'Kg Enero',
      'Fact. Febrero',
      'Kg Febrero',
      'Fact. Marzo',
      'Kg Marzo',
      'Fact. Abril',
      'Kg Abril',
      'Fact. Mayo',
      'Kg Mayo',
      'Fact. Junio',
      'Kg Junio',
      'Fact. Julio',
      'Kg Julio',
      'Fact. Agosto',
      'Kg Agosto',
      'Fact. Septiembre',
      'Kg Septiembre',
      'Fact. Octubre',
      'Kg Octubre',
      'Fact. Noviembre',
      'Kg Noviembre',
      'Fact. Diciembre',
      'Kg Diciembre',
      'Subtotal Fact.',
      'Subtotal Kg',
    ];
    return headerRow;
  }

  //Cargar información con los estilos al formato excel. 
  loadInfoExcel(ws: any, data: any, border: any, alignment: any) {
    let contador: any = 6;
    let formatNumber: Array<number> = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30];
    let row: any = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD'];

    formatNumber.forEach(x => ws.getColumn(x).numFmt = '""#,##0.00;[Red]\-""#,##0.00');
    data.forEach(x => {
      ws.addRow(x);
      row.forEach(r => {
        ws.getCell(`${r}${contador}`).border = border;
        ws.getCell(`${r}${contador}`).font = { name: 'Calibri', family: 4, size: 10 };
        ws.getCell(`${r}${contador}`).alignment = alignment;
      });
      contador++
    });
    row.forEach(r => ws.getCell(`${r}${contador - 1}`).font = { name: 'Calibri', family: 4, size: 10, bold : true, }); 
  }

  //.Función que contendrá la info al documento excel. 
  dataExcel(data: any) {
    let info: any = [];
    let count: number = 0;
    data.forEach(x => {
      info.push([
        count += 1,
        x.year,
        x.asesorId,
        x.asesor,
        this.getFactAsesor(x.year, '01', x.asesorId),
        this.getKgAsesor(x.year, '01', x.asesorId),
        this.getFactAsesor(x.year, '02', x.asesorId),
        this.getKgAsesor(x.year, '02', x.asesorId),
        this.getFactAsesor(x.year, '03', x.asesorId),
        this.getKgAsesor(x.year, '03', x.asesorId),
        this.getFactAsesor(x.year, '04', x.asesorId),
        this.getKgAsesor(x.year, '04', x.asesorId),
        this.getFactAsesor(x.year, '05', x.asesorId),
        this.getKgAsesor(x.year, '05', x.asesorId),
        this.getFactAsesor(x.year, '06', x.asesorId),
        this.getKgAsesor(x.year, '06', x.asesorId),
        this.getFactAsesor(x.year, '07', x.asesorId),
        this.getKgAsesor(x.year, '07', x.asesorId),
        this.getFactAsesor(x.year, '08', x.asesorId),
        this.getKgAsesor(x.year, '08', x.asesorId),
        this.getFactAsesor(x.year, '09', x.asesorId),
        this.getKgAsesor(x.year, '09', x.asesorId),
        this.getFactAsesor(x.year, '10', x.asesorId),
        this.getKgAsesor(x.year, '10', x.asesorId),
        this.getFactAsesor(x.year, '11', x.asesorId),
        this.getKgAsesor(x.year, '11', x.asesorId),
        this.getFactAsesor(x.year, '12', x.asesorId),
        this.getKgAsesor(x.year, '12', x.asesorId),
        this.getTotalFactAsesor(x.year, x.asesorId),
        this.getTotalKgAsesor(x.year, x.asesorId)
      ]);
    });
    this.addTotal(info);
    return info;
  }

  //Agregar fila de totales al formato excel.
  addTotal(info: any) {
    info.push([
      '',
      '',
      '',
      'TOTALES',
      this.getFactMonthAsesor('2025', '01'),
      this.getKgMonthAsesor('2025', '01'),
      this.getFactMonthAsesor('2025', '02'),
      this.getKgMonthAsesor('2025', '02'),
      this.getFactMonthAsesor('2025', '03'),
      this.getKgMonthAsesor('2025', '03'),
      this.getFactMonthAsesor('2025', '04'),
      this.getKgMonthAsesor('2025', '04'),
      this.getFactMonthAsesor('2025', '05'),
      this.getKgMonthAsesor('2025', '05'),
      this.getFactMonthAsesor('2025', '06'),
      this.getKgMonthAsesor('2025', '06'),
      this.getFactMonthAsesor('2025', '07'),
      this.getKgMonthAsesor('2025', '07'),
      this.getFactMonthAsesor('2025', '08'),
      this.getKgMonthAsesor('2025', '08'),
      this.getFactMonthAsesor('2025', '09'),
      this.getKgMonthAsesor('2025', '09'),
      this.getFactMonthAsesor('2025', '10'),
      this.getKgMonthAsesor('2025', '10'),
      this.getFactMonthAsesor('2025', '11'),
      this.getKgMonthAsesor('2025', '11'),
      this.getFactMonthAsesor('2025', '12'),
      this.getKgMonthAsesor('2025', '12'),
      this.totalFactYear('2025'),
      this.totalKgYear('2025')
    ]);
  }

  //* EXCEL TAB 2
  exportExcel2() {
    if (this.dataAsesors.length > 0) {
      setTimeout(() => { this.loadSheetAndStyles2(this.dataClients); }, 500);
    } else this.svMsj.mensajeAdvertencia(`Advertencia`, `No hay datos para exportar.`);
  }

  //Función que cargará la hoja y los estilos. 
  loadSheetAndStyles2(data: any) {
    let title: any = `Información ventas mes-cliente`;
    let fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'eeeeee' } };
    let border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }, };
    let font = { name: 'Calibri', family: 4, size: 10, bold: true };
    let alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    let workbook = this.svExcel.formatoExcel(title, true);
    this.addNewSheet2(workbook, title, fill, border, font, alignment, data);
    this.svExcel.creacionExcel(title, workbook);
  }

  //Función para agregar una nueva hoja de calculo.
  addNewSheet2(wb: any, title: any, fill: any, border: any, font: any, alignment: any, data: any) {
    let fontTitle = { name: 'Calibri', family: 4, size: 15, bold: true };
    let worksheet: any = wb.worksheets[0];
    this.loadStyleTitle2(worksheet, title, fontTitle, alignment);
    this.loadHeader2(worksheet, fill, border, font, alignment);
    this.loadInfoExcel2(worksheet, this.dataExcel2(data), border, alignment);
  }

  //Cargar estilos del titulo de la hoja.
  loadStyleTitle2(ws: any, title: any, fontTitle: any, alignment: any) {
    ws.getCell('A1').alignment = alignment;
    ws.getCell('A1').font = fontTitle;
    ws.getCell('A1').value = title;
  }

  //Función para cargar los titulos de el header y los estilos.
  loadHeader2(ws: any, fill: any, border: any, font: any, alignment: any) {
    let rowHeader: any = ['A5', 'B5', 'C5', 'D5', 'E5', 'F5', 'G5', 'H5', 'I5', 'J5', 'K5', 'L5', 'M5', 'N5', 'O5', 'P5', 'Q5', 'R5'];
    //ws.addRow([]);
    ws.addRow(this.loadFieldsHeader2());

    rowHeader.forEach(x => ws.getCell(x).fill = fill);
    rowHeader.forEach(x => ws.getCell(x).alignment = alignment);
    rowHeader.forEach(x => ws.getCell(x).border = border);
    rowHeader.forEach(x => ws.getCell(x).font = font);
    ws.mergeCells('A1:R3');

    this.loadSizeHeader2(ws);
  }

  //Función para cargar el tamaño y el alto de las columnas del header.
  loadSizeHeader2(ws: any) {
    [5].forEach(x => ws.getColumn(x).width = 40);
    [1].forEach(x => ws.getColumn(x).width = 5);
    [2, 3].forEach(x => ws.getColumn(x).width = 10);
    [4,].forEach(x => ws.getColumn(x).width = 40);
    [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,].forEach(x => ws.getColumn(x).width = 15);
  }

  //Función para cargar los nombres de las columnas del header
  loadFieldsHeader2() {
    let headerRow = [
      'N°',
      'Año',
      'Codigo',
      'Asesor',
      'Cliente',
      'Fact. Enero',
      'Fact. Febrero',
      'Fact. Marzo',
      'Fact. Abril',
      'Fact. Mayo',
      'Fact. Junio',
      'Fact. Julio',
      'Fact. Agosto',
      'Fact. Septiembre',
      'Fact. Octubre',
      'Fact. Noviembre',
      'Fact. Diciembre',
      'Subtotal Fact.',
    ];
    return headerRow;
  }

  //Cargar información con los estilos al formato excel. 
  loadInfoExcel2(ws: any, data: any, border: any, alignment: any) {
    let contador: any = 6;
    let formatNumber: Array<number> = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
    let row: any = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R'];

    formatNumber.forEach(x => ws.getColumn(x).numFmt = '""#,##0.00;[Red]\-""#,##0.00');
    data.forEach(x => {
      ws.addRow(x);
      row.forEach(r => {
        ws.getCell(`${r}${contador}`).border = border;
        ws.getCell(`${r}${contador}`).font = { name: 'Calibri', family: 4, size: 10 };
        ws.getCell(`${r}${contador}`).alignment = alignment;
      });
      contador++
    });
    row.forEach(r => ws.getCell(`${r}${contador - 1}`).font = { name: 'Calibri', family: 4, size: 10, bold : true, }); 
  }

  //.Función que contendrá la info al documento excel. 
  dataExcel2(data: any) {
    let info: any = [];
    let count: number = 0;
    data.forEach(x => {
      info.push([
        count += 1,
        x.year,
        x.asesorId,
        x.asesor,
        x.cliente,
        this.getFactClient(x.year, '01', x.asesorId, x.clienteId),
        this.getFactClient(x.year, '02', x.asesorId, x.clienteId),
        this.getFactClient(x.year, '03', x.asesorId, x.clienteId),
        this.getFactClient(x.year, '04', x.asesorId, x.clienteId),
        this.getFactClient(x.year, '05', x.asesorId, x.clienteId),
        this.getFactClient(x.year, '06', x.asesorId, x.clienteId),
        this.getFactClient(x.year, '07', x.asesorId, x.clienteId),
        this.getFactClient(x.year, '08', x.asesorId, x.clienteId),
        this.getFactClient(x.year, '09', x.asesorId, x.clienteId),
        this.getFactClient(x.year, '10', x.asesorId, x.clienteId),
        this.getFactClient(x.year, '11', x.asesorId, x.clienteId),
        this.getFactClient(x.year, '12', x.asesorId, x.clienteId),
        this.getSubtotalFactClient(x.year, x.asesorId, x.clienteId),
      ]);
    });
    this.addTotal2(info);
    return info;
  }

  //Agregar fila de totales al formato excel.
  addTotal2(info: any) {
    console.log(info);
    
    info.push([
      '',
      '',
      '',
      '',
      'TOTALES',
      this.getTotalFactMonth('2025', '01'),
      this.getTotalFactMonth('2025', '02'),
      this.getTotalFactMonth('2025', '03'),
      this.getTotalFactMonth('2025', '04'),
      this.getTotalFactMonth('2025', '05'),
      this.getTotalFactMonth('2025', '06'),
      this.getTotalFactMonth('2025', '07'),
      this.getTotalFactMonth('2025', '08'),
      this.getTotalFactMonth('2025', '09'),
      this.getTotalFactMonth('2025', '10'),
      this.getTotalFactMonth('2025', '11'),
      this.getTotalFactMonth('2025', '12'),
      0,
    ]);
  }
}
