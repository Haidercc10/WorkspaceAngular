import { Component, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Table } from 'primeng/table';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { InventarioZeusService } from 'src/app/Servicios/InventarioZeus/inventario-zeus.service';
import { RolesService } from 'src/app/Servicios/Roles/roles.service';
import Swal from 'sweetalert2';
import moment from 'moment';
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';
import pdfMake from 'pdfmake/build/pdfmake';
import { AppComponent } from 'src/app/app.component';
import { Reporte_Procesos_OTComponent } from '../Reporte_Procesos_OT/Reporte_Procesos_OT.component';
import { EstadosProcesos_OTService } from 'src/app/Servicios/EstadosProcesosOT/EstadosProcesos_OT.service';

@Component({
  selector: 'app-ReportePedidos_Zeus',
  templateUrl: './ReportePedidos_Zeus.component.html',
  styleUrls: ['./ReportePedidos_Zeus.component.css']
})
export class ReportePedidos_ZeusComponent implements OnInit {

  @ViewChild('dt') dt: Table | undefined;
  @ViewChild(Reporte_Procesos_OTComponent) modalEstadosProcesos_OT : Reporte_Procesos_OTComponent;

  cargando : boolean = false;
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente

  first = 0;
  rows = 10;
  ArrayDocumento = []; //Varibale que almacenará la información que se mostrará en la tabla de vista
  _columnasSeleccionada : any [] = [];
  columnas : any [] = [];
  formFiltros !: FormGroup;

  public arrayClientes: any =[];
  public arrayItems: any =[];
  public arrayVendedores: any =[];

  public titlePendiente : string = 'Estado que indica que no se ha realizado entrega de ninguno de los items del pedido.';
  public titleParcial : string = 'Estado que indica que se ha realizado entrega de al menos uno de los items del pedido.';
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  public costoCantidadTotal : number = 0;
  public costoCantidadPendiente : number = 0;
  public arrayPedidosIndividuales : any = [];

  modalEstadosOrdenes : boolean = false;
  consecutivoPedido : any = '';


  constructor(@Inject(SESSION_STORAGE) private storage: WebStorageService,
                private rolService : RolesService,
                 private inventarioZeusService : InventarioZeusService,
                  private FormBuild : FormBuilder,
                    private appComponent : AppComponent,
                      private estadosProcesos_OTService : EstadosProcesos_OTService,) {

   this.InicializarFormulario();
  }

  ngOnInit() {
    this.lecturaStorage();
    this.consultarPedidos();
  }

  InicializarFormulario(){
    this.formFiltros = this.FormBuild.group({
      IdVendedor : [null],
      Vendedor: [null],
      IdCliente: [null],
      Cliente: [null],
      IdItem: [null],
      Item: [null],
      Fecha1: [null],
      Fecha2 : [null],
    })
  }

  /**Leer storage para validar su rol y mostrar el usuario. */
  lecturaStorage(){
    this.storage_Id = this.storage.get('Id');
    this.storage_Nombre = this.storage.get('Nombre');
    let rol = this.storage.get('Rol');
    this.rolService.srvObtenerLista().subscribe(datos_roles => {
      for (let index = 0; index < datos_roles.length; index++) {
        if (datos_roles[index].rolUsu_Id == rol) {
          this.ValidarRol = rol;
          this.storage_Rol = datos_roles[index].rolUsu_Nombre;
        }
      }
    });
  }

  //
  consultarPedidos(){
    this.cargando = true;
    this.ArrayDocumento = [];
    this.inventarioZeusService.GetPedidos().subscribe(datos_pedidos => {
      for (let i = 0; i < datos_pedidos.length; i++) {
        //this.columnasNoMostradas();
        this.llenarTabla(datos_pedidos[i]);
        this.ArrayDocumento.sort((a,b) => Number(a.consecutivo) - Number(b.consecutivo));
      }
    });
    setTimeout(() => { this.cargando = false; }, 2000);
  }

  @Input() get columnasSeleccionada(): any[] {
    return this._columnasSeleccionada;
  }

  set columnasSeleccionada(val: any[]) {
    this._columnasSeleccionada = this.columnas.filter(col => val.includes(col));
  }

  // Funcion que permitirá filtrar la información de la tabla
  aplicarfiltro($event, campo : any, valorCampo : string){
    this.dt!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);
  }

  llenarTabla(datos : any){
    if(datos.fecha_Creacion == null) datos.fecha_Creacion = datos.fecha_Creacion
    else datos.fecha_Creacion = datos.fecha_Creacion.replace('T00:00:00', '');

    if(datos.fecha_Entrega == null) datos.fecha_Entrega = datos.fecha_Entrega
    else datos.fecha_Entrega = datos.fecha_Entrega.replace('T00:00:00', '');

    const dataPedidos : any = {
      consecutivo: datos.consecutivo,
      cliente: datos.cliente,
      producto: datos.producto,
      id_Producto: datos.id_Producto,
      cant_Pedida: datos.cant_Pedida,
      cant_Pendiente: datos.cant_Pendiente,
      cant_Facturada: datos.cant_Facturada,
      existencias: datos.existencias,
      presentacion: datos.presentacion,
      estado: datos.estado,
      vendedor: datos.vendedor,
      precioUnidad : this.formatonumeros(datos.precioUnidad.toFixed(2)),
      orden_Compra_CLiente: datos.orden_Compra_CLiente,
      costo_Cant_Pendiente: this.formatonumeros(datos.costo_Cant_Pendiente.toFixed(2)),
      costo_Cant_Total: this.formatonumeros(datos.costo_Cant_Total.toFixed(2)),
      fecha_Creacion: datos.fecha_Creacion,
      fecha_Entrega: datos.fecha_Entrega,
      OT : '',
      Proceso_OT: '',
      CantPesada : '',
      Estado_OT: '',
      CantPedidaKg_OT : '',
      CantPedidaUnd_OT : '',
    }

    this.columnas = [
      { header: 'Precio U.', field: 'precioUnidad', type : 'number' },
      { header: 'OC Cliente', field: 'orden_Compra_CLiente'},
      { header: 'Costo Cant. Pendiente', field: 'costo_Cant_Pendiente', type : 'number'},
      { header: 'Costo Cant. Total', field: 'costo_Cant_Total', type : 'number' },
      { header: 'Fecha Creación', field: 'fecha_Creacion', type : 'date'},
      { header: 'Fecha Entrega', field: 'fecha_Entrega',  type : 'date'},
      // { header: 'Estado', field: 'Estado_OT'},
      // { header: 'Proceso Actual', field: 'Proceso_OT', type : 'number'},
    ];

    this.estadosProcesos_OTService.GetOrdenesTrabajo_Pedido(datos.consecutivo).subscribe(datos_orden => {
      for (let i = 0; i < datos_orden.length; i++) {
        if (parseInt(datos.id_Producto) == datos_orden[i].prod_Id) {
          dataPedidos.OT = datos_orden[i].estProcOT_OrdenTrabajo;
          if (datos_orden[i].estProcOT_ExtrusionKg > 0) {
            dataPedidos.Proceso_OT = `Extrusión ${this.formatonumeros(datos_orden[i].estProcOT_ExtrusionKg.toFixed(2))} Kg`;
            dataPedidos.CantPesada = datos_orden[i].estProcOT_ExtrusionKg.toFixed(2);
          }
          if (datos_orden[i].estProcOT_ImpresionKg > 0) {
            dataPedidos.Proceso_OT = `Impresión ${this.formatonumeros(datos_orden[i].estProcOT_ImpresionKg.toFixed(2))} Kg`;
            dataPedidos.CantPesada = datos_orden[i].estProcOT_ImpresionKg.toFixed(2);
          }
          if (datos_orden[i].estProcOT_RotograbadoKg > 0) {
            dataPedidos.Proceso_OT = `Rotograbado ${this.formatonumeros(datos_orden[i].estProcOT_RotograbadoKg.toFixed(2))} Kg`;
            dataPedidos.CantPesada = datos_orden[i].estProcOT_RotograbadoKg.toFixed(2);
          }
          if (datos_orden[i].estProcOT_LaminadoKg > 0) {
            dataPedidos.Proceso_OT = `Laminado ${this.formatonumeros(datos_orden[i].estProcOT_LaminadoKg.toFixed(2))} Kg`;
            dataPedidos.CantPesada = datos_orden[i].estProcOT_LaminadoKg.toFixed(2);
          }
          if (datos_orden[i].estProcOT_CorteKg > 0) {
            dataPedidos.Proceso_OT = `Corte - ${this.formatonumeros(datos_orden[i].estProcOT_CorteKg.toFixed(2))} Kg`;
            dataPedidos.CantPesada = datos_orden[i].estProcOT_CorteKg.toFixed(2);
          }
          if (datos_orden[i].estProcOT_DobladoKg > 0) {
            dataPedidos.Proceso_OT = `Doblado ${this.formatonumeros(datos_orden[i].estProcOT_DobladoKg.toFixed(2))} Kg`;
            dataPedidos.CantPesada = datos_orden[i].estProcOT_DobladoKg.toFixed(2);
          }
          if (datos_orden[i].estProcOT_EmpaqueKg > 0) {
            dataPedidos.Proceso_OT = `Empaque ${this.formatonumeros(datos_orden[i].estProcOT_EmpaqueKg.toFixed(2))} Kg`;
            dataPedidos.CantPesada = datos_orden[i].estProcOT_EmpaqueKg.toFixed(2);
          }
          if (datos_orden[i].estProcOT_SelladoKg > 0) {
            dataPedidos.Proceso_OT = `Sellado ${this.formatonumeros(datos_orden[i].estProcOT_SelladoUnd.toFixed(2))} Und - ${this.formatonumeros(datos_orden[i].estProcOT_SelladoKg.toFixed(2))} Kg`;
            dataPedidos.CantPesada = datos_orden[i].estProcOT_SelladoUnd.toFixed(2);
          }
          if (datos_orden[i].estProcOT_WiketiadoKg > 0) {
            dataPedidos.Proceso_OT = `Wiketiado ${this.formatonumeros(datos_orden[i].estProcOT_WiketiadoUnd.toFixed(2))} Und - ${this.formatonumeros(datos_orden[i].estProcOT_WiketiadoKg.toFixed(2))} Kg`;
            dataPedidos.CantPesada = datos_orden[i].estProcOT_WiketiadoUnd.toFixed(2);
          }
          dataPedidos.Estado_OT = datos_orden[i].estado_Id;
          dataPedidos.CantPedidaKg_OT = datos_orden[i].estProcOT_CantidadPedida;
          dataPedidos.CantPedidaUnd_OT = datos_orden[i].estProcOT_CantidadPedidaUnd;
        }
      }
    });
    this.ArrayDocumento.push(dataPedidos);
  }

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number) => {
    const exp = /(\d)(?=(\d{3})+(?!\d))/g;
    const rep = '$1,';
    return number.toString().replace(exp,rep);
  }

  /** Función para exportar todos los pedidos a Excel */
  exportarExcel(){
    this.cargando = true;
    if(this.ArrayDocumento.length == 0) this.advertencia('Debe haber al menos un pedido en la tabla.');
    else {
      setTimeout(() => {
        const title = `Reporte de Pedidos Zeus - ${this.today}`;
      const header = ["N° Pedido", "Cliente", "Item", "Cant. Pedida", "Pendiente", "Facturada", "Stock", "Und", "Precio Und", "Estado", "Vendedor", "OC", "Costo Cant. Pendiente", "Costo Cant. Total", "Fecha Creación ", "Fecha Entrega"]
      let datos : any =[];

      for (const item of this.ArrayDocumento) {
        const datos1  : any = [item.consecutivo, item.cliente, item.producto, item.cant_Pedida, item.cant_Pendiente, item.cant_Facturada, item.existencias, item.presentacion, item.precioUnidad, item.estado, item.vendedor, item.orden_Compra_CLiente, item.costo_Cant_Pendiente, item.costo_Cant_Total, item.fecha_Creacion, item.fecha_Entrega];
        datos.push(datos1);
      }
      let workbook = new Workbook();
        let worksheet = workbook.addWorksheet(`Reporte de Pedidos Zeus - ${this.today}`);
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
        worksheet.mergeCells('A1:P2');
        worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };

        datos.forEach(d => {
          let row = worksheet.addRow(d);
          let consecutivo = row.getCell(1);
          let fecha1 = row.getCell(15);
          let fecha2 = row.getCell(16);
          let medida = row.getCell(8);
          let Pedida = row.getCell(4);
          let Pendiente = row.getCell(5);
          let Facturada = row.getCell(6);
          let stock = row.getCell(7);
          let precioUnd  = row.getCell(9);
          let ccPendiente = row.getCell(13);
          let ccTotal = row.getCell(14);

          consecutivo.alignment = { horizontal : 'center' }
          fecha1.alignment = { horizontal : 'center' }
          fecha2.alignment = { horizontal : 'center' }
          medida.alignment = { horizontal : 'center' }
          Pedida.numFmt  = '""#,##0.00;[Red]\-""#,##0.00';
          Pendiente.numFmt  = '""#,##0.00;[Red]\-""#,##0.00';
          Facturada.numFmt  = '""#,##0.00;[Red]\-""#,##0.00';
          stock.numFmt  = '""#,##0.00;[Red]\-""#,##0.00';
          precioUnd.numFmt  = '""#,##0.00;[Red]\-""#,##0.00';
          ccPendiente.numFmt  = '""#,##0.00;[Red]\-""#,##0.00';
          ccTotal.numFmt  = '""#,##0.00;[Red]\-""#,##0.00';

          worksheet.getColumn(1).width = 12;
          worksheet.getColumn(2).width = 50;
          worksheet.getColumn(3).width = 45;
          worksheet.getColumn(4).width = 15;
          worksheet.getColumn(5).width = 15;
          worksheet.getColumn(6).width = 15;
          worksheet.getColumn(7).width = 15;
          worksheet.getColumn(8).width = 10;
          worksheet.getColumn(9).width = 15;
          worksheet.getColumn(10).width = 25;
          worksheet.getColumn(11).width = 40;
          worksheet.getColumn(12).width = 20;
          worksheet.getColumn(13).width = 20;
          worksheet.getColumn(14).width = 20;
          worksheet.getColumn(15).width = 15;
          worksheet.getColumn(16).width = 15;
        });

        setTimeout(() => {
          workbook.xlsx.writeBuffer().then((data) => {
            let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            fs.saveAs(blob, `Reporte de Pedidos Zeus - ${this.today}.xlsx`);
          });
          this.cargando = false;
        }, 1000);
      }, 3000);
    }
  }

  /** Mensajes de advertencia */
  advertencia(mensaje : string) {
    Swal.fire({ icon: 'warning', title: 'Advertencia', html: mensaje, confirmButtonColor: '#ffc107', confirmButtonText: 'Aceptar', });
  }

  /** Mensajes de confirmación */
  Confirmacion(mensaje : string) {
    Swal.fire({ icon: 'success', title: 'Advertencia', html: mensaje, confirmButtonColor: '#ffc107', confirmButtonText: 'Aceptar', });
  }

  /** Llenar array al momento de seleccionar VER PDF */
  llenarArrayPdf(item : any){
    this.arrayPedidosIndividuales = [];
    this.inventarioZeusService.getPedidosXConsecutivo(item.consecutivo).subscribe(dataPedidos => {
      for (let index = 0; index < dataPedidos.length; index++) {
        this.tablaPedidos(dataPedidos[index]);
      }
    });
  }

  /** LLenar array para mostrar info en PDF */
  tablaPedidos(datos : any){
    const dataPedidos : any = {
      consecutivo: datos.consecutivo,
      cliente: datos.cliente,
      Producto: datos.producto,
      Cant_Pedida: this.formatonumeros(datos.cant_Pedida),
      Pendiente: this.formatonumeros(datos.cant_Pendiente),
      Facturada: this.formatonumeros(datos.cant_Facturada),
      Stock: this.formatonumeros(datos.existencias),
      Und: datos.presentacion,
      Estado: datos.estado,
      Vendedor: datos.vendedor,
      precioUnidad : this.formatonumeros(datos.precioUnidad),
      orden_Compra_CLiente: datos.orden_Compra_CLiente,
      Costo_Pendiente: this.formatonumeros(datos.costo_Cant_Pendiente),
      Costo_Total: this.formatonumeros(datos.costo_Cant_Total),
      Costo_Pendiente1 : datos.costo_Cant_Pendiente,
      Costo_Total1 : datos.costo_Cant_Total,
      fecha_Creacion: datos.fecha_Creacion,
      fecha_Entrega: datos.fecha_Entrega,
    }
    this.arrayPedidosIndividuales.push(dataPedidos);
    this.calcularTotales();
    //this.mostrarPedidoPdf(dataPedidos);
  }

  /** Calcular valores de costos en cantidad total/pendiente. */
  calcularTotales(){
    this.costoCantidadPendiente = 0;
    this.costoCantidadTotal = 0;

    for (let index = 0; index < this.arrayPedidosIndividuales.length; index++) {
      this.costoCantidadTotal += this.arrayPedidosIndividuales[index].Costo_Total1;
      this.costoCantidadPendiente +=this.arrayPedidosIndividuales[index].Costo_Pendiente1;
    }
  }

  /** Mostrar el PDF que contiene la información detallada del pedido. */
  mostrarPedidoPdf(item : any){
    this.llenarArrayPdf(item);
    let usuario : string = this.storage.get('Nombre');
    this.inventarioZeusService.getPedidosXConsecutivo(item.consecutivo).subscribe(dataPedidos => {
      for (let index = 0; index < dataPedidos.length; index++) {
        const infoPdf : any = {
          info: {
            title: `Pedido Nro.  ${item.consecutivo}`
          },
          pageSize: {
            width: 630,
            height: 760
          },
          footer: function(currentPage : any, pageCount : any) {
            return [
              '\n',
              {
                columns: [
                  { text: `Reporte generado por ${usuario}`, alignment: ' left', fontSize: 8, margin: [30, 0, 0, 0] },
                  { text: `Fecha Expedición Documento ${moment().format('YYYY-MM-DD')} - ${moment().format('H:mm:ss')}`, alignment: 'right', fontSize: 8 },
                  { text: `${currentPage.toString() + ' de ' + pageCount}`, alignment: 'right', fontSize: 8, margin: [0, 0, 30, 0] },
                ]
              }
            ]
          },
          content : [
            {
              columns: [
                {
                  image : this.appComponent.logoParaPdf,
                  width : 100,
                  height : 80
                },
                {
                  text: `Pedido Zeus Nro. ${item.consecutivo}`,
                  alignment: 'right',
                  style: 'titulo',
                  margin: [0, 30, 0, 0],
                }
              ]
            },
            '\n \n',
            {
              style: 'tablaEmpresa',
              table: {
                widths: [90, '*', 90, '*'],
                style: 'header',
                body: [
                  [
                    {
                      border: [false, false, false, false],
                      text: `Nombre Empresa`
                    },
                    {
                      border: [false, false, false, true],
                      text: `${dataPedidos[index].empresa}`
                    },
                    {
                      border: [false, false, false, false],
                      text: `Ciudad`
                    },
                    {
                      border: [false, false, false, true],
                      text: `${dataPedidos[index].ciudad_Empresa}`
                    },
                  ],
                  [
                    {
                      border: [false, false, false, false],
                      text: `NIT`
                    },
                    {
                      border: [false, false, false, true],
                      text: `${dataPedidos[index].nit}`
                    },
                    {
                      border: [false, false, false, false],
                      text: `Dirección`
                    },
                    {
                      border: [false, false, false, true],
                      text: `${dataPedidos[index].direccion}`
                    },
                  ],
                ]
              },
              layout: {
                defaultBorder: false,
              },
              fontSize: 9,
            },
            '\n',
            {
              text: `\n Información general del Pedido \n \n`,
              alignment: 'center',
              style: 'subtitulo'
            },
            {
              style: 'tablaCliente',
              table: {
                widths: ['*', '*', '*'],
                style: 'subtitulo',
                body: [
                  [
                    `NIT Cliente: ${dataPedidos[index].id_Cliente}`,
                    `Nombre: ${dataPedidos[index].cliente}`,
                    `Ciudad: ${dataPedidos[index].ciudad}`,
                  ],
                  [
                    `Fecha Creación: ${dataPedidos[index].fecha_Creacion.replace('T00:00:00', '')}`,
                    `Vendedor : ${dataPedidos[index].vendedor}`,
                    `OC: ${dataPedidos[index].orden_Compra_CLiente}`
                  ],
                ]
              },
              layout: 'lightHorizontalLines',
              fontSize: 11,
            },'\n \n',
            {
              text: `Información detallada del Pedido\n `,
              alignment: 'center',
              style: 'subtitulo'
            },
            this.table(this.arrayPedidosIndividuales, ['Producto', 'Cant_Pedida', 'Pendiente', 'Facturada', 'Stock', 'Und', 'Costo_Pendiente', 'Costo_Total', 'Estado' ]),

            {
              style: 'texto',
              table: {
                widths: [120, 45, 40, 40, 40, 20, 65, 50, 50],
                style: 'texto',
                body: [
                  [
                    {text: '', colSpan : 4 , border : [false, false, false, false]},
                    {},
                    {},
                    {},
                    {text : 'Totales', colSpan : 2,  alignment : 'right',  border : [true, false, true, true] },
                    {},
                    {text: this.formatonumeros(this.costoCantidadPendiente.toFixed(2)), border: [true, false, true, true]},
                    {text: this.formatonumeros(this.costoCantidadTotal.toFixed(2)), border: [true, false, true, true]},
                    {text: '', border : [false, false, false, false] },
                  ],
                ]
              },
            }
          ],
          styles: {
            header: {
              fontSize: 10,
              bold: true
            },
            texto: {
              fontSize: 8,
            },
            titulo: {
              fontSize: 20,
              bold: true
            },
            subtitulo: {
              fontSize: 14,
              bold: true
            }

          }
         }
         const pdf = pdfMake.createPdf(infoPdf);
         pdf.open();
         this.cargando = false;
         this.Confirmacion(`¡PDF generado con éxito!`);
         break;
      }
    });
  }

  // Funcion que se encagará de llenar la tabla del pd
  buildTableBody(data, columns) {
    var body = [];
    body.push(columns);
    data.forEach(function(row) {
      var dataRow = [];
      columns.forEach(function(column) {
        dataRow.push(row[column]);
      });
      body.push(dataRow);
    });

    return body;
  }

  // Funcion que genera la tabla donde se mostrará la información
  table(data, columns) {
    return {
      table: {
        headerRows: 1,
        widths: [120, 45, 40, 40, 40, 20, 65, 50, 50],
        body: this.buildTableBody(data, columns)
      },
      fontSize: 8,
      layout: {
        fillColor: function (rowIndex, node, columnIndex) {
          return (rowIndex == 0) ? '#CCCCCC' : null;
        }
      }
    };
  }

  // Funcion que genera la tabla donde se mostrará la información
  table2(data, columns) {
    return {
      table: {
        headerRows: 1,
        widths: [40, 40, 160, 50, 70, 50, 75],
        body: this.buildTableBody(data, columns)
      },
      fontSize: 8,
      layout: {
        fillColor: function (rowIndex, node, columnIndex) {
          return (rowIndex == 0) ? '#CCCCCC' : null;
        }
      }
    };
  }

  //Funcion que va a cargar un modal con la informacion de la orden de trabajo que tiene asignada el pedido
  varOrdenTranajo(data : any){
    this.estadosProcesos_OTService.GetOrdenesTrabajo_Pedido(data.consecutivo).subscribe(datos_orden => {
      if (datos_orden.length > 0) {
        this.modalEstadosOrdenes = true;
        setTimeout(() => {
          this.modalEstadosProcesos_OT.modeModal = true;
          this.modalEstadosProcesos_OT.ArrayDocumento = [];
          for (let i = 0; i < datos_orden.length; i++) {
            this.modalEstadosProcesos_OT.llenarArray(datos_orden[i]);
          }
        }, 500);
      } else Swal.fire({icon : 'warning', title : 'Advertencia', showCloseButton: true, html : `<b>¡No hay orden asociada al pedido ${data.consecutivo}!</b>`})
    }, error => {
      Swal.fire({icon : 'error', title : 'Opps...', showCloseButton: true, html : `<b>¡No se obtuvo información de las ordenes de trabajo asociadas al pedido ${data.consecutivo}!</b><br><span style="color: #f00">${error.message}</span>`})
    });
  }

  // Funcion que va a actualizar la orden de trabajo de un pedido
  cambiarOrden_Pedido(data : any){
    this.cargando = true;
    this.estadosProcesos_OTService.GetOrdenesTrabajo_Pedido(data.consecutivo).subscribe(datos_ot => {
      if (datos_ot.length > 0) {
        for (let i = 0; i < datos_ot.length; i++) {
          let info : any = {
            EstProcOT_OrdenTrabajo : datos_ot[i].estProcOT_OrdenTrabajo,
            EstProcOT_ExtrusionKg : datos_ot[i].estProcOT_ExtrusionKg,
            EstProcOT_ImpresionKg : datos_ot[i].estProcOT_ImpresionKg,
            EstProcOT_RotograbadoKg : datos_ot[i].estProcOT_RotograbadoKg,
            EstProcOT_LaminadoKg : datos_ot[i].estProcOT_LaminadoKg,
            EstProcOT_CorteKg : datos_ot[i].estProcOT_CorteKg ,
            EstProcOT_DobladoKg : datos_ot[i].estProcOT_DobladoKg,
            EstProcOT_SelladoKg : datos_ot[i].estProcOT_SelladoKg,
            EstProcOT_SelladoUnd : datos_ot[i].estProcOT_SelladoUnd,
            EstProcOT_WiketiadoKg : datos_ot[i].estProcOT_WiketiadoKg,
            EstProcOT_WiketiadoUnd : datos_ot[i].estProcOT_WiketiadoUnd,
            EstProcOT_CantProdFacturada : datos_ot[i].estProcOT_CantProdFacturada,
            EstProcOT_CantProdIngresada : datos_ot[i].estProcOT_CantProdIngresada,
            EstProcOT_CantMatPrimaAsignada : datos_ot[i].estProcOT_CantMatPrimaAsignada,
            EstProcOT_CantidadPedida : datos_ot[i].estProcOT_CantidadPedida,
            UndMed_Id : datos_ot[i].undMed_Id,
            Estado_Id : datos_ot[i].estado_Id,
            Falla_Id : datos_ot[i].falla_Id,
            EstProcOT_Observacion : datos_ot[i].estProcOT_Observacion,
            EstProcOT_FechaCreacion : datos_ot[i].estProcOT_FechaCreacion,
            EstProcOT_EmpaqueKg : datos_ot[i].estProcOT_EmpaqueKg,
            Usua_Id : datos_ot[i].usua_Id,
            EstProcOT_FechaFinal : datos_ot[i].estProcOT_FechaFinal,
            EstProcOT_FechaInicio: datos_ot[i].estProcOT_FechaInicio,
            EstProcOT_CantidadPedidaUnd : datos_ot[i].estProcOT_CantidadPedidaUnd,
            EstProcOT_HoraFinal : datos_ot[i].estProcOT_HoraFinal,
            EstProcOT_HoraInicio : datos_ot[i].estProcOT_HoraInicio,
            EstProcOT_DiffDiasInicio_Fin : datos_ot[i].estProcOT_DiffDiasInicio_Fin,
            Cli_Id : datos_ot[i].cli_Id,
            Prod_Id : datos_ot[i].prod_Id,
            EstProcOT_CLiente : datos_ot[i].estProcOT_Cliente,
            EstProcOT_Pedido : null,
          }
          this.estadosProcesos_OTService.srvActualizarPorOT(datos_ot[i].estProcOT_OrdenTrabajo, info).subscribe(datos_otActualizada => {
            Swal.fire({icon: 'success', title: 'Cambio Exitoso', text: `¡Se eliminó la relación del pedido ${data.consecutivo} con la OT ${datos_ot[i].estProcOT_OrdenTrabajo}!`, showCloseButton: true})
          });
        }
      }
    }, error => {
      Swal.fire({icon : 'error', title : 'Opps...', showCloseButton: true, html : `<b>¡No se obtuvo información de las ordenes de trabajo asociadas al pedido ${data.consecutivo}!</b><br><span style="color: #f00">${error.message}</span>`})
    });

    this.estadosProcesos_OTService.srvObtenerListaPorOT(data.OT).subscribe(datos_ot => {
      for (let i = 0; i < datos_ot.length; i++) {
        if(datos_ot[i].EstProcOT_Pedido == null) {
          if (parseInt(data.id_Producto) == datos_ot[i].prod_Id) {
            let info : any = {
              EstProcOT_OrdenTrabajo : datos_ot[i].estProcOT_OrdenTrabajo,
              EstProcOT_ExtrusionKg : datos_ot[i].estProcOT_ExtrusionKg,
              EstProcOT_ImpresionKg : datos_ot[i].estProcOT_ImpresionKg,
              EstProcOT_RotograbadoKg : datos_ot[i].estProcOT_RotograbadoKg,
              EstProcOT_LaminadoKg : datos_ot[i].estProcOT_LaminadoKg,
              EstProcOT_CorteKg : datos_ot[i].estProcOT_CorteKg ,
              EstProcOT_DobladoKg : datos_ot[i].estProcOT_DobladoKg,
              EstProcOT_SelladoKg : datos_ot[i].estProcOT_SelladoKg,
              EstProcOT_SelladoUnd : datos_ot[i].estProcOT_SelladoUnd,
              EstProcOT_WiketiadoKg : datos_ot[i].estProcOT_WiketiadoKg,
              EstProcOT_WiketiadoUnd : datos_ot[i].estProcOT_WiketiadoUnd,
              EstProcOT_CantProdFacturada : datos_ot[i].estProcOT_CantProdFacturada,
              EstProcOT_CantProdIngresada : datos_ot[i].estProcOT_CantProdIngresada,
              EstProcOT_CantMatPrimaAsignada : datos_ot[i].estProcOT_CantMatPrimaAsignada,
              EstProcOT_CantidadPedida : datos_ot[i].estProcOT_CantidadPedida,
              UndMed_Id : datos_ot[i].undMed_Id,
              Estado_Id : datos_ot[i].estado_Id,
              Falla_Id : datos_ot[i].falla_Id,
              EstProcOT_Observacion : datos_ot[i].estProcOT_Observacion,
              EstProcOT_FechaCreacion : datos_ot[i].estProcOT_FechaCreacion,
              EstProcOT_EmpaqueKg : datos_ot[i].estProcOT_EmpaqueKg,
              Usua_Id : datos_ot[i].usua_Id,
              EstProcOT_FechaFinal : datos_ot[i].estProcOT_FechaFinal,
              EstProcOT_FechaInicio: datos_ot[i].estProcOT_FechaInicio,
              EstProcOT_CantidadPedidaUnd : datos_ot[i].estProcOT_CantidadPedidaUnd,
              EstProcOT_HoraFinal : datos_ot[i].estProcOT_HoraFinal,
              EstProcOT_HoraInicio : datos_ot[i].estProcOT_HoraInicio,
              EstProcOT_DiffDiasInicio_Fin : datos_ot[i].estProcOT_DiffDiasInicio_Fin,
              Cli_Id : datos_ot[i].cli_Id,
              Prod_Id : datos_ot[i].prod_Id,
              EstProcOT_CLiente : datos_ot[i].estProcOT_Cliente,
              EstProcOT_Pedido : data.consecutivo,
            }
            this.estadosProcesos_OTService.srvActualizarPorOT(datos_ot[i].estProcOT_OrdenTrabajo, info).subscribe(datos_otActualizada => {
              Swal.fire({icon: 'success', title: 'Cambio Exitoso', text: `¡Se cambió la orden de trabajo asociada al pedido ${data.consecutivo}!`, showCloseButton: true})
            });
          } else Swal.fire({ icon: 'warning', title: 'Advertencia', text: `¡El Producto de la OT ${datos_ot[i].estProcOT_OrdenTrabajo} no coincide con el del pedido ${data.consecutivo}!`});
        } else Swal.fire({ icon: 'warning', title: 'Advertencia', text: `¡La OT ${datos_ot[i].estProcOT_OrdenTrabajo} ya tiene un pedido asignado!`});
      }
    });

    setTimeout(() => { this.consultarPedidos(); }, 1000);
  }
}
