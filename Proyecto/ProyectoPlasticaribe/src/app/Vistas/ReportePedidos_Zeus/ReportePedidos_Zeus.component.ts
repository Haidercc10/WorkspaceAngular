import { Component, OnInit, ViewChild } from '@angular/core';
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';
import moment from 'moment';
import pdfMake from 'pdfmake/build/pdfmake';
import { MessageService } from 'primeng/api';
import { OverlayPanel } from 'primeng/overlaypanel';
import { Table } from 'primeng/table';
import { modelOpedido } from 'src/app/Modelo/modelOpedido';
import { PedidoProductosService } from 'src/app/Servicios/DetallesPedidoProductos/pedidoProductos.service';
import { EstadosProcesos_OTService } from 'src/app/Servicios/EstadosProcesosOT/EstadosProcesos_OT.service';
import { InventarioZeusService } from 'src/app/Servicios/InventarioZeus/inventario-zeus.service';
import { OpedidoproductoService } from 'src/app/Servicios/PedidosProductos/opedidoproducto.service';
import { AppComponent } from 'src/app/app.component';
import { logoParaPdf } from 'src/app/logoPlasticaribe_Base64';
import { PedidoExternoComponent } from '../Pedido-Externo/Pedido-Externo.component';
import { Reporte_Procesos_OTComponent } from '../Reporte_Procesos_OT/Reporte_Procesos_OT.component';
@Component({
  selector: 'app-ReportePedidos_Zeus',
  templateUrl: './ReportePedidos_Zeus.component.html',
  styleUrls: ['./ReportePedidos_Zeus.component.css']
})
export class ReportePedidos_ZeusComponent implements OnInit {

  @ViewChild('op') op: OverlayPanel | undefined;
  @ViewChild('dt') dt: Table | undefined;
  @ViewChild(Reporte_Procesos_OTComponent) modalEstadosProcesos_OT : Reporte_Procesos_OTComponent;
  @ViewChild(PedidoExternoComponent) modalPedidoExterno : PedidoExternoComponent;

  cargando : boolean = false;
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente.
  infoColor : string = ''; //Varable que almcanerá la descripcion del un color
  ArrayPedidos = []; //Varibale que almacenará la información que se mostrará en la tabla de vista
  modalEditar : boolean = false; //Variable que validará si el pedido está en edición o no
  columnas : any [] = [];
  columnasSeleccionadas : any [] = [];
  expandedRows : {} = {};
  itemSeleccionado : any;
  modalEstadosOrdenes : boolean = false;
  consecutivoPedido : any = '';
  productosPedidos : any [] = []; //Variable que se llenará con la información de los productos que se enviaron a la base de datos, los productos serán del ultimo pedido creado
  costoCantidadTotal : number = 0;
  costoCantidadPendiente : number = 0;
  arrayPedidosIndividuales : any = [];
  datosExcel : any [] = []; //VAriable que almcanerá la informacion que se verá en el archivo de excel

  constructor(private AppComponent : AppComponent,
                private messageService: MessageService,
                  private inventarioZeusService : InventarioZeusService,
                    private pedidoProductosService : PedidoProductosService,
                      private pedidoExternoService : OpedidoproductoService,
                        private estadosProcesos_OTService : EstadosProcesos_OTService,) {
  }

  ngOnInit() {
    this.lecturaStorage();
    this.seleccionarColumnas();
    this.consultarPedidosZeus();
    this.consultarPedidos();
  }

  //Funcion que leerá la informacion que se almacenará en el storage del navegador
  lecturaStorage(){
    this.storage_Id = this.AppComponent.storage_Id;
    this.storage_Nombre = this.AppComponent.storage_Nombre;
    this.ValidarRol = this.AppComponent.storage_Rol;
  }

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number) => {
    const exp = /(\d)(?=(\d{3})+(?!\d))/g;
    const rep = '$1,';
    return number.toString().replace(exp,rep);
  }

  // Funcion que va a consultar los pedidos de zeus
  consultarPedidosZeus(){
    this.cargando = true;
    this.ArrayPedidos = [];
    this.datosExcel = [];

    this.inventarioZeusService.GetPedidos().subscribe(datos_pedidos => {
      for (let i = 0; i < datos_pedidos.length; i++) {
        if (this.ValidarRol == 2){
          if (this.storage_Id == parseInt(datos_pedidos[i].id_Vendedor)) this.llenarArrayPedidosZeus(datos_pedidos[i], i);
        } else if (this.ValidarRol == 1 || this.ValidarRol == 6 || this.ValidarRol == 60 || this.ValidarRol == 61) this.llenarArrayPedidosZeus(datos_pedidos[i], i);
      }
    });
    setTimeout(() => {
      this.cargando = false;
      this.dt.value.sort((a,b) => Number(a.id_color) - Number(b.id_color));

      const thisRef = this;
      this.ArrayPedidos.forEach(function(pedido) {
        thisRef.expandedRows[pedido.id] = true;
      });
    }, 3500);
  }

  // Funcion que va a consultar los pedidos que no han sido cargados a zeus
  consultarPedidos(){
    this.pedidoProductosService.getPedidoPendiente().subscribe(datos_pedidos => {
      for (let i = 0; i < datos_pedidos.length; i++) {
        if (this.ValidarRol == 2){
          if (datos_pedidos[i].usua_Id == this.storage_Id) this.llenarArrayPedidos(datos_pedidos[i], i);
        } else if (this.ValidarRol == 1 || this.ValidarRol == 6 || this.ValidarRol == 60) this.llenarArrayPedidos(datos_pedidos[i], i);
      }
    });
    setTimeout(() => { this.cargando = false; }, 1500);
  }

  // Funcion que va a almcanear las columnas que se podrán elegir y que saldrán elegidas desde el principio
  seleccionarColumnas(){
    this.columnas = [
      { header: 'Pedido', field: 'consecutivo', tipo: '' },
      { header: 'Cliente', field: 'cliente', tipo: '' },
      { header: 'Item', field: 'id_Producto', tipo: '' },
      { header: 'Producto', field: 'producto', tipo: '' },
      { header: 'Cant. Pedida', field: 'cant_Pedida', tipo: 'numero' },
      { header: 'Facturada', field: 'cant_Facturada', tipo: 'numero' },
      { header: 'Pendiente', field: 'cant_Pendiente', tipo: 'numero' },
      { header: 'Stock', field: 'existencias', tipo: 'numero' },
      { header: 'Und', field: 'presentacion', tipo: '' },
      { header: 'Precio U.', field: 'precioUnidad', tipo: 'numero' },
      { header: 'Total Pendiente', field: 'costo_Cant_Pendiente', tipo: 'numero' },
      { header: 'Estado', field: 'estado', tipo: '' },
      { header: 'Vendedor', field: 'vendedor', tipo: '' },
      { header: 'OT', field: 'OT', tipo: '' },
      { header: 'Proceso Actual', field: 'Proceso_OT', tipo: '' },
      { header: 'Total', field: 'costo_Cant_Total', tipo: 'numero' },
      { header: 'OC Cliente', field: 'orden_Compra_CLiente', tipo: '' },
      { header: 'Fecha Creación', field: 'fecha_Creacion', tipo: '' },
      { header: 'Fecha Entrega', field: 'fecha_Entrega', tipo: '' },
    ];
    this.columnasSeleccionadas = this.columnas;
    let posicion = this.columnasSeleccionadas.findIndex((item) => item.header == 'Total');
    this.columnasSeleccionadas.splice(posicion, 1);
  }

  // Funcion que va a llenar el array que se mostrará en la tabla con la informacion consultada de los pedidos en zeus
  llenarArrayPedidosZeus(datos : any, index : number){
    let info : any = {
      id : index,
      id_color : 4,
      color : 'blanco',
      consecutivo : datos.consecutivo,
      cliente: datos.cliente,
      producto: datos.producto,
      id_Producto: datos.id_Producto,
      cant_Pedida: datos.cant_Pedida.toFixed(2),
      cant_Pendiente: parseFloat(datos.cant_Pendiente).toFixed(2),
      cant_Facturada: datos.cant_Facturada.toFixed(2),
      existencias: parseFloat(datos.existencias).toFixed(2),
      presentacion: datos.presentacion,
      estado: datos.estado,
      vendedor: datos.vendedor,
      precioUnidad : datos.precioUnidad.toFixed(2),
      orden_Compra_CLiente: datos.orden_Compra_CLiente,
      costo_Cant_Pendiente: datos.costo_Cant_Pendiente.toFixed(2),
      costo_Cant_Total: datos.costo_Cant_Total.toFixed(2),
      fecha_Creacion: datos.fecha_Creacion.replace('T00:00:00', ''),
      fecha_Entrega: datos.fecha_Entrega.replace('T00:00:00', ''),
      OT : '',
      Proceso_OT: '',
      CantPesada : '',
      Estado_OT: '',
      CantPedidaKg_OT : '',
      CantPedidaUnd_OT : '',
      Zeus : 1,
    };
    this.estadosProcesos_OTService.GetOrdenesTrabajo_Pedido(datos.consecutivo).subscribe(datos_orden => {
      for (let i = 0; i < datos_orden.length; i++) {
        if (parseInt(datos.id_Producto) == datos_orden[i].prod_Id) {
          info.OT = datos_orden[i].estProcOT_OrdenTrabajo;
          if (datos_orden[i].estProcOT_ExtrusionKg > 0) {
            info.Proceso_OT = `Extrusión ${this.formatonumeros(datos_orden[i].estProcOT_ExtrusionKg.toFixed(2))} Kg`;
            info.CantPesada = datos_orden[i].estProcOT_ExtrusionKg.toFixed(2);
          }
          if (datos_orden[i].estProcOT_ImpresionKg > 0) {
            info.Proceso_OT = `Impresión ${this.formatonumeros(datos_orden[i].estProcOT_ImpresionKg.toFixed(2))} Kg`;
            info.CantPesada = datos_orden[i].estProcOT_ImpresionKg.toFixed(2);
          }
          if (datos_orden[i].estProcOT_RotograbadoKg > 0) {
            info.Proceso_OT = `Rotograbado ${this.formatonumeros(datos_orden[i].estProcOT_RotograbadoKg.toFixed(2))} Kg`;
            info.CantPesada = datos_orden[i].estProcOT_RotograbadoKg.toFixed(2);
          }
          if (datos_orden[i].estProcOT_LaminadoKg > 0) {
            info.Proceso_OT = `Laminado ${this.formatonumeros(datos_orden[i].estProcOT_LaminadoKg.toFixed(2))} Kg`;
            info.CantPesada = datos_orden[i].estProcOT_LaminadoKg.toFixed(2);
          }
          if (datos_orden[i].estProcOT_CorteKg > 0) {
            info.Proceso_OT = `Corte - ${this.formatonumeros(datos_orden[i].estProcOT_CorteKg.toFixed(2))} Kg`;
            info.CantPesada = datos_orden[i].estProcOT_CorteKg.toFixed(2);
          }
          if (datos_orden[i].estProcOT_DobladoKg > 0) {
            info.Proceso_OT = `Doblado ${this.formatonumeros(datos_orden[i].estProcOT_DobladoKg.toFixed(2))} Kg`;
            info.CantPesada = datos_orden[i].estProcOT_DobladoKg.toFixed(2);
          }
          if (datos_orden[i].estProcOT_EmpaqueKg > 0) {
            info.Proceso_OT = `Empaque ${this.formatonumeros(datos_orden[i].estProcOT_EmpaqueKg.toFixed(2))} Kg`;
            info.CantPesada = datos_orden[i].estProcOT_EmpaqueKg.toFixed(2);
          }
          if (datos_orden[i].estProcOT_SelladoKg > 0) {
            info.Proceso_OT = `Sellado ${this.formatonumeros(datos_orden[i].estProcOT_SelladoUnd.toFixed(2))} Und - ${this.formatonumeros(datos_orden[i].estProcOT_SelladoKg.toFixed(2))} Kg`;
            info.CantPesada = datos_orden[i].estProcOT_SelladoUnd.toFixed(2);
          }
          if (datos_orden[i].estProcOT_WiketiadoKg > 0) {
            info.Proceso_OT = `Wiketiado ${this.formatonumeros(datos_orden[i].estProcOT_WiketiadoUnd.toFixed(2))} Und - ${this.formatonumeros(datos_orden[i].estProcOT_WiketiadoKg.toFixed(2))} Kg`;
            info.CantPesada = datos_orden[i].estProcOT_WiketiadoUnd.toFixed(2);
          }
          info.Estado_OT = datos_orden[i].estado_Id;
          info.CantPedidaKg_OT = datos_orden[i].estProcOT_CantidadPedida;
          info.CantPedidaUnd_OT = datos_orden[i].estProcOT_CantidadPedidaUnd;
        }
      }
    });
    this.ArrayPedidos.push(info);
    this.datosExcel = this.ArrayPedidos;

    let pedidos = this.ArrayPedidos.filter((item) => item.consecutivo == datos.consecutivo);
    let cantidad = this.ArrayPedidos.filter((item) => item.consecutivo == datos.consecutivo && parseFloat(item.existencias) >= parseFloat(item.cant_Pendiente));

    if (pedidos.length == cantidad.length) {
      for (let i = 0; i < pedidos.length; i++) {
        let posicion = this.ArrayPedidos.findIndex((item) => item.id == pedidos[i].id);
        this.ArrayPedidos[posicion].id_color = 1;
        this.ArrayPedidos[posicion].color = 'verde';
      }
    } else if (cantidad.length > 0 && cantidad.length < pedidos.length) {
      for (let i = 0; i < pedidos.length; i++) {
        if (parseFloat(pedidos[i].existencias) >= parseFloat(pedidos[i].cant_Pendiente)) {
          let posicion = this.ArrayPedidos.findIndex((item) => item.id == pedidos[i].id);
          this.ArrayPedidos[posicion].id_color = 2;
          this.ArrayPedidos[posicion].color = 'verde';
        } else {
          let posicion = this.ArrayPedidos.findIndex((item) => item.id == pedidos[i].id);
          this.ArrayPedidos[posicion].id_color = 2;
          this.ArrayPedidos[posicion].color = 'azul';
        }
      }
    } else {
      for (let i = 0; i < pedidos.length; i++) {
        let posicion = this.ArrayPedidos.findIndex((item) => item.id == pedidos[i].id);
        this.ArrayPedidos[posicion].id_color = 4;
        this.ArrayPedidos[posicion].color = 'blanco';
      }
    }
  }

  // Funcion que va a llenar el array que se mostrará en la tabla con la informacion consultada de los pedidos
  llenarArrayPedidos(datos : any, index : number){
    if(datos.undMed_Id == 'Und') datos.undMed_Id = 'UND';
    if(datos.undMed_Id == 'Kg') datos.undMed_Id = 'KLS';
    if(datos.undMed_Id == 'Paquete') datos.undMed_Id = 'PAQ';

    let info : any = {
      id : index,
      id_color : 3,
      color : 'rojo',
      consecutivo : datos.pedExt_Id,
      cliente: datos.cli_Nombre,
      producto: datos.prod_Nombre,
      id_Producto: datos.prod_Id,
      cant_Pedida: datos.pedExtProd_Cantidad,
      cant_Pendiente: datos.pedExtProd_Cantidad,
      cant_Facturada: 0,
      existencias: datos.existencias,
      presentacion: datos.undMed_Id,
      estado: datos.estado_Nombre,
      vendedor: datos.usua_Nombre,
      precioUnidad : datos.pedExtProd_PrecioUnitario,
      orden_Compra_CLiente: datos.orden_Compra_CLiente,
      costo_Cant_Pendiente: datos.costo_Cant_Pendiente,
      costo_Cant_Total: datos.pedExtProd_Cantidad * datos.pedExtProd_PrecioUnitario,
      fecha_Creacion: datos.pedExt_FechaCreacion.replace('T00:00:00', ''),
      fecha_Entrega: datos.pedExtProd_FechaEntrega.replace('T00:00:00', ''),
      OT : '',
      Proceso_OT: '',
      CantPesada : '',
      Estado_OT: '',
      CantPedidaKg_OT : '',
      CantPedidaUnd_OT : '',
      Zeus : 0,
    };

    this.inventarioZeusService.getExistenciasProductos(datos.prod_Id.toString(), datos.undMed_Id).subscribe(dataZeus => {
      for (let index = 0; index < dataZeus.length; index++) {
        info.existencias = dataZeus[index].existencias;
      }
    });

    this.ArrayPedidos.push(info);
    this.datosExcel = this.ArrayPedidos;
    this.ArrayPedidos.sort((a,b) => Number(a.id) - Number(b.id));
  }

  // Funcion que va a calcular el costo total del pedido
  calcularCostoPedido(consecutivo : number) : number {
    let nuevo = this.ArrayPedidos.filter((item) => item.consecutivo == consecutivo);
    let total : number = 0;
    for (let i = 0; i < nuevo.length; i++) {
      total += nuevo[i].cant_Pendiente * nuevo[i].precioUnidad;
    }
    return total;
  }

  // Funcion que creará un archivo de excel con base de lo que esté en la tabla
  exportarExcel(){
    if (this.ArrayPedidos.length == 0) this.mostrarAdvertencia(`Advertencia`, 'Debe haber al menos un pedido en la tabla.');
    else {
      this.cargando = true;
      const title = `Reporte de Pedidos Zeus - ${this.today}`;
      const header = ["N° Pedido", "Cliente", "Id Producto", "Producto", "Cant. Pedida", "Pendiente", "Facturada", "Stock", "Und", "Precio Und", "Estado", "Vendedor", "OC", "Costo Cant. Pendiente", "Costo Cant. Total", "Fecha Creación ", "Fecha Entrega", "OT", "Proceso Actual", "Estado OT"]

      let datos : any =[];
      for (const item of this.datosExcel) {
        const datos1 : any = [item.consecutivo, item.cliente, item.id_Producto, item.producto, item.cant_Pedida, item.cant_Pendiente, item.cant_Facturada, item.existencias, item.presentacion, item.precioUnidad, item.estado, item.vendedor, item.orden_Compra_CLiente, item.costo_Cant_Pendiente, item.costo_Cant_Total, item.fecha_Creacion, item.fecha_Entrega, item.OT, item.Proceso_OT, item.Estado_OT ];
        datos.push(datos1);
      }

      let workbook = new Workbook();
      const imageId1 = workbook.addImage({ base64:  logoParaPdf, extension: 'png', });
      let worksheet = workbook.addWorksheet(`Reporte de Pedidos Zeus - ${this.today}`);
      worksheet.addImage(imageId1, 'A1:C3');
      let titleRow = worksheet.addRow([title]);
      titleRow.font = { name: 'Calibri', family: 4, size: 16, underline: 'double', bold: true };
      worksheet.addRow([]);
      worksheet.addRow([]);
      let headerRow = worksheet.addRow(header);
      headerRow.eachCell((cell, number) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'eeeeee' } }
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
      });
      worksheet.mergeCells('A1:T3');
      worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };

      datos.forEach(d => {
        let row = worksheet.addRow(d);
        row.alignment = { horizontal : 'center' }
        row.getCell(5).numFmt  = '""#,##0.00;[Red]\-""#,##0.00';
        row.getCell(5).font = {color : {'argb' : 'FF7F71'}, 'name': 'Calibri', 'bold' : true, 'size': 11};

        row.getCell(6).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
        row.getCell(7).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
        row.getCell(8).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
        row.getCell(10).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
        row.getCell(14).numFmt = '""#,##0.00;[Red]\-""#,##0.00';
        row.getCell(15).numFmt = '""#,##0.00;[Red]\-""#,##0.00';

        let colorEstadoPedido : string, colorEstadoOT : string;
        // OT con Estado
        if (row.getCell(20).value == 17) {
          colorEstadoOT = '8AFC9B';
          row.getCell(20).fill = { type : 'pattern', pattern: 'solid', fgColor: { argb: colorEstadoOT }, };
          row.getCell(20).value = "Terminada";
        } else if (row.getCell(20).value == 18) {
          colorEstadoOT = '53CC48';
          row.getCell(20).fill = { type : 'pattern', pattern: 'solid', fgColor: { argb: colorEstadoOT }, };
          row.getCell(20).value = "Cerrada";
        } else if (row.getCell(20).value == 3) {
          colorEstadoOT = 'FF7878';
          row.getCell(20).fill = { type : 'pattern', pattern: 'solid', fgColor: { argb: colorEstadoOT }, };
          row.getCell(20).value = "Anulado";
        } else if (row.getCell(20).value == 14) {
          colorEstadoOT = '83D3FF';
          row.getCell(20).fill = { type : 'pattern', pattern: 'solid', fgColor: { argb: colorEstadoOT }, };
          row.getCell(20).value = "Asignada";
        } else if (row.getCell(20).value == 16) {
          colorEstadoOT = 'F3FC20;';
          row.getCell(20).fill = { type : 'pattern', pattern: 'solid', fgColor: { argb: colorEstadoOT }, };
          row.getCell(20).value = "En proceso";
        } else if (row.getCell(20).value == 15) {
          colorEstadoOT = 'F6D45D';
          row.getCell(20).fill = { type : 'pattern', pattern: 'solid', fgColor: { argb: colorEstadoOT }, };
          row.getCell(20).value = "Abierta";
        } else colorEstadoOT = 'FFFFFF';

        /** Estado Pedido*/
        if (row.getCell(11).value == 'Pendiente') colorEstadoPedido = 'FF7F71'
        else if (row.getCell(11).value == 'Parcialmente Satisfecho') colorEstadoPedido = 'FFF55D';
        row.getCell(11).fill = { type : 'pattern', pattern: 'solid', fgColor: { argb: colorEstadoPedido }, }

        worksheet.getColumn(1).width = 12;
        worksheet.getColumn(2).width = 60;
        worksheet.getColumn(3).width = 15;
        worksheet.getColumn(4).width = 60;
        worksheet.getColumn(5).width = 15;
        worksheet.getColumn(6).width = 15;
        worksheet.getColumn(7).width = 15;
        worksheet.getColumn(8).width = 18;
        worksheet.getColumn(9).width = 15;
        worksheet.getColumn(10).width = 15;
        worksheet.getColumn(11).width = 20;
        worksheet.getColumn(12).width = 50;
        worksheet.getColumn(13).width = 25;
        worksheet.getColumn(14).width = 20;
        worksheet.getColumn(15).width = 20;
        worksheet.getColumn(16).width = 15;
        worksheet.getColumn(17).width = 15;
        worksheet.getColumn(18).width = 15;
        worksheet.getColumn(19).width = 40;
        worksheet.getColumn(20).width = 30;
      });
      setTimeout(() => {
        workbook.xlsx.writeBuffer().then((data) => {
          let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          fs.saveAs(blob, `Reporte de Pedidos Zeus - ${this.today}.xlsx`);
        });
        setTimeout(() => {  this.mostrarConfirmacion(`Confirmación`, '¡Archivo de excel generado exitosamente!'); }, 3100);
        this.datosExcel = this.ArrayPedidos;
        this.cargando = false;
      }, 2000);
    }
  }

  // Funcion que llenará el archivo de excel con los datos de la tabla
  llenarArrayExcel(datos : any, arrayDatos : any){
    this.cargando = true;
    for (let i = 0; i < datos.length; i++) {
      const datos1 : any = [
        datos[i].consecutivo,
        datos[i].cliente,
        datos[i].producto,
        datos[i].cant_Pedida,
        datos[i].cant_Pendiente,
        datos[i].cant_Facturada,
        datos[i].existencias,
        datos[i].presentacion,
        datos[i].precioUnidad,
        datos[i].estado,
        datos[i].vendedor,
        datos[i].orden_Compra_CLiente,
        datos[i].costo_Cant_Pendiente,
        datos[i].costo_Cant_Total,
        datos[i].fecha_Creacion.replace('T00:00:00', ''),
        datos[i].fecha_Entrega.replace('T00:00:00', ''),
        datos[i].OT,
        datos[i].Proceso_OT,
        datos[i].Estado_OT,
      ];
      arrayDatos.push(datos1);
    }
  }

  // Funcion que permitirá filtrar la información de la tabla
  aplicarfiltro($event, campo : any, valorCampo : string){
    this.dt!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);
    setTimeout(() => {
      this.datosExcel = [];
      if (this.dt.filteredValue != null) {
        for (let i = 0; i < this.dt.filteredValue.length; i++) {
          this.datosExcel.push(this.dt.filteredValue[i]);
        }
      } else {
        for (let i = 0; i < this.ArrayPedidos.length; i++) {
          this.datosExcel.push(this.ArrayPedidos[i]);
        }
      }
    }, 400);
  }

  // Función que mostrará la descripción de cada una de las card de los dashboard's
  mostrarDescripcion($event, color : string){
    if (color == 'verde') this.infoColor = `El color verde indica que <b>${'todos los items de un pedido pueden ser facturados.'}</b><br><br> Debido a que <b>${'las existencias de el/los item(s) son mayores que las cantidades pendientes.'}</b>`;
    if (color == 'azul') this.infoColor = `El color azul indica que <b>${'al menos uno de los items de un pedido pueden ser facturados.'}</b><br><br> Debido a que <b>${'el stock de dicho(s) producto(s) es mayor que las cantidad solicitada.'}</b><br><br>
    <b>${'Nota:'}</b> Si encuentra filas de color verde dentro de encabezados de pedidos de color azul <b>${'es porque ese item en específico está listo para ser facturado!'}</b>`;
    if (color == 'rojo') this.infoColor = `El color rojo muestra los pedidos <b>${'que aún no han sido aprobados por gerencia para ser creados en Zeus'}</b>`;

    setTimeout(() => {
      this.op!.toggle($event);
      $event.stopPropagation();
    }, 500);
  }

  // Funcion que mostrará un modal con la informacion del pedido seleccionado y en el que se podrá editar el pedido selecionado
  editarPedido(data: any){
    this.modalEditar = true;
    setTimeout(() => {
      this.modalPedidoExterno.limpiarTodosCampos();
      this.modalPedidoExterno.modalMode = true;
      this.pedidoExternoService.GetInfoEditarPedido(data.consecutivo).subscribe(datos_pedido => {
        for (let i = 0; i < datos_pedido.length; i++) {
          this.modalPedidoExterno.FormPedidoExternoClientes.patchValue({
            PedClienteNombre: datos_pedido[i].cliente,
            PedObservacion: datos_pedido[i].observacion,
            PedDescuento : datos_pedido[i].descuento,
            PedIva : datos_pedido[i].iva,
          });
          this.modalPedidoExterno.pedidoEditar = data.consecutivo;
          this.modalPedidoExterno.clienteSeleccionado();
          setTimeout(() => {
            this.modalPedidoExterno.FormPedidoExternoClientes.patchValue({
              ciudad_sede: datos_pedido[i].ciudad,
            });
            this.modalPedidoExterno.llenarDireccionCliente();
          }, 500);
          break;
        }
        for (let i = 0; i < datos_pedido.length; i++) {
          this.modalPedidoExterno.valorTotal = datos_pedido[i].valor_Total;
          this.modalPedidoExterno.iva = datos_pedido[i].iva;
          if (datos_pedido[i].iva > 0) this.modalPedidoExterno.checked = true;
          this.modalPedidoExterno.descuento = datos_pedido[i].descuento;
          this.modalPedidoExterno.ivaDescuento();
          let productoExt : any = {
            Id : datos_pedido[i].id_Producto,
            Nombre : datos_pedido[i].producto,
            Cant : datos_pedido[i].cantidad_Pedida,
            UndCant : datos_pedido[i].presentacion,
            PrecioUnd : datos_pedido[i].precio_Unitario,
            Stock : 0,
            SubTotal : (datos_pedido[i].cantidad_Pedida * datos_pedido[i].precio_Unitario),
            FechaEntrega : datos_pedido[i].fecha_Entrega.replace('T00:00:00', ''),
          }
          this.modalPedidoExterno.ArrayProducto.push(productoExt);
        }
      });
    }, 500);
  }

  //Funcion que va a cargar un modal con la informacion de la orden de trabajo que tiene asignada el pedido
  varOrdenTranajo(data : any){
    if (this.ValidarRol == 1) {
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
        } else this.mostrarAdvertencia(`Advertencia`, `¡No hay orden asociada al pedido ${data.consecutivo}!`);
      }, error => { this.mostrarError(`Error`, `¡No se obtuvo información de las ordenes de trabajo asociadas al pedido ${data.consecutivo}!`); });
    }
  }

  // Funcion que va a actualizar la orden de trabajo de un pedido
  cambiarOrden_Pedido(data : any){
    this.estadosProcesos_OTService.GetOrdenesTrabajo_Pedido(data.consecutivo).subscribe(datos_ot => {
      if (datos_ot.length > 0) {
        for (let i = 0; i < datos_ot.length; i++) {
          if (data.OT == datos_ot[i].estProcOT_OrdenTrabajo) {
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
              this.mostrarConfirmacion(`Confirmación`, `¡Se eliminó la relación del pedido ${data.consecutivo} con la OT ${datos_ot[i].estProcOT_OrdenTrabajo}!`);
            });
          }
        }
      }
    }, error => { this.mostrarError(`Error`, `¡No se obtuvo información de las ordenes de trabajo asociadas al pedido ${data.consecutivo}!`); });

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
              this.mostrarConfirmacion(`Confirmación`, `¡Se cambió la orden de trabajo asociada al pedido ${data.consecutivo}!`);
            });
          } else this.mostrarAdvertencia(`Advertencia`, `¡El producto de la OT ${datos_ot[i].estProcOT_OrdenTrabajo} no coincide con el del pedido ${data.consecutivo}!`);
        } else this.mostrarAdvertencia(`Advertencia`, `¡La OT ${datos_ot[i].estProcOT_OrdenTrabajo} ya tiene un pedido asignado!`);
      }
    });
    setTimeout(() => { this.consultarPedidos(); }, 1000);
  }

  // Funcion que mostrará un mensaje de confirmación para aceptar un pedido o no
  mostrarEleccion(item : any, eleccion : any){
    let mensaje : string = "";
    this.itemSeleccionado = item;
    if (eleccion == 'aceptar') { this.onReject('aceptar'); this.onReject('cancelar'); mensaje = `Está seguro que desea aceptar el pedido N° ${item}?`; }
    if(eleccion == 'cancelar') { this.onReject('cancelar'); this.onReject('aceptar'); mensaje = `Está seguro que desea cancelar el pedido N° ${item}?`; }

    this.messageService.add({severity:'warn', key: eleccion, summary: 'Elección', detail: mensaje, sticky: true});
  }

  /** Aceptar Pedido para luego crearlo en Zeus */
  aceptarPedido(item : any){
    this.onReject('aceptar');
    this.pedidoExternoService.srvObtenerListaPorId(item).subscribe(dataPedidos => {
      const info : modelOpedido = {
        PedExt_Id : dataPedidos.pedExt_Id,
        PedExt_Codigo : dataPedidos.pedExt_Codigo,
        PedExt_FechaCreacion : dataPedidos.pedExt_FechaCreacion,
        PedExt_FechaEntrega : dataPedidos.pedExt_FechaEntrega,
        Empresa_Id : dataPedidos.empresa_Id,
        SedeCli_Id : dataPedidos.sedeCli_Id,
        Estado_Id : 26,
        PedExt_Observacion : dataPedidos.pedExt_Observacion,
        PedExt_PrecioTotal: dataPedidos.pedExt_PrecioTotal,
        Usua_Id : dataPedidos.usua_Id,
        PedExt_Descuento : dataPedidos.pedExt_Descuento,
        PedExt_Iva : dataPedidos.pedExt_Iva,
        PedExt_PrecioTotalFinal : dataPedidos.pedExt_PrecioTotalFinal,
        PedExt_HoraCreacion: dataPedidos.pedExt_HoraCreacion,
        Creador_Id : dataPedidos.creador_Id,
      }
      this.pedidoExternoService.srvActualizarPedidosProductos(item, info).subscribe(data_Pedido => {
        this.mostrarConfirmacion(`Confirmación`, `Pedido Nro. ${item} aceptado con exito!`);
        setTimeout(() => {
          this.consultarPedidosZeus();
          this.consultarPedidos();
        }, 100);
      }, error => { this.mostrarError(`Error`, `No fue posible aceptar el pedido ${item}, por favor, verifique!`); });
    });
  }

  /** Aceptar Pedido para luego crearlo en Zeus */
  cancelarPedido(item : any){
    this.onReject('cancelar');
    this.pedidoExternoService.srvObtenerListaPorId(item).subscribe(dataPedidos => {
      const info : any = {
        PedExt_Id : dataPedidos.pedExt_Id,
        PedExt_Codigo : dataPedidos.pedExt_Codigo,
        PedExt_FechaCreacion : dataPedidos.pedExt_FechaCreacion,
        PedExt_FechaEntrega : dataPedidos.pedExt_FechaEntrega,
        Empresa_Id : dataPedidos.empresa_Id,
        SedeCli_Id : dataPedidos.sedeCli_Id,
        Estado_Id : 4,
        PedExt_Observacion : dataPedidos.pedExt_Observacion,
        PedExt_PrecioTotal: dataPedidos.pedExt_PrecioTotal,
        Usua_Id : dataPedidos.usua_Id,
        PedExt_Descuento : dataPedidos.pedExt_Descuento,
        PedExt_Iva : dataPedidos.pedExt_Iva,
        PedExt_PrecioTotalFinal : dataPedidos.pedExt_PrecioTotalFinal,
        PedExt_HoraCreacion: dataPedidos.pedExt_HoraCreacion,
        Creador_Id : dataPedidos.creador_Id,
      }
      this.pedidoExternoService.srvActualizarPedidosProductos(item, info).subscribe(data_Pedido => {
        this.mostrarConfirmacion(`Confirmación`, `Pedido Nro. ${item} cancelado con exito!`);
        setTimeout(() => {
          this.consultarPedidosZeus();
          this.consultarPedidos();
        }, 100);
      }, error => { this.mostrarError(`Error`, `No fue posible cancelar el pedido ${item}, por favor, verifique!`); });
    });
  }

  /** Llenar array al momento de seleccionar VER PDF */
  llenarArrayPdf(item : any){
    this.arrayPedidosIndividuales = [];
    this.costoCantidadPendiente = 0;
    this.costoCantidadTotal = 0;

    this.inventarioZeusService.getPedidosXConsecutivo(item.consecutivo).subscribe(dataPedidos => {
      for (let i = 0; i < dataPedidos.length; i++) {
        const info : any = {
          Nombre : dataPedidos[i].producto,
          Cantidad : this.formatonumeros(dataPedidos[i].cant_Pedida),
          Und : dataPedidos[i].presentacion,
          Precio : this.formatonumeros(dataPedidos[i].precioUnidad),
          SubTotal : this.formatonumeros(dataPedidos[i].costo_Cant_Total),
          "Fecha Entrega" : dataPedidos[i].fecha_Entrega.replace('T00:00:00', ''),
        }
        this.arrayPedidosIndividuales.push(info);
        this.costoCantidadTotal += dataPedidos[i].costo_Cant_Total;
        this.costoCantidadPendiente += dataPedidos[i].costo_Cant_Pendiente;
      }
    });
  }

  /** Mostrar el PDF que contiene la información detallada del pedido. */
  mostrarPedidoPdf(item : any){
    this.llenarArrayPdf(item);
    let usuario : string = this.storage_Nombre;
    this.inventarioZeusService.getPedidosXConsecutivo(item.consecutivo).subscribe(dataPedidos => {
      for (let index = 0; index < dataPedidos.length; index++) {
        const infoPdf : any = {
          info: { title: `Pedido Nro.  ${item.consecutivo}` },
          pageSize: { width: 630, height: 760 },
          footer: function(currentPage : any, pageCount : any) {
            return [
              '\n',
              {
                columns: [
                  { text: `Reporte generado por ${usuario}`, alignment: ' left', fontSize: 8, margin: [30, 0, 0, 0] },
                  { text: `Fecha Expedición Documento ${moment().format('YYYY-MM-DD')} - ${moment().format('H:mm:ss')}`, alignment: 'right', fontSize: 8 },
                  { text: `${currentPage.toString()} de ${pageCount}`, alignment: 'right', fontSize: 8, margin: [0, 0, 30, 0] },
                ]
              }
            ]
          },
          content : [
            {
              columns: [
                { image : logoParaPdf, width : 220, height : 50 },
                { text: `Pedido Zeus ${item.consecutivo}`, alignment: 'right', style: 'titulo', margin: [0, 30, 0, 0], }
              ]
            },
            '\n \n',
            {
              style: 'tablaEmpresa',
              table: {
                widths: [90, 167, 90, 166],
                style: 'header',
                body: [
                  [
                    { border: [false, false, false, false], text: `Comercial`  },
                    { border: [false, false, false, true], text: `${dataPedidos[index].vendedor}`, fontSize: 8 },
                    { border: [false, false, false, false], text: `Fecha de pedido` },
                    { border: [false, false, false, true], text: `${dataPedidos[index].fecha_Creacion.replace('T00:00:00', '')}` },
                  ],
                  [
                    { border: [false, false, false, false], text: `Código` },
                    { border: [false, false, false, true], text: `` },
                    {},
                    {}
                  ],
                ]
              },
              layout: { defaultBorder: false, },
              fontSize: 9,
            },
            '\n',
            { text: `\n Información detallada del cliente \n \n`, alignment: 'center', style: 'header' },
            {
              style: 'tablaCliente',
              table: {
                widths: [170, 170, 170],
                style: 'header',
                body: [
                  [ `NIT Cliente: ${dataPedidos[index].id_Cliente}`,  `Nombre: ${dataPedidos[index].cliente}`, `Ciudad: ${dataPedidos[index].ciudad}`, ],
                  [ `OC: ${dataPedidos[index].orden_Compra_CLiente}`, ``, `` ]
                ]
              },
              layout: 'lightHorizontalLines',
              fontSize: 9,
            },
            '\n \n',
            { text: `\n\n Información detallada de producto(s) pedido(s) \n `, alignment: 'center', style: 'header' },
            this.table(this.arrayPedidosIndividuales, ['Nombre', 'Cantidad', 'Und', 'Fecha Entrega', 'Precio', 'SubTotal']),
            {
              style: 'tablaTotales',
              table: {
                widths: [270, 145, 98],
                style: 'header',
                body: [
                  [
                    '',
                    { border: [true, false, true, true], text: `Total Pedido` },
                    { border: [false, false, true, true], text: `$${this.formatonumeros(this.costoCantidadTotal.toFixed(2))}` },
                  ],
                ]
              },
              layout: { defaultBorder: false, },
              fontSize: 8,
            },
          ],
          styles: {
            header: { fontSize: 10, bold: true },
            texto: { fontSize: 8, },
            titulo: { fontSize: 20, bold: true },
            subtitulo: { fontSize: 14, bold: true }
          }
        }
        const pdf = pdfMake.createPdf(infoPdf);
        pdf.open();
        this.cargando = false;
        this.mostrarConfirmacion(`Confirmación`, `¡PDF generado con éxito!`);
        break;
      }
    });
  }

  // Funcion que consultará los productos del ultimo pedido creado
  productosPedido(pedido : number){
    this.productosPedidos = [];
    this.pedidoExternoService.GetCrearPdfUltPedido(pedido).subscribe(datos_pedido => {
      for (let i = 0; i < datos_pedido.length; i++) {
        let info : any = {
          Id : datos_pedido[i].producto_Id,
          Nombre : datos_pedido[i].producto,
          Cantidad : this.formatonumeros(datos_pedido[i].cantidad),
          Und : datos_pedido[i].presentacion,
          Precio : this.formatonumeros(datos_pedido[i].precio_Unitario),
          SubTotal : this.formatonumeros(datos_pedido[i].subTotal_Producto),
          "Fecha Entrega" : datos_pedido[i].fecha_Entrega.replace('T00:00:00', ''),
        }
        this.productosPedidos.push(info);
        this.productosPedidos.sort((a,b) => a.Nombre.localeCompare(b.Nombre));
      }
      setTimeout(() => { this.crearpdf(pedido); }, 1000);
    });
  }

  // Fucnion para que crear ub pdf apenas se realiza el pedido de productos
  crearpdf(pedido : number){
    let usuario = this.storage_Nombre;
    this.pedidoExternoService.GetCrearPdfUltPedido(pedido).subscribe(datos_pedido => {
      for (let i = 0; i < datos_pedido.length; i++) {
        const pdfDefinicion : any = {
          info: { title: `Pedido N° ${datos_pedido[i].id_Pedido}` },
          pageSize: { width: 630, height: 760 },
          footer: function(currentPage : any, pageCount : any) {
            return [
              '\n',
              {
                columns: [
                  { text: `Reporte generado por ${usuario}`, alignment: ' left', fontSize: 8, margin: [30, 0, 0, 0] },
                  { text: `Fecha Expedición Documento ${moment().format('YYYY-MM-DD')} - ${moment().format('H:mm:ss')}`, alignment: 'right', fontSize: 8 },
                  { text: `${currentPage.toString()} de ${pageCount}`, alignment: 'right', fontSize: 8, margin: [0, 0, 30, 0] },
                ]
              }
            ]
          },
          content : [
            {
              columns: [
                { image : logoParaPdf, width : 220, height : 50 },
                { text: `Pedido ${datos_pedido[i].id_Pedido}`, alignment: 'right', style: 'titulo', margin: [0, 30, 0, 0], }
              ]
            },
            '\n \n',
            {
              style: 'tablaEmpresa',
              table: {
                widths: [90, 167, 90, 166],
                style: 'header',
                body: [
                  [
                    { border: [false, false, false, false], text: `Comercial`  },
                    { border: [false, false, false, true], text: `${datos_pedido[i].vendedor_Id} - ${datos_pedido[i].vendedor}`, fontSize: 8 },
                    { border: [false, false, false, false], text: `Fecha de pedido` },
                    { border: [false, false, false, true], text: `${datos_pedido[i].fechaCreacion.replace('T00:00:00', '')}` },
                  ],
                  [
                    { border: [false, false, false, false], text: `Estado del pedido` },
                    { border: [false, false, false, true], text: `${datos_pedido[i].estado}` },
                    { border: [false, false, false, false], text: `Código` },
                    { border: [false, false, false, true], text: `${datos_pedido[i].consecutivo}` },
                  ],
                ]
              },
              layout: { defaultBorder: false, },
              fontSize: 9,
            },
            '\n \n',
            { text: `\n Información detallada del cliente \n \n`, alignment: 'center', style: 'header' },
            {
              style: 'tablaCliente',
              table: {
                widths: [170, 170, 170],
                style: 'header',
                body: [
                  [ `ID: ${datos_pedido[i].cliente_Id}`,  `Tipo de ID: ${datos_pedido[i].tipo_Id}`, `Tipo de Cliente: ${datos_pedido[i].tipo_Cliente}` ],
                  [ `Nombre: ${datos_pedido[i].cliente}`, `Telefono: ${datos_pedido[i].telefono_Cliente}`, `Ciudad: ${datos_pedido[i].ciudad_Cliente}` ],
                  [ `Dirección: ${datos_pedido[i].direccion_Cliente}`, `Codigo Postal: ${datos_pedido[i].codPostal_Cliente}`, `E-mail: ${datos_pedido[i].correo_Cliente}` ]
                ]
              },
              layout: 'lightHorizontalLines',
              fontSize: 9,
            },
            { text: `\n\n Información detallada de producto(s) pedido(s) \n `, alignment: 'center', style: 'header' },
            this.table2(this.productosPedidos, ['Id', 'Nombre', 'Cantidad', 'Und', 'Fecha Entrega', 'Precio', 'SubTotal']),
            {
              style: 'tablaTotales',
              table: {
                widths: [275, '*', 98],
                style: 'header',
                body: [
                  [
                    '',
                    { border: [true, false, true, true], text: `SUBTOTAL` },
                    { border: [false, false, true, true], text: `$${this.formatonumeros(datos_pedido[i].precio_Total)}` },
                  ],
                  [
                    '',
                    { border: [true, false, true, true], text: `DESCUENTO (%)` },
                    { border: [false, false, true, true], text: `${datos_pedido[i].descuento}%` },
                  ],
                  [
                    '',
                    { border: [true, false, true, true], text: `SUBTOTAL DESCUENTO` },
                    { border: [false, false, true, true], text: `$${this.formatonumeros((datos_pedido[i].precio_Total * datos_pedido[i].descuento) / 100)}` },
                  ],
                  [
                    '',
                    { border: [true, false, true, true], text: `IVA (%)` },
                    { border: [false, false, true, true], text: `${this.formatonumeros(datos_pedido[i].iva)}%` },
                  ],
                  [
                    '',
                    { border: [true, false, true, true], text: `SUBTOTAL IVA` },
                    { border: [false, false, true, true], text: `$${this.formatonumeros(((datos_pedido[i].precio_Total * datos_pedido[i].iva) / 100))}` },
                  ],
                  [
                    '',
                    { border: [true, false, true, true], text: `TOTAL` },
                    { border: [false, false, true, true], text: `$${this.formatonumeros(datos_pedido[i].precio_Final)}` },
                  ]
                ]
              },
              layout: { defaultBorder: false, },
              fontSize: 8,
            },
            { text: `\n \nObservación sobre el pedido: \n ${datos_pedido[i].observacion}\n`, style: 'header', }
          ],
          styles: {
            header: { fontSize: 10, bold: true },
            general: { fontSize: 8, bold: true },
            titulo: { fontSize: 20, bold: true }
          }
        }
        const pdf = pdfMake.createPdf(pdfDefinicion);
        pdf.open();
        this.mostrarConfirmacion(`Confirmación`, `¡PDF generado con éxito!`);
        break;
      }
    });
  }

  // Funcion que genera la tabla donde se mostrará la información de los productos pedidos
  table2(data, columns) {
    return {
      table: {
        headerRows: 1,
        widths: [40, 177, 40, 30, 51, 50, 98],
        body: this.buildTableBody(data, columns),
      },
      fontSize: 8,
      layout: {
        fillColor: function (rowIndex, node, columnIndex) {
          return (rowIndex == 0) ? '#CCCCCC' : null;
        }
      }
    };
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
        widths: [177, 50, 40, 61, 60, 98],
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

  /** Mostrar mensaje de confirmación  */
  mostrarConfirmacion(mensaje : any, titulo?: any) {
   this.messageService.add({severity: 'success', summary: mensaje,  detail: titulo, life: 2000});
   this.dt.value.sort((a,b) => Number(a.id_color) - Number(b.id_color));
  }

  /** Mostrar mensaje de error  */
  mostrarError(mensaje : any, titulo?: any) {
   this.messageService.add({severity:'error', summary: mensaje, detail: titulo, life: 5000});
  }

  /** Mostrar mensaje de advertencia */
  mostrarAdvertencia(mensaje : any, titulo?: any) {
   this.messageService.add({severity:'warn', summary: mensaje, detail: titulo, life: 2000});
  }

  /** Cerrar Dialogo de eliminación de OT/rollos.*/
  onReject(dato : any) {
    this.messageService.clear(dato);
  }
}
