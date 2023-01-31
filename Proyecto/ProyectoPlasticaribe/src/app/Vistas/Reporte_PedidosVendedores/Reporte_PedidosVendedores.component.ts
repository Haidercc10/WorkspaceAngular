import { Component, Inject, Input, OnInit, ViewChild } from '@angular/core';
import moment from 'moment';
import { SESSION_STORAGE, WebStorageService } from 'ngx-webstorage-service';
import { TreeTable } from 'primeng/treetable';
import { AppComponent } from 'src/app/app.component';
import { PedidoProductosService } from 'src/app/Servicios/DetallesPedidoProductos/pedidoProductos.service';
import { OpedidoproductoService } from 'src/app/Servicios/PedidosProductos/opedidoproducto.service';
import { RolesService } from 'src/app/Servicios/Roles/roles.service';
import { PedidoExternoComponent } from '../Pedido-Externo/Pedido-Externo.component';
import Swal from 'sweetalert2';
import * as fs from 'file-saver';
import { InventarioZeusService } from 'src/app/Servicios/InventarioZeus/inventario-zeus.service';
import { Workbook } from 'exceljs';
import pdfMake from 'pdfmake/build/pdfmake';

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

  @ViewChild(PedidoExternoComponent) modalPedidoExterno : PedidoExternoComponent;
  pedidoSelecccionado : number = 0; //Variable que almacenará la informacion del pedido que se desee editar
  productosPedidos : any [] = []; //Variable que se llenará con la información de los productos que se enviaron a la base de datos, los productos serán del ultimo pedido creado
  precioTotalPedidos : number = 0; //Variable que almacenará el costo total de los pedidos

  constructor(@Inject(SESSION_STORAGE) private storage: WebStorageService,
                private rolService : RolesService,
                  private appComponent : AppComponent,
                    private servicioDtlPedidos : PedidoProductosService,
                      private pedidoExternoService : OpedidoproductoService,
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

  // Funcion que colcará la puntuacion a los numeros que se le pasen a la funcion
  formatonumeros = (number) => {
    const exp = /(\d)(?=(\d{3})+(?!\d))/g;
    const rep = '$1,';
    return number.toString().replace(exp,rep);
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
    this.precioTotalPedidos = 0;
    this.servicioDtlPedidos.GetPedidosPendientesAgrupados().subscribe(datos_pedidos => {
      for (let i = 0; i < datos_pedidos.length; i++) {
        if (this.ValidarRol == 2){
          if (datos_pedidos[i].usua_Id == this.storage_Id) this.llenarPedidosAgrupado(datos_pedidos[i]);
        } else if (this.ValidarRol == 1 || this.ValidarRol == 60) this.llenarPedidosAgrupado(datos_pedidos[i]);
      }
    });
  }

  // Funcion que va a llenar la informacion de los pedidos
  llenarPedidosAgrupado(data){
    let info : any = {
      "data" : {
        "consecutivo": data.pedExt_Id,
        "fechaCreacion" : data.pedExt_FechaCreacion.replace('T00:00:00', ''),
        "fechaEntrega" : data.pedExt_FechaEntrega.replace('T00:00:00', ''),
        "idCliente": data.cli_Id,
        "cliente": data.cli_Nombre,
        "idProducto ": '',
        "producto":  '',
        "cant_Pedida": '',
        "existencias": '',
        "precio": '',
        "presentacion": '',
        "idVendedor": data.usua_Id,
        "vendedor": data.usua_Nombre,
        "idEstado": data.estado_Id,
        "estado": data.estado_Nombre,
        "costo_Cant_Total": (data.pedExt_PrecioTotalFinal),
      },
      expanded: true,
      "children" : []
    }
    this.precioTotalPedidos += data.pedExt_PrecioTotalFinal;
    this.ArrayDocumento.push(info);
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
    }, 1000);
    setTimeout(() => { this.load = false; }, 2000);
  }

  /** Función que buscara por filtros en la tabla. */
  aplicarfiltro($event, campo : any, valorCampo : string){
    this.tt!.filter(($event.target as HTMLInputElement).value, campo, valorCampo);
    setTimeout(() => {
      if (this.tt.filteredNodes != null) {
        this.precioTotalPedidos = 0;
        for (let i = 0; i < this.tt.filteredNodes.length; i++) {
          this.precioTotalPedidos += this.tt.filteredNodes[i].data.costo_Cant_Total;
        }
      } else {
        this.precioTotalPedidos = 0;
        for (let i = 0; i < this.tt._value.length; i++) {
          this.precioTotalPedidos += this.tt._value[i].data.costo_Cant_Total;
        }
      }
    }, 400);
  }

  // Funcion que va a exportar a excel la informacion de los pedidos
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
          worksheet.getColumn(2).width = 50;
          worksheet.getColumn(3).width = 50;
          worksheet.getColumn(4).width = 15;
          worksheet.getColumn(5).width = 15;
          worksheet.getColumn(6).width = 10;
          worksheet.getColumn(7).width = 15;
          worksheet.getColumn(8).width = 15;
          worksheet.getColumn(9).width = 40;
          worksheet.getColumn(10).width = 25;
          worksheet.getColumn(11).width = 40;
          worksheet.getColumn(12).width = 20;
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
    this.pedidoExternoService.srvObtenerListaPorId(item).subscribe(dataPedidos => {
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
      this.pedidoExternoService.srvActualizarPedidosProductos(item, info).subscribe(data_Pedido => {
        this.Confirmacion(`Pedido Nro. ${item} aceptado con exito!`);
        setTimeout(() => { this.cargarPedidosPendientes(); }, 1000);
        setTimeout(() => { this.cargarPedidosPendientes(); }, 100);
      }, error => { this.mostrarError(`No fue posible aceptar el pedido ${item}, por favor, verifique!`); });
    });
  }

  // Funcion que mostrará un modal con la informacion del pedido seleccionado y en el que se podrá editar el pedido selecionado
  editarPedido(data: any){
    this.modalEditar = true;
    setTimeout(() => {
      this.modalPedidoExterno.limpiarTodosCampos();
      this.modalPedidoExterno.modalMode = true;
      this.pedidoExternoService.GetInfoEditarPedido(data.consecutivo).subscribe(datos_pedido => {
        for (let i = 0; i < datos_pedido.length; i++) {
          this.modalPedidoExterno.FormPedidoExternoClientes.setValue({
            PedClienteNombre: datos_pedido[i].id_Cliente,
            PedClienteId : datos_pedido[i].id_Cliente,
            PedSedeCli_Id: datos_pedido[i].id_SedeCliente,
            ciudad_sede: datos_pedido[i].ciudad,
            PedUsuarioNombre: datos_pedido[i].vendedor,
            PedUsuarioId: datos_pedido[i].id_Vendedor,
            PedFechaEnt: datos_pedido[i].fecha_Entrega.replace('T00:00:00', ''),
            PedEstadoId: 11,
            PedObservacion: datos_pedido[i].observacion,
            PedDescuento : datos_pedido[i].descuento,
            PedIva : datos_pedido[i].iva,
          });
          this.modalPedidoExterno.pedidoEditar = data.consecutivo;
          this.modalPedidoExterno.clienteSeleccionado();
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
          }
          this.modalPedidoExterno.ArrayProducto.push(productoExt);
        }
      });
    }, 500);
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
          "Fecha Entrega" : datos_pedido[i].fechaEntrega.replace('T00:00:00', ''),
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
                { image : this.appComponent.logoParaPdf, width : 100, height : 80 },
                { text: `Pedido Nro. ${datos_pedido[i].id_Pedido}`, alignment: 'right', style: 'titulo', margin: [0, 30, 0, 0], }
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
                    { border: [false, false, false, false], text: `NIT` },
                    { border: [false, false, false, true], text: `${datos_pedido[i].empresa_Id}` },
                    { border: [false, false, false, false], text: `Nombre Empresa` },
                    { border: [false, false, false, true], text: `${datos_pedido[i].empresa}` },
                  ],
                  [
                    { border: [false, false, false, false], text: `Dirección` },
                    { border: [false, false, false, true], text: `${datos_pedido[i].empresa_Direccion}` },
                    { border: [false, false, false, false], text: `Ciudad` },
                    { border: [false, false, false, true], text: `${datos_pedido[i].empresa_Ciudad}` },
                  ],
                  [
                    { border: [false, false, false, false], text: `Fecha de pedido` },
                    { border: [false, false, false, true], text: `${datos_pedido[i].fechaCreacion.replace('T00:00:00', '')}` },
                    { border: [false, false, false, false], text: `Estado del pedido` },
                    { border: [false, false, false, true], text: `${datos_pedido[i].estado}` },
                  ],
                  [
                    { border: [false, false, false, false], text: `Vendedor` },
                    { border: [false, false, false, true], text: `${datos_pedido[i].vendedor_Id} - ${datos_pedido[i].vendedor}`, fontSize: 8 },
                    {},
                    {},
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
            this.table(this.productosPedidos, ['Id', 'Nombre', 'Cantidad', 'Und', 'Fecha Entrega', 'Precio', 'SubTotal']),
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
        break;
      }
    });

  }

  // funcion que se encagará de llenar la tabla de los productos en el pdf
  buildTableBody(data, columns) {
    var body = [];
    body.push(columns);
    data.forEach(function(row) {
      var dataRow = [];
      columns.forEach(function(column) {
        dataRow.push(row[column].toString());
      });
      body.push(dataRow);
    });
    return body;
  }

  // Funcion que genera la tabla donde se mostrará la información de los productos pedidos
  table(data, columns) {
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
}
