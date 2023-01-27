import { Component, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { Workbook } from 'exceljs';
import moment from 'moment';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { TreeTable } from 'primeng/treetable';
import { AppComponent } from 'src/app/app.component';
import { PedidoProductosService } from 'src/app/Servicios/DetallesPedidoProductos/pedidoProductos.service';
import { RolesService } from 'src/app/Servicios/Roles/roles.service';
import Swal from 'sweetalert2';
import * as fs from 'file-saver';
import { OpedidoproductoService } from 'src/app/Servicios/PedidosProductos/opedidoproducto.service';
import { InventarioZeusService } from 'src/app/Servicios/InventarioZeus/inventario-zeus.service';

@Component({
  selector: 'app-Reporte_PedidosVendedores',
  templateUrl: './Reporte_PedidosVendedores.component.html',
  styleUrls: ['./Reporte_PedidosVendedores.component.css']
})

export class Reporte_PedidosVendedoresComponent implements OnInit {
  @ViewChild('tt') tt: TreeTable | undefined;

  public load : boolean = false;
  public modalEditar : boolean = false;
  public ArrayDocumento : any = [];
  public _columnasSeleccionada: any[] = [];
  public columnas: any [] = [];
  public titlePendiente : string;
  public titleParcial : string;
  public sumaCostoPendiente: number = 0;
  public sumaCostoTotal: number = 0;
  public storage_Id : number; //Variable que se usará para almacenar el id que se encuentra en el almacenamiento local del navegador
  public storage_Nombre : any; //Variable que se usará para almacenar el nombre que se encuentra en el almacenamiento local del navegador
  public storage_Rol : any; //Variable que se usará para almacenar el rol que se encuentra en el almacenamiento local del navegador
  public ValidarRol : number; //Variable que se usará en la vista para validar el tipo de rol, si es tipo 2 tendrá una vista algo diferente
  today : any = moment().format('YYYY-MM-DD'); //Variable que se usará para llenar la fecha actual


  constructor(@Inject(SESSION_STORAGE) private storage: WebStorageService,
                private rolService : RolesService,
                  private appComponent : AppComponent,
                    private servicioDtlPedidos : PedidoProductosService,
                      private servicioPedidos : OpedidoproductoService,
                        private servicioZeus : InventarioZeusService) { }

  ngOnInit() {
    this.lecturaStorage();
    this.cargarPedidosPendientes();
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

  @Input() get columnasSeleccionada(): any[] {
    return this._columnasSeleccionada;
  }

  set columnasSeleccionada(val: any[]) {
    this._columnasSeleccionada = this.columnas.filter(col => val.includes(col));
  }

  // Funcion que va a cargar el encabezado de los pedidos
  pedidoAgrupado(){
    this.load = true;
    this.ArrayDocumento = [];
    this.servicioDtlPedidos.GetPedidosPendientesAgrupados().subscribe(datos_pedidos => {
      for (let i = 0; i < datos_pedidos.length; i++) {
        let info : any = {
          "data" : {
            "consecutivo": datos_pedidos[i].pedExt_Id,
            "fechaCreacion" : datos_pedidos[i].pedExt_FechaCreacion.replace('T00:00:00', ''),
            "fechaEntrega" : datos_pedidos[i].pedExt_FechaEntrega.replace('T00:00:00', ''),
            "idCliente": datos_pedidos[i].cli_Id,
            "cliente": datos_pedidos[i].cli_Nombre,
            "idProducto ": '',
            "producto":  '',
            "cant_Pedida": '',
            "existencias": '',
            "precio": '',
            "presentacion": '',
            "idVendedor": datos_pedidos[i].usua_Id,
            "vendedor": datos_pedidos[i].usua_Nombre,
            "idEstado": datos_pedidos[i].estado_Id,
            "estado": datos_pedidos[i].estado_Nombre,
            "costo_Cant_Total": (datos_pedidos[i].pedExt_PrecioTotalFinal),
          },
          expanded: true,
          "children" : []
        }
        this.ArrayDocumento.push(info);
      }
    });
  }

  // Funcion que va a llenar los datos de los productos de cada pedido
  pedidosDetallados(){

    this.servicioDtlPedidos.getPedidoPendiente().subscribe(datos_pedidos => {
      for (let i = 0; i < datos_pedidos.length; i++) {
            for (let j = 0; j < this.ArrayDocumento.length; j++) {
              if (datos_pedidos[i].pedExt_Id == this.ArrayDocumento[j].data.consecutivo) {
                let info : any = {
                  "data" : {
                    "consecutivo": datos_pedidos[i].pedExt_Id,
                    "fechaCreacion" : datos_pedidos[i].pedExt_FechaCreacion.replace('T00:00:00', ''),
                    "fechaEntrega" : datos_pedidos[i].pedExt_FechaEntrega.replace('T00:00:00', ''),
                    "idCliente": datos_pedidos[i].cli_Id,
                    "cliente": datos_pedidos[i].cli_Nombre,
                    "idProducto ": datos_pedidos[i].prod_Id,
                    "producto":  datos_pedidos[i].prod_Nombre,
                    "cant_Pedida": datos_pedidos[i].pedExtProd_Cantidad,
                    "existencias": 0,
                    "precio": datos_pedidos[i].pedExtProd_PrecioUnitario,
                    "presentacion": datos_pedidos[i].undMed_Id,
                    "idVendedor": datos_pedidos[i].usua_Id,
                    "vendedor": datos_pedidos[i].usua_Nombre,
                    "idEstado": datos_pedidos[i].estado_Id,
                    "estado": datos_pedidos[i].estado_Nombre,
                    "costo_Cant_Total": (datos_pedidos[i].pedExtProd_Cantidad * datos_pedidos[i].exProd_PrecioVenta),
                  }
                }
                if(datos_pedidos[i].undMed_Id == 'Und') datos_pedidos[i].undMed_Id = 'UND';
                if(datos_pedidos[i].undMed_Id == 'Kg') datos_pedidos[i].undMed_Id = 'KLS';
                if(datos_pedidos[i].undMed_Id == 'Paquete') datos_pedidos[i].undMed_Id = 'PAQ';

                this.servicioZeus.getExistenciasProductos(datos_pedidos[i].prod_Id.toString(), datos_pedidos[i].undMed_Id).subscribe(dataZeus => {
                  for (let index = 0; index < dataZeus.length; index++) {
                    info.data.existencias = dataZeus[index].existencias;
                  }
                });

                this.ArrayDocumento[j].children.push(info);
                this.ArrayDocumento.sort((a,b) => Number(a.data.consecutivo) - Number(b.data.consecutivo));
              }
            }
      }
    });
  }

  /** Función que va a cargar el pedido y su detalles */
  cargarPedidosPendientes(){
    this.load = true;
    this.ArrayDocumento = [];
    this.pedidoAgrupado();
    setTimeout(() => {
      this.pedidosDetallados();
      this.ArrayDocumento.sort((a,b) => Number(a.consecutivo) - Number(b.consecutivo));
    }, 1500);
    setTimeout(() => { this.load = false; }, 2000);
  }

  /** */
  infoPedidos(datos : any){
    const infoPedido : any = {
      "data" : {
        "consecutivo ": datos.pedExt_Id,
        "fechaCreacion" : datos.pedExt_FechaCreacion.replace('T00:00:00', ''),
        "fechaEntrega" : datos.pedExt_FechaEntrega.replace('T00:00:00', ''),
        "idCliente": datos.cli_Id,
        "cliente": datos.cli_Nombre,
        "idProducto ": datos.prod_Id,
        "producto":  datos.prod_Nombre,
        "cant_Pedida": datos.pedExtProd_Cantidad,
        "existencias": datos.exProd_Cantidad,
        "precio": datos.pedExtProd_PrecioUnitario,
        "presentacion": datos.undMed_Id,
        "idVendedor": datos.usua_Id,
        "vendedor": datos.usua_Nombre,
        "idEstado": datos.estado_Id,
        "estado": datos.estado_Nombre,
        "costo_Cant_Total": (datos.pedExtProd_Cantidad * datos.exProd_PrecioVenta),
      },
      "children" : []
    }
    this.ArrayDocumento.push(infoPedido);
  }

  /** Función que buscara por filtros en la tabla. */
  aplicarfiltro($event, campo : any, valorCampo : string){
    this.tt!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);
  }

  /** */
  editarPedido(item: any){
    this.modalEditar = true;
    this.servicioDtlPedidos.getPedidoPendientexId(item.consecutivo).subscribe(dataPedido => {
      for (let index = 0; index < dataPedido.length; index++) {

      }
    });
  }

  /** */
  cambiarOrden_Pedido(item : any){

  }

  /** */
  mostrarPedidoPdf(item : any){

  }

  /** Función que exportará a excel lo que esté cargado en la tabla.*/
  exportarExcel(){
    if(this.ArrayDocumento.length == 0) this.advertencia('Debe haber al menos un pedido en la tabla.')
    else {
      let datos : any = [];

      setTimeout(() => {
        if(this.tt.filteredNodes != null) {
          for (let index = 0; index < this.tt.filteredNodes.length; index++) {
            this.llenarArrayExcel(this.tt.filteredNodes[index].children, datos);
          }
        } else {
          for (let index = 0; index < this.tt._value.length; index++) {
            this.llenarArrayExcel(this.tt._value[index].children, datos);
          }
        }
      }, 500);

      setTimeout(() => {
        const title = `Pedidos de Vendedores - ${this.today}`;
        const header = ["N° Pedido", "Cliente", "Item", "Cant. Pedida", "Stock", "Und", "Precio Und", "Estado", "Vendedor", "Costo Cant. Total", "Fecha Creación ", "Fecha Entrega", ]
        let workbook = new Workbook();
        const imageId1 = workbook.addImage({
          base64:  this.appComponent.logoParaPdf,
          extension: 'png',
        });
        let worksheet = workbook.addWorksheet(`Reporte de de Vendedores - ${this.today}`);
        worksheet.addImage(imageId1, 'A1:A3');
        let titleRow = worksheet.addRow([title]);
        titleRow.font = { name: 'Calibri', family: 4, size: 16, underline: 'double', bold: true };
        worksheet.addRow([]);
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
        worksheet.mergeCells('A1:L3');
        worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
        datos.forEach(d => {
          let row = worksheet.addRow(d);
          let cantPedida = row.getCell(4);
          let stock = row.getCell(5);
          let precioUnd = row.getCell(7);
          let costoTotal = row.getCell(10);
          let consecutivo = row.getCell(1);
          let fecha1 = row.getCell(11);
          let fecha2 = row.getCell(12);
          let und = row.getCell(6);
          let color;

          cantPedida.numFmt = '""#,##0.00;[Red]\-""#,##0.00';
          stock.numFmt = '""#,##0.00;[Red]\-""#,##0.00';
          precioUnd.numFmt = '""#,##0.00;[Red]\-""#,##0.00';
          costoTotal.numFmt = '""#,##0.00;[Red]\-""#,##0.00';

          consecutivo.alignment = {horizontal : 'center'};
          fecha1.alignment = {horizontal : 'center'};
          fecha2.alignment = {horizontal : 'center'};
          und.alignment = {horizontal : 'center'};

          if(d[4] >= d[3]) {
            color = '8AFC9B';
            stock.fill = {type : 'pattern', pattern: 'solid', fgColor: { argb: color }, };
          } else color = 'FFFFFF';

          worksheet.getColumn(1).width = 12;
          worksheet.getColumn(2).width = 45;
          worksheet.getColumn(3).width = 45;
          worksheet.getColumn(4).width = 15;
          worksheet.getColumn(5).width = 15;
          worksheet.getColumn(6).width = 10;
          worksheet.getColumn(7).width = 15;
          worksheet.getColumn(8).width = 12;
          worksheet.getColumn(9).width = 40;
          worksheet.getColumn(10).width = 18;
          worksheet.getColumn(11).width = 18;
          worksheet.getColumn(12).width = 18;
        });
        setTimeout(() => {
          workbook.xlsx.writeBuffer().then((data) => {
            let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            fs.saveAs(blob, `Reporte de Vendedores - ${this.today}.xlsx`);
          });
          this.load = false;
        }, 1000);
      }, 1500);
      setTimeout(() => {  this.Confirmacion('¡Archivo de Excel generado exitosamente!'); }, 3000);
    }
  }

  /** Función para llenar el array de datos que se mostrará en el excel. */
  llenarArrayExcel(datos : any, arrayDatos : any){
    this.load = true;
    for (let i = 0; i < datos.length; i++) {
      const datos1 : any = [
        datos[i].data.consecutivo,
        datos[i].data.cliente,
        datos[i].data.producto,
        datos[i].data.cant_Pedida,
        datos[i].data.existencias,
        datos[i].data.presentacion,
        datos[i].data.precio,
        datos[i].data.estado,
        datos[i].data.vendedor,
        datos[i].data.costo_Cant_Total,
        datos[i].data.fechaCreacion.replace('T00:00:00', ''),
        datos[i].data.fechaEntrega.replace('T00:00:00', ''),
      ];
      arrayDatos.push(datos1);
    }
  }

  /** Mensajes de advertencia */
  advertencia(mensaje : string) {
    Swal.fire({ icon: 'warning', title: 'Advertencia', html: mensaje, confirmButtonColor: '#ffc107', confirmButtonText: 'Aceptar', });
  }

  /** Mensajes de confirmación */
  Confirmacion(mensaje : string) {
    Swal.fire({ icon: 'success', title: 'Confirmación', html: mensaje, confirmButtonColor: '#53CC48', confirmButtonText: 'Aceptar', });
  }

   /** Mensajes de error */
   mostrarError(mensaje : string) {
    Swal.fire({ icon: 'error', title: 'Confirmación', html: mensaje, confirmButtonColor: '#d83542', confirmButtonText: 'Aceptar', });
  }

  confirmarActualizacion(item : any){
    Swal.fire({
      icon: 'warning',
      title: 'Advertencia',
      text: 'Está seguro que desea aceptar el pedido?',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      confirmButtonColor: '#53CC48',
    }).then((result) => {
      if (result.isConfirmed) this.aceptarPedido(item);
    });
  }

  /** Aceptar Pedido para luego crearlo en Zeus */
  aceptarPedido(item : any){
    this.servicioPedidos.srvObtenerListaPorId(item).subscribe(dataPedidos => {
      const info : any = {
        PedExt_Id : dataPedidos.pedExt_Id,
        PedExt_Codigo : dataPedidos.pedExt_Codigo,
        PedExt_FechaCreacion : dataPedidos.pedExt_FechaCreacion,
        PedExt_FechaEntrega : dataPedidos.pedExt_FechaEntrega,
        Empresa_Id : dataPedidos.empresa_Id,
        SedeCli_Id : dataPedidos.sedeCli_Id,
        Estado_Id : 26,
        PedExt_Observacion : dataPedidos.pedExt_Observacion,
        Usua_Id : dataPedidos.usua_Id,
        PedExt_Descuento : dataPedidos.pedExt_Descuento,
        PedExt_Iva : dataPedidos.pedExt_Iva,
        PedExt_PrecioTotalFinal : dataPedidos.pedExt_PrecioTotalFinal,
        PedExt_HoraCreacion: dataPedidos.pedExt_HoraCreacion,
        Creador_Id : dataPedidos.creador_Id,
      }
      this.servicioPedidos.srvActualizarPedidosProductos(item, info).subscribe(data_Pedido => {
        this.Confirmacion(`Pedido Nro. ${item} aceptado con exito!`);
        setTimeout(() => { this.cargarPedidosPendientes(); }, 100);
      }, error => { this.mostrarError(`No fue posible aceptar el pedido ${item}, por favor, verifique!`); });
    });
  }
}
