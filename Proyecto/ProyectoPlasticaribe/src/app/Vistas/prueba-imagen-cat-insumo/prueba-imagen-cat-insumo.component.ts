import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';
import moment from 'moment';
import pdfMake from 'pdfmake/build/pdfmake';
import { MessageService } from 'primeng/api';
import { TreeTable } from 'primeng/treetable';
import { modelOpedido } from 'src/app/Modelo/modelOpedido';
import { PedidoProductosService } from 'src/app/Servicios/DetallesPedidoProductos/pedidoProductos.service';
import { EstadosProcesos_OTService } from 'src/app/Servicios/EstadosProcesosOT/EstadosProcesos_OT.service';
import { InventarioZeusService } from 'src/app/Servicios/InventarioZeus/inventario-zeus.service';
import { OpedidoproductoService } from 'src/app/Servicios/PedidosProductos/opedidoproducto.service';
import { AppComponent } from 'src/app/app.component';
import { logoParaPdf } from 'src/app/logoPlasticaribe_Base64';
import Swal from 'sweetalert2';
import { PedidoExternoComponent } from '../Pedido-Externo/Pedido-Externo.component';
import { Reporte_Procesos_OTComponent } from '../Reporte_Procesos_OT/Reporte_Procesos_OT.component';
import { OverlayPanel } from 'primeng/overlaypanel';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-prueba-imagen-cat-insumo',
  templateUrl: './prueba-imagen-cat-insumo.component.html',
  styleUrls: ['./prueba-imagen-cat-insumo.component.css']
})

export class PruebaImagenCatInsumoComponent implements OnInit {

  @ViewChild('op') op: OverlayPanel | undefined;
  @ViewChild('dt') dt: Table | undefined;

  cargando : boolean = false;
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual
  storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente.
  infoColor : string = ''; //Varable que almcanerá la descripcion del un color
  ArrayPedidos = []; //Varibale que almacenará la información que se mostrará en la tabla de vista
  columnas : any [] = [];
  columnasSeleccionadas : any [] = [];

  constructor(private AppComponent : AppComponent,
                private messageService: MessageService,
                  private inventarioZeusService : InventarioZeusService,
                    private pedidoProductosService : PedidoProductosService,
                      private estadosProcesos_OTService : EstadosProcesos_OTService,) {
  }

  ngOnInit() {
    this.lecturaStorage();
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

    this.inventarioZeusService.GetPedidos().subscribe(datos_pedidos => {
      for (let i = 0; i < datos_pedidos.length; i++) {
        if (this.ValidarRol == 2){
          if (this.storage_Id == parseInt(datos_pedidos[i].id_Vendedor)) this.llenarArrayPedidosZeus(datos_pedidos[i], i);
        } else if (this.ValidarRol == 1 || this.ValidarRol == 60 || this.ValidarRol == 61) this.llenarArrayPedidosZeus(datos_pedidos[i], i);
      }
    });
    setTimeout(() => {
      this.cargando = false;
      // this.ArrayPedidos.sort((a,b) => Number(a.consecutivo) - Number(b.consecutivo));
      this.ArrayPedidos.sort((a,b) => Number(a.id_color) - Number(b.id_color));
    }, 3500);
  }

  // Funcion que va a consultar los pedidos que no han sido cargados a zeus
  consultarPedidos(){
    this.pedidoProductosService.GetPedidosPendientesAgrupados().subscribe(datos_pedidos => {
      for (let i = 0; i < datos_pedidos.length; i++) {
        if (this.ValidarRol == 2){
          if (datos_pedidos[i].usua_Id == this.storage_Id) this.llenarArrayPedidos(datos_pedidos[i]);
        } else if (this.ValidarRol == 1 || this.ValidarRol == 60) this.llenarArrayPedidos(datos_pedidos[i]);
      }
    });
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
      cant_Pendiente: datos.cant_Pendiente.toFixed(2),
      cant_Facturada: datos.cant_Facturada.toFixed(2),
      existencias: datos.existencias.toFixed(2),
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
    this.columnas = [
      { header: 'Pedido', field: 'consecutivo', tipo: '' },
      { header: 'Cliente', field: 'cliente', tipo: '' },
      { header: 'Id Producto', field: 'id_Producto', tipo: '' },
      { header: 'Producto', field: 'producto', tipo: '' },
      { header: 'Cant. Pedida', field: 'cant_Pedida', tipo: 'numero' },
      { header: 'Pendiente', field: 'cant_Pendiente', tipo: 'numero' },
      { header: 'Facturada', field: 'cant_Facturada', tipo: 'numero' },
      { header: 'Stock', field: 'existencias', tipo: 'numero' },
      { header: 'Und', field: 'presentacion', tipo: '' },
      { header: 'Estado', field: 'estado', tipo: '' },
      { header: 'Vendedor', field: 'vendedor', tipo: '' },
      { header: 'OT', field: 'OT', tipo: '' },
      { header: 'Proceso Actual', field: 'Proceso_OT', tipo: '' },
      { header: 'Total Pendiente', field: 'costo_Cant_Pendiente', tipo: 'numero' },
      { header: 'Total', field: 'costo_Cant_Total', tipo: 'numero' },
      { header: 'Precio U.', field: 'precioUnidad', tipo: 'numero' },
      { header: 'OC Cliente', field: 'orden_Compra_CLiente', tipo: '' },
      { header: 'Fecha Creación', field: 'fecha_Creacion', tipo: '' },
      { header: 'Fecha Entrega', field: 'fecha_Entrega', tipo: '' },
    ];
    this.columnasSeleccionadas = this.columnas;
    this.ArrayPedidos.push(info);

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
        let posicion = this.ArrayPedidos.findIndex((item) => item.id == pedidos[i].id);
        this.ArrayPedidos[posicion].id_color = 2;
        this.ArrayPedidos[posicion].color = 'azul';
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
  llenarArrayPedidos(datos : any){
  }

  // Funcion que le va a colocar los colores al array de pedidos
  validarColoresArray(){

  }

  // Funcion que creará un archivo de excel con base de lo que esté en la tabla
  exportarExcel(){
    if (this.ArrayPedidos.length == 0) this.mostrarAdvertencia(`Advertencia`, 'Debe haber al menos un pedido en la tabla.');
    else {
      let datos : any =[];
      // setTimeout(() => {
      //   if(this.dt.filteredNodes != null) {
      //     for (let index = 0; index < this.dt.filteredNodes.length; index++) {
      //       this.llenarArrayExcel(this.dt.filteredNodes[index].children, datos);
      //     }
      //   } else {
      //     for (let index = 0; index < this.dt._value.length; index++) {
      //       this.llenarArrayExcel(this.dt._value[index].children, datos);
      //     }
      //   }
      // }, 300);

      setTimeout(() => {
        const title = `Reporte de Pedidos Zeus - ${this.today}`;
        const header = ["N° Pedido", "Cliente", "Item", "Cant. Pedida", "Pendiente", "Facturada", "Stock", "Und", "Precio Und", "Estado", "Vendedor", "OC", "Costo Cant. Pendiente", "Costo Cant. Total", "Fecha Creación ", "Fecha Entrega", "OT", "Proceso Actual", "Estado OT"]

        let workbook = new Workbook();
        const imageId1 = workbook.addImage({
          base64:  logoParaPdf,
          extension: 'png',
        });
        let worksheet = workbook.addWorksheet(`Reporte de Pedidos Zeus - ${this.today}`);
        worksheet.addImage(imageId1, 'A1:B3');
        let titleRow = worksheet.addRow([title]);
        titleRow.font = { name: 'Calibri', family: 4, size: 16, underline: 'double', bold: true };
        worksheet.addRow([]);
        worksheet.addRow([]);
        let headerRow = worksheet.addRow(header);
        headerRow.eachCell((cell, number) => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'eeeeee' } }
          cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
        });
        worksheet.mergeCells('A1:S3');
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
          let OT = row.getCell(17);
          let estadoPedido = row.getCell(10);
          let estadoOT = row.getCell(19);
          let colorEstadoOT;
          let colorEstadoPedido;

          consecutivo.alignment = { horizontal : 'center' }
          fecha1.alignment = { horizontal : 'center' }
          fecha2.alignment = { horizontal : 'center' }
          medida.alignment = { horizontal : 'center' }
          OT.alignment = {horizontal : 'center'}
          Pedida.numFmt  = '""#,##0.00;[Red]\-""#,##0.00';
          /** Pendiente */
          row.getCell(5).numFmt  = '""#,##0.00;[Red]\-""#,##0.00';
          Pendiente.font = {color : {'argb' : 'FF7F71'}, 'name': 'Calibri', 'bold' : true, 'size': 11};

          Facturada.numFmt  = '""#,##0.00;[Red]\-""#,##0.00';
          stock.numFmt  = '""#,##0.00;[Red]\-""#,##0.00';
          precioUnd.numFmt  = '""#,##0.00;[Red]\-""#,##0.00';
          ccPendiente.numFmt  = '""#,##0.00;[Red]\-""#,##0.00';
          ccTotal.numFmt  = '""#,##0.00;[Red]\-""#,##0.00';

          /** OT con Estado */
          if(d[18] == 17) { colorEstadoOT = '8AFC9B';  estadoOT.fill = { type : 'pattern', pattern: 'solid', fgColor: { argb: colorEstadoOT }, }; estadoOT.value = 'Terminada'; }
          else if(d[18] == 18) {colorEstadoOT = '53CC48'; estadoOT.fill = { type : 'pattern', pattern: 'solid', fgColor: { argb: colorEstadoOT }, }; estadoOT.value = 'Cerrada';}
          else if(d[18] == 3) {colorEstadoOT = 'FF7878'; estadoOT.fill = { type : 'pattern', pattern: 'solid', fgColor: { argb: colorEstadoOT }, }; estadoOT.value = 'Anulada';}
          else if(d[18] == 14) {colorEstadoOT = '83D3FF'; estadoOT.fill = { type : 'pattern', pattern: 'solid', fgColor: { argb: colorEstadoOT }, }; estadoOT.value = 'Asignada';}
          else if(d[18] == 16) {colorEstadoOT = 'F3FC20;'; estadoOT.fill = { type : 'pattern', pattern: 'solid', fgColor: { argb: colorEstadoOT }, }; estadoOT.value = 'En Proceso';}
          else if(d[18] == 15) {colorEstadoOT = 'F6D45D'; estadoOT.fill = { type : 'pattern', pattern: 'solid', fgColor: { argb: colorEstadoOT }, }; estadoOT.value = 'Abierta';}
          else colorEstadoOT = 'FFFFFF';

          /** Estado Pedido*/
          if (d[9] == 'Pendiente') colorEstadoPedido = 'FF7F71'
          else if (d[9] == 'Parcialmente Satisfecho') colorEstadoPedido = 'FFF55D';
          estadoPedido.fill = {
            type : 'pattern',
            pattern: 'solid',
            fgColor: { argb: colorEstadoPedido },
          }

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
          worksheet.getColumn(17).width = 15;
          worksheet.getColumn(18).width = 30;
          worksheet.getColumn(19).width = 20;
        });

        setTimeout(() => {
          workbook.xlsx.writeBuffer().then((data) => {
            let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            fs.saveAs(blob, `Reporte de Pedidos Zeus - ${this.today}.xlsx`);
          });
          this.cargando = false;
        }, 1000);
      }, 1500);
      setTimeout(() => {  this.mostrarConfirmacion(`Confirmación`, '¡Archivo de excel generado exitosamente!'); }, 3100);
    }
  }

  // Funcion que llenará el archivo de excel con los datos de la tabla
  llenarArrayExcel(datos : any, arrayDatos : any){
    this.cargando = true;
    for (let i = 0; i < datos.length; i++) {
      const datos1 : any = [
        datos[i].data.consecutivo,
        datos[i].data.cliente,
        datos[i].data.producto,
        datos[i].data.cant_Pedida,
        datos[i].data.cant_Pendiente,
        datos[i].data.cant_Facturada,
        datos[i].data.existencias,
        datos[i].data.presentacion,
        datos[i].data.precioUnidad,
        datos[i].data.estado,
        datos[i].data.vendedor,
        datos[i].data.orden_Compra_CLiente,
        datos[i].data.costo_Cant_Pendiente,
        datos[i].data.costo_Cant_Total,
        datos[i].data.fecha_Creacion.replace('T00:00:00', ''),
        datos[i].data.fecha_Entrega.replace('T00:00:00', ''),
        datos[i].data.OT,
        datos[i].data.Proceso_OT,
        datos[i].data.Estado_OT,
      ];
      arrayDatos.push(datos1);
    }
  }

  // Funcion que permitirá filtrar la información de la tabla
  aplicarfiltro($event, campo : any, valorCampo : string){
    this.dt!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);
    // setTimeout(() => {
    //   if (this.tt.filteredNodes != null) {
    //     this.sumaCostoPendiente = 0;
    //     this.sumaCostoTotal = 0;
    //     for (let i = 0; i < this.tt.filteredNodes.length; i++) {
    //       this.sumaCostoPendiente += this.tt.filteredNodes[i].data.costo_Cant_Pendiente;
    //       this.sumaCostoTotal += this.tt.filteredNodes[i].data.costo_Cant_Total;
    //     }
    //   } else {
    //     this.sumaCostoPendiente = 0;
    //     this.sumaCostoTotal = 0;
    //     for (let i = 0; i < this.tt._value.length; i++) {
    //       this.sumaCostoPendiente += this.tt._value[i].data.costo_Cant_Pendiente;
    //       this.sumaCostoTotal += this.tt._value[i].data.costo_Cant_Total;
    //     }
    //   }
    // }, 400);
  }

  // Función que mostrará la descripción de cada una de las card de los dashboard's
  mostrarDescripcion($event, color : string){
    if (color == 'verde') this.infoColor = `El color verde indica que todos los items de un pedido se pueden faturar o en su defecto este tambien indica cuando el item de un pedido se puede facturar. Esta facturación se basa en la existencia que tiene el producto actualmente`;
    setTimeout(() => {
      this.op!.toggle($event);
      $event.stopPropagation();
    }, 500);
  }

  /** Mostrar mensaje de confirmación  */
  mostrarConfirmacion(mensaje : any, titulo?: any) {
   this.messageService.add({severity: 'success', summary: mensaje,  detail: titulo, life: 2000});
  }

  /** Mostrar mensaje de error  */
  mostrarError(mensaje : any, titulo?: any) {
   this.messageService.add({severity:'error', summary: mensaje, detail: titulo, life: 5000});
  }

  /** Mostrar mensaje de advertencia */
  mostrarAdvertencia(mensaje : any, titulo?: any) {
   this.messageService.add({severity:'warn', summary: mensaje, detail: titulo, life: 2000});
  }
}
